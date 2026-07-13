# 🚀 Feature Usage & Engagement Analytics Platform

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38BDF8)
![License](https://img.shields.io/badge/License-MIT-yellow)

</p>

> A production-inspired feature analytics platform that enables developers to track user interactions, monitor feature adoption, analyze engagement metrics, and visualize insights through an interactive dashboard powered by AI-generated insights.

---

# 📖 Overview

Feature Usage & Engagement Analytics Platform is a lightweight, self-hosted analytics solution designed for modern web applications.

It provides a JavaScript SDK to capture user interactions, stores events securely, and presents actionable insights through a responsive analytics dashboard.

The platform helps developers understand:

- Feature adoption
- User engagement
- Session activity
- User behaviour
- Product usage trends
- AI-generated recommendations

---

# ✨ Features

- 📊 Feature Usage Tracking
- 👥 User Session Analytics
- 🖱 Automatic Click Tracking
- 📈 Interactive Analytics Dashboard
- 🤖 AI-powered Insights
- 📅 Historical Trend Analysis
- ⚡ Lightweight JavaScript SDK
- 🔐 Self-hosted Architecture
- 📦 REST API Backend
- 📱 Responsive Dashboard

---

# 🏗 Architecture

```text
                +----------------------+
                |   Web Application    |
                +----------+-----------+
                           |
                     tracker.js SDK
                           |
                           ▼
                 Express REST API Server
                           |
                           ▼
                     MongoDB Database
                           |
                           ▼
              React Analytics Dashboard
                           |
                           ▼
                AI Insights (Gemini API)
```

---

# ⚙️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Charts | Recharts |
| AI | Google Gemini API |
| SDK | Vanilla JavaScript |
| API | REST API |

---

# 📂 Project Structure

```text
Feature-Usage-and-Engagement-Analytics/

├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── dashboard/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
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

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/hiteshkr25/Feature-Usage-and-Engagement-Analytics.git

cd Feature-Usage-and-Engagement-Analytics
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

---

## Dashboard Setup

```bash
cd dashboard

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_api_key
```

---

# 📈 Dashboard Features

### Analytics

- Daily Active Users
- Feature Usage Metrics
- Event Tracking
- User Sessions
- User Activity Timeline
- Engagement Trends

### AI Insights

- Product Usage Summary
- Feature Recommendations
- Engagement Suggestions
- Behaviour Analysis

---

# 🔄 Event Flow

```text
User Interaction

        │

        ▼

JavaScript SDK

        │

        ▼

REST API

        │

        ▼

MongoDB

        │

        ▼

Analytics Dashboard

        │

        ▼

AI Insights
```

---

# 📸 Screenshots

> Add screenshots here after deployment.

```
Dashboard

Feature Usage

User Sessions

AI Insights
```

---

# 🛣 Roadmap

- ✅ Event Tracking SDK
- ✅ Analytics Dashboard
- ✅ Session Tracking
- ✅ AI Insights
- ✅ MongoDB Integration
- ⏳ Authentication
- ⏳ Team Workspaces
- ⏳ Event Export
- ⏳ Heatmaps
- ⏳ Real-time Streaming

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit changes

```bash
git commit -m "feat: add new feature"
```

4. Push

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Hitesh Kumar**

**Anjali Sinha**

**Rahul Raj**

**Vasu Singh**



---

⭐ If you found this project useful, consider giving it a star!
