import React, { useContext } from "react";
import { BarChart3, Clock, Sparkles, Activity } from "lucide-react";
import { AnalyticsContext } from "../App.jsx";
import KPICard from "../components/KPICard.jsx";
import TrendLineChart from "../components/TrendLineChart.jsx";
import AIInsightCard from "../components/AIInsightCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

import { useEffect, useState } from "react";


function formatAvgSession(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  if (s < 60) return `${s.toFixed(0)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

export default function Dashboard() {
  const ctx = useContext(AnalyticsContext);
  const { insights, aiInsights, loading } = ctx;

  const totals = insights?.totals;
  const changesPct = insights?.changesPct;

  const hasData = (totals?.totalEvents ?? 0) > 0;

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fade-in-up" style={{ animationDelay: "60ms" }}>
          <KPICard
            icon={Activity}
            label="Total events"
            value={totals.totalEvents}
            pctChange={changesPct?.events}
          />
        </div>
        <div className="fade-in-up" style={{ animationDelay: "120ms" }}>
          <KPICard
            icon={BarChart3}
            label="Total sessions"
            value={totals.totalSessions}
            pctChange={changesPct?.sessions}
          />
        </div>
        <div className="fade-in-up" style={{ animationDelay: "180ms" }}>
          <KPICard
            icon={Sparkles}
            label="Total users"
            value={totals.totalUsers}
            pctChange={changesPct?.users}
          />
        </div>
        <div className="fade-in-up" style={{ animationDelay: "240ms" }}>
          <KPICard
            icon={Clock}
            label="Avg session duration"
            value={totals.avgSessionDurationSeconds}
            formatValue={(v) => formatAvgSession(v)}
            pctChange={changesPct?.avgSessionDurationSeconds}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendLineChart data={insights?.dailyEventTrend} />
        </div>
        <div className="lg:col-span-1 fade-in-up" style={{ animationDelay: "180ms" }}>
          <section className="glass-surface rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white/80">AI Insights</div>
                <div className="text-xs text-white/60 mt-1">Plain-English engagement takeaways</div>
              </div>
              <div className={`text-xs ${loading.ai ? "text-purple1" : "text-white/60"}`}>
                {loading.ai ? "Updating..." : "Live"}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {aiInsights?.length ? (
                aiInsights.slice(0, 4).map((t, idx) => <AIInsightCard key={`${t}-${idx}`} text={t} />)
              ) : (
                <AIInsightCard text="Waiting for insights..." />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

