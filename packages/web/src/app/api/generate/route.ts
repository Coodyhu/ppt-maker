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
} from "@ppt-maker/core";
import type { PresetName, Audience } from "@ppt-maker/core";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

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
      style = (formData.get("style") as PresetName) ?? "blueprint";
      audience = (formData.get("audience") as Audience) ?? "general";
      const sc = formData.get("slideCount") as string;
      slideCount = sc ? parseInt(sc, 10) : undefined;
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
      style = body.style ?? "blueprint";
      audience = body.audience ?? "general";
      slideCount = body.slideCount;
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
    try {
      const pptxPath = await mergeToPptx(outputDir);
      files.push(pptxPath);
    } catch {}

    try {
      const pdfPath = await mergeToPdf(outputDir);
      files.push(pdfPath);
    } catch {}

    return NextResponse.json({
      outputDir,
      files,
      outline: {
        topic: outline.topic,
        slideCount: outline.slideCount,
        style: outline.style.preset,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}
