# Feature Usage & Engagement Analytics — Integration Guide

This SDK is a standalone script. It tracks page visits, per-page engagement time, sessions, and feature usage, and sends everything to the backend at `POST /api/events`.

## 1) Add the `<script>` tag

Host `sdk/tracker.js` somewhere reachable by your website (your own server, CDN, etc.), then add:

```html
<script src="https://your-domain.com/path/to/tracker.js"></script>
```

After this script loads, use `AnalyticsSDK.init(...)`.

## 2) Configure `appId` and `endpoint`

Call init once (typically near the end of your page HTML):

```html
<script>
  window.AnalyticsSDK.init({
    appId: "my-app",
    endpoint: "http://localhost:5000"
  });
</script>
```

`appId` is used to isolate analytics per application.

## 3) Auto-track feature usage via `data-track` on buttons

Add `data-track="feature_name"` to any clickable element:

```html
<button data-track="task_create">Create task</button>
<button data-track="book_delivery">Book delivery</button>
```

When clicked, the SDK will emit:
`trackEvent("feature_used", { feature: "..." })`

## 4) Manually call `trackEvent()`

You can emit custom events like:

```js
window.trackEvent("feature_used", { feature: "task_create" });
```

Optional fields:
- `pageName` (string) — override the current page name
- `timeSpent` (number, ms) — useful for engagement-tagged features
- `metadata` (object) — attach extra context

## 5) Drone delivery app example

Track these events:
- `book_delivery` — user books a delivery
- `track_drone` — user opens drone tracking map
- `view_orders` — user views order history
- `cancel_order` — user cancels an order
- `map_viewed` — time spent on the drone map page

### HTML buttons (data attributes)

```html
<button data-track="book_delivery">Book Delivery</button>
<button data-track="track_drone">Open Drone Tracking</button>
<button data-track="view_orders">View Orders</button>
<button data-track="cancel_order">Cancel Order</button>
```

### Page engagement: `map_viewed` (time spent on map)

On your drone map page, measure local time spent and emit `map_viewed` with `timeSpent`:

```html
<script>
  let mapStart = Date.now();

  window.addEventListener("pagehide", function () {
    const durationMs = Date.now() - mapStart;
    window.trackEvent("feature_used", {
      feature: "map_viewed",
      timeSpent: durationMs
    });
  });
  
</script>
```

That ensures the backend receives a `feature_used` record for `map_viewed` whenever users spend time on the map.

