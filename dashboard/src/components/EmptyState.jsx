import React from "react";

export default function EmptyState({ onIntegrate }) {
  return (
    <section className="glass-surface rounded-3xl border border-border p-8 fade-in-up">
      <div className="flex flex-col md:flex-row gap-8 md:items-center">
        <div className="md:w-1/2">
          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Getting started</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">No analytics yet</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Add the SDK script to your app and start emitting events. This dashboard will automatically show sessions, feature usage,
            and AI insights.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-white/85 mb-2">1. Add the script tag</div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap text-white/70">
{`<script>
  window.AnalyticsSDK = window.AnalyticsSDK || {};
  // (No npm/build needed)
</script>
<script src="${"/sdk/tracker.js"}"></script>`}
            </pre>
            <div className="text-xs text-white/55 mt-2">
              Serve `tracker.js` from your site (or your CDN). Then call `AnalyticsSDK.init(...)`.
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-white/85 mb-2">2. Configure appId + endpoint</div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap text-white/70">
{`AnalyticsSDK.init({
  appId: "my-app",
  endpoint: "http://localhost:5000"
});`}
            </pre>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-white/85 mb-2">3. Track features with buttons</div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap text-white/70">
{`<button data-track="task_create">Create task</button>
<button data-track="book_delivery">Book delivery</button>`}
            </pre>
          </div>

          <div className="mt-6 text-xs text-white/60">
            Tip: use{" "}
            <span className="text-white/80">
              `AnalyticsSDK.trackEvent("feature_used", {"{"} feature: "feature_name" {"}"})`
            </span>{" "}
            for manual tracking.
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo1/10 via-purple1/10 to-transparent p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo1/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple1/20 blur-2xl" />
            <svg viewBox="0 0 420 240" className="relative z-10 w-full">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect x="18" y="22" width="384" height="196" rx="24" fill="rgba(17,17,24,0.65)" stroke="rgba(30,30,46,1)" />
              <path
                d="M70 170 C110 120, 160 205, 210 150 S300 100, 340 130"
                stroke="url(#g1)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="70" cy="170" r="10" fill="#8B5CF6" opacity="0.9" />
              <circle cx="210" cy="150" r="9" fill="#6366F1" opacity="0.8" />
              <circle cx="340" cy="130" r="9" fill="#8B5CF6" opacity="0.75" />
              <text x="42" y="70" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily="ui-monospace, SFMono-Regular">
                Waiting for events...
              </text>
              <text x="42" y="95" fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular">
                Your dashboard is ready
              </text>
            </svg>
          </div>
        </div>
      </div>

      {onIntegrate ? (
        <div className="mt-6">
          <button
            onClick={onIntegrate}
            className="rounded-xl px-4 py-2 bg-gradient-to-r from-indigo1 to-purple1 font-semibold border border-indigo1/30 shadow-glow"
          >
            I added the SDK
          </button>
        </div>
      ) : null}
    </section>
  );
}

