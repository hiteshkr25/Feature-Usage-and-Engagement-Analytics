import React, { useContext } from "react";
import { RefreshCw } from "lucide-react";
import { AnalyticsContext } from "../App.jsx";
import AIInsightCard from "../components/AIInsightCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AIInsights() {
  const ctx = useContext(AnalyticsContext);
  const { aiInsights, loading, insights, refetchAiNow } = ctx;

  const hasData = (insights?.totals?.totalEvents ?? 0) > 0;
  if (!hasData) return <EmptyState />;

  return (
    <div className="space-y-4">
      <section className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white/80">AI Insights</div>
            <div className="text-xs text-white/60 mt-1">Generated from your aggregated engagement data</div>
          </div>
          <button
            onClick={refetchAiNow}
            className="rounded-xl px-3 py-2 border border-border bg-surface/50 hover:border-indigo1/50 transition flex items-center gap-2 text-sm font-semibold disabled:opacity-60"
            disabled={loading.ai}
          >
            <RefreshCw className={`h-4 w-4 ${loading.ai ? "animate-spin" : ""}`} />
            {loading.ai ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {aiInsights?.length ? (
          aiInsights.slice(0, 6).map((t, idx) => <AIInsightCard key={`${t}-${idx}`} text={t} />)
        ) : (
          <AIInsightCard text="Waiting for AI insights..." />
        )}
      </div>
    </div>
  );
}

