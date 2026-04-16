import type {
  PresetName,
  StyleDimensions,
  ResolvedStyle,
  ContentAnalysis,
} from "../types/index";
import { PRESETS, getPreset } from "./presets";

const AUTO_SELECT_MAP: Array<{ keywords: string[]; preset: PresetName }> = [
  { keywords: ["tutorial", "learn", "education", "guide", "beginner"], preset: "sketch-notes" },
  { keywords: ["hand-drawn", "infographic", "diagram", "process", "onboarding"], preset: "hand-drawn-edu" },
  { keywords: ["classroom", "teaching", "school", "chalkboard"], preset: "chalkboard" },
  { keywords: ["architecture", "system", "data", "analysis", "technical"], preset: "blueprint" },
  { keywords: ["creative", "children", "kids", "cute"], preset: "vector-illustration" },
  { keywords: ["briefing", "academic", "research", "bilingual"], preset: "intuition-machine" },
  { keywords: ["executive", "minimal", "clean", "simple"], preset: "minimal" },
  { keywords: ["saas", "product", "dashboard", "metrics"], preset: "notion" },
  { keywords: ["investor", "quarterly", "business", "corporate"], preset: "corporate" },
  { keywords: ["launch", "marketing", "keynote", "magazine"], preset: "bold-editorial" },
  { keywords: ["entertainment", "music", "gaming", "atmospheric"], preset: "dark-atmospheric" },
  { keywords: ["explainer", "journalism", "science communication"], preset: "editorial-infographic" },
  { keywords: ["story", "fantasy", "animation", "magical"], preset: "fantasy-animation" },
  { keywords: ["gaming", "retro", "pixel", "developer"], preset: "pixel-art" },
  { keywords: ["biology", "chemistry", "medical", "scientific"], preset: "scientific" },
  { keywords: ["history", "heritage", "vintage", "expedition"], preset: "vintage" },
  { keywords: ["lifestyle", "wellness", "travel", "artistic"], preset: "watercolor" },
];

export function detectStyle(content: string): PresetName {
  const lower = content.toLowerCase();

  for (const { keywords, preset } of AUTO_SELECT_MAP) {
    const matchCount = keywords.filter((kw) => lower.includes(kw)).length;
    if (matchCount >= 2) return preset;
  }

  for (const { keywords, preset } of AUTO_SELECT_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return preset;
  }

  return "blueprint";
}

export function resolveStyle(
  preset: PresetName | "custom",
  customDimensions?: StyleDimensions,
): ResolvedStyle {
  if (preset !== "custom") {
    const spec = getPreset(preset);
    return { preset, dimensions: spec.dimensions, spec };
  }

  if (!customDimensions) {
    throw new Error("Custom dimensions required when preset is 'custom'");
  }

  const closestPreset = findClosestPreset(customDimensions);
  const spec = { ...getPreset(closestPreset) };
  spec.dimensions = customDimensions;
  spec.name = closestPreset;
  spec.description = `Custom: ${customDimensions.texture} + ${customDimensions.mood} + ${customDimensions.typography} + ${customDimensions.density}`;

  return { preset: "custom", dimensions: customDimensions, spec };
}

function findClosestPreset(dims: StyleDimensions): PresetName {
  let bestMatch: PresetName = "blueprint";
  let bestScore = 0;

  for (const [name, spec] of Object.entries(PRESETS)) {
    let score = 0;
    if (spec.dimensions.texture === dims.texture) score++;
    if (spec.dimensions.mood === dims.mood) score++;
    if (spec.dimensions.typography === dims.typography) score++;
    if (spec.dimensions.density === dims.density) score++;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = name as PresetName;
    }
  }

  return bestMatch;
}

export function recommendSlideCount(wordCount: number): number {
  if (wordCount < 1000) return 8;
  if (wordCount < 3000) return 14;
  if (wordCount < 5000) return 20;
  return 25;
}

export function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30)
    .replace(/-$/, "");
}

export function analyzeContent(source: string): ContentAnalysis {
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const topicMatch = source.match(/^#\s+(.+)$/m);
  const topic = topicMatch?.[1] ?? source.slice(0, 60).replace(/\n/g, " ").trim();
  const topicSlug = generateSlug(topic);

  const style = detectStyle(source);
  const slideCount = recommendSlideCount(wordCount);

  const language = detectLanguage(source);

  const contentSignals = detectContentSignals(source);

  return {
    topic,
    topicSlug,
    wordCount,
    language,
    recommendedStyle: style,
    recommendedSlideCount: slideCount,
    contentSignals,
  };
}

function detectLanguage(text: string): string {
  const cjkPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g;
  const cjkMatches = text.match(cjkPattern) || [];

  if (cjkMatches.length > 5) {
    const jpPattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    if (jpPattern.test(text)) return "ja";
    return "zh";
  }

  return "en";
}

function detectContentSignals(text: string): string[] {
  const lower = text.toLowerCase();
  const signals: string[] = [];

  for (const { keywords, preset } of AUTO_SELECT_MAP) {
    const matches = keywords.filter((kw) => lower.includes(kw));
    if (matches.length > 0) {
      signals.push(`${preset}: ${matches.join(", ")}`);
    }
  }

  return signals;
}
