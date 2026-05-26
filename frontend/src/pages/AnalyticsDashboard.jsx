import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Lightbulb,
  Medal,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getAuthHeader } from "../utils/auth";
import { API_BASE } from "../config";
import { DashboardSkeleton, ErrorState } from "../components/UiStates";

const cardClass =
  "rounded-lg border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/20 backdrop-blur-2xl";
const panelClass =
  "rounded-lg border border-white/10 bg-slate-950/35 shadow-xl shadow-black/15 backdrop-blur-xl";

const pretty = (value) =>
  String(value || "General")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const COLORS = ["#67e8f9", "#86efac", "#fcd34d", "#f0abfc", "#fb7185"];

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [error, setError] = useState("");

  const authHeader = useMemo(() => getAuthHeader(), []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsResponse, leaderboardResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/results/analytics`, {
          headers: { ...authHeader },
        }),
        axios.get(`${API_BASE}/api/results/leaderboard`, {
          headers: { ...authHeader },
        }),
      ]);

      setAnalytics(analyticsResponse.data);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
      setSubjects(leaderboardResponse.data.subjects || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  const loadLeaderboard = async (subject) => {
    setSelectedSubject(subject);
    setRankingLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/results/leaderboard?subject=${encodeURIComponent(subject)}`,
        { headers: { ...authHeader } }
      );
      setLeaderboard(response.data.leaderboard || []);
      setSubjects(response.data.subjects || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load leaderboard");
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const stats = analytics?.stats || {};
  const subjectData = (analytics?.subjectAnalytics || []).map((item) => ({
    ...item,
    subject: pretty(item.technology),
  }));
  const weakSubjectData = (analytics?.weakSubjects || []).map((item) => ({
    subject: pretty(item.technology),
    score: item.averageScore,
    accuracy: item.accuracy,
  }));
  const trendData = analytics?.trend || [];
  const history = analytics?.history || [];
  const smartCoach = analytics?.smartCoach;

  return (
    <main className="min-h-screen bg-slate-950 text-white [color-scheme:dark]">
      <Navbar />
      <section className="bg-[radial-gradient(circle_at_12%_10%,rgba(56,189,248,.16),transparent_30%),radial-gradient(circle_at_88%_5%,rgba(16,185,129,.14),transparent_24%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-4 py-6 sm:px-6 md:pl-28 lg:px-8 lg:pl-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                Learning Intelligence
              </p>
              <h1 className="text-3xl font-black tracking-normal text-white md:text-5xl">
                Leaderboard & Analytics
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Track scores, accuracy, weak subjects, quiz history, and rankings
                across the whole learning platform.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100">
              {stats.currentRank ? `Global Rank #${stats.currentRank}` : "Complete a quiz to rank"}
            </div>
          </div>

          {loading ? (
            <DashboardSkeleton rows={3} />
          ) : error ? (
            <ErrorState
              title="Analytics could not be loaded"
              message={error}
              onRetry={loadAnalytics}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Trophy} label="Highest Score" value={`${stats.highestScore || 0}%`} accent="text-amber-200" />
                <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy || 0}%`} accent="text-emerald-200" />
                <StatCard icon={Activity} label="Average Score" value={`${stats.averageScore || 0}%`} accent="text-cyan-200" />
                <StatCard icon={BookOpen} label="Quiz Attempts" value={stats.totalAttempts || 0} accent="text-fuchsia-200" />
              </div>

              {smartCoach && (
                <section className={`${cardClass} mt-5 overflow-hidden p-0`}>
                  <div className="grid gap-0 xl:grid-cols-[.9fr_1.1fr]">
                    <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-300/16 via-slate-950/20 to-emerald-300/12 p-5 sm:p-6 xl:border-b-0 xl:border-r">
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
                      <div className="relative">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30">
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                              AI-Style Smart Coach
                            </p>
                            <h2 className="text-2xl font-black text-white">
                              Adaptive next-step planner
                            </h2>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                          <CoachMetric label="Readiness" value={`${smartCoach.readinessScore || 0}%`} />
                          <CoachMetric
                            label="Momentum"
                            value={`${smartCoach.momentum > 0 ? "+" : ""}${smartCoach.momentum || 0}`}
                          />
                          <CoachMetric
                            label="Target"
                            value={`${smartCoach.recommendedPractice?.targetScore || 85}%`}
                          />
                        </div>
                        <Link
                          to={`/student?tech=${encodeURIComponent(
                            smartCoach.recommendedPractice?.technology || "html"
                          )}&level=${encodeURIComponent(
                            smartCoach.recommendedPractice?.level || "basic"
                          )}&adaptive=1`}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-200 to-emerald-200 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 sm:w-auto"
                        >
                          <Rocket size={18} />
                          Start Adaptive Practice
                        </Link>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/35 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                          Recommended session
                        </p>
                        <p className="mt-2 text-xl font-black text-white">
                          {pretty(smartCoach.recommendedPractice?.technology)} -{" "}
                          {pretty(smartCoach.recommendedPractice?.level)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {smartCoach.recommendedPractice?.reason}
                        </p>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <div>
                          <SectionTitle
                            icon={Lightbulb}
                            title="Coach Insights"
                            subtitle="Generated from quiz history"
                          />
                          <div className="grid gap-2">
                            {(smartCoach.insights || []).map((item) => (
                              <article
                                key={`${item.type}-${item.title}`}
                                className="rounded-lg border border-white/10 bg-white/[0.05] p-3"
                              >
                                <p className="text-sm font-black text-white">{item.title}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">{item.message}</p>
                              </article>
                            ))}
                          </div>
                        </div>
                        <div>
                          <SectionTitle
                            icon={Target}
                            title="3-Step Focus Plan"
                            subtitle="Practical preparation loop"
                          />
                          <div className="grid gap-2">
                            {(smartCoach.focusPlan || []).map((item, index) => (
                              <div
                                key={item}
                                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-3"
                              >
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-cyan-300/15 text-xs font-black text-cyan-100">
                                  {index + 1}
                                </span>
                                <p className="text-sm font-semibold leading-6 text-slate-300">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
                <section className={`${cardClass} p-4 sm:p-5`}>
                  <SectionTitle
                    icon={BarChart3}
                    title="Score & Accuracy Trend"
                    subtitle="Attempt-by-attempt learning progress"
                  />
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.16)" />
                        <XAxis dataKey="attempt" stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#67e8f9" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="accuracy" stroke="#86efac" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className={`${cardClass} p-4 sm:p-5`}>
                  <SectionTitle
                    icon={Brain}
                    title="Weak Subject Analysis"
                    subtitle="Subjects that need attention"
                  />
                  <div className="h-80">
                    {weakSubjectData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={weakSubjectData}>
                          <PolarGrid stroke="rgba(148,163,184,.22)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                          <Radar dataKey="score" stroke="#fb7185" fill="#fb7185" fillOpacity={0.28} />
                          <Tooltip content={<ChartTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState text="No weak subjects yet. Keep taking quizzes for deeper insight." />
                    )}
                  </div>
                </section>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
                <section className={`${cardClass} p-4 sm:p-5`}>
                  <SectionTitle
                    icon={Award}
                    title="Subject Performance"
                    subtitle="Average score and accuracy by subject"
                  />
                  <div className="h-80">
                    {subjectData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.16)" />
                          <XAxis dataKey="subject" stroke="#94a3b8" />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend />
                          <Bar dataKey="averageScore" name="Avg Score" radius={[6, 6, 0, 0]}>
                            {subjectData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                          <Bar dataKey="accuracy" name="Accuracy" fill="#86efac" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState text="No subject analytics available yet." />
                    )}
                  </div>
                </section>

                <section className={`${cardClass} p-4 sm:p-5`}>
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                      icon={Medal}
                      title="Leaderboard"
                      subtitle="Global and subject-wise rankings"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadLeaderboard("all")}
                        className={filterClass(selectedSubject === "all")}
                      >
                        Global
                      </button>
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => loadLeaderboard(subject)}
                          className={filterClass(selectedSubject === subject)}
                        >
                          {pretty(subject)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                        <tr>
                          <th className="px-3 py-3">Rank</th>
                          <th className="px-3 py-3">Student</th>
                          <th className="px-3 py-3">Best</th>
                          <th className="px-3 py-3">Avg</th>
                          <th className="px-3 py-3">Accuracy</th>
                          <th className="px-3 py-3">Attempts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {rankingLoading ? (
                          <tr>
                            <td colSpan="6" className="px-3 py-8 text-center text-slate-400">
                              Loading ranking...
                            </td>
                          </tr>
                        ) : leaderboard.length ? (
                          leaderboard.map((student) => (
                            <tr key={student.userId} className="transition hover:bg-white/[0.04]">
                              <td className="px-3 py-4">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 font-black text-cyan-100">
                                  {student.rank}
                                </span>
                              </td>
                              <td className="px-3 py-4">
                                <p className="font-black text-white">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </td>
                              <td className="px-3 py-4 font-black text-amber-100">{student.highestScore}%</td>
                              <td className="px-3 py-4 text-slate-300">{student.averageScore}%</td>
                              <td className="px-3 py-4 text-emerald-100">{student.accuracy}%</td>
                              <td className="px-3 py-4 text-slate-300">{student.attempts}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-3 py-8 text-center text-slate-400">
                              No leaderboard data yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
                <section className={`${cardClass} p-4 sm:p-5`}>
                  <SectionTitle
                    icon={Users}
                    title="Platform Position"
                    subtitle="Your context against all students"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniMetric label="Total Students" value={stats.totalStudents || 0} />
                    <MiniMetric label="Your Rank" value={stats.currentRank ? `#${stats.currentRank}` : "--"} />
                    <MiniMetric label="Subjects Practiced" value={stats.subjectsPracticed || 0} />
                    <MiniMetric label="Questions Solved" value={stats.totalQuestions || 0} />
                  </div>
                  <div className="mt-5 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.42} />
                            <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="attempt" stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="score" stroke="#67e8f9" fill="url(#scoreGradient)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className={`${cardClass} p-4 sm:p-5`}>
                  <SectionTitle
                    icon={BookOpen}
                    title="Quiz History"
                    subtitle="Recent attempts and performance outcomes"
                  />
                  <div className="grid gap-3">
                    {history.slice(0, 8).map((item) => (
                      <article key={item.id} className={`${panelClass} p-4`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-black text-white">{item.title}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {pretty(item.technology)} - {pretty(item.level)} - {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[270px]">
                            <HistoryMetric label="Score" value={`${item.score}%`} />
                            <HistoryMetric label="Correct" value={item.correct} />
                            <HistoryMetric label="Accuracy" value={`${item.accuracy}%`} />
                          </div>
                        </div>
                      </article>
                    ))}
                    {!history.length && <EmptyState text="No quiz history yet. Take a quiz to populate this dashboard." />}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

const filterClass = (active) =>
  `rounded-lg border px-3 py-2 text-xs font-black transition ${
    active
      ? "border-cyan-300/30 bg-cyan-300 text-slate-950"
      : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
  }`;

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <article className={`${cardClass} p-5 transition duration-300 hover:-translate-y-1`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className={`mt-3 text-3xl font-black ${accent}`}>{value}</p>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-cyan-100">
        <Icon size={22} />
      </div>
    </div>
  </article>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100">
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-sm font-bold text-white">
          <span style={{ color: item.color }}>{item.name || item.dataKey}</span>:{" "}
          {item.value}
          {typeof item.value === "number" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

const MiniMetric = ({ label, value }) => (
  <div className={panelClass + " p-4"}>
    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
  </div>
);

const CoachMetric = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4 shadow-inner shadow-black/10">
    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
  </div>
);

const HistoryMetric = ({ label, value }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2">
    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 font-black text-white">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="grid h-full min-h-44 place-items-center rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-6 text-center shadow-inner shadow-black/10">
    <p className="max-w-sm text-sm font-semibold leading-6 text-slate-400">{text}</p>
  </div>
);

export default AnalyticsDashboard;
