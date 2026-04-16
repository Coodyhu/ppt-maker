import JSZip from "jszip";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { readFileSync } from "fs";
import { extname } from "path";
import type {
  TemplateInfo,
  TemplateLayout,
  TemplatePlaceholder,
  SlideContent,
  SlideElement,
  Outline,
  SlideEntry,
  OnProgress,
  RichTextParagraph,
  RichTextRun,
} from "../types/index";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["p:sp", "a:r", "a:p", "Relationship", "Override", "p:sldId", "Default"].includes(name),
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  suppressEmptyNode: true,
  format: true,
});

/** EMU conversion: 1 inch = 914400 EMUs */
const INCH = 914400;

// ─── MIME helpers ───

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// ─── Layout matching ───

/** Map outline slide types → layout name keywords (中英文) */
const LAYOUT_KEYWORDS: Record<string, string[]> = {
  cover: ["Title Slide", "ctrTitle", "title", "标题幻灯片", "封面"],
  content: ["Title, Content", "Title and Content", "Two Content", "内容", "标题和内容", "Content"],
  "back-cover": ["Blank", "Section Header", "节标题", "空白", "Title Slide", "标题幻灯片"],
};

function normalizeLayoutName(name: string): string {
  return name.toLowerCase().replace(/[\s\-_,]/g, "");
}

/**
 * Four-tier layout matching:
 * 1. Exact match on SlideEntry.layout field (normalized)
 * 2. Semantic match by placeholder types needed
 * 3. Keyword fuzzy match (Chinese + English)
 * 4. Fallback by title-placeholder presence then count
 */
function pickLayout(info: TemplateInfo, slide: SlideEntry): TemplateLayout {
  // Tier 1: exact match on layout field
  if (slide.layout) {
    const norm = normalizeLayoutName(slide.layout);
    const exact = info.layouts.find((l) => normalizeLayoutName(l.name) === norm);
    if (exact) return exact;
  }

  // Tier 2: semantic match (image → layout with picture placeholder)
  if (slide.imagePath) {
    const withPic = info.layouts.find((l) =>
      l.placeholders.some((p) => p.type === "picture"),
    );
    if (withPic) return withPic;
  }

  // Tier 3: keyword fuzzy match
  const keywords = LAYOUT_KEYWORDS[slide.type] ?? LAYOUT_KEYWORDS["content"];
  for (const kw of keywords) {
    const found = info.layouts.find((l) =>
      l.name.toLowerCase().includes(kw.toLowerCase()),
    );
    if (found) return found;
  }

  // Tier 4: fallback – prefer layouts with title placeholder, then by count
  const sorted = [...info.layouts].sort((a, b) => {
    const aTitle = a.placeholders.some((p) => p.type === "title") ? 1 : 0;
    const bTitle = b.placeholders.some((p) => p.type === "title") ? 1 : 0;
    return bTitle - aTitle || b.placeholders.length - a.placeholders.length;
  });
  return sorted[0] ?? info.layouts[0];
}

// ─── Main entry ───

export async function composeFromTemplate(
  zip: JSZip,
  info: TemplateInfo,
  outline: Outline,
  onProgress?: OnProgress,
): Promise<Buffer> {
  await removeExistingSlides(zip);

  const slideRels: { rId: string; path: string }[] = [];
  const allImageExts = new Set<string>();

  for (let i = 0; i < outline.slides.length; i++) {
    const slideEntry = outline.slides[i];
    const slideNum = i + 1;
    onProgress?.({ type: "template-composing", slideNumber: slideNum, total: outline.slides.length });

    const layout = pickLayout(info, slideEntry);
    const content = slideEntryToContent(slideEntry);
    const slideFileName = `slide${slideNum}.xml`;
    const slidePath = `ppt/slides/${slideFileName}`;
    const slideRelsPath = `ppt/slides/_rels/${slideFileName}.rels`;

    // Build slide XML — images write to zip and collect rels
    const imageRels: { rId: string; target: string }[] = [];
    const slideXml = buildSlideXml(content, layout, info, zip, slideNum, imageRels);
    zip.file(slidePath, slideXml);

    // Track image extensions for Content_Types
    for (const ir of imageRels) {
      const ext = ir.target.split(".").pop() ?? "png";
      allImageExts.add(ext);
    }

    // Build slide relationships
    const layoutRelPath = getRelativePath("ppt/slides", layout.filePath);
    const slideRelsXml = buildSlideRelsXml(layoutRelPath, imageRels);
    zip.file(slideRelsPath, slideRelsXml);

    const rId = `rId${100 + slideNum}`;
    slideRels.push({ rId, path: slidePath });
  }

  await updatePresentation(zip, slideRels);
  await updateContentTypes(zip, slideRels, allImageExts);

  const output = await zip.generateAsync({ type: "nodebuffer" });
  return Buffer.from(output);
}

// ─── Content conversion ───

function slideEntryToContent(entry: SlideEntry): SlideContent {
  const elements: SlideElement[] = [];

  elements.push({ type: "title", text: entry.headline });

  if (entry.subHeadline) {
    elements.push({ type: "subtitle", text: entry.subHeadline });
  }

  // Image element
  if (entry.imagePath) {
    try {
      const data = readFileSync(entry.imagePath);
      const ext = extname(entry.imagePath).toLowerCase();
      const mimeType = EXT_TO_MIME[ext] ?? "image/png";
      elements.push({ type: "image", data, mimeType });
    } catch {
      // Skip if image file not found
    }
  }

  // Rich text takes priority over plain bodyPoints
  if (entry.richBodyPoints && entry.richBodyPoints.length > 0) {
    elements.push({
      type: "body",
      text: "",
      richParagraphs: entry.richBodyPoints,
    });
  } else if (entry.bodyPoints && entry.bodyPoints.length > 0) {
    elements.push({
      type: "body",
      text: entry.bodyPoints.join("\n"),
      bullets: entry.bodyPoints,
    });
  }

  return {
    layoutName: entry.type,
    elements,
  };
}

// ─── Slide XML generation ───

function buildSlideXml(
  content: SlideContent,
  layout: TemplateLayout,
  info: TemplateInfo,
  zip: JSZip,
  slideIndex: number,
  imageRels: { rId: string; target: string }[],
): string {
  const shapes: string[] = [];

  const titlePh = layout.placeholders.find((p) => p.type === "title");
  const subtitlePh = layout.placeholders.find((p) => p.type === "subtitle");
  const bodyPh = layout.placeholders.find((p) => p.type === "body");
  const picturePh = layout.placeholders.find((p) => p.type === "picture");

  let shapeId = 2;
  let imgCount = 0;

  for (const el of content.elements) {
    if (el.type === "title") {
      if (titlePh) {
        shapes.push(buildPlaceholderShape(shapeId++, titlePh, el.text, info, true));
      } else {
        shapes.push(buildFreeTextBox(shapeId++, el.text, info, {
          x: INCH, y: INCH / 2, cx: info.slideWidth - INCH * 2, cy: INCH,
        }, true));
      }
    } else if (el.type === "subtitle") {
      if (subtitlePh) {
        shapes.push(buildPlaceholderShape(shapeId++, subtitlePh, el.text, info, false));
      } else {
        shapes.push(buildFreeTextBox(shapeId++, el.text, info, {
          x: INCH, y: INCH * 1.8, cx: info.slideWidth - INCH * 2, cy: INCH * 0.6,
        }, false));
      }
    } else if (el.type === "body") {
      const forPh = !!bodyPh;
      let bodyXml: string;

      if (el.richParagraphs && el.richParagraphs.length > 0) {
        bodyXml = buildRichParagraphs(el.richParagraphs, info, forPh);
      } else if (el.bullets) {
        bodyXml = el.bullets.map((b) => buildBulletParagraph(b, info, forPh)).join("");
      } else {
        bodyXml = buildParagraph(el.text, info, false, forPh);
      }

      if (bodyPh) {
        shapes.push(buildPlaceholderShapeRaw(shapeId++, bodyPh, bodyXml));
      } else {
        shapes.push(buildFreeTextBoxRaw(shapeId++, bodyXml, {
          x: INCH, y: INCH * 2.5, cx: info.slideWidth - INCH * 2, cy: info.slideHeight - INCH * 3.5,
        }));
      }
    } else if (el.type === "image") {
      imgCount++;
      const ext = MIME_TO_EXT[el.mimeType] ?? "png";
      const mediaFileName = `img${slideIndex}_${imgCount}.${ext}`;
      const mediaPath = `ppt/media/${mediaFileName}`;

      // Write image data to ZIP
      zip.file(mediaPath, el.data);

      const rId = `rId${10 + imgCount}`;
      imageRels.push({ rId, target: `../media/${mediaFileName}` });

      // Position: use picture placeholder if available, else right-half fallback
      const pos = picturePh?.hasExplicitPosition
        ? picturePh.position
        : {
            x: Math.floor(info.slideWidth * 0.55),
            y: INCH,
            cx: Math.floor(info.slideWidth * 0.4),
            cy: Math.floor(info.slideHeight * 0.7),
          };

      shapes.push(buildPicShape(shapeId++, rId, pos));
    } else if (el.type === "table") {
      shapes.push(buildTableShape(shapeId++, el.headers, el.rows, info));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
${shapes.join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

// ─── Shape builders ───

function buildPlaceholderShape(
  id: number,
  ph: TemplatePlaceholder,
  text: string,
  info: TemplateInfo,
  isTitle: boolean,
): string {
  const body = buildParagraph(text, info, isTitle, true);
  return buildPlaceholderShapeRaw(id, ph, body);
}

function buildPlaceholderShapeRaw(
  id: number,
  ph: TemplatePlaceholder,
  bodyXml: string,
): string {
  const phType = ph.type === "title" ? "title" : ph.type === "subtitle" ? "subTitle" : "body";

  // Only emit xfrm if the layout has explicit positioning; otherwise inherit from master
  const spPrContent = ph.hasExplicitPosition
    ? `
          <a:xfrm>
            <a:off x="${ph.position.x}" y="${ph.position.y}"/>
            <a:ext cx="${ph.position.cx}" cy="${ph.position.cy}"/>
          </a:xfrm>`
    : "";

  return `      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="Placeholder ${id}"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="${phType}" idx="${ph.idx}"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>${spPrContent}
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
${bodyXml}
        </p:txBody>
      </p:sp>`;
}

function buildFreeTextBox(
  id: number,
  text: string,
  info: TemplateInfo,
  pos: { x: number; y: number; cx: number; cy: number },
  isTitle: boolean,
): string {
  const body = buildParagraph(text, info, isTitle, false);
  return buildFreeTextBoxRaw(id, body, pos);
}

function buildFreeTextBoxRaw(
  id: number,
  bodyXml: string,
  pos: { x: number; y: number; cx: number; cy: number },
): string {
  return `      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${id}" name="TextBox ${id}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${pos.x}" y="${pos.y}"/>
            <a:ext cx="${pos.cx}" cy="${pos.cy}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" rtlCol="0"/>
          <a:lstStyle/>
${bodyXml}
        </p:txBody>
      </p:sp>`;
}

function buildPicShape(
  id: number,
  rId: string,
  pos: { x: number; y: number; cx: number; cy: number },
): string {
  return `      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="${id}" name="Image ${id}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="${rId}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${pos.x}" y="${pos.y}"/>
            <a:ext cx="${pos.cx}" cy="${pos.cy}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>`;
}

// ─── Text paragraph builders ───

/**
 * Build a single paragraph.
 * @param forPlaceholder When true, omit explicit font/size to let master styles inherit.
 */
function buildParagraph(text: string, info: TemplateInfo, isTitle: boolean, forPlaceholder = false): string {
  if (forPlaceholder) {
    return `          <a:p>
            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US" dirty="0"/>
              <a:t>${escapeXml(text)}</a:t>
            </a:r>
          </a:p>`;
  }

  // Free text box — write explicit styles
  const fontSize = isTitle ? 3200 : 1800;
  const bold = isTitle ? ' b="1"' : "";
  const font = isTitle ? info.fontScheme.majorFont : info.fontScheme.minorFont;

  return `          <a:p>
            <a:pPr algn="${isTitle ? "ctr" : "l"}"/>
            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US" sz="${fontSize}"${bold} dirty="0">
                <a:latin typeface="${escapeXml(font)}"/>
                <a:ea typeface="${escapeXml(font)}"/>
              </a:rPr>
              <a:t>${escapeXml(text)}</a:t>
            </a:r>
          </a:p>`;
}

/**
 * Build a bullet paragraph.
 * @param forPlaceholder When true, omit explicit font/size.
 */
function buildBulletParagraph(text: string, info: TemplateInfo, forPlaceholder = false): string {
  if (forPlaceholder) {
    return `          <a:p>
            <a:pPr marL="342900" indent="-342900">
              <a:buFont typeface="Arial"/>
              <a:buChar char="\u2022"/>
            </a:pPr>
            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US" dirty="0"/>
              <a:t>${escapeXml(text)}</a:t>
            </a:r>
          </a:p>`;
  }

  // Free text box — write explicit styles
  const font = info.fontScheme.minorFont;
  return `          <a:p>
            <a:pPr marL="342900" indent="-342900">
              <a:buFont typeface="Arial"/>
              <a:buChar char="\u2022"/>
            </a:pPr>
            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US" sz="1800" dirty="0">
                <a:latin typeface="${escapeXml(font)}"/>
                <a:ea typeface="${escapeXml(font)}"/>
              </a:rPr>
              <a:t>${escapeXml(text)}</a:t>
            </a:r>
          </a:p>`;
}

// ─── Rich text builders ───

function buildRichParagraphs(paragraphs: RichTextParagraph[], info: TemplateInfo, forPlaceholder: boolean): string {
  return paragraphs.map((p) => buildRichParagraph(p, info, forPlaceholder)).join("");
}

function buildRichParagraph(p: RichTextParagraph, info: TemplateInfo, forPlaceholder: boolean): string {
  const level = p.level ?? 0;
  const marL = 342900 + level * 457200;
  const indent = -342900;

  const bulletXml = p.bullet !== false
    ? `<a:buFont typeface="Arial"/><a:buChar char="\u2022"/>`
    : `<a:buNone/>`;

  const pPr = `<a:pPr lvl="${level}" marL="${marL}" indent="${indent}">${bulletXml}</a:pPr>`;
  const runs = p.runs.map((r) => buildRichRun(r, info, forPlaceholder)).join("");

  return `          <a:p>
            ${pPr}
${runs}
          </a:p>`;
}

function buildRichRun(r: RichTextRun, info: TemplateInfo, forPlaceholder: boolean): string {
  if (forPlaceholder) {
    // Only write attributes that carry explicit overrides
    const attrs = [
      r.bold !== undefined ? ` b="${r.bold ? 1 : 0}"` : "",
      r.italic !== undefined ? ` i="${r.italic ? 1 : 0}"` : "",
      r.fontSize !== undefined ? ` sz="${r.fontSize}"` : "",
      ' dirty="0"',
    ].join("");
    const solidFill = r.color
      ? `<a:solidFill><a:srgbClr val="${r.color}"/></a:solidFill>`
      : "";

    return `            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US"${attrs}>${solidFill}</a:rPr>
              <a:t>${escapeXml(r.text)}</a:t>
            </a:r>`;
  }

  // Free text box — write full styles
  const font = info.fontScheme.minorFont;
  const sz = r.fontSize ?? 1800;
  const boldAttr = r.bold ? ' b="1"' : "";
  const italicAttr = r.italic ? ' i="1"' : "";
  const solidFill = r.color
    ? `<a:solidFill><a:srgbClr val="${r.color}"/></a:solidFill>`
    : "";

  return `            <a:r>
              <a:rPr lang="zh-CN" altLang="en-US" sz="${sz}"${boldAttr}${italicAttr} dirty="0">
                ${solidFill}
                <a:latin typeface="${escapeXml(font)}"/>
                <a:ea typeface="${escapeXml(font)}"/>
              </a:rPr>
              <a:t>${escapeXml(r.text)}</a:t>
            </a:r>`;
}

// ─── Table builder ───

function buildTableShape(
  id: number,
  headers: string[],
  rows: string[][],
  info: TemplateInfo,
): string {
  const colCount = headers.length;
  const colWidth = Math.floor((info.slideWidth - INCH * 2) / colCount);
  const rowHeight = 370840;

  const colsXml = headers.map(() => `<a:gridCol w="${colWidth}"/>`).join("");

  const headerRow = `<a:tr h="${rowHeight}">
${headers.map((h) => `    <a:tc>
      <a:txBody><a:bodyPr/><a:lstStyle/>
        <a:p><a:r><a:rPr lang="zh-CN" b="1" sz="1400"/><a:t>${escapeXml(h)}</a:t></a:r></a:p>
      </a:txBody>
      <a:tcPr/>
    </a:tc>`).join("\n")}
  </a:tr>`;

  const dataRows = rows.map((row) => `<a:tr h="${rowHeight}">
${row.map((cell) => `    <a:tc>
      <a:txBody><a:bodyPr/><a:lstStyle/>
        <a:p><a:r><a:rPr lang="zh-CN" sz="1400"/><a:t>${escapeXml(cell)}</a:t></a:r></a:p>
      </a:txBody>
      <a:tcPr/>
    </a:tc>`).join("\n")}
  </a:tr>`).join("\n");

  const tableWidth = colWidth * colCount;
  const tableHeight = rowHeight * (rows.length + 1);
  const x = Math.floor((info.slideWidth - tableWidth) / 2);
  const y = Math.floor(info.slideHeight * 0.35);

  return `      <p:graphicFrame>
        <p:nvGraphicFramePr>
          <p:cNvPr id="${id}" name="Table ${id}"/>
          <p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>
          <p:nvPr/>
        </p:nvGraphicFramePr>
        <p:xfrm>
          <a:off x="${x}" y="${y}"/>
          <a:ext cx="${tableWidth}" cy="${tableHeight}"/>
        </p:xfrm>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">
            <a:tbl>
              <a:tblPr firstRow="1" bandRow="1">
                <a:tblStyle val="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>
              </a:tblPr>
              <a:tblGrid>${colsXml}</a:tblGrid>
              ${headerRow}
              ${dataRows}
            </a:tbl>
          </a:graphicData>
        </a:graphic>
      </p:graphicFrame>`;
}

// ─── ZIP manipulation helpers ───

async function removeExistingSlides(zip: JSZip): Promise<void> {
  const toRemove: string[] = [];
  zip.forEach((path) => {
    if (
      path.startsWith("ppt/slides/slide") ||
      path.startsWith("ppt/slides/_rels/slide")
    ) {
      toRemove.push(path);
    }
  });
  for (const path of toRemove) {
    zip.remove(path);
  }
}

async function updatePresentation(
  zip: JSZip,
  slideRels: { rId: string; path: string }[],
): Promise<void> {
  const presFile = zip.file("ppt/presentation.xml");
  if (!presFile) return;
  const presText = await presFile.async("text");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pres = parser.parse(presText) as any;

  const sldIdList = slideRels.map((sr, i) => ({
    "@_id": 256 + i,
    "@_r:id": sr.rId,
  }));

  pres["p:presentation"]["p:sldIdLst"] = { "p:sldId": sldIdList };

  const newPresXml = builder.build(pres) as string;
  zip.file("ppt/presentation.xml", newPresXml);

  // Update presentation.xml.rels
  const relsFile = zip.file("ppt/_rels/presentation.xml.rels");
  if (!relsFile) return;
  const relsText = await relsFile.async("text");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rels = parser.parse(relsText) as any;

  let existingRels = ensureArray(rels["Relationships"]?.["Relationship"]);

  // Remove old slide relationships
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingRels = existingRels.filter((r: any) => {
    return !r["@_Target"]?.startsWith("slides/slide");
  });

  // Add new slide relationships
  for (const sr of slideRels) {
    existingRels.push({
      "@_Id": sr.rId,
      "@_Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
      "@_Target": sr.path.replace("ppt/", ""),
    });
  }

  rels["Relationships"]["Relationship"] = existingRels;
  const newRelsXml = builder.build(rels) as string;
  zip.file("ppt/_rels/presentation.xml.rels", newRelsXml);
}

async function updateContentTypes(
  zip: JSZip,
  slideRels: { rId: string; path: string }[],
  imageExts: Set<string>,
): Promise<void> {
  const ctFile = zip.file("[Content_Types].xml");
  if (!ctFile) return;
  const ctText = await ctFile.async("text");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = parser.parse(ctText) as any;

  const types = ct["Types"];
  let overrides = ensureArray(types["Override"]);

  // Remove old slide overrides
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides = overrides.filter((o: any) => {
    return !o["@_PartName"]?.match(/\/ppt\/slides\/slide\d+\.xml$/);
  });

  // Add new slide overrides
  for (const sr of slideRels) {
    overrides.push({
      "@_PartName": `/${sr.path}`,
      "@_ContentType":
        "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    });
  }

  types["Override"] = overrides;

  // Ensure image MIME type defaults exist
  const defaults = ensureArray(types["Default"]);
  const extToMime: Record<string, string> = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };

  for (const ext of imageExts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exists = defaults.some((d: any) =>
      (d["@_Extension"] as string)?.toLowerCase() === ext.toLowerCase(),
    );
    if (!exists && extToMime[ext]) {
      defaults.push({
        "@_Extension": ext,
        "@_ContentType": extToMime[ext],
      });
    }
  }

  types["Default"] = defaults;

  const newCtXml = builder.build(ct) as string;
  zip.file("[Content_Types].xml", newCtXml);
}

function buildSlideRelsXml(
  layoutRelPath: string,
  imageRels: { rId: string; target: string }[],
): string {
  const imageRelEntries = imageRels
    .map(
      (ir) =>
        `  <Relationship Id="${ir.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${ir.target}"/>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="${layoutRelPath}"/>
${imageRelEntries}
</Relationships>`;
}

// ─── Utility helpers ───

function getRelativePath(fromDir: string, toPath: string): string {
  const fromParts = fromDir.split("/");
  const toParts = toPath.split("/");

  let common = 0;
  while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) {
    common++;
  }

  const ups = fromParts.length - common;
  const rest = toParts.slice(common);
  return "../".repeat(ups) + rest.join("/");
}

function ensureArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
