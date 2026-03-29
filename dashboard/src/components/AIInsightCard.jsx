import React from "react";
import { Sparkles } from "lucide-react";

export default function AIInsightCard({ text }) {
  return (
    <article className="rounded-2xl border border-border bg-surface/50 backdrop-blur p-5 fade-in-up border-l-4 border-indigo1">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo1/20 to-purple1/20 border border-indigo1/30 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple1" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Insight</div>
          <div className="mt-2 text-sm leading-relaxed text-white/90">{text}</div>
        </div>
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-indigo1/40 via-purple1/40 to-transparent" />
    </article>
  );
}

