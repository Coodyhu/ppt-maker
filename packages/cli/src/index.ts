#!/usr/bin/env bun

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";
import {
  createDeck,
  ClaudeImageGenerator,
  getAllPresets,
  analyzeContent,
  resolveStyle,
  generateOutline,
  outlineToMarkdown,
  generateAllPrompts,
  mergeToPptx,
  mergeToPdf,
} from "@ppt-maker/core";
import type {
  PresetName,
  Audience,
  GenerationEvent,
  StyleDimensions,
} from "@ppt-maker/core";

const VERSION = "0.1.0";

function printHelp(): void {
  console.log(`
ppt-maker v${VERSION} — AI-powered slide deck generator

Usage:
  ppt-maker create <source.md> [options]    Create a slide deck
  ppt-maker styles                          List available styles
  ppt-maker merge <dir>                     Merge images to PPTX/PDF
  ppt-maker help                            Show this help

Create Options:
  --style <name>        Visual style preset (default: auto-detect)
  --audience <type>     Target audience: general, beginners, experts, executives
  --lang <code>         Output language: en, zh, ja, etc. (default: auto-detect)
  --slides <number>     Target slide count (default: auto from content length)
  --output <dir>        Output directory (default: ./slide-deck)
  --template <file>     Use a .pptx template for editable output
  --outline-only        Generate outline only, skip images
  --prompts-only        Generate outline + prompts, skip images
  --api-key <key>       Anthropic API key (or set ANTHROPIC_API_KEY env)

Examples:
  ppt-maker create presentation.md
  ppt-maker create content.md --style sketch-notes --slides 12
  ppt-maker create proposal.md --style corporate --audience executives
  ppt-maker create report.md --template company-template.pptx
  ppt-maker styles
  ppt-maker merge slide-deck/my-topic
`);
}

function printStyles(): void {
  const presets = getAllPresets();
  console.log("\nAvailable Styles:\n");
  console.log("  Name                    Description                              Best For");
  console.log("  ─────────────────────── ──────────────────────────────────────── ─────────────────────────");

  for (const preset of presets) {
    const name = preset.name.padEnd(24);
    const desc = preset.description.padEnd(40);
    console.log(`  ${name} ${desc} ${preset.bestFor}`);
  }

  console.log(`\n  Total: ${presets.length} presets`);
  console.log("  Custom combinations: 5×7×5×3 = 525 unique styles\n");
}

function progressHandler(event: GenerationEvent): void {
  switch (event.type) {
    case "analyzing":
      console.log(`\n📄 Analyzing content...`);
      break;
    case "outline-generated":
      console.log(`📋 Outline generated: ${event.slideCount} slides`);
      break;
    case "prompts-generated":
      console.log(`✏️  Prompts generated: ${event.count} files`);
      break;
    case "image-generating":
      process.stdout.write(`\r🎨 Generating image ${event.slideNumber}/${event.total}...`);
      break;
    case "image-generated":
      process.stdout.write(`\r✅ Generated image ${event.slideNumber}/${event.total}: ${event.path}\n`);
      break;
    case "image-failed":
      console.log(`\n❌ Failed slide ${event.slideNumber}: ${event.error}`);
      break;
    case "template-parsing":
      console.log(`📐 Parsing template: ${event.templatePath}`);
      break;
    case "template-parsed":
      console.log(`📐 Template parsed: ${event.layoutCount} layouts found`);
      break;
    case "template-composing":
      process.stdout.write(`\r📝 Composing slide ${event.slideNumber}/${event.total}...`);
      break;
    case "merging":
      console.log(`📦 Merging to ${event.format.toUpperCase()}...`);
      break;
    case "complete":
      console.log(`\n🎉 Complete! Output: ${event.outputDir}`);
      console.log(`   Files: ${event.files.length}`);
      break;
    case "error":
      console.error(`\n❗ Error: ${event.message}`);
      break;
  }
}

async function handleCreate(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      style: { type: "string", short: "s" },
      audience: { type: "string", short: "a" },
      lang: { type: "string", short: "l" },
      slides: { type: "string", short: "n" },
      output: { type: "string", short: "o" },
      template: { type: "string", short: "t" },
      "outline-only": { type: "boolean" },
      "prompts-only": { type: "boolean" },
      "api-key": { type: "string" },
    },
    allowPositionals: true,
  });

  const sourceFile = positionals[0];
  if (!sourceFile) {
    console.error("Error: source file required\nUsage: ppt-maker create <source.md>");
    process.exit(1);
  }

  if (!existsSync(sourceFile)) {
    console.error(`Error: file not found: ${sourceFile}`);
    process.exit(1);
  }

  const templatePath = values.template;
  if (templatePath && !existsSync(templatePath)) {
    console.error(`Error: template file not found: ${templatePath}`);
    process.exit(1);
  }

  const source = readFileSync(sourceFile, "utf-8");
  const apiKey = values["api-key"] ?? process.env["ANTHROPIC_API_KEY"];

  const outlineOnly = values["outline-only"] ?? false;
  const promptsOnly = values["prompts-only"] ?? false;

  // Template mode doesn't need API key for basic generation
  if (!outlineOnly && !promptsOnly && !templatePath && !apiKey) {
    console.error("Error: API key required for image generation");
    console.error("Set ANTHROPIC_API_KEY env or use --api-key");
    console.error("Alternatively, use --template <file.pptx> for editable PPTX output");
    process.exit(1);
  }

  const style = (values.style as PresetName) ?? "blueprint";
  const audience = (values.audience as Audience) ?? "general";
  const slideCount = values.slides ? parseInt(values.slides, 10) : undefined;

  // Auto-detect language from content
  const analysis = analyzeContent(source);
  const lang = values.lang ?? analysis.language;

  console.log(`\nppt-maker v${VERSION}`);
  console.log(`─────────────────────────────`);
  console.log(`Source:   ${sourceFile}`);
  console.log(`Topic:    ${analysis.topic}`);
  console.log(`Style:    ${style}`);
  console.log(`Audience: ${audience}`);
  console.log(`Language: ${lang}`);
  console.log(`Slides:   ${slideCount ?? analysis.recommendedSlideCount} (${slideCount ? "custom" : "auto"})`);
  if (templatePath) {
    console.log(`Template: ${templatePath}`);
  }

  const generator = apiKey ? new ClaudeImageGenerator(apiKey) : null;

  if (outlineOnly || promptsOnly) {
    const resolvedStyle = resolveStyle(style);
    const outline = generateOutline(
      analysis,
      source,
      resolvedStyle,
      audience,
      lang,
      slideCount ?? analysis.recommendedSlideCount,
    );

    const { mkdirSync, writeFileSync } = await import("fs");
    const { join } = await import("path");
    const outputDir = values.output
      ? `${values.output}/${analysis.topicSlug}`
      : `slide-deck/${analysis.topicSlug}`;
    mkdirSync(outputDir, { recursive: true });

    const outlineMd = outlineToMarkdown(outline);
    writeFileSync(`${outputDir}/outline.md`, outlineMd, "utf-8");
    console.log(`\n📋 Outline saved: ${outputDir}/outline.md`);

    if (promptsOnly) {
      mkdirSync(`${outputDir}/prompts`, { recursive: true });
      const prompts = generateAllPrompts(outline);
      for (const [filename, content] of prompts) {
        writeFileSync(`${outputDir}/prompts/${filename}`, content, "utf-8");
      }
      console.log(`✏️  Prompts saved: ${outputDir}/prompts/ (${prompts.size} files)`);
    }

    return;
  }

  const result = await createDeck(
    {
      source,
      style,
      audience,
      language: lang,
      slideCount,
      outputDir: values.output,
      templatePath,
    },
    generator!,
    progressHandler,
  );
}

async function handleMerge(args: string[]): Promise<void> {
  const dir = args[0];
  if (!dir) {
    console.error("Error: directory required\nUsage: ppt-maker merge <slide-deck-dir>");
    process.exit(1);
  }

  if (!existsSync(dir)) {
    console.error(`Error: directory not found: ${dir}`);
    process.exit(1);
  }

  console.log(`\nMerging slides from: ${dir}`);

  try {
    const pptxPath = await mergeToPptx(dir);
    console.log(`📦 PPTX: ${pptxPath}`);
  } catch (error) {
    console.error(`❌ PPTX failed: ${error}`);
  }

  try {
    const pdfPath = await mergeToPdf(dir);
    console.log(`📦 PDF: ${pdfPath}`);
  } catch (error) {
    console.error(`❌ PDF failed: ${error}`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "create":
      await handleCreate(args.slice(1));
      break;
    case "styles":
    case "list-styles":
      printStyles();
      break;
    case "merge":
      await handleMerge(args.slice(1));
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(`ppt-maker v${VERSION}`);
      break;
    default:
      // If first arg looks like a file, treat as create
      if (existsSync(command)) {
        await handleCreate(args);
      } else {
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
      }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
