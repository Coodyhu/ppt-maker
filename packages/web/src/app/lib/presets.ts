// Client-safe preset data (no Node.js dependencies)

export type PresetName =
  | "blueprint" | "bold-editorial" | "chalkboard" | "corporate"
  | "dark-atmospheric" | "editorial-infographic" | "fantasy-animation"
  | "hand-drawn-edu" | "intuition-machine" | "minimal" | "notion"
  | "pixel-art" | "scientific" | "sketch-notes" | "vector-illustration"
  | "vintage" | "watercolor";

export type Audience = "general" | "beginners" | "experts" | "executives";

export interface PresetInfo {
  name: PresetName;
  label: string;
  description: string;
  bestFor: string;
  palette: { name: string; hex: string }[];
  dimensions: { texture: string; mood: string; typography: string; density: string };
}

export const PRESETS: PresetInfo[] = [
  { name: "blueprint", label: "Blueprint", description: "Technical, grid-based, cool blue tones", bestFor: "Architecture, system design", palette: [{ name: "Blue", hex: "#2563EB" }, { name: "Slate", hex: "#334155" }, { name: "Off-White", hex: "#FAF8F5" }, { name: "Cyan", hex: "#06B6D4" }], dimensions: { texture: "grid", mood: "cool", typography: "technical", density: "balanced" } },
  { name: "bold-editorial", label: "Bold Editorial", description: "High-impact magazine style", bestFor: "Product launches, keynotes", palette: [{ name: "Blue", hex: "#3B82F6" }, { name: "Orange", hex: "#FB923C" }, { name: "Black", hex: "#0A0A0A" }, { name: "White", hex: "#FFFFFF" }], dimensions: { texture: "clean", mood: "vibrant", typography: "editorial", density: "balanced" } },
  { name: "chalkboard", label: "Chalkboard", description: "Classroom board, colorful chalk", bestFor: "Education, tutorials", palette: [{ name: "White", hex: "#F5F5F5" }, { name: "Yellow", hex: "#FFE566" }, { name: "Blue", hex: "#87CEEB" }, { name: "Pink", hex: "#FFB6C1" }], dimensions: { texture: "organic", mood: "warm", typography: "handwritten", density: "balanced" } },
  { name: "corporate", label: "Corporate", description: "Clean, navy/gold, professional", bestFor: "Investor decks, proposals", palette: [{ name: "Navy", hex: "#1E3A5F" }, { name: "Gold", hex: "#C9A227" }, { name: "White", hex: "#FFFFFF" }, { name: "Gray", hex: "#F0F0F0" }], dimensions: { texture: "clean", mood: "professional", typography: "geometric", density: "balanced" } },
  { name: "dark-atmospheric", label: "Dark Atmospheric", description: "Cinematic, moody, glowing", bestFor: "Entertainment, gaming", palette: [{ name: "Purple", hex: "#8B5CF6" }, { name: "Cyan", hex: "#06B6D4" }, { name: "Dark", hex: "#0D0D1A" }, { name: "Coral", hex: "#FF6B6B" }], dimensions: { texture: "clean", mood: "dark", typography: "editorial", density: "balanced" } },
  { name: "editorial-infographic", label: "Editorial Infographic", description: "Magazine explainer quality", bestFor: "Tech explainers, research", palette: [{ name: "Blue", hex: "#2563EB" }, { name: "Coral", hex: "#F97316" }, { name: "Slate", hex: "#1E293B" }, { name: "Gray", hex: "#F1F5F9" }], dimensions: { texture: "clean", mood: "cool", typography: "editorial", density: "dense" } },
  { name: "fantasy-animation", label: "Fantasy Animation", description: "Whimsical, storybook feel", bestFor: "Educational storytelling", palette: [{ name: "Green", hex: "#2D5A3D" }, { name: "Gold", hex: "#F4D03F" }, { name: "Sky", hex: "#E8F4FC" }, { name: "Rose", hex: "#E07A5F" }], dimensions: { texture: "organic", mood: "vibrant", typography: "handwritten", density: "minimal" } },
  { name: "hand-drawn-edu", label: "Hand-Drawn Edu", description: "Macaron pastel, doodle style", bestFor: "Diagrams, process explainers", palette: [{ name: "Blue", hex: "#A8D8EA" }, { name: "Mint", hex: "#B5E5CF" }, { name: "Lavender", hex: "#C3B1E1" }, { name: "Peach", hex: "#FFDAC1" }], dimensions: { texture: "organic", mood: "macaron", typography: "handwritten", density: "balanced" } },
  { name: "intuition-machine", label: "Intuition Machine", description: "Bilingual technical briefing", bestFor: "Technical docs, academic", palette: [{ name: "Maroon", hex: "#5D3A3A" }, { name: "Teal", hex: "#2F7373" }, { name: "Cream", hex: "#F5F0E6" }, { name: "Dark", hex: "#2D2D2D" }], dimensions: { texture: "clean", mood: "cool", typography: "technical", density: "dense" } },
  { name: "minimal", label: "Minimal", description: "Zen-like, maximum whitespace", bestFor: "Executive briefings", palette: [{ name: "Black", hex: "#1A1A1A" }, { name: "Blue", hex: "#2563EB" }, { name: "White", hex: "#FFFFFF" }, { name: "Gray", hex: "#6B7280" }], dimensions: { texture: "clean", mood: "neutral", typography: "geometric", density: "minimal" } },
  { name: "notion", label: "Notion", description: "SaaS dashboard, card-based", bestFor: "Product demos, SaaS", palette: [{ name: "Blue", hex: "#2383E2" }, { name: "Border", hex: "#E5E5E5" }, { name: "BG", hex: "#F7F7F5" }, { name: "Text", hex: "#37352F" }], dimensions: { texture: "clean", mood: "neutral", typography: "geometric", density: "dense" } },
  { name: "pixel-art", label: "Pixel Art", description: "8-bit retro gaming aesthetic", bestFor: "Gaming, developer talks", palette: [{ name: "Green", hex: "#00FF00" }, { name: "Red", hex: "#FF0000" }, { name: "Sky", hex: "#87CEEB" }, { name: "Yellow", hex: "#FFD700" }], dimensions: { texture: "pixel", mood: "vibrant", typography: "technical", density: "balanced" } },
  { name: "scientific", label: "Scientific", description: "Academic textbook diagrams", bestFor: "Biology, chemistry, medical", palette: [{ name: "Teal", hex: "#0D9488" }, { name: "Amber", hex: "#F59E0B" }, { name: "White", hex: "#FAFAFA" }, { name: "Slate", hex: "#1E293B" }], dimensions: { texture: "clean", mood: "cool", typography: "technical", density: "dense" } },
  { name: "sketch-notes", label: "Sketch Notes", description: "Hand-drawn, warm, approachable", bestFor: "Educational, tutorials", palette: [{ name: "Orange", hex: "#F4A261" }, { name: "Green", hex: "#87A96B" }, { name: "White", hex: "#FAF8F0" }, { name: "Charcoal", hex: "#333333" }], dimensions: { texture: "organic", mood: "warm", typography: "handwritten", density: "balanced" } },
  { name: "vector-illustration", label: "Vector Illustration", description: "Flat design, black outlines", bestFor: "Creative, children's content", palette: [{ name: "Coral", hex: "#E07A5F" }, { name: "Mint", hex: "#81B29A" }, { name: "Cream", hex: "#F5F0E6" }, { name: "Navy", hex: "#3D405B" }], dimensions: { texture: "clean", mood: "vibrant", typography: "humanist", density: "balanced" } },
  { name: "vintage", label: "Vintage", description: "Aged parchment, historical", bestFor: "Historical, heritage", palette: [{ name: "Brown", hex: "#3D2914" }, { name: "Burgundy", hex: "#722F37" }, { name: "Parchment", hex: "#F5E6D3" }, { name: "Forest", hex: "#355E3B" }], dimensions: { texture: "paper", mood: "warm", typography: "editorial", density: "balanced" } },
  { name: "watercolor", label: "Watercolor", description: "Soft brush strokes, natural", bestFor: "Lifestyle, wellness", palette: [{ name: "Coral", hex: "#F4A261" }, { name: "Rose", hex: "#E8A0A0" }, { name: "White", hex: "#FAF8F0" }, { name: "Gray", hex: "#5C5C5C" }], dimensions: { texture: "organic", mood: "warm", typography: "humanist", density: "minimal" } },
];
