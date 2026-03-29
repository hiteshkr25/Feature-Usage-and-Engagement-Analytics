import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PALETTE = ["#6366F1", "#8B5CF6", "#7C3AED", "#5B21B6", "#4C1D95", "#A78BFA"];

function TooltipPie({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-surface/90 backdrop-blur px-3 py-2 shadow-glow">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white">
        {p.name} : {p.value.toLocaleString()}
      </div>
    </div>
  );
}

export default function UsagePieChart({ data }) {
  const safe = Array.isArray(data) ? data : [];
  const top = safe.slice(0, 6);
  const total = top.reduce((acc, x) => acc + (Number(x.count) || 0), 0) || 1;

  return (
    <div className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white/80">Usage Distribution</div>
          <div className="text-xs text-white/60 mt-1">Share of feature usage</div>
        </div>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={<TooltipPie />} />
            <Pie
              data={top}
              dataKey="count"
              nameKey="name"
              innerRadius={58}
              outerRadius={95}
              stroke="rgba(255,255,255,0.08)"
              paddingAngle={2}
              isAnimationActive
              animationDuration={450}
            >
              {top.map((entry, idx) => {
                const pct = ((Number(entry.count) || 0) / total) * 100;
                return (
                  <Cell
                    key={entry.name}
                    fill={PALETTE[idx % PALETTE.length]}
                    opacity={0.95}
                    // @ts-ignore
                    payload={{ ...entry, pct }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {top.map((x, idx) => {
          const pct = ((Number(x.count) || 0) / total) * 100;
          return (
            <div key={x.name} className="rounded-xl border border-border bg-surface/40 px-3 py-2 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[idx % PALETTE.length] }} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white/80 truncate">{x.name.replaceAll("_", " ")}</div>
                <div className="text-[11px] text-white/55">{pct.toFixed(0)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

