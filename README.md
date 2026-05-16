# Feature Usage & Engagement Analytics System

Self-hosted mini Google Analytics for web apps:
- Vanilla JS tracking SDK (`sdk/tracker.js`) via a single `<script>` tag
- Node.js + Express API that stores events in MongoDB
- React (Vite) dashboard with premium charts + Gemini-based AI insights 

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (or provide your own connection string)
- (Optional) Gemini API key for AI insights

---

## Backend (Express + MongoDB)

1. Configure environment:
   - Copy `backend/.env.example` to `backend/.env`
   - Set:
     - `MONGO_URI`
     - `GEMINI_API_KEY` (optional but recommended)

2. Start backend:

```powershell
cd analytics-system/backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

---

## Dashboard (React + Vite + Tailwind + Recharts)

1. Configure environment:
   - Copy `dashboard/.env.example` to `dashboard/.env`
   - Set `VITE_BACKEND_ENDPOINT` if needed.

2. Start dashboard:

```powershell
cd analytics-system/dashboard
npm install
npm run dev
```

---

## Integrate the SDK (single script tag)

See `integration/INTEGRATION_GUIDE.md` for full steps.

High-level:
1. Host `sdk/tracker.js` somewhere your app can load it
2. Add the `<script src=".../tracker.js"></script>` tag
3. Call:
   - `AnalyticsSDK.init({ appId: "my-app", endpoint: "http://localhost:5000" })`
4. Add `data-track="feature_name"` to buttons (auto-tracked)

---

## Reset Data

The dashboard header includes a **Reset Data** button that clears stored events (useful for testing).

