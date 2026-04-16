// Core type definitions for ppt-maker

// ─── Dimension Types ───

export type Texture = "clean" | "grid" | "organic" | "pixel" | "paper";

export type Mood =
  | "professional"
  | "warm"
  | "cool"
  | "vibrant"
  | "dark"
  | "neutral"
  | "macaron";

export type Typography =
  | "geometric"
  | "humanist"
  | "handwritten"
  | "editorial"
  | "technical";

export type Density = "minimal" | "balanced" | "dense";

export interface StyleDimensions {
  texture: Texture;
  mood: Mood;
  typography: Typography;
  density: Density;
}

// ─── Preset Types ───

export type PresetName =
  | "blueprint"
  | "bold-editorial"
  | "chalkboard"
  | "corporate"
  | "dark-atmospheric"
  | "editorial-infographic"
  | "fantasy-animation"
  | "hand-drawn-edu"
  | "intuition-machine"
  | "minimal"
  | "notion"
  | "pixel-art"
  | "scientific"
  | "sketch-notes"
  | "vector-illustration"
  | "vintage"
  | "watercolor";

export interface ColorEntry {
  name: string;
  hex: string;
  usage: string;
}

export interface StyleSpec {
  name: PresetName;
  label: string;
  description: string;
  dimensions: StyleDimensions;
  bestFor: string;
  autoSelectKeywords: string[];
  aesthetic: string;
  background: { texture: string; baseColor: string; hex: string };
  typography: { headline: string; body: string };
  palette: ColorEntry[];
  visualElements: string[];
  rules: { do: string[]; dont: string[] };
}

// ─── Style Config (resolved for generation) ───

export interface ResolvedStyle {
  preset: PresetName | "custom";
  dimensions: StyleDimensions;
  spec: StyleSpec;
}

// ─── Audience ───

export type Audience =
  | "general"
  | "beginners"
  | "experts"
  | "executives";

// ─── Slide Types ───

export type SlideType = "cover" | "content" | "back-cover";

export interface SlideEntry {
  number: number;
  type: SlideType;
  filename: string;
  slug: string;
  narrativeGoal: string;
  headline: string;
  subHeadline?: string;
  bodyPoints?: string[];
  /** Rich text body (takes priority over bodyPoints when present) */
  richBodyPoints?: RichTextParagraph[];
  visual: string;
  layout?: string;
  /** Path to a local image to embed in the slide */
  imagePath?: string;
}

// ─── Outline ───

export interface Outline {
  topic: string;
  topicSlug: string;
  style: ResolvedStyle;
  audience: Audience;
  language: string;
  slideCount: number;
  generatedAt: string;
  styleInstructions: string;
  slides: SlideEntry[];
}

// ─── Generation Config ───

export interface GenerationConfig {
  source: string;
  style: PresetName | "custom";
  customDimensions?: StyleDimensions;
  audience: Audience;
  language: string;
  slideCount?: number;
  outputDir?: string;
  outlineOnly?: boolean;
  promptsOnly?: boolean;
  imagesOnly?: boolean;
  regenerateSlides?: number[];
  /** Path to a .pptx template file for editable PPTX generation */
  templatePath?: string;
  /** Raw template buffer (for Web UI uploads) */
  templateBuffer?: Buffer;
}

// ─── Generation Events (for progress tracking) ───

export type GenerationEvent =
  | { type: "analyzing"; source: string }
  | { type: "outline-generated"; slideCount: number }
  | { type: "prompts-generated"; count: number }
  | { type: "image-generating"; slideNumber: number; total: number }
  | { type: "image-generated"; slideNumber: number; total: number; path: string }
  | { type: "image-failed"; slideNumber: number; error: string }
  | { type: "template-parsing"; templatePath: string }
  | { type: "template-parsed"; layoutCount: number }
  | { type: "template-composing"; slideNumber: number; total: number }
  | { type: "merging"; format: "pptx" | "pdf" }
  | { type: "complete"; outputDir: string; files: string[] }
  | { type: "error"; message: string };

export type OnProgress = (event: GenerationEvent) => void;

// ─── Slide Image Info ───

export interface SlideImage {
  filename: string;
  path: string;
  index: number;
  promptPath?: string;
}

// ─── Template Types ───

export interface TemplatePlaceholder {
  idx: number;
  type: "title" | "body" | "subtitle" | "picture" | "chart" | "table" | "other";
  name?: string;
  /** Position in EMUs (English Metric Units) */
  position: { x: number; y: number; cx: number; cy: number };
  /** Whether this placeholder defines its own xfrm instead of inheriting from layout/master */
  hasExplicitPosition: boolean;
}

export interface TemplateLayout {
  name: string;
  rId: string;
  filePath: string;
  placeholders: TemplatePlaceholder[];
}

export interface TemplateColorScheme {
  dk1: string;
  lt1: string;
  dk2: string;
  lt2: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  accent5: string;
  accent6: string;
  hlink: string;
  folHlink: string;
}

export interface TemplateFontScheme {
  majorFont: string;
  minorFont: string;
}

export interface TemplateInfo {
  layouts: TemplateLayout[];
  colorScheme: TemplateColorScheme;
  fontScheme: TemplateFontScheme;
  slideWidth: number;
  slideHeight: number;
  masterFilePaths: string[];
  themeFilePath: string;
}

export interface RichTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
}

export interface RichTextParagraph {
  runs: RichTextRun[];
  bullet?: boolean;
  level?: number;
}

/** Content to place into a single slide */
export interface SlideContent {
  layoutName: string;
  elements: SlideElement[];
}

export type SlideElement =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "body"; text: string; bullets?: string[]; richParagraphs?: RichTextParagraph[] }
  | { type: "image"; data: Buffer; mimeType: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "chart"; chartType: "bar" | "line" | "pie"; data: ChartData };

export interface ChartData {
  categories: string[];
  series: { name: string; values: number[] }[];
}

// ─── Content Analysis ───

export interface ContentAnalysis {
  topic: string;
  topicSlug: string;
  wordCount: number;
  language: string;
  recommendedStyle: PresetName;
  recommendedSlideCount: number;
  contentSignals: string[];
}
