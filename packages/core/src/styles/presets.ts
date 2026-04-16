import type { StyleSpec, PresetName } from "../types/index";

export const PRESETS: Record<PresetName, StyleSpec> = {
  blueprint: {
    name: "blueprint",
    label: "Blueprint",
    description: "Technical, grid-based, cool blue tones",
    dimensions: { texture: "grid", mood: "cool", typography: "technical", density: "balanced" },
    bestFor: "Architecture, system design",
    autoSelectKeywords: ["architecture", "system", "data", "analysis", "technical"],
    aesthetic: "Engineering precision with analytical clarity. Cool blue tones on subtle grid overlay create a technical, systematic feel.",
    background: { texture: "Subtle grid overlay at 5-10% opacity", baseColor: "Blueprint Off-White", hex: "#FAF8F5" },
    typography: { headline: "Precise sans-serif with monospace accents, clear number distinction", body: "Clean sans-serif with technical precision, consistent stroke width" },
    palette: [
      { name: "Primary Blue", hex: "#2563EB", usage: "Headlines, key data" },
      { name: "Slate", hex: "#334155", usage: "Body text" },
      { name: "Off-White", hex: "#FAF8F5", usage: "Background" },
      { name: "Cyan Accent", hex: "#06B6D4", usage: "Highlights, links" },
    ],
    visualElements: ["Grid alignment lines", "Technical schematics", "Dimension lines", "90-degree connection lines"],
    rules: {
      do: ["Use grid alignment", "Show precise measurements", "Use technical diagrams"],
      dont: ["Use curved connection lines", "Use organic shapes", "Use warm colors"],
    },
  },

  "bold-editorial": {
    name: "bold-editorial",
    label: "Bold Editorial",
    description: "High-impact magazine style, dramatic scale",
    dimensions: { texture: "clean", mood: "vibrant", typography: "editorial", density: "balanced" },
    bestFor: "Product launches, keynotes",
    autoSelectKeywords: ["launch", "marketing", "keynote", "magazine"],
    aesthetic: "Magazine cover impact with dramatic typography scale. Bold, high-saturation colors create energy and excitement.",
    background: { texture: "Pure solid, no texture", baseColor: "Deep Black or White", hex: "#0A0A0A" },
    typography: { headline: "Bold condensed serif/sans with extreme scale contrast", body: "Classic serif with high thick-thin contrast" },
    palette: [
      { name: "Electric Blue", hex: "#3B82F6", usage: "Primary accent" },
      { name: "Vibrant Orange", hex: "#FB923C", usage: "Secondary accent" },
      { name: "Deep Black", hex: "#0A0A0A", usage: "Background" },
      { name: "Pure White", hex: "#FFFFFF", usage: "Text" },
    ],
    visualElements: ["Extreme scale typography", "Bold color blocks", "Dramatic whitespace"],
    rules: {
      do: ["Use extreme scale contrast", "Bold color blocks", "Dramatic compositions"],
      dont: ["Use muted colors", "Small subtle typography", "Busy backgrounds"],
    },
  },

  chalkboard: {
    name: "chalkboard",
    label: "Chalkboard",
    description: "Classroom board aesthetic, colorful chalk",
    dimensions: { texture: "organic", mood: "warm", typography: "handwritten", density: "balanced" },
    bestFor: "Education, tutorials",
    autoSelectKeywords: ["classroom", "teaching", "school", "chalkboard"],
    aesthetic: "Classroom warmth with nostalgic chalk-on-board feel. Imperfect hand-drawn lines and warm chalk colors.",
    background: { texture: "Dark surface with subtle scratches and chalk dust", baseColor: "Chalkboard Black", hex: "#1A1A1A" },
    typography: { headline: "Chalk-style handwritten, bold and slightly uneven", body: "Casual chalk print, organic imperfections" },
    palette: [
      { name: "Chalk White", hex: "#F5F5F5", usage: "Primary text" },
      { name: "Chalk Yellow", hex: "#FFE566", usage: "Highlights" },
      { name: "Chalk Blue", hex: "#87CEEB", usage: "Diagrams" },
      { name: "Chalk Pink", hex: "#FFB6C1", usage: "Accents" },
    ],
    visualElements: ["Chalk dust effects", "Imperfect hand-drawn lines", "Eraser smudges", "Doodle decorations"],
    rules: {
      do: ["Use imperfect lines", "Add chalk dust texture", "Hand-drawn doodles"],
      dont: ["Use perfect geometric shapes", "Use crisp digital edges", "Use photorealistic elements"],
    },
  },

  corporate: {
    name: "corporate",
    label: "Corporate",
    description: "Clean, navy/gold, professional",
    dimensions: { texture: "clean", mood: "professional", typography: "geometric", density: "balanced" },
    bestFor: "Investor decks, proposals",
    autoSelectKeywords: ["investor", "quarterly", "business", "corporate"],
    aesthetic: "Business credibility with institutional trust. Clean navy and gold palette with geometric precision.",
    background: { texture: "Pure solid, no texture", baseColor: "Pure White", hex: "#FFFFFF" },
    typography: { headline: "Modern geometric sans-serif, bold weight", body: "Clean sans-serif with mathematical precision" },
    palette: [
      { name: "Navy", hex: "#1E3A5F", usage: "Headlines, primary" },
      { name: "Gold", hex: "#C9A227", usage: "Accents, highlights" },
      { name: "Pure White", hex: "#FFFFFF", usage: "Background" },
      { name: "Light Gray", hex: "#F0F0F0", usage: "Card backgrounds" },
    ],
    visualElements: ["Consistent grid alignment", "Clean charts", "Outlined icons", "Structured layouts"],
    rules: {
      do: ["Use consistent grid", "Maintain professional tone", "Clean data visualization"],
      dont: ["Use playful/casual elements", "Handwritten fonts", "Bright saturated colors"],
    },
  },

  "dark-atmospheric": {
    name: "dark-atmospheric",
    label: "Dark Atmospheric",
    description: "Cinematic, moody, glowing accents",
    dimensions: { texture: "clean", mood: "dark", typography: "editorial", density: "balanced" },
    bestFor: "Entertainment, gaming",
    autoSelectKeywords: ["entertainment", "music", "gaming", "atmospheric"],
    aesthetic: "Cinematic depth with glowing accent elements. Deep dark backgrounds create dramatic staging for content.",
    background: { texture: "Pure solid, no texture", baseColor: "Deep Purple-Black", hex: "#0D0D1A" },
    typography: { headline: "Refined serif with editorial weight, high contrast", body: "Clean serif/sans, readable against dark backgrounds" },
    palette: [
      { name: "Purple", hex: "#8B5CF6", usage: "Primary accent" },
      { name: "Cyan", hex: "#06B6D4", usage: "Secondary accent" },
      { name: "Deep Background", hex: "#0D0D1A", usage: "Background" },
      { name: "Bright Coral", hex: "#FF6B6B", usage: "Highlights" },
    ],
    visualElements: ["Glow effects on accents", "High contrast elements", "Cinematic composition", "Subtle gradients"],
    rules: {
      do: ["Use high contrast", "Subtle glow effects", "Cinematic compositions"],
      dont: ["Overuse neon effects", "Use flat bright backgrounds", "Low contrast text"],
    },
  },

  "editorial-infographic": {
    name: "editorial-infographic",
    label: "Editorial Infographic",
    description: "Magazine explainer, publication quality",
    dimensions: { texture: "clean", mood: "cool", typography: "editorial", density: "dense" },
    bestFor: "Tech explainers, research",
    autoSelectKeywords: ["explainer", "journalism", "science communication"],
    aesthetic: "Publication-quality infographic with editorial precision. Dense information presented with clear hierarchy.",
    background: { texture: "Pure solid, no texture", baseColor: "Pure White", hex: "#FFFFFF" },
    typography: { headline: "Display serif with dramatic thick-thin contrast", body: "Classic serif, highly readable" },
    palette: [
      { name: "Royal Blue", hex: "#2563EB", usage: "Primary data, headlines" },
      { name: "Coral", hex: "#F97316", usage: "Accent, highlights" },
      { name: "Dark Slate", hex: "#1E293B", usage: "Body text" },
      { name: "Light Gray", hex: "#F1F5F9", usage: "Section backgrounds" },
    ],
    visualElements: ["Visual metaphors", "Data callouts", "Hairline rules", "Multi-section layouts"],
    rules: {
      do: ["Use visual metaphors", "Clear data hierarchy", "Editorial precision"],
      dont: ["Use photographic imagery", "Cluttered layouts", "Inconsistent styling"],
    },
  },

  "fantasy-animation": {
    name: "fantasy-animation",
    label: "Fantasy Animation",
    description: "Whimsical, storybook feel",
    dimensions: { texture: "organic", mood: "vibrant", typography: "handwritten", density: "minimal" },
    bestFor: "Educational storytelling",
    autoSelectKeywords: ["story", "fantasy", "animation", "magical"],
    aesthetic: "Whimsical storybook world with painterly textures. Vibrant colors and organic forms create magical atmosphere.",
    background: { texture: "Soft organic textures, canvas feel", baseColor: "Sky Blue or Cream", hex: "#E8F4FC" },
    typography: { headline: "Whimsical serif with handwritten character", body: "Casual handwritten print, friendly and approachable" },
    palette: [
      { name: "Forest Green", hex: "#2D5A3D", usage: "Primary" },
      { name: "Golden Yellow", hex: "#F4D03F", usage: "Accents, magic" },
      { name: "Sky Blue", hex: "#E8F4FC", usage: "Background" },
      { name: "Rose", hex: "#E07A5F", usage: "Highlights" },
    ],
    visualElements: ["Painterly textures", "Organic flowing shapes", "Storybook borders", "Nature elements"],
    rules: {
      do: ["Use painterly textures", "Organic flowing shapes", "Warm magical lighting"],
      dont: ["Use cold color palettes", "Sharp geometric shapes", "Technical diagrams"],
    },
  },

  "hand-drawn-edu": {
    name: "hand-drawn-edu",
    label: "Hand-Drawn Edu",
    description: "Macaron pastel blocks, doodle style",
    dimensions: { texture: "organic", mood: "macaron", typography: "handwritten", density: "balanced" },
    bestFor: "Educational diagrams, process explainers",
    autoSelectKeywords: ["hand-drawn", "infographic", "diagram", "process", "onboarding"],
    aesthetic: "Hand-drawn educational infographic with macaron pastel color zones. Friendly marker-style illustrations.",
    background: { texture: "Soft paper grain, canvas feel", baseColor: "Warm Cream", hex: "#F5F0E8" },
    typography: { headline: "Bold marker-style handwritten", body: "Casual print handwriting, slightly uneven" },
    palette: [
      { name: "Pastel Blue", hex: "#A8D8EA", usage: "Info zones" },
      { name: "Mint Green", hex: "#B5E5CF", usage: "Success, growth" },
      { name: "Lavender", hex: "#C3B1E1", usage: "Creative sections" },
      { name: "Peach", hex: "#FFDAC1", usage: "Highlights, warmth" },
    ],
    visualElements: ["Distinct color block zones", "Hand-drawn arrows", "Doodle icons", "Marker-style borders"],
    rules: {
      do: ["Use distinct color blocks", "Hand-drawn arrows and connectors", "Doodle decorations"],
      dont: ["Use straight lines", "Digital-precise shapes", "Monochrome palette"],
    },
  },

  "intuition-machine": {
    name: "intuition-machine",
    label: "Intuition Machine",
    description: "Bilingual technical briefing, aged paper",
    dimensions: { texture: "clean", mood: "cool", typography: "technical", density: "dense" },
    bestFor: "Technical docs, academic",
    autoSelectKeywords: ["briefing", "academic", "research", "bilingual"],
    aesthetic: "Technical briefing document with aged paper warmth. Dense information with bilingual label support.",
    background: { texture: "Subtle aged cream texture", baseColor: "Aged Cream", hex: "#F5F0E6" },
    typography: { headline: "Bold technical sans with bracket decorations", body: "Clean sans-serif, precise" },
    palette: [
      { name: "Maroon", hex: "#5D3A3A", usage: "Headlines" },
      { name: "Teal", hex: "#2F7373", usage: "Accents, data" },
      { name: "Aged Cream", hex: "#F5F0E6", usage: "Background" },
      { name: "Dark Text", hex: "#2D2D2D", usage: "Body text" },
    ],
    visualElements: ["Bilingual labels", "Bracket decorations", "Dense data tables", "Technical annotations"],
    rules: {
      do: ["Use bilingual labels", "Dense data layouts", "Technical annotations"],
      dont: ["Use photorealistic renders", "Playful decorations", "Loose layouts"],
    },
  },

  minimal: {
    name: "minimal",
    label: "Minimal",
    description: "Zen-like, maximum whitespace, geometric",
    dimensions: { texture: "clean", mood: "neutral", typography: "geometric", density: "minimal" },
    bestFor: "Executive briefings",
    autoSelectKeywords: ["executive", "minimal", "clean", "simple"],
    aesthetic: "Maximum sophistication through restraint. Zen-like whitespace with precise geometric typography.",
    background: { texture: "Pure solid, absolutely no texture", baseColor: "Pure White", hex: "#FFFFFF" },
    typography: { headline: "Light geometric sans-serif, elegant weight", body: "Clean sans-serif, minimal" },
    palette: [
      { name: "Near Black", hex: "#1A1A1A", usage: "Headlines" },
      { name: "Accent Blue", hex: "#2563EB", usage: "Single accent" },
      { name: "Pure White", hex: "#FFFFFF", usage: "Background" },
      { name: "Medium Gray", hex: "#6B7280", usage: "Body text" },
    ],
    visualElements: ["Maximum whitespace", "Single focal point", "Hairline rules", "Precise alignment"],
    rules: {
      do: ["Embrace empty space", "Single focal point per slide", "Precise alignment"],
      dont: ["Fill space with decoration", "Use multiple colors", "Busy layouts"],
    },
  },

  notion: {
    name: "notion",
    label: "Notion",
    description: "SaaS dashboard, card-based layout",
    dimensions: { texture: "clean", mood: "neutral", typography: "geometric", density: "dense" },
    bestFor: "Product demos, SaaS",
    autoSelectKeywords: ["saas", "product", "dashboard", "metrics"],
    aesthetic: "SaaS professional with functional card-based layouts. Data-forward presentation with systematic spacing.",
    background: { texture: "Pure solid, no texture", baseColor: "Light Gray", hex: "#F7F7F5" },
    typography: { headline: "System UI geometric sans-serif", body: "Clean sans-serif, functional" },
    palette: [
      { name: "Notion Blue", hex: "#2383E2", usage: "Links, primary actions" },
      { name: "Border Gray", hex: "#E5E5E5", usage: "Card borders, dividers" },
      { name: "Light Background", hex: "#F7F7F5", usage: "Page background" },
      { name: "Dark Text", hex: "#37352F", usage: "Body text" },
    ],
    visualElements: ["Card-based layouts", "Subtle borders", "Toggle/accordion sections", "Status badges"],
    rules: {
      do: ["Use card-based layout", "Subtle borders", "Functional spacing"],
      dont: ["Use rounded blob shapes", "Decorative illustrations", "Heavy drop shadows"],
    },
  },

  "pixel-art": {
    name: "pixel-art",
    label: "Pixel Art",
    description: "8-bit retro gaming aesthetic",
    dimensions: { texture: "pixel", mood: "vibrant", typography: "technical", density: "balanced" },
    bestFor: "Gaming, developer talks",
    autoSelectKeywords: ["gaming", "retro", "pixel", "developer"],
    aesthetic: "Retro 8-bit charm with chunky pixel aesthetic. Vibrant colors and aliased edges create nostalgic gaming feel.",
    background: { texture: "Visible pixel grid, chunky pixels", baseColor: "Sky Blue", hex: "#87CEEB" },
    typography: { headline: "Bitmap-style pixel font, blocky and bold", body: "Pixel font, clear and readable at low resolution" },
    palette: [
      { name: "Pixel Green", hex: "#00FF00", usage: "Success, active" },
      { name: "Pixel Red", hex: "#FF0000", usage: "Alert, important" },
      { name: "Sky Blue", hex: "#87CEEB", usage: "Background" },
      { name: "Pixel Yellow", hex: "#FFD700", usage: "Highlights" },
    ],
    visualElements: ["Consistent pixel grid", "8-bit character sprites", "Retro game UI elements", "Aliased edges"],
    rules: {
      do: ["Keep consistent pixel grid", "Use chunky aliased elements", "Retro game aesthetic"],
      dont: ["Use smooth gradients", "Anti-aliased edges", "Realistic proportions"],
    },
  },

  scientific: {
    name: "scientific",
    label: "Scientific",
    description: "Academic textbook diagrams",
    dimensions: { texture: "clean", mood: "cool", typography: "technical", density: "dense" },
    bestFor: "Biology, chemistry, medical",
    autoSelectKeywords: ["biology", "chemistry", "medical", "scientific"],
    aesthetic: "Academic precision with research-quality diagrams. Cool analytical palette with dense, labeled components.",
    background: { texture: "Pure solid, no texture", baseColor: "Off-White", hex: "#FAFAFA" },
    typography: { headline: "Precise serif similar to Times, academic weight", body: "Clean serif, highly readable for dense text" },
    palette: [
      { name: "Teal", hex: "#0D9488", usage: "Primary data, diagrams" },
      { name: "Amber", hex: "#F59E0B", usage: "Highlights, warnings" },
      { name: "Off-White", hex: "#FAFAFA", usage: "Background" },
      { name: "Dark Slate", hex: "#1E293B", usage: "Body text" },
    ],
    visualElements: ["Labeled diagrams", "Annotation callouts", "Scientific notation", "Cross-section views"],
    rules: {
      do: ["Use labeled components", "Scientific precision", "Clear annotations"],
      dont: ["Use artistic diagrams", "Decorative elements", "Imprecise labeling"],
    },
  },

  "sketch-notes": {
    name: "sketch-notes",
    label: "Sketch Notes",
    description: "Hand-drawn, warm, approachable",
    dimensions: { texture: "organic", mood: "warm", typography: "handwritten", density: "balanced" },
    bestFor: "Educational, tutorials",
    autoSelectKeywords: ["tutorial", "learn", "education", "guide", "beginner"],
    aesthetic: "Friendly learning environment with warm hand-drawn illustrations. Approachable and welcoming.",
    background: { texture: "Soft paper grain, slight cream warmth", baseColor: "Warm Off-White", hex: "#FAF8F0" },
    typography: { headline: "Bold marker-style handwritten, energetic", body: "Casual handwritten print, friendly" },
    palette: [
      { name: "Warm Orange", hex: "#F4A261", usage: "Highlights, energy" },
      { name: "Sage Green", hex: "#87A96B", usage: "Balance, nature" },
      { name: "Off-White", hex: "#FAF8F0", usage: "Background" },
      { name: "Charcoal", hex: "#333333", usage: "Body text" },
    ],
    visualElements: ["Hand-drawn icons", "Brush stroke underlines", "Doodle decorations", "Sticky note elements"],
    rules: {
      do: ["Allow imperfection", "Hand-drawn connectors", "Warm friendly tone"],
      dont: ["Use clinical white backgrounds", "Perfect geometric shapes", "Cold formal styling"],
    },
  },

  "vector-illustration": {
    name: "vector-illustration",
    label: "Vector Illustration",
    description: "Flat design, black outlines",
    dimensions: { texture: "clean", mood: "vibrant", typography: "humanist", density: "balanced" },
    bestFor: "Creative, children's content",
    autoSelectKeywords: ["creative", "children", "kids", "cute"],
    aesthetic: "Flat design with uniform black outlines. Playful, vibrant illustrations with clean vector style.",
    background: { texture: "Clean solid with subtle warmth", baseColor: "Warm Cream", hex: "#F5F0E6" },
    typography: { headline: "Retro serif with humanist warmth, friendly weight", body: "Readable sans-serif with open counters" },
    palette: [
      { name: "Coral", hex: "#E07A5F", usage: "Primary, warmth" },
      { name: "Mint", hex: "#81B29A", usage: "Secondary, balance" },
      { name: "Cream", hex: "#F5F0E6", usage: "Background" },
      { name: "Navy", hex: "#3D405B", usage: "Text, outlines" },
    ],
    visualElements: ["Uniform black outlines", "Flat color fills", "Character illustrations", "Simple geometric shapes"],
    rules: {
      do: ["Use uniform black outlines", "Flat color fills only", "Simple geometric characters"],
      dont: ["Use gradients or shading", "Drop shadows", "Realistic proportions"],
    },
  },

  vintage: {
    name: "vintage",
    label: "Vintage",
    description: "Aged parchment, historical journal",
    dimensions: { texture: "paper", mood: "warm", typography: "editorial", density: "balanced" },
    bestFor: "Historical, heritage",
    autoSelectKeywords: ["history", "heritage", "vintage", "expedition"],
    aesthetic: "Explorer's journal with aged parchment feel. Warm tones and editorial typography create historical atmosphere.",
    background: { texture: "Aged paper with subtle creases and discoloration", baseColor: "Parchment", hex: "#F5E6D3" },
    typography: { headline: "Classic editorial serif, bold and authoritative", body: "Readable serif with old-style numerals" },
    palette: [
      { name: "Dark Brown", hex: "#3D2914", usage: "Headlines, primary" },
      { name: "Burgundy", hex: "#722F37", usage: "Accents" },
      { name: "Parchment", hex: "#F5E6D3", usage: "Background" },
      { name: "Forest", hex: "#355E3B", usage: "Secondary" },
    ],
    visualElements: ["Worn edge textures", "Vintage stamps", "Aged elements", "Sepia overlays"],
    rules: {
      do: ["Add worn edge textures", "Use aged paper effects", "Historical styling"],
      dont: ["Use crisp clean edges", "Bright digital colors", "Modern minimalism"],
    },
  },

  watercolor: {
    name: "watercolor",
    label: "Watercolor",
    description: "Soft brush strokes, natural warmth",
    dimensions: { texture: "organic", mood: "warm", typography: "humanist", density: "minimal" },
    bestFor: "Lifestyle, wellness",
    autoSelectKeywords: ["lifestyle", "wellness", "travel", "artistic"],
    aesthetic: "Artistic natural beauty with soft watercolor washes. Organic textures and warm palette create gentle atmosphere.",
    background: { texture: "Soft watercolor paper texture, subtle grain", baseColor: "Warm Off-White", hex: "#FAF8F0" },
    typography: { headline: "Brush script with organic character, flowing", body: "Humanist sans-serif, friendly and warm" },
    palette: [
      { name: "Warm Coral", hex: "#F4A261", usage: "Primary accent" },
      { name: "Soft Rose", hex: "#E8A0A0", usage: "Warmth, highlights" },
      { name: "Off-White", hex: "#FAF8F0", usage: "Background" },
      { name: "Warm Gray", hex: "#5C5C5C", usage: "Body text" },
    ],
    visualElements: ["Visible color bleeding", "Brush stroke washes", "Organic flowing shapes", "Watercolor splotches"],
    rules: {
      do: ["Use visible color bleeding", "Soft organic shapes", "Watercolor textures"],
      dont: ["Use hard edges", "Perfect geometric shapes", "Digital precision"],
    },
  },
};

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

export function getPreset(name: PresetName): StyleSpec {
  return PRESETS[name];
}

export function getAllPresets(): StyleSpec[] {
  return Object.values(PRESETS);
}
