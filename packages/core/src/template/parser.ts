import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";
import type {
  TemplateInfo,
  TemplateLayout,
  TemplatePlaceholder,
  TemplateColorScheme,
  TemplateFontScheme,
} from "../types/index";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => {
    const arrayTags = [
      "p:sldLayoutId",
      "p:sp",
      "p:cSld",
      "a:r",
      "a:p",
      "p:sldId",
      "Relationship",
      "Override",
    ];
    return arrayTags.includes(name);
  },
});

/** Placeholder type index mapping from OpenXML spec */
const PH_TYPE_MAP: Record<string, TemplatePlaceholder["type"]> = {
  title: "title",
  ctrTitle: "title",
  subTitle: "subtitle",
  body: "body",
  obj: "body",
  pic: "picture",
  chart: "chart",
  tbl: "table",
  dt: "other",
  ftr: "other",
  sldNum: "other",
  hdr: "other",
};

export async function parseTemplate(source: string | Buffer): Promise<{ zip: JSZip; info: TemplateInfo }> {
  const buffer = typeof source === "string" ? readFileSync(source) : source;
  const zip = await JSZip.loadAsync(buffer);

  const info: TemplateInfo = {
    layouts: [],
    colorScheme: await extractColorScheme(zip),
    fontScheme: await extractFontScheme(zip),
    slideWidth: 12192000, // default 16:9
    slideHeight: 6858000,
    masterFilePaths: [],
    themeFilePath: "ppt/theme/theme1.xml",
  };

  // Extract slide dimensions from presentation.xml
  const presXml = await readXml(zip, "ppt/presentation.xml");
  if (presXml) {
    const sldSz = presXml["p:presentation"]?.["p:sldSz"];
    if (sldSz) {
      info.slideWidth = parseInt(sldSz["@_cx"] ?? "12192000", 10);
      info.slideHeight = parseInt(sldSz["@_cy"] ?? "6858000", 10);
    }
  }

  // Discover master slides
  const presRels = await readXml(zip, "ppt/_rels/presentation.xml.rels");
  if (presRels) {
    const rels = ensureArray(presRels["Relationships"]?.["Relationship"]);
    for (const rel of rels) {
      const target = rel["@_Target"] as string;
      if (target?.includes("slideMaster")) {
        info.masterFilePaths.push(`ppt/${target.replace(/^\.\//, "")}`);
      }
    }
  }

  // Extract layouts from each master
  for (const masterPath of info.masterFilePaths) {
    const masterRelsPath = masterPath.replace("slideMasters/", "slideMasters/_rels/") + ".rels";
    const masterRels = await readXml(zip, masterRelsPath);
    if (!masterRels) continue;

    const rels = ensureArray(masterRels["Relationships"]?.["Relationship"]);
    for (const rel of rels) {
      const target = rel["@_Target"] as string;
      if (!target?.includes("slideLayout")) continue;

      const layoutPath = resolveRelativePath(masterPath, target);
      const layout = await parseLayout(zip, layoutPath, rel["@_Id"] as string);
      if (layout) {
        info.layouts.push(layout);
      }
    }
  }

  return { zip, info };
}

async function parseLayout(zip: JSZip, filePath: string, rId: string): Promise<TemplateLayout | null> {
  const xml = await readXml(zip, filePath);
  if (!xml) return null;

  const cSld = xml["p:sldLayout"]?.["p:cSld"];
  const layoutName = (cSld?.["@_name"] || xml["p:sldLayout"]?.["@_type"] || "Unknown") as string;

  const placeholders: TemplatePlaceholder[] = [];
  const shapes = ensureArray(cSld?.["p:spTree"]?.["p:sp"]);

  for (const sp of shapes) {
    const ph = sp?.["p:nvSpPr"]?.["p:nvPr"]?.["p:ph"];
    if (!ph) continue;

    const phType = (ph["@_type"] ?? "body") as string;
    const phIdx = parseInt(ph["@_idx"] ?? "0", 10);

    const xfrm = sp["p:spPr"]?.["a:xfrm"];
    const off = xfrm?.["a:off"];
    const ext = xfrm?.["a:ext"];
    const hasExplicitPosition = !!(off && ext);

    placeholders.push({
      idx: phIdx,
      type: PH_TYPE_MAP[phType] ?? "other",
      name: sp["p:nvSpPr"]?.["p:cNvPr"]?.["@_name"] as string | undefined,
      position: {
        x: parseInt(off?.["@_x"] ?? "0", 10),
        y: parseInt(off?.["@_y"] ?? "0", 10),
        cx: parseInt(ext?.["@_cx"] ?? "0", 10),
        cy: parseInt(ext?.["@_cy"] ?? "0", 10),
      },
      hasExplicitPosition,
    });
  }

  return {
    name: layoutName,
    rId,
    filePath,
    placeholders,
  };
}

async function extractColorScheme(zip: JSZip): Promise<TemplateColorScheme> {
  const defaults: TemplateColorScheme = {
    dk1: "000000", lt1: "FFFFFF", dk2: "44546A", lt2: "E7E6E6",
    accent1: "4472C4", accent2: "ED7D31", accent3: "A5A5A5",
    accent4: "FFC000", accent5: "5B9BD5", accent6: "70AD47",
    hlink: "0563C1", folHlink: "954F72",
  };

  const themeXml = await readXml(zip, "ppt/theme/theme1.xml");
  if (!themeXml) return defaults;

  const clrScheme =
    themeXml["a:theme"]?.["a:themeElements"]?.["a:clrScheme"];
  if (!clrScheme) return defaults;

  const extract = (key: string): string => {
    const node = clrScheme[`a:${key}`];
    if (!node) return defaults[key as keyof TemplateColorScheme];
    // Color can be sysClr or srgbClr
    return (node["a:srgbClr"]?.["@_val"] ?? node["a:sysClr"]?.["@_lastClr"] ?? defaults[key as keyof TemplateColorScheme]) as string;
  };

  return {
    dk1: extract("dk1"), lt1: extract("lt1"),
    dk2: extract("dk2"), lt2: extract("lt2"),
    accent1: extract("accent1"), accent2: extract("accent2"),
    accent3: extract("accent3"), accent4: extract("accent4"),
    accent5: extract("accent5"), accent6: extract("accent6"),
    hlink: extract("hlink"), folHlink: extract("folHlink"),
  };
}

async function extractFontScheme(zip: JSZip): Promise<TemplateFontScheme> {
  const themeXml = await readXml(zip, "ppt/theme/theme1.xml");
  if (!themeXml) return { majorFont: "Calibri", minorFont: "Calibri" };

  const fontScheme =
    themeXml["a:theme"]?.["a:themeElements"]?.["a:fontScheme"];
  if (!fontScheme) return { majorFont: "Calibri", minorFont: "Calibri" };

  const majorLatin = fontScheme["a:majorFont"]?.["a:latin"]?.["@_typeface"];
  const minorLatin = fontScheme["a:minorFont"]?.["a:latin"]?.["@_typeface"];

  return {
    majorFont: (majorLatin ?? "Calibri") as string,
    minorFont: (minorLatin ?? "Calibri") as string,
  };
}

// ─── Helpers ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readXml(zip: JSZip, path: string): Promise<any | null> {
  const file = zip.file(path);
  if (!file) return null;
  const text = await file.async("text");
  return parser.parse(text);
}

function ensureArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

function resolveRelativePath(basePath: string, relative: string): string {
  const baseDir = basePath.substring(0, basePath.lastIndexOf("/"));
  const parts = baseDir.split("/");
  const relParts = relative.split("/");

  for (const part of relParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }

  return parts.join("/");
}
