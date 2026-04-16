"use client";

import { useState } from "react";
import { PRESETS } from "../lib/presets";
import type { PresetName, Audience } from "../lib/presets";

const AUDIENCES: { value: Audience; label: string; desc: string }[] = [
  { value: "general", label: "General", desc: "Broad appeal" },
  { value: "beginners", label: "Beginners", desc: "Educational focus" },
  { value: "experts", label: "Experts", desc: "Technical depth" },
  { value: "executives", label: "Executives", desc: "High-level insights" },
];

type Step = "input" | "configure" | "generating" | "complete";

interface GenerationProgress {
  step: string;
  current: number;
  total: number;
  message: string;
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>("input");
  const [content, setContent] = useState("");
  const [style, setStyle] = useState<PresetName>("blueprint");
  const [audience, setAudience] = useState<Audience>("general");
  const [slideCount, setSlideCount] = useState(10);
  const [apiKey, setApiKey] = useState("");
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [outlineOnly, setOutlineOnly] = useState(false);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ outputDir: string; files: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = PRESETS;

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setStep("generating");
    setError(null);
    setProgress({ step: "analyzing", current: 0, total: 0, message: "Analyzing content..." });

    try {
      let response: Response;

      if (templateFile) {
        const formData = new FormData();
        formData.append("source", content);
        formData.append("style", style);
        formData.append("audience", audience);
        formData.append("slideCount", String(slideCount));
        formData.append("outlineOnly", String(outlineOnly));
        formData.append("template", templateFile);
        if (apiKey) formData.append("apiKey", apiKey);

        response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: content,
            style,
            audience,
            slideCount,
            apiKey: apiKey || undefined,
            outlineOnly,
          }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message ?? "Generation failed");
      }

      const data = await response.json();
      setResult(data);
      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("configure");
    }
  };

  if (step === "input") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Create Slide Deck</h1>
        <p className="text-neutral-400 mb-8">
          Paste your content below — Markdown, plain text, or outline
        </p>

        <textarea
          className="w-full h-80 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-white/30 placeholder-neutral-600"
          placeholder={"# Your Presentation Title\n\n## Section 1\n\nContent goes here...\n\n## Section 2\n\n- Point one\n- Point two\n- Point three"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-neutral-500">
            {content.split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={() => content.trim() && setStep("configure")}
            disabled={!content.trim()}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next: Configure Style
          </button>
        </div>
      </div>
    );
  }

  if (step === "configure") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Configure Style</h1>
        <p className="text-neutral-400 mb-8">
          Choose how your slides should look
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Visual Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setStyle(preset.name)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                    style === preset.name
                      ? "border-white/50 bg-white/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex gap-2 mb-1">
                    {preset.palette.slice(0, 3).map((c) => (
                      <div
                        key={c.hex}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {preset.bestFor}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium mb-3">Audience</label>
            <div className="flex gap-3">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    audience === a.value
                      ? "border-white/50 bg-white/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Count */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Slide Count: {slideCount}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full max-w-xs"
            />
          </div>

          {/* Template Upload */}
          <div>
            <label className="block text-sm font-medium mb-3">
              PPTX Template (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/25 transition-colors">
                {templateFile ? templateFile.name : "Choose .pptx file"}
                <input
                  type="file"
                  accept=".pptx"
                  className="hidden"
                  onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {templateFile && (
                <button
                  onClick={() => setTemplateFile(null)}
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Upload your own .pptx template for editable output. Preserves master slides, colors, and fonts.
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-white/30 placeholder-neutral-600"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Required for image generation. Leave empty for outline-only mode.
            </p>
          </div>

          {/* Outline Only */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={outlineOnly}
              onChange={(e) => setOutlineOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Outline only (skip image generation)
            </span>
          </label>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={() => setStep("input")}
            className="px-6 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={!outlineOnly && !templateFile && !apiKey}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {outlineOnly ? "Generate Outline" : templateFile ? "Generate from Template" : "Generate Slides"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-semibold mb-2">Generating...</h2>
        <p className="text-neutral-400">
          {progress?.message ?? "Please wait..."}
        </p>
      </div>
    );
  }

  // complete
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Done!</h1>
      <p className="text-neutral-400 mb-8">
        Your slide deck has been generated
      </p>

      {result && (
        <div className="border border-white/10 rounded-xl p-6">
          <div className="text-sm space-y-2">
            <div>
              <span className="text-neutral-400">Output:</span>{" "}
              <span className="font-mono">{result.outputDir}</span>
            </div>
            <div>
              <span className="text-neutral-400">Files:</span>{" "}
              {result.files.length}
            </div>
          </div>
          <div className="mt-4 space-y-1">
            {result.files.map((f) => (
              <div key={f} className="text-xs font-mono text-neutral-500">
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setStep("input");
          setContent("");
          setResult(null);
        }}
        className="mt-6 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
      >
        Create Another
      </button>
    </div>
  );
}
