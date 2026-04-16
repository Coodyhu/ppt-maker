import Link from "next/link";

const STYLE_PREVIEWS = [
  { name: "Blueprint", color: "#2563EB", emoji: "📐" },
  { name: "Sketch Notes", color: "#F4A261", emoji: "✏️" },
  { name: "Corporate", color: "#1E3A5F", emoji: "💼" },
  { name: "Minimal", color: "#6B7280", emoji: "◻️" },
  { name: "Dark Atmospheric", color: "#8B5CF6", emoji: "🌃" },
  { name: "Pixel Art", color: "#00FF00", emoji: "👾" },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <section className="text-center mb-20">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          AI-Powered Slide Deck Generator
        </h1>
        <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
          Transform your content into professional presentations with 17 visual
          styles. Paste your outline, pick a style, generate.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/create"
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Start Creating
          </Link>
          <Link
            href="/styles"
            className="px-6 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
          >
            Browse Styles
          </Link>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-semibold text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Paste Content",
              desc: "Drop your Markdown outline or plain text",
            },
            {
              step: "2",
              title: "Choose Style",
              desc: "Pick from 17 presets or customize dimensions",
            },
            {
              step: "3",
              title: "Generate",
              desc: "AI creates each slide as a stunning image",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-sm font-mono">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-center mb-10">
          17 Professional Styles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STYLE_PREVIEWS.map((style) => (
            <div
              key={style.name}
              className="border border-white/10 rounded-xl p-4 text-center hover:border-white/30 transition-colors cursor-pointer"
            >
              <div
                className="text-3xl mb-2"
                style={{ filter: `drop-shadow(0 0 8px ${style.color}40)` }}
              >
                {style.emoji}
              </div>
              <div className="text-sm font-medium">{style.name}</div>
              <div
                className="w-4 h-1 rounded-full mx-auto mt-2"
                style={{ backgroundColor: style.color }}
              />
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-neutral-500 text-sm">
          <Link href="/styles" className="underline hover:text-neutral-300">
            View all 17 styles
          </Link>{" "}
          + 525 custom dimension combinations
        </p>
      </section>
    </div>
  );
}
