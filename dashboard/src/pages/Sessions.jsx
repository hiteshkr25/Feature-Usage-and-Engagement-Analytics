import React, { useContext } from "react";
import { AnalyticsContext } from "../App.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SessionsTable from "../components/SessionsTable.jsx";

export default function Sessions() {
  const ctx = useContext(AnalyticsContext);
  const { insights } = ctx;

  const sessions = insights?.recentSessions || [];
  const hasData = (insights?.totals?.totalSessions ?? 0) > 0 || sessions.length > 0;

  if (!hasData) return <EmptyState />;

  return (
    <div className="space-y-6">
      <SessionsTable sessions={sessions} />
    </div>
  );
}

