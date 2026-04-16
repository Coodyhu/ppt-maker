import { PRESETS } from "../lib/presets";

export default function StylesPage() {
  const presets = PRESETS;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Style Gallery</h1>
      <p className="text-neutral-400 mb-10">
        17 built-in presets + 525 custom dimension combinations
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => (
          <div
            key={preset.name}
            className="border border-white/10 rounded-xl p-6 hover:border-white/25 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{preset.label}</h2>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-md font-mono">
                {preset.name}
              </span>
            </div>

            <p className="text-sm text-neutral-400 mb-4">{preset.description}</p>

            <div className="flex gap-2 mb-4">
              {preset.palette.map((color) => (
                <div
                  key={color.hex}
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name}: ${color.hex}`}
                />
              ))}
            </div>

            <div className="text-xs text-neutral-500 space-y-1">
              <div>
                <span className="text-neutral-400">Dimensions:</span>{" "}
                {preset.dimensions.texture} · {preset.dimensions.mood} ·{" "}
                {preset.dimensions.typography} · {preset.dimensions.density}
              </div>
              <div>
                <span className="text-neutral-400">Best for:</span>{" "}
                {preset.bestFor}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16 border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Custom Dimensions</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Mix and match 4 dimensions to create your own style:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2 text-neutral-300">Texture</h3>
            <ul className="space-y-1 text-neutral-500">
              <li>clean — Pure solid</li>
              <li>grid — Technical grid</li>
              <li>organic — Hand-drawn</li>
              <li>pixel — 8-bit blocks</li>
              <li>paper — Aged texture</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-neutral-300">Mood</h3>
            <ul className="space-y-1 text-neutral-500">
              <li>professional — Navy/Gold</li>
              <li>warm — Earth tones</li>
              <li>cool — Blues/Grays</li>
              <li>vibrant — High saturation</li>
              <li>dark — Cinematic</li>
              <li>neutral — Grayscale</li>
              <li>macaron — Pastels</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-neutral-300">Typography</h3>
            <ul className="space-y-1 text-neutral-500">
              <li>geometric — Modern sans</li>
              <li>humanist — Friendly</li>
              <li>handwritten — Marker/brush</li>
              <li>editorial — Magazine</li>
              <li>technical — Precise</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-neutral-300">Density</h3>
            <ul className="space-y-1 text-neutral-500">
              <li>minimal — One focus point</li>
              <li>balanced — 2-3 key points</li>
              <li>dense — Data-rich</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-4">
          5 × 7 × 5 × 3 = 525 unique combinations
        </p>
      </section>
    </div>
  );
}
