import { NextRequest, NextResponse } from "next/server";
import {
  analyzeContent,
  resolveStyle,
  generateOutline,
  outlineToMarkdown,
  generateAllPrompts,
  ClaudeImageGenerator,
  generateSlideImages,
  mergeToPptx,
  mergeToPdf,
  parseTemplate,
  composeFromTemplate,
  PRESET_NAMES,
} from "@ppt-maker/core";
import type { PresetName, Audience } from "@ppt-maker/core";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const VALID_STYLES = new Set<string>(PRESET_NAMES);
const VALID_AUDIENCES = new Set<string>(["general", "beginners", "experts", "executives"]);

function validateStyle(value: unknown): PresetName {
  const s = typeof value === "string" ? value : "blueprint";
  return VALID_STYLES.has(s) ? (s as PresetName) : "blueprint";
}

function validateAudience(value: unknown): Audience {
  const a = typeof value === "string" ? value : "general";
  return VALID_AUDIENCES.has(a) ? (a as Audience) : "general";
}

function validateSlideCount(value: unknown): number | undefined {
  if (value == null) return undefined;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (Number.isNaN(n) || n < 1 || n > 50) return undefined;
  return n;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let source: string;
    let style: PresetName = "blueprint";
    let audience: Audience = "general";
    let slideCount: number | undefined;
    let apiKey: string | undefined;
    let outlineOnly = false;
    let templateBuffer: Buffer | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      source = formData.get("source") as string ?? "";
      style = validateStyle(formData.get("style"));
      audience = validateAudience(formData.get("audience"));
      slideCount = validateSlideCount(formData.get("slideCount"));
      apiKey = (formData.get("apiKey") as string) || undefined;
      outlineOnly = formData.get("outlineOnly") === "true";

      const templateFile = formData.get("template") as File | null;
      if (templateFile) {
        const arrayBuffer = await templateFile.arrayBuffer();
        templateBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await request.json();
      source = body.source ?? "";
      style = validateStyle(body.style);
      audience = validateAudience(body.audience);
      slideCount = validateSlideCount(body.slideCount);
      apiKey = body.apiKey;
      outlineOnly = body.outlineOnly ?? false;
    }

    if (!source?.trim()) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Source content is required" } },
        { status: 400 },
      );
    }

    // Analyze content
    const analysis = analyzeContent(source);
    const resolvedStyle = resolveStyle(style);
    const count = slideCount ?? analysis.recommendedSlideCount;

    // Generate outline
    const outline = generateOutline(
      analysis,
      source,
      resolvedStyle,
      audience,
      analysis.language,
      count,
    );

    // Save to filesystem
    const outputDir = join(process.cwd(), "slide-deck", analysis.topicSlug);
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(join(outputDir, "prompts"), { recursive: true });

    writeFileSync(join(outputDir, `source-${analysis.topicSlug}.md`), source, "utf-8");
    writeFileSync(join(outputDir, "outline.md"), outlineToMarkdown(outline), "utf-8");

    const files: string[] = [join(outputDir, "outline.md")];

    if (outlineOnly) {
      return NextResponse.json({
        outputDir,
        files,
        outline: {
          topic: outline.topic,
          slideCount: outline.slideCount,
          style: outline.style.preset,
        },
      });
    }

    // ─── Template-based path ───
    if (templateBuffer) {
      const { zip, info } = await parseTemplate(templateBuffer);
      const pptxBuffer = await composeFromTemplate(zip, info, outline);
      const pptxPath = join(outputDir, `${analysis.topicSlug}.pptx`);
      writeFileSync(pptxPath, pptxBuffer);
      files.push(pptxPath);

      return NextResponse.json({
        outputDir,
        files,
        outline: {
          topic: outline.topic,
          slideCount: outline.slideCount,
          style: outline.style.preset,
        },
        mode: "template",
      });
    }

    // ─── Image-based path ───
    // Generate prompts
    const prompts = generateAllPrompts(outline);
    for (const [filename, content] of prompts) {
      writeFileSync(join(outputDir, "prompts", filename), content, "utf-8");
      files.push(join(outputDir, "prompts", filename));
    }

    if (!apiKey) {
      return NextResponse.json({
        outputDir,
        files,
        outline: {
          topic: outline.topic,
          slideCount: outline.slideCount,
          style: outline.style.preset,
        },
        message: "Outline and prompts generated. API key required for image generation.",
      });
    }

    // Generate images
    const generator = new ClaudeImageGenerator(apiKey);
    const sessionId = `slides-${analysis.topicSlug}-${Date.now()}`;
    const generatedImages = await generateSlideImages(
      generator,
      prompts,
      outputDir,
      sessionId,
    );
    files.push(...generatedImages);

    // Merge
    const warnings: string[] = [];
    try {
      const pptxPath = await mergeToPptx(outputDir);
      files.push(pptxPath);
    } catch (e) {
      warnings.push(`PPTX merge failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }

    try {
      const pdfPath = await mergeToPdf(outputDir);
      files.push(pdfPath);
    } catch (e) {
      warnings.push(`PDF merge failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }

    return NextResponse.json({
      outputDir,
      files,
      outline: {
        topic: outline.topic,
        slideCount: outline.slideCount,
        style: outline.style.preset,
      },
      ...(warnings.length > 0 && { warnings }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 },
    );
  }
}
