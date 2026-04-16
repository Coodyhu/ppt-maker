import type {
  Outline,
  SlideEntry,
  ResolvedStyle,
  Audience,
  ContentAnalysis,
} from "../types/index";

export function buildStyleInstructions(style: ResolvedStyle): string {
  const { spec } = style;
  const paletteLines = spec.palette
    .map((c) => `  ${c.name}: ${c.hex} — ${c.usage}`)
    .join("\n");
  const visualLines = spec.visualElements.map((v) => `  - ${v}`).join("\n");

  return `<STYLE_INSTRUCTIONS>
Design Aesthetic: ${spec.aesthetic}

Background:
  Texture: ${spec.background.texture}
  Base Color: ${spec.background.baseColor} (${spec.background.hex})

Typography:
  Headlines: ${spec.typography.headline}
  Body: ${spec.typography.body}

Color Palette:
${paletteLines}

Visual Elements:
${visualLines}

Density Guidelines:
  ${densityGuideline(style.dimensions.density)}

Style Rules:
  Do: ${spec.rules.do.join("; ")}
  Don't: ${spec.rules.dont.join("; ")}
</STYLE_INSTRUCTIONS>`;
}

function densityGuideline(density: string): string {
  switch (density) {
    case "minimal":
      return "One focus point per slide, large visuals, minimal text (headline + 1-2 lines), 15%+ margins";
    case "balanced":
      return "2-3 key points per slide, balanced text/visual ratio, standard margins (10%), clear hierarchy";
    case "dense":
      return "Multiple data points, charts/tables allowed, compact margins (5-8%), strategic whitespace";
    default:
      return "2-3 key points per slide";
  }
}

export function generateOutline(
  analysis: ContentAnalysis,
  source: string,
  style: ResolvedStyle,
  audience: Audience,
  language: string,
  slideCount: number,
): Outline {
  const styleInstructions = buildStyleInstructions(style);

  const slides = planSlides(source, analysis, slideCount, audience);

  return {
    topic: analysis.topic,
    topicSlug: analysis.topicSlug,
    style,
    audience,
    language,
    slideCount: slides.length,
    generatedAt: new Date().toISOString(),
    styleInstructions,
    slides,
  };
}

function planSlides(
  source: string,
  analysis: ContentAnalysis,
  targetCount: number,
  audience: Audience,
): SlideEntry[] {
  const slides: SlideEntry[] = [];
  const sections = extractSections(source);

  // Cover slide
  slides.push({
    number: 1,
    type: "cover",
    filename: "01-slide-cover.png",
    slug: "cover",
    narrativeGoal: "Capture attention and establish the topic",
    headline: analysis.topic,
    subHeadline: generateSubHeadline(analysis, audience),
    visual: "Bold title composition with style-appropriate decorative elements",
    layout: "title-hero",
  });

  // Content slides from sections
  const contentSlideCount = targetCount - 2; // minus cover and back cover
  const sectionSlides = distributeContentToSlides(sections, contentSlideCount, audience);

  for (let i = 0; i < sectionSlides.length; i++) {
    const s = sectionSlides[i];
    const num = i + 2;
    const slug = generateSlideSlug(s.headline);
    slides.push({
      number: num,
      type: "content",
      filename: `${String(num).padStart(2, "0")}-slide-${slug}.png`,
      slug,
      narrativeGoal: s.narrativeGoal,
      headline: s.headline,
      subHeadline: s.subHeadline,
      bodyPoints: s.bodyPoints,
      visual: s.visual,
      layout: s.layout,
    });
  }

  // Back cover
  const lastNum = slides.length + 1;
  slides.push({
    number: lastNum,
    type: "back-cover",
    filename: `${String(lastNum).padStart(2, "0")}-slide-back-cover.png`,
    slug: "back-cover",
    narrativeGoal: "Provide memorable closing and call-to-action",
    headline: generateClosingHeadline(analysis),
    visual: "Clean closing composition reinforcing the core message",
    layout: "title-hero",
  });

  return slides;
}

interface Section {
  title: string;
  content: string;
  level: number;
}

function extractSections(source: string): Section[] {
  const lines = source.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  const contentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        sections.push(currentSection);
        contentLines.length = 0;
      }
      currentSection = {
        title: headingMatch[2],
        content: "",
        level: headingMatch[1].length,
      };
    } else if (currentSection) {
      contentLines.push(line);
    } else {
      contentLines.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    sections.push(currentSection);
  }

  // If no sections found, create one from the whole content
  if (sections.length === 0) {
    sections.push({
      title: "Content",
      content: source.trim(),
      level: 1,
    });
  }

  return sections;
}

interface ContentSlide {
  headline: string;
  subHeadline?: string;
  bodyPoints: string[];
  visual: string;
  layout?: string;
  narrativeGoal: string;
}

function distributeContentToSlides(
  sections: Section[],
  targetCount: number,
  audience: Audience,
): ContentSlide[] {
  const slides: ContentSlide[] = [];

  if (sections.length <= targetCount) {
    for (const section of sections) {
      const points = extractKeyPoints(section.content);
      slides.push({
        headline: section.title,
        bodyPoints: points.slice(0, 4),
        visual: generateVisualDescription(section.title, section.content),
        narrativeGoal: `Explain ${section.title.toLowerCase()}`,
        layout: selectLayout(points.length),
      });
    }
  } else {
    // Merge smaller sections
    const mergedSections = mergeSections(sections, targetCount);
    for (const section of mergedSections) {
      const points = extractKeyPoints(section.content);
      slides.push({
        headline: section.title,
        bodyPoints: points.slice(0, 4),
        visual: generateVisualDescription(section.title, section.content),
        narrativeGoal: `Explain ${section.title.toLowerCase()}`,
        layout: selectLayout(points.length),
      });
    }
  }

  // Pad with additional slides if needed
  while (slides.length < targetCount && sections.length > 0) {
    const longestSlide = slides.reduce(
      (max, s) => ((s.bodyPoints?.length ?? 0) > (max.bodyPoints?.length ?? 0) ? s : max),
      slides[0],
    );

    if ((longestSlide.bodyPoints?.length ?? 0) > 2) {
      const split = longestSlide.bodyPoints?.splice(2) ?? [];
      slides.push({
        headline: `${longestSlide.headline} (continued)`,
        bodyPoints: split,
        visual: longestSlide.visual,
        narrativeGoal: longestSlide.narrativeGoal,
        layout: selectLayout(split.length),
      });
    } else {
      break;
    }
  }

  return slides.slice(0, targetCount);
}

function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  for (const line of lines) {
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      points.push(bulletMatch[1].trim());
    } else if (line.match(/^\d+\.\s+(.+)/)) {
      points.push(line.replace(/^\d+\.\s+/, "").trim());
    }
  }

  // If no bullets found, split content into sentences
  if (points.length === 0) {
    const sentences = content.split(/[.。!！?？]\s*/).filter((s) => s.trim().length > 10);
    for (const s of sentences.slice(0, 4)) {
      points.push(s.trim());
    }
  }

  return points;
}

function generateVisualDescription(title: string, content: string): string {
  const hasNumbers = /\d+%|\d+\.\d+/.test(content);
  const hasList = /^[-*•]\s/m.test(content);
  const hasComparison = /vs\.?|versus|compared|比较|对比/i.test(content);

  if (hasNumbers) return "Data visualization with key metrics highlighted";
  if (hasComparison) return "Side-by-side comparison layout with contrasting elements";
  if (hasList) return "Organized list with visual icons for each point";
  return "Conceptual illustration supporting the headline message";
}

function selectLayout(pointCount: number): string {
  if (pointCount <= 1) return "title-statement";
  if (pointCount <= 3) return "content-split";
  return "content-grid";
}

function mergeSections(sections: Section[], targetCount: number): Section[] {
  if (sections.length <= targetCount) return sections;

  const merged: Section[] = [...sections];
  while (merged.length > targetCount) {
    let smallestIdx = 0;
    let smallestLen = Infinity;
    for (let i = 0; i < merged.length; i++) {
      if (merged[i].content.length < smallestLen) {
        smallestLen = merged[i].content.length;
        smallestIdx = i;
      }
    }

    const mergeTarget = smallestIdx > 0 ? smallestIdx - 1 : smallestIdx + 1;
    if (mergeTarget < merged.length) {
      merged[mergeTarget].content += "\n" + merged[smallestIdx].content;
      merged.splice(smallestIdx, 1);
    } else {
      break;
    }
  }

  return merged;
}

function generateSlideSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 25)
    .replace(/-$/, "");
}

function generateSubHeadline(analysis: ContentAnalysis, audience: Audience): string {
  const audienceLabel: Record<Audience, string> = {
    general: "",
    beginners: "A beginner-friendly guide",
    experts: "An in-depth analysis",
    executives: "Executive summary",
  };
  return audienceLabel[audience] || "";
}

function generateClosingHeadline(analysis: ContentAnalysis): string {
  return "Key Takeaways";
}

export function outlineToMarkdown(outline: Outline): string {
  const lines: string[] = [];

  lines.push("# Slide Deck Outline");
  lines.push("");
  lines.push(`**Topic**: ${outline.topic}`);
  lines.push(`**Style**: ${outline.style.preset}`);
  lines.push(
    `**Dimensions**: ${outline.style.dimensions.texture} + ${outline.style.dimensions.mood} + ${outline.style.dimensions.typography} + ${outline.style.dimensions.density}`,
  );
  lines.push(`**Audience**: ${outline.audience}`);
  lines.push(`**Language**: ${outline.language}`);
  lines.push(`**Slide Count**: ${outline.slideCount} slides`);
  lines.push(`**Generated**: ${outline.generatedAt}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(outline.styleInstructions);
  lines.push("");
  lines.push("---");

  for (const slide of outline.slides) {
    lines.push("");
    lines.push(`## Slide ${slide.number} of ${outline.slideCount}`);
    lines.push("");
    lines.push(`**Type**: ${slide.type === "back-cover" ? "Back Cover" : slide.type === "cover" ? "Cover" : "Content"}`);
    lines.push(`**Filename**: ${slide.filename}`);
    lines.push("");
    lines.push("// NARRATIVE GOAL");
    lines.push(slide.narrativeGoal);
    lines.push("");
    lines.push("// KEY CONTENT");
    lines.push(`Headline: ${slide.headline}`);
    if (slide.subHeadline) lines.push(`Sub-headline: ${slide.subHeadline}`);
    if (slide.bodyPoints && slide.bodyPoints.length > 0) {
      lines.push("Body:");
      for (const point of slide.bodyPoints) {
        lines.push(`- ${point}`);
      }
    }
    lines.push("");
    lines.push("// VISUAL");
    lines.push(slide.visual);
    if (slide.layout) {
      lines.push("");
      lines.push("// LAYOUT");
      lines.push(`Layout: ${slide.layout}`);
    }
    lines.push("");
    lines.push("---");
  }

  return lines.join("\n");
}
