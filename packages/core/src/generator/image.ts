import type { OnProgress } from "../types/index";

export interface ImageGenerator {
  generate(prompt: string, outputPath: string, sessionId: string): Promise<void>;
}

export class ClaudeImageGenerator implements ImageGenerator {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "claude-sonnet-4-20250514") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, outputPath: string, sessionId: string): Promise<void> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2024-01-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        metadata: {
          session_id: sessionId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error (${response.status}): ${error}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; source?: { type: string; data: string }; text?: string }>;
    };

    // Extract image from response
    const imageBlock = data.content.find(
      (block) => block.type === "image",
    );

    if (!imageBlock?.source?.data) {
      throw new Error("No image generated in Claude response");
    }

    const imageBuffer = Buffer.from(imageBlock.source.data, "base64");
    await Bun.write(outputPath, imageBuffer);
  }
}

export async function generateSlideImages(
  generator: ImageGenerator,
  prompts: Map<string, string>,
  outputDir: string,
  sessionId: string,
  onProgress?: OnProgress,
): Promise<string[]> {
  const generatedFiles: string[] = [];
  const total = prompts.size;
  let current = 0;

  for (const [promptFile, prompt] of prompts) {
    current++;
    const imageFile = promptFile.replace(".md", ".png");
    const imagePath = `${outputDir}/${imageFile}`;

    onProgress?.({ type: "image-generating", slideNumber: current, total });

    let retries = 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await generator.generate(prompt, imagePath, sessionId);
        generatedFiles.push(imagePath);
        onProgress?.({ type: "image-generated", slideNumber: current, total, path: imagePath });
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    if (lastError) {
      onProgress?.({ type: "image-failed", slideNumber: current, error: lastError.message });
    }
  }

  return generatedFiles;
}
