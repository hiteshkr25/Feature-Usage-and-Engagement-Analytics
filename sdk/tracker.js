/* eslint-disable no-var, prefer-const */
(function () {
  // Minimal, standalone SDK (no build, no imports).
  // Exposes: window.AnalyticsSDK and window.trackEvent

  var SDK_KEY = "__analytics_sdk_v1__";
  var SESSION_KEY = "__analytics_user_session_id__";
  var USER_KEY = "__analytics_user_id__";

  var config = {
    appId: null,
    endpoint: null,
  };

  var initialized = false;
  var sending = false;
  var eventQueue = [];
  var pendingEvents = [];
  var flushTimer = null;

  var sessionId = null;
  var userId = null;
  var sessionStartTs = null;
  var pageStartPerf = null;
  var pageName = getPageName();

  // Make sure IDs exist as early as possible.
  userId = safeGetOrCreateStorage(USER_KEY, createRandomId);
  sessionId = safeGetOrCreateSessionStorage(SESSION_KEY, createRandomId);

  pageStartPerf = safePerformanceNow();

  function safePerformanceNow() {
    try {
      return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    } catch (e) {
      return Date.now();
    }
  }

  function createRandomId() {
    try {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        var arr = new Uint32Array(4);
        crypto.getRandomValues(arr);
        return Array.prototype.map
          .call(arr, function (x) {
            return x.toString(16);
          })
          .join("");
      }
    } catch (e) {}
    return String(Math.random()).slice(2) + "_" + String(Date.now());
  }

  function safeGetOrCreateStorage(key, createFn) {
    try {
      var v = localStorage.getItem(key);
      if (v) return v;
      v = createFn();
      localStorage.setItem(key, v);
      return v;
    } catch (e) {
      return createFn();
    }
  }

  function safeGetOrCreateSessionStorage(key, createFn) {
    try {
      var v = sessionStorage.getItem(key);
      if (v) return v;
      v = createFn();
      sessionStorage.setItem(key, v);
      return v;
    } catch (e) {
      return createFn();
    }
  }

  function getEndpointUrl() {
    if (!config.endpoint) return null;
    var base = String(config.endpoint).replace(/\/+$/, "");
    return base + "/api/events";
  }

  function getPageName() {
    try {
      var p = location.pathname || "/";
      var s = location.search || "";
      // Keep it readable but stable.
      if (s && s.length > 0) return p + s;
      return p;
    } catch (e) {
      return "unknown";
    }
  }

  function nowISO() {
    try {
      return new Date().toISOString();
    } catch (e) {
      return Date.now();
    }
  }

  function enqueueEvent(event) {
    if (!event) return;
    eventQueue.push(event);
    scheduleFlush();
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush(false);
    }, 2000);
  }

  function flush(forceBeacon) {
    if (sending) return;
    if (!eventQueue.length) return;

    var endpointUrl = getEndpointUrl();
    if (!endpointUrl) return;

    var batch = eventQueue.splice(0, eventQueue.length);
    sending = true;

    // For unload scenarios, prefer sendBeacon.
    if (forceBeacon && navigator && navigator.sendBeacon) {
      try {
        var blob = new Blob([JSON.stringify(batch)], { type: "application/json" });
        navigator.sendBeacon(endpointUrl, blob);
        sending = false;
        return;
      } catch (e) {}
    }

    // Regular flush (best effort).
    try {
      batch.forEach(function (evt) {
        try {
          fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evt),
            keepalive: true,
          }).catch(function () {});
        } catch (e) {}
      });
    } catch (e) {}

    // Avoid sticking on failures. We already removed items from the queue.
    sending = false;
  }

  function trackEvent(eventType, payload) {
    payload = payload || {};

    if (!config.appId) {
      // Allow calls before init(); they'll be replayed after init.
      pendingEvents.push([eventType, payload]);
      return;
    }

    // Only "feature_used" uses the required { feature } convention; other event types can pass pageName/timeSpent.
    var featureName = payload.featureName || payload.feature;
    var page = payload.pageName != null ? String(payload.pageName) : pageName;

    var evt = {
      appId: config.appId,
      sessionId: sessionId,
      userId: userId,
      eventType: String(eventType),
      featureName: featureName != null ? featureName : undefined,
      pageName: page != null ? page : undefined,
      timeSpent: payload.timeSpent != null ? Number(payload.timeSpent) : undefined,
      timestamp: payload.timestamp != null ? payload.timestamp : nowISO(),
      metadata: payload.metadata != null ? payload.metadata : undefined,
    };

    enqueueEvent(evt);
  }

  function sendPageAndSessionEnd() {
    var did = sendPageAndSessionEnd._did;
    if (did) return;
    sendPageAndSessionEnd._did = true;

    // Page time (from perf baseline).
    var durationMs = Math.max(0, Math.round(safePerformanceNow() - pageStartPerf));
    trackEvent("page_time", { timeSpent: durationMs, pageName: pageName });

    // Session duration (wall clock).
    var sessionDurationMs = sessionStartTs ? Math.max(0, Math.round(Date.now() - sessionStartTs)) : durationMs;
    trackEvent("session_end", { timeSpent: sessionDurationMs });

    // Best-effort final flush.
    flush(true);
  }

  function bindAutoTracking() {
    // Capture feature usage through declarative data attributes.
    document.addEventListener(
      "click",
      function (e) {
        try {
          var target = e.target;
          if (!target || !target.closest) return;
          var el = target.closest("[data-track]");
          if (!el) return;
          var feature = el.getAttribute("data-track");
          if (!feature) return;
          trackEvent("feature_used", { featureName: feature, pageName: getPageName() });
        } catch (err) {}
      },
      true
    );

    // Handle navigation unload.
    window.addEventListener(
      "pagehide",
      function () {
        sendPageAndSessionEnd();
      },
      { capture: true }
    );

    window.addEventListener(
      "beforeunload",
      function () {
        sendPageAndSessionEnd();
      },
      { capture: true }
    );
  }

  function onInit() {
    if (initialized) return;
    initialized = true;

    sessionStartTs = Date.now();
    pageName = getPageName();

    // Session start + page view.
    trackEvent("session_start", { timestamp: nowISO(), metadata: { sdk: true } });
    trackEvent("page_visit", { timestamp: nowISO(), pageName: pageName });

    // Replay any queued manual events captured before init().
    if (pendingEvents.length) {
      var toReplay = pendingEvents.splice(0, pendingEvents.length);
      for (var i = 0; i < toReplay.length; i++) {
        trackEvent(toReplay[i][0], toReplay[i][1]);
      }
    }

    // Periodic flush so events aren't delayed too long.
    setInterval(function () {
      flush(false);
    }, 10_000);

    bindAutoTracking();
  }

  function normalizeEndpoint(endpoint) {
    if (!endpoint) return null;
    return String(endpoint).replace(/\/+$/, "");
  }

  function init(opts) {
    opts = opts || {};
    if (!opts.appId || !opts.endpoint) throw new Error("AnalyticsSDK.init requires { appId, endpoint }");
    config.appId = String(opts.appId);
    config.endpoint = normalizeEndpoint(opts.endpoint);

    // Persist init options for debugging.
    try {
      window.SDKConfig = window.SDKConfig || {};
      window.SDKConfig.appId = config.appId;
      window.SDKConfig.endpoint = config.endpoint;
      window.SDKConfig[SDK_KEY] = true;
    } catch (e) {}

    onInit();
  }

  var AnalyticsSDK = {
    init: init,
    trackEvent: trackEvent,
    // For debugging/testing.
    _flush: function () {
      flush(false);
    },
  };

  window.AnalyticsSDK = AnalyticsSDK;

  // Also expose a global trackEvent to match the requested developer ergonomics.
  window.trackEvent = function (eventType, payload) {
    if (!initialized) {
      // If trackEvent is called before init, we still enqueue; it will have appId populated after init.
    }
    return trackEvent(eventType, payload);
  };
})();

