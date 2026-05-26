import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Edit3,
  GraduationCap,
  Copy,
  Layers,
  Link2,
  PlusCircle,
  Save,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { getAuthHeader } from "../utils/auth";
import { API_BASE } from "../config";
import { DashboardSkeleton, EmptyState, ErrorState } from "../components/UiStates";

const emptyQuestion = {
  technology: "",
  level: "",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  isActive: true,
};

const emptyTechnology = {
  id: "",
  name: "",
  category: "General",
  levelsText: "Basic, Intermediate, Advanced",
  isActive: true,
};

const emptyShareForm = {
  technology: "",
  level: "",
  limit: 30,
};

const statCards = [
  { key: "students", label: "Students", icon: Users },
  { key: "questions", label: "Questions", icon: BookOpen },
  { key: "technologies", label: "Technologies", icon: Layers },
  { key: "averageScore", label: "Avg Score", icon: BarChart3, suffix: "%" },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("questions");
  const [stats, setStats] = useState({});
  const [technologies, setTechnologies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [technologyForm, setTechnologyForm] = useState(emptyTechnology);
  const [shareForm, setShareForm] = useState(emptyShareForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingTechnologyId, setEditingTechnologyId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const authHeader = useMemo(() => getAuthHeader(), []);

  const selectedTechnology = technologies.find(
    (item) => item.id === questionForm.technology
  );
  const levelOptions = selectedTechnology?.levels || [];
  const shareTechnology = technologies.find((item) => item.id === shareForm.technology);
  const shareLevels = shareTechnology?.levels || [];
  const shareLink =
    shareForm.technology && shareForm.level
      ? `${window.location.origin}/student?tech=${encodeURIComponent(
          shareForm.technology
        )}&level=${encodeURIComponent(shareForm.level)}&share=1&limit=${shareForm.limit}`
      : "";

  const filteredQuestions = questions.filter((item) =>
    filter === "all" ? true : item.technology === filter
  );

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Request failed");
    return data;
  }, [authHeader]);

  const applyDefaultQuestionSelection = (items) => {
    const firstTech = items.find((item) => item.isActive) || items[0];
    const firstLevel = firstTech?.levels?.[0];
    setQuestionForm((current) => ({
      ...current,
      technology: current.technology || firstTech?.id || "",
      level: current.level || firstLevel?.id || "",
    }));
    setShareForm((current) => ({
      ...current,
      technology: current.technology || firstTech?.id || "",
      level: current.level || firstLevel?.id || "",
    }));
  };

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [techData, questionData, statsData, studentsData, resultsData] =
        await Promise.all([
          request("/api/technologies/admin?includeInactive=true"),
          request("/api/questions/mine"),
          request("/api/admin/stats"),
          request("/api/admin/students"),
          request("/api/admin/results"),
        ]);

      const loadedTechnologies = techData.technologies || [];
      setTechnologies(loadedTechnologies);
      setQuestions(questionData.questions || []);
      setStats(statsData.stats || {});
      setStudents(studentsData.students || []);
      setResults(resultsData.results || []);
      applyDefaultQuestionSelection(loadedTechnologies);
    } catch (err) {
      const message = err.message || "Could not load admin data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const resetQuestionForm = () => {
    const firstTech = technologies[0];
    setQuestionForm({
      ...emptyQuestion,
      technology: firstTech?.id || "",
      level: firstTech?.levels?.[0]?.id || "",
    });
    setEditingQuestionId(null);
  };

  const resetTechnologyForm = () => {
    setTechnologyForm(emptyTechnology);
    setEditingTechnologyId(null);
  };

  const updateOption = (index, value) => {
    setQuestionForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option
      ),
    }));
  };

  const handleTechnologyChange = (technologyId) => {
    const technology = technologies.find((item) => item.id === technologyId);
    setQuestionForm((current) => ({
      ...current,
      technology: technologyId,
      level: technology?.levels?.[0]?.id || "",
    }));
  };

  const handleShareTechnologyChange = (technologyId) => {
    const technology = technologies.find((item) => item.id === technologyId);
    setShareForm((current) => ({
      ...current,
      technology: technologyId,
      level: technology?.levels?.[0]?.id || "",
    }));
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Student quiz link copied");
    } catch {
      toast.info(shareLink);
    }
  };

  const saveQuestion = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const url = editingQuestionId
        ? `/api/questions/${editingQuestionId}`
        : "/api/questions";
      const method = editingQuestionId ? "PUT" : "POST";
      const data = await request(url, {
        method,
        body: JSON.stringify(questionForm),
      });

      toast.success(data.message || "Question saved");
      resetQuestionForm();
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Question was not saved");
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (question) => {
    setEditingQuestionId(question._id);
    setQuestionForm({
      technology: question.technology,
      level: question.level,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      isActive: question.isActive,
    });
    setActiveTab("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question permanently?")) return;
    try {
      await request(`/api/questions/${id}`, { method: "DELETE" });
      toast.success("Question deleted");
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Question was not deleted");
    }
  };

  const saveTechnology = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const levels = technologyForm.levelsText
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const payload = {
        id: technologyForm.id,
        name: technologyForm.name,
        category: technologyForm.category,
        levels,
        isActive: technologyForm.isActive,
      };

      const url = editingTechnologyId
        ? `/api/technologies/${editingTechnologyId}`
        : "/api/technologies";
      const method = editingTechnologyId ? "PUT" : "POST";
      const data = await request(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(data.message || "Technology saved");
      resetTechnologyForm();
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Technology was not saved");
    } finally {
      setSaving(false);
    }
  };

  const editTechnology = (technology) => {
    setEditingTechnologyId(technology.id);
    setTechnologyForm({
      id: technology.id,
      name: technology.name,
      category: technology.category || "General",
      levelsText: technology.levels.map((level) => level.name).join(", "),
      isActive: technology.isActive,
    });
    setActiveTab("technologies");
  };

  const deleteTechnology = async (technology) => {
    if (
      !window.confirm(
        `Delete ${technology.name}? This also deletes its questions.`
      )
    ) {
      return;
    }

    try {
      const data = await request(`/api/technologies/${technology.id}`, {
        method: "DELETE",
      });
      toast.success(data.message || "Technology deleted");
      resetQuestionForm();
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Technology was not deleted");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <section className="border-b border-white/10 bg-slate-900/80 md:pl-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
            <h1 className="text-2xl font-bold text-white">
              Smart Quiz Admin
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Manage technologies, questions, students, scores, and platform data.
            </p>
          </div>
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-cyan-200">
              Admin account
            </p>
            <p className="text-sm font-bold text-white">admin@quiz.com</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:pl-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon, suffix = "" }) => (
            <div
              key={key}
              className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/10 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-300">{label}</p>
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">
                {stats[key] ?? 0}
                {suffix}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["questions", "Questions", BookOpen],
            ["technologies", "Technologies", Layers],
            ["students", "Students", Users],
            ["scores", "Scores", GraduationCap],
            ["analytics", "Analytics", BarChart3],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${
                activeTab === id
                  ? "bg-cyan-300 text-slate-950"
                  : "border border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6">
            <DashboardSkeleton rows={2} />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState
              title="Admin data could not be loaded"
              message={error}
              onRetry={loadAdminData}
            />
          </div>
        ) : (
          <>
            {activeTab === "questions" && (
              <section className="mt-6 grid gap-6">
                <div className="rounded-lg border border-cyan-300/20 bg-gradient-to-br from-cyan-300/12 via-white/[0.07] to-emerald-300/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                  <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950">
                          <Link2 size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white">Secure Student Practice Link</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-300">
                            Share a fixed-time link. Each student receives a different deterministic shuffle from up to 30 questions to reduce copying.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Technology
                          <select
                            value={shareForm.technology}
                            onChange={(event) => handleShareTechnologyChange(event.target.value)}
                            className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          >
                            <option value="">Select</option>
                            {technologies.filter((item) => item.isActive).map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Level
                          <select
                            value={shareForm.level}
                            onChange={(event) => setShareForm((current) => ({ ...current, level: event.target.value }))}
                            className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          >
                            <option value="">Select</option>
                            {shareLevels.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Questions
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={shareForm.limit}
                            onChange={(event) => setShareForm((current) => ({
                              ...current,
                              limit: Math.min(30, Math.max(1, Number(event.target.value) || 30)),
                            }))}
                            className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </label>
                      </div>
                      {shareLink && (
                        <p className="mt-4 break-all rounded-lg border border-white/10 bg-slate-950/50 p-3 text-xs font-semibold text-cyan-100">
                          {shareLink}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={copyShareLink}
                      disabled={!shareLink}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-60"
                    >
                      <Copy size={18} />
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <form
                  onSubmit={saveQuestion}
                  className="h-fit rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      {editingQuestionId ? "Edit Question" : "Add Question"}
                    </h2>
                    {editingQuestionId && (
                      <button
                        type="button"
                        onClick={resetQuestionForm}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-slate-200">
                      Technology
                      <select
                        value={questionForm.technology}
                        onChange={(event) =>
                          handleTechnologyChange(event.target.value)
                        }
                        className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                        required
                      >
                        <option value="">Select</option>
                        {technologies
                          .filter((item) => item.isActive)
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-200">
                      Level
                      <select
                        value={questionForm.level}
                        onChange={(event) =>
                          setQuestionForm((current) => ({
                            ...current,
                            level: event.target.value,
                          }))
                        }
                        className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                        required
                      >
                        <option value="">Select</option>
                        {levelOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-200">
                    Question
                    <textarea
                      value={questionForm.question}
                      onChange={(event) =>
                        setQuestionForm((current) => ({
                          ...current,
                          question: event.target.value,
                        }))
                      }
                      rows={4}
                      className="resize-none rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                      required
                    />
                  </label>

                  <div className="mt-4 grid gap-3">
                    <p className="text-sm font-semibold text-slate-200">
                      Options
                    </p>
                    {questionForm.options.map((option, index) => (
                      <label
                        key={index}
                        className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-white/10 bg-slate-950/70 p-3"
                      >
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswer === index}
                          onChange={() =>
                            setQuestionForm((current) => ({
                              ...current,
                              correctAnswer: index,
                            }))
                          }
                        />
                        <input
                          value={option}
                          onChange={(event) =>
                            updateOption(index, event.target.value)
                          }
                          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                      </label>
                    ))}
                  </div>

                  <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={questionForm.isActive}
                      onChange={(event) =>
                        setQuestionForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Visible on quiz page
                  </label>

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-70"
                  >
                    {editingQuestionId ? <Save size={18} /> : <PlusCircle size={18} />}
                    {saving ? "Saving..." : editingQuestionId ? "Update" : "Add"}
                  </button>
                </form>

                <div className="rounded-lg border border-white/10 bg-white/10 shadow-xl shadow-black/10 backdrop-blur">
                  <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold text-white">
                      All Questions
                    </h2>
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    >
                      <option value="all">All technologies</option>
                      {technologies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="divide-y divide-white/10">
                    {filteredQuestions.map((item) => (
                      <article key={item._id} className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                          <div>
                            <div className="mb-2 flex flex-wrap gap-2">
                              <span className="rounded-md bg-cyan-300/15 px-2 py-1 text-xs font-bold uppercase text-cyan-200">
                                {item.technology}
                              </span>
                              <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold uppercase text-slate-200">
                                {item.level}
                              </span>
                              <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-200">
                                {item.isActive ? "Visible" : "Hidden"}
                              </span>
                            </div>
                            <h3 className="font-bold text-white">{item.question}</h3>
                            <p className="mt-1 text-xs text-slate-400">
                              By {item.createdBy?.name || "Admin"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editQuestion(item)}
                              className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200"
                            >
                              <Edit3 size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteQuestion(item._id)}
                              className="inline-flex items-center gap-2 rounded-md border border-red-300/30 px-3 py-2 text-sm font-semibold text-red-200"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {!filteredQuestions.length && (
                      <div className="p-5">
                        <EmptyState
                          title="No questions found"
                          message="Add a question or change the technology filter to populate this list."
                        />
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </section>
            )}

            {activeTab === "technologies" && (
              <section className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
                <form
                  onSubmit={saveTechnology}
                  className="h-fit rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      {editingTechnologyId ? "Edit Technology" : "Add Technology"}
                    </h2>
                    {editingTechnologyId && (
                      <button
                        type="button"
                        onClick={resetTechnologyForm}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    )}
                  </div>
                  <label className="grid gap-2 text-sm font-semibold text-slate-200">
                    Technology Name
                    <input
                      value={technologyForm.name}
                      onChange={(event) =>
                        setTechnologyForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                      placeholder="Data Science"
                      required
                    />
                  </label>
                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-200">
                    Category
                    <select
                      value={technologyForm.category}
                      onChange={(event) =>
                        setTechnologyForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    >
                      {["Frontend", "Backend", "Programming", "Database", "General"].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-200">
                    Levels
                    <input
                      value={technologyForm.levelsText}
                      onChange={(event) =>
                        setTechnologyForm((current) => ({
                          ...current,
                          levelsText: event.target.value,
                        }))
                      }
                      className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                      placeholder="Basic, Intermediate, Advanced"
                      required
                    />
                  </label>
                  <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={technologyForm.isActive}
                      onChange={(event) =>
                        setTechnologyForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Show on quiz page
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-70"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Technology"}
                  </button>
                </form>

                <div className="rounded-lg border border-white/10 bg-white/10 shadow-xl shadow-black/10 backdrop-blur">
                  <h2 className="border-b border-white/10 p-5 text-lg font-bold text-white">
                    Technologies And Levels
                  </h2>
                  <div className="divide-y divide-white/10">
                    {technologies.map((item) => (
                      <article key={item.id} className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{item.name}</h3>
                            <p className="mt-1 text-xs text-slate-400">
                              ID: {item.id} | {item.category || "General"} | {item.isActive ? "Visible" : "Hidden"}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.levels.map((level) => (
                                <span
                                  key={level.id}
                                  className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200"
                                >
                                  {level.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editTechnology(item)}
                              className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200"
                            >
                              <Edit3 size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTechnology(item)}
                              className="inline-flex items-center gap-2 rounded-md border border-red-300/30 px-3 py-2 text-sm font-semibold text-red-200"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "students" && (
              <DataTable
                title="Students"
                empty="No students found."
                headers={["Name", "Email", "Joined"]}
                rows={students.map((student) => [
                  student.name,
                  student.email,
                  new Date(student.createdAt).toLocaleDateString(),
                ])}
              />
            )}

            {activeTab === "scores" && (
              <DataTable
                title="Scores"
                empty="No scores found."
                headers={["Student", "Quiz", "Level", "Score", "Date"]}
                rows={results.map((result) => [
                  result.user?.name || "Deleted user",
                  result.title,
                  result.level,
                  `${result.score}%`,
                  new Date(result.createdAt).toLocaleDateString(),
                ])}
              />
            )}

            {activeTab === "analytics" && (
              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur">
                  <h2 className="text-lg font-bold text-white">Top Performers</h2>
                  <div className="mt-4 grid gap-3">
                    {(stats.topPerformers || []).map((student, index) => (
                      <article
                        key={student.userId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-black text-white">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-amber-100">{student.highestScore}%</p>
                          <p className="text-xs text-slate-400">{student.attempts} attempts</p>
                        </div>
                      </article>
                    ))}
                    {!stats.topPerformers?.length && (
                      <p className="text-sm text-slate-400">No performer data yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur">
                  <h2 className="text-lg font-bold text-white">Subject Analytics</h2>
                  <div className="mt-4 grid gap-3">
                    {(stats.subjectStats || []).map((subject) => (
                      <article
                        key={subject.technology}
                        className="rounded-lg border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-black text-white">{subject.technology.toUpperCase()}</p>
                          <p className="text-sm font-black text-cyan-100">{subject.averageScore}% avg</p>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                            style={{ width: `${subject.accuracy}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          {subject.attempts} attempts - {subject.accuracy}% accuracy
                        </p>
                      </article>
                    ))}
                    {!stats.subjectStats?.length && (
                      <p className="text-sm text-slate-400">No subject analytics yet.</p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
};

const DataTable = ({ title, headers, rows, empty }) => (
  <section className="mt-6 rounded-lg border border-white/10 bg-white/10 shadow-xl shadow-black/10 backdrop-blur">
    <h2 className="border-b border-white/10 p-5 text-lg font-bold text-white">
      {title}
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-5 py-4 text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="p-5">
          <EmptyState title={empty} message="New platform activity will appear here automatically." />
        </div>
      )}
    </div>
  </section>
);

export default AdminPanel;
