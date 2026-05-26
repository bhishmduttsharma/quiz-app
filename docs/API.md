# API Documentation

Base URL:

```text
http://localhost:4000/api
```

Protected routes require:

```http
Authorization: Bearer <jwt-token>
```

## Auth APIs

### Register

```http
POST /auth/register
```

Body:

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

To create an admin, use the private invite code configured by `ADMIN_INVITE_CODE`:

```json
{
  "name": "Admin Name",
  "email": "admin2@example.com",
  "password": "password123",
  "role": "admin",
  "adminCode": "QUIZMASTER-ADMIN-2026"
}
```

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

### Get Current Profile

```http
GET /auth/me
```

Protected: Yes

### Update Profile

```http
PUT /auth/profile
```

Protected: Yes

Body:

```json
{
  "name": "Student Name",
  "college": "ABC Institute",
  "bio": "Frontend learner",
  "avatar": "data:image/png;base64,..."
}
```

## Technology APIs

### List Public Technologies

```http
GET /technologies
```

### List Technologies for Admin

```http
GET /technologies/admin?includeInactive=true
```

Protected: Admin

### Create Technology

```http
POST /technologies
```

Protected: Admin

Body:

```json
{
  "id": "react",
  "name": "React",
  "category": "Frontend",
  "levels": [{ "name": "Basic" }, { "name": "Intermediate" }],
  "isActive": true
}
```

### Update Technology

```http
PUT /technologies/:id
```

Protected: Admin

### Delete Technology

```http
DELETE /technologies/:id
```

Protected: Admin

## Question APIs

### List Public Questions

```http
GET /questions?technology=react&level=basic
```

### List Own/Admin Questions

```http
GET /questions/mine
```

Protected: Yes

### Create Question

```http
POST /questions
```

Protected: Yes

Body:

```json
{
  "technology": "react",
  "level": "basic",
  "question": "What is JSX?",
  "options": ["A syntax extension", "A database", "A server", "A CSS framework"],
  "correctAnswer": 0,
  "isActive": true
}
```

### Update Question

```http
PUT /questions/:id
```

Protected: Yes

### Delete Question

```http
DELETE /questions/:id
```

Protected: Yes

## Result APIs

### Save Result

```http
POST /results
```

Protected: Yes

Body:

```json
{
  "title": "React - Basic quiz",
  "technology": "react",
  "level": "basic",
  "totalQuestions": 10,
  "correct": 8,
  "wrong": 2
}
```

### List User Results

```http
GET /results
GET /results?technology=react
```

Protected: Yes

### Analytics and Smart Coach

```http
GET /results/analytics
```

Protected: Yes

Returns:

- score statistics
- subject analytics
- weak subjects
- attempt trend
- quiz history
- leaderboard context
- Smart Coach recommendation

### Leaderboard

```http
GET /results/leaderboard
GET /results/leaderboard?subject=react
```

Protected: Yes

### Top Performers

```http
GET /results/top-performers
```

Public

## Admin APIs

All admin APIs require admin authentication.

### Platform Stats

```http
GET /admin/stats
```

### List Students

```http
GET /admin/students
```

### List All Results

```http
GET /admin/results
```
