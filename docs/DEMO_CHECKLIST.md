# Startup Demo and Viva Checklist

Use this checklist before presenting QuizMaster.

## Pre-Demo

- Start MongoDB or verify MongoDB Atlas connectivity.
- Confirm `backend/.env` has a strong `JWT_SECRET`.
- Start backend with `npm run dev` from `backend/`.
- Start frontend with `npm run dev` from `frontend/`.
- Login once as admin and verify seed data appears.
- Create at least one sample student result so analytics and Smart Coach have data.

## Suggested Demo Flow

1. Show the landing/student quiz experience.
2. Login as a student and take a short quiz.
3. Show result summary, review mode, bookmarks, and certificate download.
4. Open Analytics and explain charts, leaderboard, weak-subject analysis, and Smart Coach.
5. Click **Start Adaptive Practice** to demonstrate personalized recommendations.
6. Login as admin and show question/technology management plus platform analytics.
7. Open documentation and explain architecture/API design.

## Engineering Viva Talking Points

- Modular MERN architecture with clean route/controller/service separation.
- JWT-based authentication and role-based admin access.
- Centralized validation, error handling, security headers, and basic rate limiting.
- Analytics logic separated into a service for scalability.
- Smart Coach as an explainable recommendation engine.
- Responsive SaaS UI with skeleton loaders, page transitions, and empty states.
- Future scope includes LLM-based feedback, class assignment, proctoring, tests, and CI/CD.
