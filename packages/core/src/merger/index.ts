import { existsSync, readdirSync, readFileSync } from "fs";
import { join, basename, extname } from "path";
import PptxGenJS from "pptxgenjs";
import { PDFDocument } from "pdf-lib";
import type { SlideImage } from "../types/index";

export function findSlideImages(dir: string): SlideImage[] {
  if (!existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`);
  }

  const files = readdirSync(dir);
  const slidePattern = /^(\d+)-slide-.*\.(png|jpg|jpeg)$/i;
  const promptsDir = join(dir, "prompts");
  const hasPrompts = existsSync(promptsDir);

  const slides: SlideImage[] = files
    .filter((f) => slidePattern.test(f))
    .map((f) => {
      const match = f.match(slidePattern);
      const baseName = f.replace(/\.(png|jpg|jpeg)$/i, "");
      const promptPath = hasPrompts ? join(promptsDir, `${baseName}.md`) : undefined;

      return {
        filename: f,
        path: join(dir, f),
        index: parseInt(match![1], 10),
        promptPath: promptPath && existsSync(promptPath) ? promptPath : undefined,
      };
    })
    .sort((a, b) => a.index - b.index);

  return slides;
}

export async function mergeToPptx(
  dir: string,
  outputPath?: string,
): Promise<string> {
  const slides = findSlideImages(dir);
  if (slides.length === 0) {
    throw new Error(`No slide images found in: ${dir}`);
  }

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "ppt-maker";
  pptx.subject = "Generated Slide Deck";

  for (const slide of slides) {
    const s = pptx.addSlide();
    const imageData = readFileSync(slide.path);
    const base64 = imageData.toString("base64");
    const ext = extname(slide.filename).toLowerCase().replace(".", "");
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    s.addImage({
      data: `data:${mimeType};base64,${base64}`,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      sizing: { type: "cover", w: "100%", h: "100%" },
    });

    if (slide.promptPath) {
      const notes = readFileSync(slide.promptPath, "utf-8");
      s.addNotes(notes);
    }
  }

  const dirName = basename(dir) === "slide-deck" ? basename(join(dir, "..")) : basename(dir);
  const finalPath = outputPath ?? join(dir, `${dirName}.pptx`);

  await pptx.writeFile({ fileName: finalPath });
  return finalPath;
}

export async function mergeToPdf(
  dir: string,
  outputPath?: string,
): Promise<string> {
  const slides = findSlideImages(dir);
  if (slides.length === 0) {
    throw new Error(`No slide images found in: ${dir}`);
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setAuthor("ppt-maker");
  pdfDoc.setSubject("Generated Slide Deck");

  for (const slide of slides) {
    const imageData = readFileSync(slide.path);
    const isPng =
      imageData[0] === 0x89 &&
      imageData[1] === 0x50 &&
      imageData[2] === 0x4e &&
      imageData[3] === 0x47;
    const image = isPng
      ? await pdfDoc.embedPng(imageData)
      : await pdfDoc.embedJpg(imageData);

    const { width, height } = image;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  const dirName = basename(dir) === "slide-deck" ? basename(join(dir, "..")) : basename(dir);
  const finalPath = outputPath ?? join(dir, `${dirName}.pdf`);

  await Bun.write(finalPath, pdfBytes);
  return finalPath;
}
