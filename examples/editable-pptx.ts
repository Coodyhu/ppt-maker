#!/usr/bin/env bun
/**
 * Example: Generate an editable PPTX with code (using pptxgenjs)
 *
 * This demonstrates how to create a fully editable presentation
 * programmatically — no AI image generation needed.
 *
 * Usage: bun run examples/editable-pptx.ts
 */

import PptxGenJS from "pptxgenjs";
import { join } from "path";

const OUTPUT = join(import.meta.dir, "../output/example-editable.pptx");

// ─── Theme ───
const C = {
  bg: "FAFAFA",
  bgAlt: "F0F4F8",
  card: "FFFFFF",
  text: "1E293B",
  label: "475569",
  gray: "94A3B8",
  teal: "0D9488",
  blue: "3B82F6",
  purple: "8B5CF6",
  amber: "F59E0B",
  red: "EF4444",
  green: "22C55E",
  border: "CBD5E1",
};

const FONT = "Arial";

// ─── Helpers ───
function topBar(s: PptxGenJS.Slide, color: string) {
  s.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.06, fill: { color } });
}

function pageTitle(s: PptxGenJS.Slide, title: string, sub: string, color: string) {
  s.background = { color: C.bg };
  topBar(s, color);
  s.addText(title, {
    x: 0.8, y: 0.25, w: 8.4, h: 0.7,
    fontSize: 32, fontFace: FONT, color: C.text, bold: true,
  });
  s.addText(sub, {
    x: 0.8, y: 0.95, w: 8.4, h: 0.4,
    fontSize: 15, fontFace: FONT, color: C.label,
  });
}

function sectionSlide(s: PptxGenJS.Slide, num: string, title: string, sub: string, color: string) {
  s.background = { color: C.bgAlt };
  s.addText(num, {
    x: 0, y: 1.0, w: "100%", h: 1,
    fontSize: 64, fontFace: FONT, color, bold: true, align: "center", transparency: 60,
  });
  s.addText(title, {
    x: 0, y: 2.3, w: "100%", h: 0.9,
    fontSize: 38, fontFace: FONT, color: C.text, bold: true, align: "center",
  });
  s.addText(sub, {
    x: 0, y: 3.3, w: "100%", h: 0.5,
    fontSize: 16, fontFace: FONT, color: C.label, align: "center",
  });
}

// ─── Create Presentation ───
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.author = "ppt-maker";
pptx.title = "Building an AI-Powered Tool — Lessons Learned";

// ═══ S01: Cover ═══
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  topBar(s, C.teal);
  s.addText("Building an AI-Powered Tool", {
    x: 1, y: 1.2, w: 8, h: 1,
    fontSize: 44, fontFace: FONT, color: C.text, bold: true, align: "center",
  });
  s.addText("Lessons from 0 to 1", {
    x: 1, y: 2.4, w: 8, h: 0.6,
    fontSize: 18, fontFace: FONT, color: C.label, align: "center",
  });
  s.addShape("rect", { x: 3.5, y: 3.3, w: 3, h: 0.03, fill: { color: C.teal } });
  s.addText("A practical guide to shipping AI products", {
    x: 1, y: 3.6, w: 8, h: 0.5,
    fontSize: 16, fontFace: FONT, color: C.gray, align: "center",
  });
}

// ═══ S02: Problem ═══
{
  const s = pptx.addSlide();
  pageTitle(s, "The Problem", "Common challenges when building AI tools", C.red);

  const items = [
    { n: "01", title: "Inconsistent Output", desc: "LLM responses vary across runs — same input, different results", c: C.red },
    { n: "02", title: "Slow Iteration", desc: "Manual testing and prompt tuning takes days per cycle", c: C.amber },
    { n: "03", title: "Hard to Evaluate", desc: "No clear metrics to measure if output quality improved", c: C.purple },
    { n: "04", title: "Scaling Bottleneck", desc: "What works for 10 cases breaks at 1000", c: C.blue },
  ];

  items.forEach((p, i) => {
    const y = 1.55 + i * 0.7;
    s.addShape("roundRect", {
      x: 0.8, y, w: 8.4, h: 0.58, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: p.c, width: 1 },
    });
    s.addText(p.n, {
      x: 1.0, y, w: 0.7, h: 0.58,
      fontSize: 18, fontFace: FONT, color: p.c, bold: true, align: "center", valign: "middle",
    });
    s.addText(p.title, {
      x: 1.8, y, w: 2.2, h: 0.58,
      fontSize: 14, fontFace: FONT, color: C.text, bold: true, valign: "middle",
    });
    s.addText(p.desc, {
      x: 4.0, y, w: 5.0, h: 0.58,
      fontSize: 13, fontFace: FONT, color: C.label, valign: "middle",
    });
  });
}

// ═══ S03: Section — Approach ═══
{
  const s = pptx.addSlide();
  sectionSlide(s, "01", "Our Approach", "Consensus mechanism + hybrid architecture", C.teal);
}

// ═══ S04: Consensus ═══
{
  const s = pptx.addSlide();
  pageTitle(s, "Multi-Model Consensus", "N judges vote independently → threshold agreement", C.teal);

  const rows = [
    { label: "Problem", text: "Single model is unreliable — same input gives different output across runs", c: C.red },
    { label: "Solution", text: "N independent judges → vote → dynamic threshold max(2, ceil(N×0.75))", c: C.blue },
    { label: "Result", text: "Accuracy 75% → 92%, saved 80%+ manual review effort", c: C.green },
  ];

  rows.forEach((r, i) => {
    const y = 1.6 + i * 0.95;
    s.addShape("roundRect", {
      x: 0.8, y, w: 8.4, h: 0.75, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: r.c, width: 0.7 },
    });
    s.addText(r.label, {
      x: 1.0, y, w: 1.2, h: 0.75,
      fontSize: 13, fontFace: FONT, color: r.c, bold: true, valign: "middle",
    });
    s.addText(r.text, {
      x: 2.2, y, w: 6.8, h: 0.75,
      fontSize: 14, fontFace: FONT, color: C.text, valign: "middle",
    });
  });
}

// ═══ S05: Hybrid Architecture ═══
{
  const s = pptx.addSlide();
  pageTitle(s, "2ms vs 5s", "Deterministic logic → rules engine, ambiguity → AI", C.blue);

  // Rules card
  s.addShape("roundRect", {
    x: 0.8, y: 1.6, w: 3.6, h: 1.8, rectRadius: 0.12,
    fill: { color: C.card }, line: { color: C.blue, width: 1.5 },
  });
  s.addText("Rules Engine", {
    x: 0.8, y: 1.7, w: 3.6, h: 0.35,
    fontSize: 13, fontFace: FONT, color: C.blue, bold: true, align: "center",
  });
  s.addText("2ms", {
    x: 0.8, y: 2.1, w: 3.6, h: 0.7,
    fontSize: 40, fontFace: FONT, color: C.blue, bold: true, align: "center",
  });
  s.addText("Deterministic · Zero hallucination", {
    x: 0.8, y: 2.85, w: 3.6, h: 0.4,
    fontSize: 12, fontFace: FONT, color: C.label, align: "center",
  });

  // LLM card
  s.addShape("roundRect", {
    x: 5.6, y: 1.6, w: 3.6, h: 1.8, rectRadius: 0.12,
    fill: { color: C.card }, line: { color: C.purple, width: 1.5 },
  });
  s.addText("LLM Inference", {
    x: 5.6, y: 1.7, w: 3.6, h: 0.35,
    fontSize: 13, fontFace: FONT, color: C.purple, bold: true, align: "center",
  });
  s.addText("5s", {
    x: 5.6, y: 2.1, w: 3.6, h: 0.7,
    fontSize: 40, fontFace: FONT, color: C.purple, bold: true, align: "center",
  });
  s.addText("Multi-model consensus · Complex semantics", {
    x: 5.6, y: 2.85, w: 3.6, h: 0.4,
    fontSize: 12, fontFace: FONT, color: C.label, align: "center",
  });

  s.addText("x2500", {
    x: 4.3, y: 2.1, w: 1.4, h: 0.7,
    fontSize: 18, fontFace: FONT, color: C.amber, bold: true, align: "center", valign: "middle",
  });
}

// ═══ S06: Section — Lessons ═══
{
  const s = pptx.addSlide();
  sectionSlide(s, "02", "Lessons Learned", "Three takeaways from building AI tools", C.purple);
}

// ═══ S07: Takeaways ═══
{
  const s = pptx.addSlide();
  pageTitle(s, "Three Takeaways", "What we learned building from 0 to 1", C.purple);

  const items = [
    { n: "1", title: "Ship first, polish later", desc: "Fast iteration beats perfect design — every bug is a chance to improve", c: C.teal },
    { n: "2", title: "Validate then hand off", desc: "Prove the method works, then let the product team own it", c: C.blue },
    { n: "3", title: "Automate the boring parts", desc: "If you're doing it manually more than twice, build a tool", c: C.amber },
  ];

  items.forEach((item, i) => {
    const y = 1.55 + i * 0.9;
    s.addShape("roundRect", {
      x: 0.8, y, w: 8.4, h: 0.72, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: item.c, width: 1 },
    });
    s.addText(item.n, {
      x: 1.0, y, w: 0.6, h: 0.72,
      fontSize: 24, fontFace: FONT, color: item.c, bold: true, align: "center", valign: "middle",
    });
    s.addText(item.title, {
      x: 1.7, y: y + 0.02, w: 7.2, h: 0.35,
      fontSize: 15, fontFace: FONT, color: C.text, bold: true,
    });
    s.addText(item.desc, {
      x: 1.7, y: y + 0.37, w: 7.2, h: 0.3,
      fontSize: 12, fontFace: FONT, color: C.label,
    });
  });
}

// ═══ S08: End ═══
{
  const s = pptx.addSlide();
  s.background = { color: C.bgAlt };
  topBar(s, C.teal);
  s.addText("Thank You", {
    x: 1, y: 1.8, w: 8, h: 1,
    fontSize: 44, fontFace: FONT, color: C.text, bold: true, align: "center",
  });
  s.addShape("rect", { x: 3.5, y: 3.0, w: 3, h: 0.03, fill: { color: C.teal } });
  s.addText("Built with ppt-maker", {
    x: 1, y: 3.4, w: 8, h: 0.5,
    fontSize: 16, fontFace: FONT, color: C.gray, align: "center",
  });
}

// ─── Write ───
const { mkdirSync } = await import("fs");
mkdirSync(join(import.meta.dir, "../output"), { recursive: true });
await pptx.writeFile({ fileName: OUTPUT });
console.log(`Done: ${OUTPUT}`);
console.log(`  8 slides · editable PPTX · no AI needed`);
