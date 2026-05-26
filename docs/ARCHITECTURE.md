# Architecture Explanation

## Overview

QuizMaster follows a modular MERN architecture:

```text
React Frontend
  -> Axios / Fetch API
  -> Express REST API
  -> Mongoose Models
  -> MongoDB Database
```

The frontend is responsible for presentation, routing, stateful quiz interaction, charts, and user feedback. The backend is responsible for authentication, authorization, validation, persistence, analytics aggregation, and recommendation logic.

## Frontend Architecture

```text
frontend/src/
  components/    Reusable UI and feature components
  pages/         Route-level screens
  assets/        Quiz fallback data and shared style constants
  utils/         Authentication helpers
  config.js      API base URL configuration
  App.jsx        Route definitions, guards, lazy loading, transitions
```

Important frontend design decisions:

- Route-level lazy loading improves initial page load.
- Protected route wrappers prevent unauthenticated dashboard access.
- Shared skeleton and empty-state components create consistent loading experiences.
- Framer Motion provides smooth page and menu transitions.
- Recharts visualizes score trends, radar analysis, subject performance, and leaderboard data.

## Backend Architecture

```text
backend/
  config/        Environment and MongoDB connection
  controllers/   Request handling and workflow orchestration
  middleware/    Auth, admin guard, validation, errors, security headers
  models/        User, Result, Question, Technology schemas
  routes/        REST route definitions
  services/      Analytics and Smart Coach recommendation logic
  utils/         Shared helpers
```

Important backend design decisions:

- Controllers stay focused on request/response workflow.
- Analytics calculations are isolated in `services/analyticsService.js`.
- Middleware centralizes validation, authentication, and error handling.
- Models define consistent MongoDB document structure.
- Startup seeding ensures required technologies and default admin exist.

## Authentication Flow

1. User registers or logs in.
2. Backend validates credentials.
3. Backend returns a JWT token and user object.
4. Frontend stores the token in local storage.
5. Protected API calls include `Authorization: Bearer <token>`.
6. Backend middleware verifies token and attaches `req.user`.

## Smart Coach Flow

1. Student completes quizzes.
2. Results are stored with score, technology, level, correct answers, wrong answers, and date.
3. Analytics endpoint fetches the user's result history.
4. `buildSmartCoach()` evaluates:
   - average score
   - weakest subject
   - strongest subject
   - recent score momentum
   - last attempted level
5. Backend returns a recommendation object.
6. Frontend displays the Smart Coach panel.
7. Student starts the recommended adaptive practice session.

## Data Models

Main entities:

- `User`: student/admin identity, profile, password hash
- `Technology`: quiz subject, category, levels, active status
- `Question`: technology, level, options, correct answer, creator
- `Result`: quiz attempt, score, correctness, performance, user reference

## Security and Reliability

- Password hashing with bcryptjs
- JWT authentication
- Role-based admin authorization
- Request validation middleware
- Centralized error handler
- Security headers
- CORS configuration through environment variable
- JSON payload size limit
