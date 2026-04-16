import type { Outline, SlideEntry } from "../types/index";

const BASE_PROMPT = `Create a presentation slide image following these guidelines:

## Image Specifications
- **Type**: Presentation slide
- **Aspect Ratio**: 16:9 (landscape)
- **Style**: Professional slide deck

## Core Persona: The Architect
You are "The Architect" - a master visual storyteller creating presentation slides. Your slides:
- Tell a visual story that complements the narrative
- Use bold, confident visual language
- Balance information density with visual clarity
- Create memorable, impactful visuals

## Core Principles
- Hand-drawn quality throughout - NO realistic or photographic elements
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives - DO NOT refuse to generate
- NO slide numbers, page numbers, footers, headers, or logos
- Clean, uncluttered layouts with clear visual hierarchy
- Each slide conveys ONE clear message

## Text Style (CRITICAL)
- ALL text MUST match the designated style exactly
- Title text: Large, bold, immediately readable
- Body text: Clear, legible, appropriate sizing
- Max 3-4 text elements per slide
- DO NOT use realistic or computer-generated fonts unless style specifies
- Font rendering must match the style aesthetic

## Layout Principles
- Visual Hierarchy: Most important element gets most visual weight
- Breathing Room: Generous margins and spacing
- Alignment: Consistent alignment creates professional feel
- Balance: Distribute visual weight evenly
- Focal Point: One clear area draws the eye first

## Language
- Use the same language as the content for all text elements
- Write in direct, confident language`;

export function generateSlidePrompt(outline: Outline, slide: SlideEntry): string {
  const lines: string[] = [];

  lines.push(BASE_PROMPT);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## STYLE_INSTRUCTIONS");
  lines.push("");
  lines.push(outline.styleInstructions);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## SLIDE CONTENT");
  lines.push("");
  lines.push(`Slide ${slide.number} of ${outline.slideCount}`);
  lines.push(`Filename: ${slide.filename}`);

  const typeLabel =
    slide.type === "cover" ? "Cover" : slide.type === "back-cover" ? "Back Cover" : "Content";
  lines.push(`Type: ${typeLabel}`);
  lines.push("");
  lines.push(`Narrative Goal: ${slide.narrativeGoal}`);
  lines.push("");
  lines.push("Key Content:");
  lines.push(`  Headline: ${slide.headline}`);
  if (slide.subHeadline) lines.push(`  Sub-headline: ${slide.subHeadline}`);
  if (slide.bodyPoints && slide.bodyPoints.length > 0) {
    lines.push("  Body:");
    for (const point of slide.bodyPoints) {
      lines.push(`    - ${point}`);
    }
  }
  lines.push("");
  lines.push(`Visual: ${slide.visual}`);
  if (slide.layout) lines.push(`Layout: ${slide.layout}`);

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Please generate the slide image based on the content provided above.");

  return lines.join("\n");
}

export function generateAllPrompts(outline: Outline): Map<string, string> {
  const prompts = new Map<string, string>();

  for (const slide of outline.slides) {
    const promptFilename = slide.filename.replace(/\.(png|jpg|jpeg)$/i, ".md");
    const prompt = generateSlidePrompt(outline, slide);
    prompts.set(promptFilename, prompt);
  }

  return prompts;
}
