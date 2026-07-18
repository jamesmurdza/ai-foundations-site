type Bubble = {
  label: string;
  /** desktop absolute placement, in % of the canvas */
  left: number;
  top: number;
  /** bubble width in px (desktop) */
  size: number;
  variant: "green" | "greenSoft" | "amber" | "amberSoft" | "cream";
  /** float animation timing */
  delay: number;
  duration: number;
};

const BUBBLES: Bubble[] = [
  { label: "Building Agents from Scratch", left: 3, top: 30, size: 210, variant: "green", delay: 0, duration: 6.5 },
  { label: "Voice Agents", left: 30, top: 5, size: 150, variant: "amber", delay: 0.8, duration: 5.5 },
  { label: "UI/UX Design", left: 66, top: 12, size: 165, variant: "cream", delay: 1.4, duration: 7 },
  { label: "Open Source Development", left: 40, top: 46, size: 188, variant: "greenSoft", delay: 0.4, duration: 6 },
  { label: "Portfolio Development", left: 64, top: 54, size: 185, variant: "amberSoft", delay: 1.1, duration: 6.8 },
  { label: "AI Evals", left: 20, top: 62, size: 140, variant: "green", delay: 1.8, duration: 5.8 },
];

const VARIANTS: Record<Bubble["variant"], string> = {
  green: "bg-[#2f5233] text-white ring-1 ring-[#2f5233]/20",
  greenSoft: "bg-[#2f5233]/10 text-[#1e3a24] ring-1 ring-[#2f5233]/25",
  amber: "bg-[#b8763e] text-white ring-1 ring-[#b8763e]/20",
  amberSoft: "bg-[#b8763e]/15 text-[#8a5a2b] ring-1 ring-[#b8763e]/30",
  cream: "bg-[#f1e9dc] text-[#2f5233] ring-1 ring-[#2f5233]/15",
};

export function TopicsBubbleMap() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-[#2f5233] mb-3">
            The curriculum
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-[#2b2b28]">
            What you&apos;ll explore
          </h2>
        </div>

        {/* Desktop: free-floating bubble cluster */}
        <div className="relative mx-auto hidden md:block h-[520px] max-w-4xl">
          {BUBBLES.map((b) => (
            <div
              key={b.label}
              className="ss-bubble-float absolute"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.duration}s`,
              }}
            >
              <div
                className={`flex items-center justify-center rounded-full text-center font-heading font-medium leading-tight shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl ${VARIANTS[b.variant]}`}
                style={{
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  padding: "1.25rem",
                  fontSize: b.size > 180 ? "1.125rem" : "1rem",
                }}
              >
                {b.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: tidy wrap of rounded pills */}
        <div className="flex flex-wrap justify-center gap-3 md:hidden">
          {BUBBLES.map((b) => (
            <span
              key={b.label}
              className={`rounded-full px-5 py-3 text-center font-heading font-medium ${VARIANTS[b.variant]}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
