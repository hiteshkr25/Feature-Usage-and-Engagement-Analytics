import React, { useEffect, useMemo, useState } from "react";

function useCountUp(target, { durationMs = 900 } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = null;
    const start = performance.now();
    const from = value;
    const to = Number(target) || 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export default function KPICard({ icon: Icon, label, value, formatValue, pctChange }) {
  const animated = useCountUp(value);

  const formatted = useMemo(() => {
    if (formatValue) return formatValue(animated);
    return Math.round(animated).toLocaleString();
  }, [animated, formatValue]);

  const pct = Number(pctChange ?? 0);
  const isUp = pct >= 0;
  const pctText = `${Math.abs(pct).toFixed(0)}%`;

  return (
    <section
      className="glass-surface rounded-2xl border border-border p-5 transition hover:card-glow fade-in-up"
      style={{ animationDelay: "60ms" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-indigo1/30 bg-gradient-to-b from-indigo1/10 to-transparent p-2.5">
          <Icon className="h-5 w-5 text-indigo1" />
        </div>
        <div
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            isUp ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20" : "bg-rose-400/10 text-rose-300 border border-rose-400/20",
          ].join(" ")}
        >
          <span className="mr-1">{isUp ? "▲" : "▼"}</span>
          {pctText}
        </div>
      </div>

      <div className="mt-4">
        <div className="font-mono text-4xl font-extrabold tracking-tight leading-none">{formatted}</div>
        <div className="mt-2 text-sm text-white/70 font-semibold">{label}</div>
      </div>
    </section>
  );
}

