# QuizMaster - AI-Assisted Quiz and Learning Analytics Platform

QuizMaster is a full-stack MERN quiz platform built for students, teachers, and administrators. It combines role-based quiz management, timed assessments, result tracking, leaderboards, downloadable certificates, and an AI-style Smart Coach that recommends adaptive practice based on learner performance.

The project is designed as a final year engineering presentation system: it demonstrates practical software engineering, full-stack architecture, authentication, data modeling, analytics, responsive UI design, and intelligent decision support.

## Project Highlights

- Role-based authentication for students and administrators
- Technology and difficulty-based quiz workflow
- Admin dashboard for managing technologies, levels, questions, users, and results
- Private admin invitation code for creating multiple admin accounts
- Secure student practice links with per-student shuffled question sets
- Timed quiz engine with bookmarks, review mode, progress tracking, and auto-submit
- Analytics dashboard with score trends, weak-subject analysis, leaderboard, and quiz history
- AI-style Smart Coach that generates readiness score, momentum insights, and adaptive recommendations
- Adaptive Practice Launcher that opens the recommended subject and level directly
- PDF certificate generation for completed quizzes
- Premium responsive SaaS-style UI with skeleton loaders, empty states, animations, and accessible focus states

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Framer Motion, Recharts, Lucide Icons |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Analytics | Custom aggregation logic, leaderboard scoring, Smart Coach recommendation engine |
| Utilities | jsPDF, React Toastify, Axios |

## Project Structure

```text
quiz-app/
  backend/
    config/          Environment and database configuration
    controllers/     Request handlers and business workflows
    middleware/      Authentication, authorization, validation, errors, security
    models/          Mongoose schemas
    routes/          Express route modules
    services/        Reusable analytics and recommendation logic
    utils/           API helpers, validators, token generation, seed data
    app.js           Express application setup
    server.js        Server bootstrap
  frontend/
    public/          Static public assets
    src/
      assets/        Local quiz data and style constants
      components/    Reusable UI and feature components
      pages/         Route-level pages
      utils/         Frontend auth helpers
      App.jsx        Application routes and page transitions
      config.js      Frontend API configuration
      index.css      Global design system styles
  docs/
    API.md
    ARCHITECTURE.md
    FEATURE_SUMMARY.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18 or newer
- MongoDB local server or MongoDB Atlas database
- npm

### 2. Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/quiz-app
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
ADMIN_INVITE_CODE=QUIZMASTER-ADMIN-2026
```

The backend seeds default technologies and an admin account on startup.

Default admin credentials:

```text
Email: admin@quiz.com
Password: Admin@123
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Optional frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Available Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Documentation

- [Feature Summary](docs/FEATURE_SUMMARY.md)
- [Architecture Explanation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Demo and Viva Checklist](docs/DEMO_CHECKLIST.md)

## Future Scope

- Integrate a real LLM API for natural-language study feedback
- Add teacher role with class-wise quiz assignment
- Add proctored exam mode with tab-switch detection
- Add question import/export using CSV or Excel
- Add email reports and weekly learning summaries
- Add deployment pipeline with Docker and CI/CD
- Add unit, integration, and end-to-end test suites

## Technical Highlights

- Modular Express architecture with controllers, routes, middleware, services, and models
- JWT authentication with role-based admin authorization
- Centralized error handling and request validation
- Security headers, request IDs, basic rate limiting, and environment-based CORS
- Analytics service separated from controllers for maintainable business logic
- Responsive React UI with route-level lazy loading and page transitions
- Skeleton loaders and empty states for professional loading and no-data experiences
- Custom recommendation logic for adaptive learning guidance

## Project Description

QuizMaster solves a common academic challenge: students take quizzes, but they rarely receive structured feedback about what to practice next. This platform goes beyond basic quiz scoring by turning attempts into analytics and actionable recommendations. The Smart Coach feature evaluates score trends, accuracy, weak subjects, and recent momentum to recommend the next best practice session.

This makes the project suitable for demonstrating both standard full-stack engineering and intelligent analytics-driven learning support.
