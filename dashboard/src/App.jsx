import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Features from "./pages/Features.jsx";
import Sessions from "./pages/Sessions.jsx";
import AIInsights from "./pages/AIInsights.jsx";

export const AnalyticsContext = createContext(null);

const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT || "http://127.0.0.1:4000";
const APP_ID = import.meta.env.VITE_APP_ID || "drone-app";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function App() {
  const [insights, setInsights] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState({ insights: false, ai: false, health: false });
  const [healthOk, setHealthOk] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchInsightsNow = useCallback(async () => {
    if (!healthOk) return;
    setLoading((l) => ({ ...l, insights: true }));
    try {
      const data = await fetchJSON(`${BACKEND_ENDPOINT}/api/insights?appId=${APP_ID}`);
      setInsights(data);
    } finally {
      setLoading((l) => ({ ...l, insights: false }));
    }
  }, [healthOk]);

  const fetchAiNow = useCallback(async () => {
    if (!healthOk) return;
    setLoading((l) => ({ ...l, ai: true }));
    try {
      setAiInsights(["No AI insights yet"]);
    } finally {
      setLoading((l) => ({ ...l, ai: false }));
    }
  }, [healthOk]);

  const ctxValue = useMemo(
    () => ({
      appId: APP_ID,
      backendEndpoint: BACKEND_ENDPOINT,
      insights,
      aiInsights,
      loading,
      healthOk,
      refreshTick,
      refetchAll: async () => {
        setRefreshTick((x) => x + 1);
        // Also fetch immediately so the Reset button feels instant.
        await Promise.all([fetchInsightsNow(), fetchAiNow()]);
      },
      refetchInsightsNow: fetchInsightsNow,
      refetchAiNow: fetchAiNow,
    }),
    [insights, aiInsights, loading, healthOk, refreshTick, fetchInsightsNow, fetchAiNow]
  );

  useEffect(() => {
    let alive = true;

    async function checkHealth() {
      setLoading((l) => ({ ...l, health: true }));
      try {
        await fetchJSON(`${BACKEND_ENDPOINT}/api/insights?appId=${APP_ID}`);
        if (!alive) return;
        setHealthOk(true);
      } catch (e) {
        if (!alive) return;
        setHealthOk(false);
      } finally {
        if (!alive) return;
        setLoading((l) => ({ ...l, health: false }));
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 10_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    // Initial load.
    fetchInsightsNow();
    fetchAiNow();

    // Auto-refresh every 30 seconds.
    const t = setInterval(() => {
      if (!alive) return;
      fetchInsightsNow();
      fetchAiNow();
    }, 30_000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [healthOk, refreshTick, fetchInsightsNow, fetchAiNow]);

  return (
    <AnalyticsContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-ink">
        <Sidebar />
        <div className="ml-20 lg:ml-60">
          <Header />
          <main className="px-4 lg:px-8 pt-6 pb-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/features" element={<Features />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AnalyticsContext.Provider>
  );
}

