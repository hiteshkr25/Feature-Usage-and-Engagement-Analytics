import React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-surface/90 backdrop-blur px-3 py-2 shadow-glow">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white">{p.value?.toLocaleString?.() ?? p.value}</div>
    </div>
  );
}

function GlowDot({ cx, cy, payload }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="rgba(139,92,246,0.25)" />
      <circle cx={cx} cy={cy} r={3} fill="#8B5CF6" />
      <circle cx={cx} cy={cy} r={2} fill="#6366F1" />
      {payload?.count != null ? null : null}
    </g>
  );
}

export default function TrendLineChart({ data }) {
  const safe = Array.isArray(data) ? data : [];

  return (
    <div className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white/80">Event Trend</div>
          <div className="text-xs text-white/60 mt-1">Daily volume over the last 7 days</div>
        </div>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={safe} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={<GlowDot />}
              activeDot={false}
              fill="url(#trendGradient)"
              isAnimationActive
              animationDuration={450}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

