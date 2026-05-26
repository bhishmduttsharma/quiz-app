import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { API_BASE } from '../config';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = ({ onLoginSuccess = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.admin ? 'admin' : 'student';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!isValidEmail(email.trim())) nextErrors.email = 'Enter a valid email';

    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    return nextErrors;
  };

  const persistSession = (data, payloadEmail) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem(
      'currentUser',
      JSON.stringify(data.user || { email: payloadEmail, role })
    );
  };

  const performLogin = async (payload) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      persistSession(data, payload.email);
      const user = data.user || { email: payload.email, role: payload.role };
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      if (typeof onLoginSuccess === 'function') onLoginSuccess(user);

      toast.success(`Welcome ${user.role === 'admin' ? 'Admin' : 'Student'}`);
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    await performLogin({
      email: email.trim().toLowerCase(),
      password,
      role,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
      <Link
        to="/"
        className="relative z-10 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur transition hover:bg-white/15"
      >
        <ArrowLeft size={16} />
        Home
      </Link>
      </motion.div>

      <section className="relative z-10 mx-auto mt-8 grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden lg:block"
        >
          <p className="mb-3 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
            Smart Quiz Platform
          </p>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-normal text-white">
            Secure role-based access for focused learning.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Students get a clean quiz experience while admins manage subjects,
            levels, questions, scores, and platform data from a protected dashboard.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          noValidate
          className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-300 text-slate-950">
              {role === 'admin' ? <ShieldCheck size={24} /> : <UserRound size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Login</h2>
              <p className="text-sm text-slate-300">Choose your role and continue.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-1">
            {[
              ['student', 'Student', UserRound],
              ['admin', 'Admin', ShieldCheck],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                  role === value
                    ? 'bg-cyan-300 text-slate-950'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            Email
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((current) => ({ ...current, email: '' }));
                }}
                className={`w-full rounded-md border bg-slate-950/80 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                  errors.email
                    ? 'border-red-400 focus:border-red-300'
                    : 'border-white/10 focus:border-cyan-300'
                }`}
                placeholder={role === 'admin' ? 'admin@quiz.com' : 'student@example.com'}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
            </div>
            {errors.email && <span id="login-email-error" className="text-xs text-red-300">{errors.email}</span>}
          </label>

          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-200">
            Password
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) setErrors((current) => ({ ...current, password: '' }));
                }}
                className={`w-full rounded-md border bg-slate-950/80 px-10 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                  errors.password
                    ? 'border-red-400 focus:border-red-300'
                    : 'border-white/10 focus:border-cyan-300'
                }`}
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span id="login-password-error" className="text-xs text-red-300">{errors.password}</span>}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            {loading ? 'Signing in...' : `Sign in as ${role}`}
          </button>

          <p className="mt-5 text-center text-sm text-slate-300">
            Need an account?{' '}
            <Link to="/signup" className="font-bold text-cyan-200 hover:text-cyan-100">
              Create student or admin account
            </Link>
          </p>
        </motion.form>
      </section>
    </main>
  );
};

export default Login;
