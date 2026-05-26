import React, { Suspense, lazy } from 'react'
import {Route, Routes, useLocation,Navigate} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isAdminUser } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import { InlineLoader } from './components/UiStates';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const MyResultpage = lazy(() => import('./pages/MyResultPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function RequireAuth({ children}) {
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));
  const location = useLocation();

  if (!isLoggedIn) {
    return (<Navigate to="/login" state={{ from: location }} replace /> );
  }
  return children;
}

function RequireAdmin({ children }) {
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location, admin: true }} replace />;
  }

  if (!isAdminUser()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const App = () => {
  const location = useLocation();

  return (
   <>
    <Suspense fallback={<main className="min-h-screen bg-slate-950 p-4 text-white"><InlineLoader label="Opening QuizMaster..." /></main>}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="app-page min-h-screen"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route
              path="/student"
              element={
                <RequireAuth>
                  <StudentDashboard />
                </RequireAuth>
              }
            />
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>} /> 

            <Route 
              path="/result"
              element={
                <RequireAuth>
                  <MyResultpage />
                </RequireAuth>
              }
              />
            <Route
              path="/analytics"
              element={
                <RequireAuth>
                  <AnalyticsDashboard />
                </RequireAuth>
              }
              />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
              />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPanel />
                </RequireAdmin>
              }
              />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
    <ToastContainer position="top-right" autoClose={2500} theme="colored" pauseOnFocusLoss={false} />
   </>
  );
};

export default App;
