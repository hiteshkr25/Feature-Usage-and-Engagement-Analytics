const express = require("express");

module.exports = function createEventsRouter({ Event }) {
  const router = express.Router();

  function clampNumber(n, fallback = 0) {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
  }

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

  router.post("/api/events", async (req, res) => {
    try {
      const payload = req.body;
      const items = Array.isArray(payload) ? payload : [payload];

      const sanitized = items.map(sanitizeEventPayload).filter(Boolean);
      if (!sanitized.length) return res.status(400).json({ error: "Invalid event payload" });

      await Event.insertMany(sanitized, { ordered: false });
      res.json({ ok: true, received: sanitized.length });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: "Failed to store events" });
    }
  });

  router.delete("/api/events", async (req, res) => {
    try {
      await Event.deleteMany({});
      res.json({ ok: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: "Failed to clear events" });
    }
  });

  return router;
};

