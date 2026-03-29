import React from "react";

function formatDuration(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

export default function SessionsTable({ sessions }) {
  const safe = Array.isArray(sessions) ? sessions : [];

  return (
    <section className="glass-surface rounded-2xl border border-border p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white/80">Recent Sessions</div>
          <div className="text-xs text-white/60 mt-1">Latest activity across captured sessions</div>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-border bg-surface/40">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-white/70">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Session ID</th>
              <th className="text-left px-4 py-3 font-semibold">Duration</th>
              <th className="text-left px-4 py-3 font-semibold">Pages</th>
              <th className="text-left px-4 py-3 font-semibold">Events</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {safe.length ? (
              safe.map((s) => (
                <tr key={s.sessionId} className="hover:bg-surface/50 transition">
                  <td className="px-4 py-3 font-mono text-white/90">{s.sessionId}</td>
                  <td className="px-4 py-3 text-white/80">{formatDuration(s.durationSeconds)}</td>
                  <td className="px-4 py-3 text-white/80">{s.pagesCount ?? 0}</td>
                  <td className="px-4 py-3 text-white/80">{s.eventsCount ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                  No sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

