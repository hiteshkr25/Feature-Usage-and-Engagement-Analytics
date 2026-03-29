import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function TooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-surface/90 backdrop-blur px-3 py-2 shadow-glow">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white">{p.value?.toLocaleString?.() ?? p.value}</div>
    </div>
  );
}

export default function FeatureBarChart({ data }) {
  const safe = Array.isArray(data) ? data : [];

  return (
    <div className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white/80">Feature Usage</div>
          <div className="text-xs text-white/60 mt-1">Top features by event count</div>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={safe} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v) => String(v).replaceAll("_", " ")}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<TooltipBar />} />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[10, 10, 0, 0]}
              stroke="#8B5CF6"
              strokeOpacity={0.25}
              isAnimationActive
              animationDuration={450}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

