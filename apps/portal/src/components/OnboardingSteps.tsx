export function OnboardingSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Your details", "Your goals", "Connect"];
  return (
    <div className="flex items-center gap-2 mb-8 flex-wrap">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                active
                  ? "bg-primary text-white"
                  : done
                    ? "bg-primary-soft text-primary-strong"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={`text-[14px] ${active ? "font-semibold text-foreground" : "meta"}`}>
              {label}
            </span>
            {n < 3 && <span className="w-6 h-px bg-border mx-1 hidden sm:block" />}
          </div>
        );
      })}
    </div>
  );
}
