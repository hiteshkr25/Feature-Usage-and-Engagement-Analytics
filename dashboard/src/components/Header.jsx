import React, { useContext, useState } from "react";
import { Activity, RotateCcw } from "lucide-react";
import { AnalyticsContext } from "../App.jsx";

export default function Header() {
  const ctx = useContext(AnalyticsContext);
  const { appId, backendEndpoint, healthOk, refetchAll } = ctx;
  const [resetting, setResetting] = useState(false);

  async function resetData() {
    try {
      setResetting(true);
      await fetch(`${backendEndpoint}/api/events`, { method: "DELETE" });
      refetchAll();
    } finally {
      setResetting(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 pb-4 bg-ink/60 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo1 to-purple1 flex items-center justify-center shadow-glow">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold tracking-tight">Feature Usage Analytics</div>
              <div className="text-xs text-white/60 mt-0.5">
                Connected app:{" "}
                <span className="text-white/90 font-semibold">
                  {appId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2">
            <div className={`h-2.5 w-2.5 rounded-full ${healthOk ? "bg-emerald-400" : "bg-white/30"} ${healthOk ? "pulse-dot" : ""}`} />
            <div className="text-xs text-white/70 font-semibold">{healthOk ? "Live" : "Offline"}</div>
          </div>

          <button
            onClick={resetData}
            className="rounded-xl px-3 py-2 border border-border bg-surface/50 hover:border-indigo1/50 transition flex items-center gap-2 text-sm font-semibold disabled:opacity-60"
            disabled={resetting}
          >
            <RotateCcw className="h-4 w-4" />
            {resetting ? "Resetting..." : "Reset Data"}
          </button>
        </div>
      </div>
    </header>
  );
}

