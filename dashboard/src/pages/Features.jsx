import React, { useContext, useMemo } from "react";
import { AnalyticsContext } from "../App.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FeatureBarChart from "../components/FeatureBarChart.jsx";
import UsagePieChart from "../components/UsagePieChart.jsx";

export default function Features() {
  const ctx = useContext(AnalyticsContext);
  const { insights } = ctx;

  const totals = insights?.totals;
  if (!totals || (totals.totalEvents ?? 0) === 0) return <EmptyState />;

  const features = insights?.featureUsageBreakdown || [];
  const most = insights?.mostUsedFeature;
  const least = insights?.leastUsedFeature;

  const totalFeatureCount = useMemo(() => features.reduce((acc, x) => acc + (Number(x.count) || 0), 0), [features]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeatureBarChart data={features} />
          <UsagePieChart data={features} />
        </div>

        <section className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
          <div className="text-sm font-bold text-white/80">Feature Signals</div>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Most used</div>
              <div className="mt-2 font-mono text-lg font-extrabold text-white">
                {most?.name ? most.name.replaceAll("_", " ") : "—"}
              </div>
              <div className="text-xs text-white/55 mt-1">Uses: {most?.count ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Least used</div>
              <div className="mt-2 font-mono text-lg font-extrabold text-white">
                {least?.name ? least.name.replaceAll("_", " ") : "—"}
              </div>
              <div className="text-xs text-white/55 mt-1">Uses: {least?.count ?? 0}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-white/80">Feature List</div>
            <div className="text-xs text-white/60 mt-1">Ranked by total feature_used events</div>
          </div>
          <div className="text-xs text-white/55 font-semibold">Total: {totalFeatureCount.toLocaleString()}</div>
        </div>

        <div className="overflow-auto rounded-xl border border-border bg-surface/40">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-white/70">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Rank</th>
                <th className="text-left px-4 py-3 font-semibold">Feature</th>
                <th className="text-left px-4 py-3 font-semibold">Count</th>
                <th className="text-left px-4 py-3 font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {features.length ? (
                features
                  .slice()
                  .sort((a, b) => (b.count || 0) - (a.count || 0))
                  .map((f, idx) => {
                    const pct = totalFeatureCount ? ((Number(f.count) || 0) / totalFeatureCount) * 100 : 0;
                    const rank = idx + 1;
                    return (
                      <tr key={f.name} className="hover:bg-surface/50 transition">
                        <td className="px-4 py-3 font-mono text-white/90">{rank}</td>
                        <td className="px-4 py-3 font-semibold text-white/85">{f.name.replaceAll("_", " ")}</td>
                        <td className="px-4 py-3 text-white/80">{Number(f.count || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-white/70">{pct.toFixed(1)}%</td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/60">
                    No feature events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

