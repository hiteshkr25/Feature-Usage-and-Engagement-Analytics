const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = function createInsightsRouter({ Event, GEMINI_API_KEY, seedAppIfEmpty, DEFAULT_APP_ID }) {
  const router = express.Router();

  function formatDateKey(d) {
    const dt = new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function pctChange(nowValue, prevValue) {
    const a = Number(nowValue);
    const b = Number(prevValue);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    if (b === 0) return a === 0 ? 0 : 100;
    return ((a - b) / b) * 100;
  }

  function fillDailyTrend(dailyEventTrendAgg, last7From) {
    const days = [];
    const start = new Date(last7From);
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      days.push({ date: formatDateKey(d), count: 0 });
    }

    for (const row of dailyEventTrendAgg || []) {
      const date = row._id;
      const idx = days.findIndex((d) => d.date === date);
      if (idx >= 0) days[idx].count = row.count;
    }
    return days;
  }

  async function getAppInsights(appId) {
    const appFilter = { appId };
    const now = new Date();

    const last7From = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7From = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [totalEvents, sessionsDistinct, usersDistinct, avgSessionDurationMs] = await Promise.all([
      Event.countDocuments(appFilter),
      Event.distinct("sessionId", appFilter),
      Event.distinct("userId", appFilter),
      Event.aggregate([
        { $match: { ...appFilter, eventType: "session_end", timeSpent: { $type: "number" } } },
        { $group: { _id: null, avg: { $avg: "$timeSpent" } } },
      ]),
    ]);

    const avgSessionDuration = (avgSessionDurationMs?.[0]?.avg ?? 0) / 1000;

    // Feature usage (feature_used events)
    const featureBreakdown = await Event.aggregate([
      { $match: { ...appFilter, eventType: "feature_used", featureName: { $ne: null } } },
      { $group: { _id: "$featureName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const mostUsedFeature = featureBreakdown[0] ? { name: featureBreakdown[0]._id, count: featureBreakdown[0].count } : null;
    const leastUsedFeature = featureBreakdown.length
      ? { name: featureBreakdown[featureBreakdown.length - 1]._id, count: featureBreakdown[featureBreakdown.length - 1].count }
      : null;

    // Time spent per page (page_time events)
    const topPages = await Event.aggregate([
      { $match: { ...appFilter, eventType: "page_time", pageName: { $ne: null } } },
      { $group: { _id: "$pageName", count: { $sum: 1 }, totalMs: { $sum: "$timeSpent" } } },
      { $sort: { totalMs: -1 } },
      { $limit: 8 },
    ]);

    const pageTimeSeries = topPages.map((p) => ({
      pageName: p._id,
      count: p.count,
      totalSeconds: (p.totalMs || 0) / 1000,
    }));

    // Daily trend last 7 days.
    const dailyEventTrendAgg = await Event.aggregate([
      { $match: { ...appFilter, timestamp: { $gte: last7From } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyEventTrend = fillDailyTrend(dailyEventTrendAgg, last7From);

    // KPI comparisons (last 7 days vs previous 7 days)
    const [
      eventsLast7,
      eventsPrev7,
      sessionsLast7Arr,
      sessionsPrev7Arr,
      usersLast7Arr,
      usersPrev7Arr,
      avgLast7Agg,
      avgPrev7Agg,
    ] = await Promise.all([
      Event.countDocuments({ ...appFilter, timestamp: { $gte: last7From } }),
      Event.countDocuments({ ...appFilter, timestamp: { $gte: prev7From, $lt: last7From } }),
      Event.distinct("sessionId", { ...appFilter, timestamp: { $gte: last7From } }),
      Event.distinct("sessionId", { ...appFilter, timestamp: { $gte: prev7From, $lt: last7From } }),
      Event.distinct("userId", { ...appFilter, timestamp: { $gte: last7From } }),
      Event.distinct("userId", { ...appFilter, timestamp: { $gte: prev7From, $lt: last7From } }),
      Event.aggregate([
        { $match: { ...appFilter, eventType: "session_end", timestamp: { $gte: last7From } } },
        { $group: { _id: null, avg: { $avg: "$timeSpent" } } },
      ]),
      Event.aggregate([
        { $match: { ...appFilter, eventType: "session_end", timestamp: { $gte: prev7From, $lt: last7From } } },
        { $group: { _id: null, avg: { $avg: "$timeSpent" } } },
      ]),
    ]);

    const sessionsLast7 = sessionsLast7Arr.length;
    const sessionsPrev7 = sessionsPrev7Arr.length;
    const usersLast7 = usersLast7Arr.length;
    const usersPrev7 = usersPrev7Arr.length;

    const avgLast7 = (avgLast7Agg?.[0]?.avg ?? 0) / 1000;
    const avgPrev7 = (avgPrev7Agg?.[0]?.avg ?? 0) / 1000;

    // Recent sessions for table
    const recentSessions = await Event.aggregate([
      { $match: appFilter },
      {
        $group: {
          _id: "$sessionId",
          durationSeconds: {
            $max: {
              $cond: [{ $eq: ["$eventType", "session_end"] }, { $divide: ["$timeSpent", 1000] }, 0],
            },
          },
          endTimestamp: {
            $max: {
              $cond: [{ $eq: ["$eventType", "session_end"] }, "$timestamp", new Date(0)],
            },
          },
          pagesVisited: {
            $addToSet: {
              $cond: [
                { $in: ["$eventType", ["page_visit", "page_time"]] },
                "$pageName",
                "$$REMOVE",
              ],
            },
          },
          eventsCount: { $sum: 1 },
          userId: { $first: "$userId" },
        },
      },
      { $sort: { endTimestamp: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          sessionId: "$_id",
          durationSeconds: 1,
          pagesCount: { $size: "$pagesVisited" },
          pagesVisited: 1,
          eventsCount: 1,
          userId: 1,
        },
      },
    ]);

    return {
      totals: {
        totalEvents,
        totalSessions: sessionsDistinct.length,
        totalUsers: usersDistinct.length,
        avgSessionDurationSeconds: avgSessionDuration,
      },
      changesPct: {
        events: pctChange(eventsLast7, eventsPrev7),
        sessions: pctChange(sessionsLast7, sessionsPrev7),
        users: pctChange(usersLast7, usersPrev7),
        avgSessionDurationSeconds: pctChange(avgLast7, avgPrev7),
      },
      mostUsedFeature,
      leastUsedFeature,
      featureUsageBreakdown: featureBreakdown.map((x) => ({ name: x._id, count: x.count })),
      timeSpentPerPageSeconds: pageTimeSeries,
      dailyEventTrend,
      recentSessions,
    };
  }

  function heuristicFallback() {
    return [
      "Connect the SDK to start capturing feature usage and page engagement.",
      "Once data arrives, you will see which features are most (and least) used.",
      "This dashboard will also highlight where users spend the most time.",
      "Enable events for your key flows to get actionable AI insights.",
    ];
  }

  function heuristicInsights(data) {
    const insights = [];
    if (data?.mostUsedFeature?.name) {
      insights.push(`Feature ${data.mostUsedFeature.name} is currently the most used, indicating strong user engagement with that workflow.`);
    }
    if (data?.leastUsedFeature?.name) {
      insights.push(`Feature ${data.leastUsedFeature.name} is relatively rarely used, which may signal discovery or usability opportunities.`);
    }
    const pages = data?.timeSpentPerPageSeconds || [];
    if (pages.length) {
      insights.push(`Users spend the most time on ${pages[0].pageName}, suggesting that page is the primary engagement driver.`);
    }
    if (data?.changesPct) {
      const upOrDown = data.changesPct.events >= 0 ? "up" : "down";
      insights.push(`Overall activity is trending ${upOrDown} recently, based on the last week of captured events.`);
    }
    return insights.slice(0, 5).length ? insights.slice(0, 5) : heuristicFallback();
  }

  function safeParseJSON(text) {
    try {
      const trimmed = String(text || "").trim();
      const firstBracket = trimmed.indexOf("[");
      const lastBracket = trimmed.lastIndexOf("]");
      const candidate =
        firstBracket >= 0 && lastBracket > firstBracket ? trimmed.slice(firstBracket, lastBracket + 1) : trimmed;
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  router.get("/api/insights", async (req, res) => {
    try {
      const appId = String(req.query.appId || DEFAULT_APP_ID);
      await seedAppIfEmpty(appId);
      const insights = await getAppInsights(appId);
      res.json(insights);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: "Failed to compute insights" });
    }
  });

  router.get("/api/ai-insights", async (req, res) => {
    try {
      const appId = String(req.query.appId || DEFAULT_APP_ID);
      await seedAppIfEmpty(appId);
      const data = await getAppInsights(appId);

      const fallbackInsights = heuristicInsights(data);

      if (!GEMINI_API_KEY) return res.json({ insights: fallbackInsights });

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = [
        "You are an analytics assistant. Generate 3 to 5 concise, plain-English insights for a product analytics dashboard.",
        "Use ONLY the provided JSON data. Each insight must be a single sentence.",
        "",
        "Rules:",
        "- Avoid jargon and numbers unless they add clarity.",
        "- Mention the feature name when relevant (e.g. 'Feature book_delivery').",
        "- Avoid repeating the same idea.",
        "",
        "DATA (appId-aggregated):",
        JSON.stringify(
          {
            totals: data.totals,
            changesPct: data.changesPct,
            mostUsedFeature: data.mostUsedFeature,
            leastUsedFeature: data.leastUsedFeature,
            topFeatures: data.featureUsageBreakdown.slice(0, 6),
            topPagesByTime: data.timeSpentPerPageSeconds,
            dailyEventTrend: data.dailyEventTrend,
          },
          null,
          0
        ),
        "",
        "Return ONLY a JSON array of strings (no markdown).",
      ].join("\n");

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const parsed = safeParseJSON(text);
      if (!Array.isArray(parsed) || parsed.some((x) => typeof x !== "string")) {
        return res.json({ insights: fallbackInsights });
      }

      const insights = parsed.slice(0, 5).map((s) => String(s).trim()).filter(Boolean);
      return res.json({ insights: insights.length ? insights : fallbackInsights });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.json({ insights: heuristicFallback() });
    }
  });

  return router;
};

