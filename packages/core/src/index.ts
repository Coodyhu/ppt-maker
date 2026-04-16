import { mkdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import type {
  GenerationConfig,
  OnProgress,
  Outline,
} from "./types/index";
import { analyzeContent, resolveStyle } from "./styles/index";
import { generateOutline, outlineToMarkdown } from "./outline/index";
import { generateAllPrompts } from "./prompts/index";
import {
  ClaudeImageGenerator,
  generateSlideImages,
} from "./generator/index";
import type { ImageGenerator } from "./generator/index";
import { mergeToPptx, mergeToPdf } from "./merger/index";
import { parseTemplate } from "./template/parser";
import { composeFromTemplate } from "./template/composer";

export async function createDeck(
  config: GenerationConfig,
  generator: ImageGenerator | null,
  onProgress?: OnProgress,
): Promise<{ outputDir: string; outline: Outline; files: string[] }> {
  onProgress?.({ type: "analyzing", source: config.source.slice(0, 100) });

  // 1. Analyze content
  const analysis = analyzeContent(config.source);

  // 2. Resolve style
  const style = resolveStyle(
    config.style,
    config.customDimensions,
  );

  // 3. Determine output directory
  const baseDir = config.outputDir ?? "slide-deck";
  const outputDir = join(baseDir, analysis.topicSlug);
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(join(outputDir, "prompts"), { recursive: true });

  // Save source
  writeFileSync(join(outputDir, `source-${analysis.topicSlug}.md`), config.source, "utf-8");

  // 4. Generate outline
  const slideCount = config.slideCount ?? analysis.recommendedSlideCount;
  const outline = generateOutline(
    analysis,
    config.source,
    style,
    config.audience,
    config.language,
    slideCount,
  );

  // Save outline
  const outlineMd = outlineToMarkdown(outline);
  writeFileSync(join(outputDir, "outline.md"), outlineMd, "utf-8");
  onProgress?.({ type: "outline-generated", slideCount: outline.slideCount });

  if (config.outlineOnly) {
    return { outputDir, outline, files: [join(outputDir, "outline.md")] };
  }

  // ─── Template-based path ───
  const hasTemplate = config.templatePath || config.templateBuffer;
  if (hasTemplate) {
    return createDeckFromTemplate(config, outline, outputDir, onProgress);
  }

  // ─── Image-based path (original) ───
  // 5. Generate prompts
  const prompts = generateAllPrompts(outline);
  for (const [filename, content] of prompts) {
    writeFileSync(join(outputDir, "prompts", filename), content, "utf-8");
  }
  onProgress?.({ type: "prompts-generated", count: prompts.size });

  if (config.promptsOnly) {
    return { outputDir, outline, files: [join(outputDir, "outline.md")] };
  }

  // 6. Generate images
  if (!generator) {
    throw new Error("ImageGenerator required for image-based slide generation. Use --template for editable PPTX.");
  }
  const sessionId = `slides-${analysis.topicSlug}-${Date.now()}`;
  const generatedImages = await generateSlideImages(
    generator,
    prompts,
    outputDir,
    sessionId,
    onProgress,
  );

  // 7. Merge to PPTX and PDF
  const files = [...generatedImages];

  try {
    onProgress?.({ type: "merging", format: "pptx" });
    const pptxPath = await mergeToPptx(outputDir);
    files.push(pptxPath);
  } catch (error) {
    onProgress?.({ type: "error", message: `PPTX merge failed: ${error}` });
  }

  try {
    onProgress?.({ type: "merging", format: "pdf" });
    const pdfPath = await mergeToPdf(outputDir);
    files.push(pdfPath);
  } catch (error) {
    onProgress?.({ type: "error", message: `PDF merge failed: ${error}` });
  }

  onProgress?.({ type: "complete", outputDir, files });

  return { outputDir, outline, files };
}

async function createDeckFromTemplate(
  config: GenerationConfig,
  outline: Outline,
  outputDir: string,
  onProgress?: OnProgress,
): Promise<{ outputDir: string; outline: Outline; files: string[] }> {
  const source = config.templateBuffer ?? config.templatePath!;
  onProgress?.({
    type: "template-parsing",
    templatePath: typeof source === "string" ? source : "(uploaded buffer)",
  });

  const { zip, info } = await parseTemplate(source);
  onProgress?.({ type: "template-parsed", layoutCount: info.layouts.length });

  // Compose editable PPTX
  const pptxBuffer = await composeFromTemplate(zip, info, outline, onProgress);

  const pptxPath = join(outputDir, `${outline.topicSlug}.pptx`);
  writeFileSync(pptxPath, pptxBuffer);

  const files = [join(outputDir, "outline.md"), pptxPath];
  onProgress?.({ type: "complete", outputDir, files });

  return { outputDir, outline, files };
}

// Re-export everything
export * from "./types/index";
export * from "./styles/index";
export * from "./outline/index";
export * from "./prompts/index";
export * from "./generator/index";
export * from "./merger/index";
export * from "./template/index";
