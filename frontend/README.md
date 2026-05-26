# QuizMaster Frontend

This is the React frontend for QuizMaster, a premium quiz and learning analytics platform.

## Responsibilities

- Student quiz experience
- Admin dashboard
- Authentication pages
- Analytics dashboard
- Smart Coach recommendation UI
- Result history and certificate generation
- Responsive SaaS-style user interface

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Axios
- jsPDF
- Lucide React

## Setup

```bash
npm install
npm run dev
```

Default development URL:

```text
http://localhost:5173
```

Optional `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Important Files

- `src/App.jsx`: routes, protected route guards, lazy loading, page transitions
- `src/components/Sidebar.jsx`: quiz engine and adaptive practice entry
- `src/pages/AnalyticsDashboard.jsx`: charts, leaderboard, Smart Coach UI
- `src/pages/AdminPanel.jsx`: admin CRUD dashboard
- `src/components/UiStates.jsx`: skeleton loaders, empty states, error states
- `src/config.js`: backend API base URL
