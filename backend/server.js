const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");

const Event = require("./models/Event");
const SeedState = require("./models/SeedState");
const createEventsRouter = require("./routes/events");
const createInsightsRouter = require("./routes/insights");
const Analytics = require("./models/Analytics");
dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_APP_ID = process.env.SEED_APP_ID || "drone-app";

if (!MONGO_URI) {
  // eslint-disable-next-line no-console
  console.error("Missing MONGO_URI. Set it in backend/.env");
}

app.post("/api/events", async (req, res) => {
  try {
    const data = req.body;

    const event = new Analytics({
      appId: data.appId || "drone-app",
      event: data.eventType || "unknown",
      feature: data.featureName || "unknown",
      user_id: data.userId || "anonymous",
      details: {
        sessionId: data.sessionId,
        pageName: data.pageName,
        metadata: data.metadata
      },
      timeSpent: data.timeSpent || 0
    });

    await event.save();

    console.log("✅ Saved:", event);

    res.json({ status: "saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/analytics/summary", async (req, res) => {
  try {
    const events = await Analytics.find();

    const featureCount = {};

    events.forEach(e => {
      const feature = e.feature || "unknown";
      featureCount[feature] = (featureCount[feature] || 0) + 1;
    });

    const sorted = Object.entries(featureCount)
      .sort((a, b) => b[1] - a[1]);

    res.json({
      mostUsed: sorted[0],
      leastUsed: sorted[sorted.length - 1],
      totalEvents: events.length,
      featureCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function clampNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function formatDateKey(d) {
  const dt = new Date(d);
  // YYYY-MM-DD in local time is fine for dashboards.
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

async function seedAppIfEmpty(appId) {
  const alreadySeeded = await SeedState.exists({ appId });
  if (alreadySeeded) return;

  const existingEvents = await Event.countDocuments({ appId });
  if (existingEvents > 0) {
    // Data already exists, but we still mark as seeded to prevent future re-seeds (e.g. after deletes).
    await SeedState.create({ appId });
    return;
  }

  const now = Date.now();
  const pages = [
    "/",
    "/dashboard",
    "/features",
    "/sessions",
    "/ai-insights",
    "/drone/map",
    "/orders",
    "/checkout",
  ];
  const features = ["book_delivery", "track_drone", "view_orders", "cancel_order"];
  const users = ["u_alex", "u_sam", "u_priya", "u_morgan", "u_jordan"];

  const events = [];
  const sessionsToCreate = 28;

  for (let s = 0; s < sessionsToCreate; s++) {
    const sessionId = `sess_${cryptoRandomId()}`;
    const userId = users[Math.floor(Math.random() * users.length)];

    // Spread seeds over the last ~10 days.
    const sessionStartOffsetMs = randInt(0, 9 * 24 * 60 * 60 * 1000);
    const startTs = new Date(now - sessionStartOffsetMs);

    const sessionDurationMs = randInt(25_000, 3 * 60 * 1000);
    const sessionEndTs = new Date(startTs.getTime() + sessionDurationMs);

    events.push({
      appId,
      sessionId,
      userId,
      eventType: "session_start",
      timestamp: startTs,
    });

    const pageSteps = randInt(2, 6);
    let cursorTs = startTs.getTime();

    // Ensure at least one feature per session, so the feature charts aren't empty.
    const requiredFeature = features[Math.floor(Math.random() * features.length)];
    const featureAtStep = randInt(0, Math.max(0, pageSteps - 1));

    for (let i = 0; i < pageSteps; i++) {
      const pageName = pages[Math.floor(Math.random() * pages.length)];
      const pageVisitTs = new Date(cursorTs);
      const pageTimeMs = randInt(4_000, 45_000);
      const pageTimeEndTs = new Date(cursorTs + pageTimeMs);

      events.push({
        appId,
        sessionId,
        userId,
        eventType: "page_visit",
        pageName,
        timestamp: pageVisitTs,
      });

      events.push({
        appId,
        sessionId,
        userId,
        eventType: "page_time",
        pageName,
        timeSpent: pageTimeMs,
        timestamp: pageTimeEndTs,
      });

      if (i === featureAtStep) {
        events.push({
          appId,
          sessionId,
          userId,
          eventType: "feature_used",
          featureName: requiredFeature,
          pageName,
          timestamp: pageTimeEndTs,
        });
      } else if (Math.random() < 0.35) {
        const featureName = features[Math.floor(Math.random() * features.length)];
        events.push({
          appId,
          sessionId,
          userId,
          eventType: "feature_used",
          featureName,
          pageName,
          timestamp: pageTimeEndTs,
        });
      }

      cursorTs += pageTimeMs + randInt(400, 1400);
      if (cursorTs > sessionEndTs.getTime() - 2_000) break;
    }

    events.push({
      appId,
      sessionId,
      userId,
      eventType: "session_end",
      timeSpent: sessionDurationMs,
      timestamp: sessionEndTs,
    });
  }

  await Event.insertMany(events, { ordered: false });
  await SeedState.create({ appId });
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cryptoRandomId() {
  // Works in Node even without crypto import by using Math fallback.
  // Fine for seed data; real SDK generates secure IDs client-side.
  return `${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// REST endpoints (split into dedicated route modules as requested).
app.use(createEventsRouter({ Event }));
app.use(
  createInsightsRouter({
    Event,
    GEMINI_API_KEY,
    seedAppIfEmpty,
    DEFAULT_APP_ID,
  })
);

function sanitizeEventPayload(e) {
  const appId = String(e.appId || "");
  const sessionId = String(e.sessionId || "");
  const userId = String(e.userId || "");
  const eventType = String(e.eventType || "");
  if (!appId || !sessionId || !userId || !eventType) return null;

  const payload = {
    appId,
    sessionId,
    userId,
    eventType,
  };

  if (e.featureName != null) payload.featureName = String(e.featureName);
  if (e.pageName != null) payload.pageName = String(e.pageName);
  if (e.timeSpent != null) payload.timeSpent = clampNumber(e.timeSpent, 0);
  payload.timestamp = e.timestamp ? new Date(e.timestamp) : new Date();
  payload.metadata = e.metadata || undefined;

  return payload;
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

  const mostUsedFeature = featureBreakdown[0]
    ? { name: featureBreakdown[0]._id, count: featureBreakdown[0].count }
    : null;

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
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyEventTrend = fillDailyTrend(dailyEventTrendAgg, last7From);

  // KPI comparisons (last 7 days vs previous 7 days)
  const [eventsLast7, eventsPrev7, sessionsLast7Arr, sessionsPrev7Arr, usersLast7Arr, usersPrev7Arr, avgLast7Agg, avgPrev7Agg] =
    await Promise.all([
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

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
    insights.push(
      `Feature ${data.mostUsedFeature.name} is currently the most used, indicating strong user engagement with that workflow.`
    );
  }
  if (data?.leastUsedFeature?.name) {
    insights.push(
      `Feature ${data.leastUsedFeature.name} is relatively rarely used, which may signal discovery or usability opportunities.`
    );
  }
  const pages = data?.timeSpentPerPageSeconds || [];
  if (pages.length) {
    insights.push(
      `Users spend the most time on ${pages[0].pageName}, suggesting that page is the primary engagement driver.`
    );
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
    // Sometimes models wrap JSON in text; attempt to extract the first array.
    const firstBracket = trimmed.indexOf("[");
    const lastBracket = trimmed.lastIndexOf("]");
    const candidate = firstBracket >= 0 && lastBracket > firstBracket ? trimmed.slice(firstBracket, lastBracket + 1) : trimmed;
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
    await seedAppIfEmpty(DEFAULT_APP_ID);
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Analytics backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

