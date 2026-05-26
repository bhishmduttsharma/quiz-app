import React, { useEffect, useId, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';

import {
  Award,
  BarChart3,
  Bell,
  BookOpenCheck,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';

const Navbar = ({ logoSrc }) => {
  const navigate = useNavigate();
  const initialUser = getCurrentUser();
  const mobileMenuId = useId();

  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [isAdmin, setIsAdmin] = useState(
    () => initialUser?.role === 'admin' || Boolean(initialUser?.isAdmin)
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("quizNotifications") || "[]");
    } catch {
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handler = (ev) => {
      const detailUser = ev?.detail?.user ?? null;
      setLoggedIn(!!detailUser);
      setIsAdmin(detailUser?.role === 'admin' || Boolean(detailUser?.isAdmin));
    };
    window.addEventListener("authChanged", handler);
    const notificationHandler = () => {
      try {
        setNotifications(JSON.parse(localStorage.getItem("quizNotifications") || "[]"));
      } catch {
        setNotifications([]);
      }
    };
    window.addEventListener("quizNotification", notificationHandler);

    return () => {
      window.removeEventListener("authChanged", handler);
      window.removeEventListener("quizNotification", notificationHandler);
    };
  }, []);


  // Logout function
  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.clear();
    } catch {
      // Private browsing modes can reject storage writes; the UI still clears locally.
    }

    window.dispatchEvent(
      new CustomEvent('authChanged', {
        detail: { user: null },
      })
    );

    setLoggedIn(false);
    setMenuOpen(false);

    try {
      navigate('/login');
    } catch {
      window.location.href = '/login';
    }
  };

  const logo =
    logoSrc ||
    'https://yt3.googleusercontent.com/eD5QJD-9uS--ekQcA-kDTCu1ZO4d7d7BTKLIVH-EySZtDVw3JZcc-bHHDOMvxys92F7rD8Kgfg=s900-c-k-c0x00ffffff-no-rj';

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/student', label: 'Learn', icon: BookOpenCheck, auth: true },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, auth: true },
    { to: '/result', label: 'Results', icon: Award, auth: true },
    { to: '/profile', label: 'Profile', icon: UserRound, auth: true },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ClipboardList, auth: true }] : []),
  ].filter((item) => !item.auth || loggedIn);

  return (
    <>
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="fixed left-4 top-4 z-50 hidden h-[calc(100vh-2rem)] w-20 flex-col items-center rounded-lg border border-white/10 bg-slate-950/72 px-3 py-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.44)] ring-1 ring-white/[0.03] backdrop-blur-2xl md:flex"
      >
        <Link to="/" className="group grid h-12 w-12 place-items-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/15 to-white/[0.04] shadow-lg shadow-cyan-950/20 transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60">
          <img src={logo} alt="QuizMaster logo" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
        </Link>

        <div className="mt-5 h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <nav className="mt-5 flex flex-1 flex-col items-center gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `group relative grid h-12 w-12 place-items-center rounded-lg border transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 ${
                  isActive
                    ? 'border-cyan-300/40 bg-gradient-to-br from-cyan-200 to-emerald-200 text-slate-950 shadow-lg shadow-cyan-950/30'
                    : 'border-white/10 bg-white/[0.055] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-cyan-950/10'
                }`
              }
            >
              <Icon size={20} />
              <span className="pointer-events-none absolute left-14 scale-95 rounded-md border border-white/10 bg-slate-950/95 px-2 py-1 text-xs font-bold text-white opacity-0 shadow-xl backdrop-blur transition group-hover:scale-100 group-hover:opacity-100">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={loggedIn ? handleLogout : () => navigate('/login')}
          className="grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          title={loggedIn ? 'Logout' : 'Login'}
          aria-label={loggedIn ? 'Logout' : 'Login'}
        >
          {loggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
        </button>

        {loggedIn && (
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setShowNotifications((value) => !value)}
              className="grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              title="Notifications"
              aria-label="Toggle notifications"
              aria-expanded={showNotifications}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.96 }}
                  className="absolute bottom-0 left-14 w-72 rounded-lg border border-white/10 bg-slate-950/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
                >
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Notifications
                  </p>
                  <div className="grid gap-2">
                    {notifications.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-md border border-white/10 bg-white/[0.05] p-2 text-xs font-semibold text-slate-300">
                        {item.message}
                      </div>
                    ))}
                    {!notifications.length && (
                      <p className="text-xs text-slate-500">No notifications yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.aside>

      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/82 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="QuizMaster logo" className="h-10 w-10 rounded-lg border border-white/10 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">QuizMaster</p>
              <p className="truncate text-xs text-slate-400">Premium learning dashboard</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label="Toggle menu"
            aria-controls={mobileMenuId}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
              id={mobileMenuId}
            >
              <div className="mt-3 grid gap-2 rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-2 shadow-xl shadow-black/20">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-200 to-emerald-200 text-slate-950'
                          : 'text-slate-200 hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={loggedIn ? handleLogout : () => navigate('/login')}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                >
                  {loggedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                  {loggedIn ? 'Logout' : 'Login'}
                </button>
                {loggedIn && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      <Bell size={14} />
                      Notifications
                    </div>
                    <div className="grid gap-2">
                      {notifications.slice(0, 3).map((item) => (
                        <p key={item.id} className="rounded-md bg-white/[0.05] p-2 text-xs font-semibold text-slate-300">
                          {item.message}
                        </p>
                      ))}
                      {!notifications.length && (
                        <p className="text-xs text-slate-500">No notifications yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
