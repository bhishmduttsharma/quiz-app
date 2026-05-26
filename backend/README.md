# QuizMaster Backend

Express and MongoDB backend for QuizMaster.

## Responsibilities

- Authentication and JWT issuing
- Admin authorization
- Technology and question management
- Quiz result storage
- Leaderboard and analytics generation
- Smart Coach recommendation generation
- Request validation and centralized error handling

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

## Environment Variables

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JSON_LIMIT=2mb

MONGODB_URI=mongodb://127.0.0.1:27017/quiz-app
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=24h

ADMIN_EMAIL=admin@quiz.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Quiz Admin
```

Use a strong `JWT_SECRET` in production and never commit real credentials.

## Main Modules

- `app.js`: Express middleware and route registration
- `server.js`: database connection, seed execution, server startup
- `routes/`: REST route modules
- `controllers/`: API request handlers
- `models/`: Mongoose schemas
- `middleware/`: auth, admin guard, validation, security, errors
- `services/analyticsService.js`: leaderboard, subject analytics, Smart Coach

## API Prefix

```text
/api
```

Full API documentation is available in:

```text
../docs/API.md
```
