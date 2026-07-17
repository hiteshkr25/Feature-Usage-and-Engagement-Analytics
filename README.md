# 📊 Feature Usage & Engagement Analytics System

A full-stack web analytics platform that captures user interactions, stores engagement data, processes analytics, and visualizes actionable insights through an interactive dashboard.

The system enables developers to understand user behavior by tracking feature usage, sessions, page engagement, and overall application activity.

---

## 🚀 Features

- 📌 Automatic Event Tracking
- 👤 User & Session Tracking
- 📈 Interactive Analytics Dashboard
- 📊 KPI Metrics
  - Total Events
  - Total Sessions
  - Total Users
  - Average Session Duration
- 📉 Daily Event Trend Analysis
- 🧩 Feature Usage Analytics
- ⏱ Session Analytics
- 📱 Responsive Dashboard UI
- 🔄 Real-time Dashboard Refresh
- 🌐 REST API Architecture

---

# 🏗 Project Architecture

```
                    User Interaction
                           │
                           ▼
               JavaScript Tracking SDK
                           │
                    HTTP POST Requests
                           │
                           ▼
                Node.js + Express Server
                           │
                    Request Validation
                           │
                           ▼
                      MongoDB Database
                           │
                 Analytics Computation
                           │
                           ▼
                 REST Analytics APIs
                           │
                           ▼
                React Analytics Dashboard
```

---

# 📂 Project Structure

```
analytics-system/

├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── sdk/
│   └── tracker.js
│
├── integration/
│   └── INTEGRATION_GUIDE.md
│
└── README.md
```

---

# ⚙ Tech Stack

## Frontend

- React.js
- JavaScript (ES6+)
- Tailwind CSS
- Recharts / Chart Library
- Fetch API

---

## Backend

- Node.js
- Express.js
- REST APIs
- Middleware
- CORS
- Morgan

---

## Database

- MongoDB
- Mongoose ODM

---

## Development Tools

- Git & GitHub
- Postman
- Nodemon
- VS Code

---

# 📊 Dashboard Modules

### Overview

- Total Events
- Total Sessions
- Total Users
- Average Session Duration

### Feature Analytics

- Most Used Feature
- Least Used Feature
- Feature Usage Distribution

### Session Analytics

- Session Duration
- User Activity
- Pages Visited
- Session Statistics

---

# 🔄 System Workflow

1. User performs an action.
2. Tracking SDK captures the interaction.
3. Event is sent to the backend using REST APIs.
4. Backend validates the request.
5. Event is stored in MongoDB.
6. Analytics APIs process the stored data.
7. Dashboard fetches processed analytics.
8. KPIs and charts are rendered for visualization.

---

# 📌 REST API Endpoints

## Event APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/events` | Store tracking events |
| DELETE | `/api/events` | Clear analytics data |

---

## Analytics APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/insights` | Fetch dashboard analytics |
| GET | `/api/health` | Backend health check |

---

# 📈 KPIs Calculated

- Total Events
- Total Sessions
- Total Users
- Average Session Duration
- Daily Event Trend
- Feature Usage Breakdown
- Most Used Feature
- Least Used Feature
- Session Statistics

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/feature-usage-analytics.git

cd feature-usage-analytics
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=4001

MONGO_URI=your_mongodb_connection_string
```

Run backend:

```bash
npm start
```

---

## Dashboard Setup

```bash
cd dashboard

npm install

npm run dev
```

---

# 📡 Event Tracking Example

```javascript
AnalyticsSDK.init({
    appId: "drone-app",
    endpoint: "http://localhost:4001"
});

AnalyticsSDK.trackEvent({
    eventType: "feature_used",
    featureName: "track_order"
});
```

---

# 📊 Sample Analytics Response

```json
{
  "totals": {
    "totalEvents": 150,
    "totalUsers": 24,
    "totalSessions": 42,
    "avgSessionDurationSeconds": 185
  },
  "mostUsedFeature": {
    "name": "Track Order",
    "count": 68
  }
}
```

---

# 🎯 Key Learning Outcomes

- Full Stack Web Development
- REST API Development
- Event Tracking Systems
- MongoDB Data Modeling
- Analytics Dashboard Development
- Data Aggregation
- Client-Server Architecture
- Session Management
- Responsive UI Development

---

# 👨‍💻 Team Contributions

### Member 1 – Frontend Dashboard Development

- Dashboard UI
- KPI Cards
- Charts
- Responsive Design
- API Integration

### Member 2 – Event Tracking System

- Tracking SDK
- Event Capture
- Session Tracking
- Fetch API Integration

### Member 3 – Backend Development

- Express Server
- REST APIs
- Event Processing
- Request Validation
- Server Architecture

### Member 4 – Database & Analytics

- MongoDB Schema
- Data Storage
- Aggregation Pipelines
- KPI Computation
- Analytics APIs

---

# 🌟 Future Enhancements

- AI-powered Insights
- Real-time Analytics using WebSockets
- User Authentication
- Export Reports (PDF/Excel)
- Funnel Analysis
- Retention Analytics
- Heatmaps
- Role-based Access Control
- Cloud Deployment
- Docker Support

---

# 📄 License

This project was developed for academic and educational purposes.

---

## ⭐ If you found this project useful, consider giving it a star!
