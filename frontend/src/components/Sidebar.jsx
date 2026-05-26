import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { sidebarStyles } from '../assets/dummyStyles'
import questionsData from '../assets/dummydata'
import { toast } from 'react-toastify'
import axios from 'axios'
import { API_BASE } from '../config'
import { SkeletonBlock } from './UiStates'
import { getCurrentUser } from '../utils/auth'

//import toggleSidebar
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Globe,
  Layout,
  Code,
  Clock3,
  Cpu,
  Database,
  Coffee,
  Terminal,
  Star,
  Zap,
  Target,
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  RotateCcw,
  Search,
  Send,
  Shuffle,
  Volume2,
  CheckCircle,
  X,
  Circle
} from "lucide-react";

const QUIZ_TIME_BY_LEVEL = {
  basic: 5 * 60,
  intermediate: 8 * 60,
  advanced: 10 * 60,
};

const getQuizDuration = (level, totalQuestions) => {
  const baseSeconds = QUIZ_TIME_BY_LEVEL[level] || 6 * 60;
  const questionSeconds = Math.max(180, totalQuestions * 30);
  return Math.max(baseSeconds, questionSeconds);
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const shuffleQuestions = (items) =>
  [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed) => {
  let state = seed || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) / 4294967296);
  };
};

const seededShuffle = (items, seedText) => {
  const random = seededRandom(hashString(seedText));
  return [...items]
    .map((item) => ({ item, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const shuffleOptionsForStudent = (question, seedText) => {
  const pairs = question.options.map((option, index) => ({ option, index }));
  const shuffled = seededShuffle(pairs, `${seedText}-${question._id || question.id || question.question}`);
  return {
    ...question,
    options: shuffled.map((item) => item.option),
    correctAnswer: shuffled.findIndex((item) => item.index === question.correctAnswer),
  };
};

const categoryForTech = (id) => {
  if (["html", "css", "js", "react", "bootstrap"].includes(id)) return "Frontend";
  if (["node", "mongodb"].includes(id)) return "Backend";
  if (["java", "python", "cpp"].includes(id)) return "Programming";
  return "General";
};

const playTone = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = type === "error" ? 180 : type === "submit" ? 520 : 740;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
  } catch {
    // Sound is optional and can be blocked by browser settings.
  }
};

const Sidebar = () => {
  const [searchParams] = useSearchParams();
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [serverQuestions, setServerQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [technologies, setTechnologies] = useState([]);
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(true);
  const [technologyError, setTechnologyError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarkedQuestions") || "[]");
    } catch {
      return [];
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [topPerformers, setTopPerformers] = useState([]);

  const submittedRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const asideRef = useRef(null);
  const appliedAdaptiveRef = useRef(false);

  useEffect(() => {
    // Keep the desktop rail open while preserving a drawer interaction on small screens.
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      if (isSidebarOpen) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const techVisuals = useMemo(() => ({
    html: { icon: <Globe size={20} />, color: "bg-orange-400/15 text-orange-100 border-orange-300/25" },
    css: { icon: <Layout size={20} />, color: "bg-sky-400/15 text-sky-100 border-sky-300/25" },
    js: { icon: <Code size={20} />, color: "bg-amber-300/15 text-amber-100 border-amber-300/25" },
    react: { icon: <Cpu size={20} />, color: "bg-cyan-300/15 text-cyan-100 border-cyan-300/25" },
    node: { icon: <Code size={20} />, color: "bg-lime-300/15 text-lime-100 border-lime-300/25" },
    mongodb: { icon: <Database size={20} />, color: "bg-emerald-300/15 text-emerald-100 border-emerald-300/25" },
    java: { icon: <Coffee size={20} />, color: "bg-rose-400/15 text-rose-100 border-rose-300/25" },
    python: { icon: <Terminal size={20} />, color: "bg-indigo-300/15 text-indigo-100 border-indigo-300/25" },
    cpp: { icon: <Code size={20} />, color: "bg-fuchsia-300/15 text-fuchsia-100 border-fuchsia-300/25" },
    bootstrap: { icon: <Layout size={20} />, color: "bg-violet-300/15 text-violet-100 border-violet-300/25" },
  }), []);

  const levelVisuals = useMemo(() => ({
    basic: { icon: <Star size={16} />, color: "bg-emerald-300/15 text-emerald-100 border-emerald-300/25" },
    intermediate: { icon: <Zap size={16} />, color: "bg-cyan-300/15 text-cyan-100 border-cyan-300/25" },
    advanced: { icon: <Target size={16} />, color: "bg-amber-300/15 text-amber-100 border-amber-300/25" },
  }), []);

  const selectedTechData = technologies.find((t) => t.id === selectedTech);
  const selectedLevels = selectedTechData?.levels || [];
  const isSharedQuiz = searchParams.get("share") === "1";
  const sharedLimit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 30));
  const studentSeed = getCurrentUser()?.email || localStorage.getItem("authToken") || "guest";
  const sharedSessionKey = `sharedQuiz:${studentSeed}:${selectedTech}:${selectedLevel}:${sharedLimit}`;
  const categories = ["All", ...Array.from(new Set(technologies.map((tech) => tech.category)))];
  const visibleTechnologies = technologies.filter((tech) => {
    const matchesSearch = `${tech.name} ${tech.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || tech.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetQuizSession = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizQuestions([]);
    setTimeLeft(0);
    setIsSubmittingResult(false);
    setReviewMode(false);
    submittedRef.current = false;
    autoSubmittedRef.current = false;
  };

  const notifyStudent = (message, type = "info") => {
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("quizNotifications") || "[]");
      const next = [item, ...existing].slice(0, 8);
      localStorage.setItem("quizNotifications", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("quizNotification", { detail: item }));
    } catch {
      // Notifications are enhancement-only.
    }
  };

  const toggleBookmark = (question) => {
    if (!question) return;
    const key = question._id || `${selectedTech}-${selectedLevel}-${question.question}`;
    const exists = bookmarks.some((item) => item.key === key);
    const next = exists
      ? bookmarks.filter((item) => item.key !== key)
      : [
          {
            key,
            technology: selectedTech,
            level: selectedLevel,
            question: question.question,
            answer: question.options?.[question.correctAnswer] || "",
            createdAt: new Date().toISOString(),
          },
          ...bookmarks,
        ];
    setBookmarks(next);
    localStorage.setItem("bookmarkedQuestions", JSON.stringify(next));
    toast.success(exists ? "Bookmark removed" : "Question bookmarked");
    notifyStudent(exists ? "Bookmark removed" : "Question saved to bookmarks", "bookmark");
  };

  useEffect(() => {
    const loadTechnologies = async () => {
      setIsLoadingTechnologies(true);
      setTechnologyError("");
      try {
        const response = await axios.get(`${API_BASE}/api/technologies`);
        if (response.data?.success) {
          const items = (response.data.technologies || []).map((item) => {
            const visual = techVisuals[item.id] || {
              icon: <BookOpen size={20} />,
              color: "bg-slate-300/15 text-slate-100 border-slate-300/25",
            };

            return {
              ...item,
              ...visual,
              category: item.category || categoryForTech(item.id),
              levels: (item.levels || []).map((level) => ({
                ...level,
                ...(levelVisuals[level.id] || {
                  icon: <Target size={16} />,
                  color: "bg-slate-300/15 text-slate-100 border-slate-300/25",
                }),
                questions: questionsData[item.id]?.[level.id]?.length || "Live",
              })),
            };
          });
          setTechnologies(items);
        }
      } catch {
        setTechnologyError("Could not load technologies. Check the API server and try again.");
      }
      finally {
        setIsLoadingTechnologies(false);
      }
    };

    loadTechnologies();
  }, [levelVisuals, techVisuals]);

  useEffect(() => {
    const loadTopPerformers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/results/top-performers`);
        if (response.data?.success) {
          setTopPerformers(response.data.topPerformers || []);
        }
      } catch (err) {
        console.error("Error loading top performers:", err);
      }
    };

    loadTopPerformers();
  }, []);

  useEffect(() => {
    if (appliedAdaptiveRef.current || isLoadingTechnologies || !technologies.length) return;

    const tech = searchParams.get("tech");
    const level = searchParams.get("level");
    if (!tech || !level) return;

    const matchedTech = technologies.find((item) => item.id === tech);
    const matchedLevel = matchedTech?.levels?.find((item) => item.id === level);
    if (!matchedTech || !matchedLevel) return;

    appliedAdaptiveRef.current = true;
    setSelectedTech(tech);
    setSelectedLevel(level);
    resetQuizSession();
    setServerQuestions([]);
    setIsLoadingQuestions(true);
    toast.info(`Adaptive practice: ${matchedTech.name} - ${matchedLevel.name}`);
    notifyStudent(`Smart Coach started ${matchedTech.name} adaptive practice`, "coach");
  }, [isLoadingTechnologies, searchParams, technologies]);

  const handleTechSelect = (techId) => {
    if (selectedTech === techId) {
      setSelectedTech(null);
      setSelectedLevel(null);
    } else {
      setSelectedTech(techId);
      setSelectedLevel(null);
    }
    resetQuizSession();
    setServerQuestions([]);
    setIsLoadingQuestions(false);

    if (window.innerWidth < 768) setIsSidebarOpen(true);

    setTimeout(() => {
      const el = asideRef.current?.querySelector(`[data-tech="${techId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
    resetQuizSession();
    setServerQuestions([]);
    setIsLoadingQuestions(true);

    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResults || reviewMode) return;
    const isCorrect = currentQ?.correctAnswer === answerIndex;
    if (soundEnabled) playTone(isCorrect ? "success" : "error");
    setUserAnswers((current) => ({
      ...current,
      [currentQuestion]: answerIndex,
    }));
  };

  const getQuestions = () => {
    if (!selectedTech || !selectedLevel) return [];
    return quizQuestions;
  }

  useEffect(() => {
    if (!selectedTech || !selectedLevel) {
      setServerQuestions([]);
      return;
    }

    const controller = new AbortController();

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const params = new URLSearchParams({
          technology: selectedTech,
          level: selectedLevel,
        });
        const response = await axios.get(`${API_BASE}/api/questions?${params}`, {
          signal: controller.signal,
        });

        if (response.data?.success) {
          setServerQuestions(response.data.questions || []);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Error loading teacher questions:", err);
          setServerQuestions([]);
        }
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();

    return () => controller.abort();
  }, [selectedTech, selectedLevel]);

  useEffect(() => {
    if (!selectedTech || !selectedLevel || isLoadingQuestions) return;

    const fallbackQuestions = questionsData[selectedTech]?.[selectedLevel] || [];
    const sourceQuestions = serverQuestions.length ? serverQuestions : fallbackQuestions;
    const seedText = `${studentSeed}:${selectedTech}:${selectedLevel}`;
    const nextQuestions = isSharedQuiz
      ? seededShuffle(sourceQuestions, seedText)
          .slice(0, sharedLimit)
          .map((question) => shuffleOptionsForStudent(question, seedText))
      : shuffleQuestions(sourceQuestions);
    const duration = getQuizDuration(selectedLevel, nextQuestions.length);
    let nextTimeLeft = duration;

    if (isSharedQuiz) {
      const storedDeadline = sessionStorage.getItem(sharedSessionKey);
      const deadline = storedDeadline
        ? Number(storedDeadline)
        : Date.now() + duration * 1000;
      sessionStorage.setItem(sharedSessionKey, String(deadline));
      nextTimeLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    }

    setQuizQuestions(nextQuestions);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setReviewMode(false);
    setTimeLeft(nextTimeLeft);
    submittedRef.current = false;
    autoSubmittedRef.current = false;
  }, [isLoadingQuestions, isSharedQuiz, selectedLevel, selectedTech, serverQuestions, sharedLimit, sharedSessionKey, studentSeed]);

  const calculateScore = () => {
    const questions = getQuestions();
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === undefined) return;
      answered++;
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });
    return {
      correct,
      wrong,
      answered,
      unanswered: Math.max(0, questions.length - answered),
      total: questions.length,
      percentage: questions.length
        ? Math.round((correct / questions.length) * 100)
        : 0,
    };
  };

  const resetQuiz = () => {
    const shuffled = shuffleQuestions(getQuestions());
    const duration = getQuizDuration(selectedLevel, shuffled.length);
    if (isSharedQuiz) {
      sessionStorage.setItem(sharedSessionKey, String(Date.now() + duration * 1000));
    }
    setQuizQuestions(shuffled);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setTimeLeft(duration);
    submittedRef.current = false;
    autoSubmittedRef.current = false;
  }


  const questions = getQuestions();
  const currentQ = questions[currentQuestion];
  const score = calculateScore();
  const answeredCount = Object.keys(userAnswers).length;
  const quizProgress = questions.length
    ? Math.round(((currentQuestion + 1) / questions.length) * 100)
    : 0;
  const answeredProgress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;
  const totalDuration = getQuizDuration(selectedLevel, questions.length);
  const elapsedSeconds = showResults
    ? Math.max(0, totalDuration - timeLeft)
    : Math.max(0, totalDuration - timeLeft);
  const timerProgress = totalDuration
    ? Math.round((timeLeft / totalDuration) * 100)
    : 0;
  const isLastQuestion = currentQuestion >= questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const getPerformanceStatus = () => {
    if (score.percentage >= 90)
      return {
        text: "Outstanding!",
        color: "bg-gradient-to-r from-amber-200 to-amber-300",
        icon: <Sparkles className="text-amber-800" />,
      };
    if (score.percentage >= 75)
      return {
        text: "Excellent!",
        color: "bg-gradient-to-r from-blue-200 to-indigo-200",
        icon: <Trophy className="text-blue-800" />,
      };
    if (score.percentage >= 60)
      return {
        text: "Good Job!",
        color: "bg-gradient-to-r from-green-200 to-teal-200",
        icon: <Award className="text-green-800" />,
      };
    return {
      text: "Keep Practicing",
      color: "bg-gradient-to-r from-gray-200 to-gray-300",
      icon: <BookOpen className="text-gray-800" />,
    };
  };

  const performance = getPerformanceStatus();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const goToNextQuestion = () => {
    setCurrentQuestion((current) =>
      Math.min(current + 1, Math.max(questions.length - 1, 0))
    );
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestion((current) => Math.max(current - 1, 0));
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token') ||
      localStorage.getItem('authToken') || null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const submitResult = useCallback(async () => {
    if (submittedRef.current) return;
    if (!selectedTech || !selectedLevel) return;

    const payload = {
      title: `${selectedTech.toUpperCase()} - ${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)
        } quiz`,
      technology: selectedTech,
      level: selectedLevel,
      totalQuestions: score.total,
      correct: score.correct,
      wrong: score.wrong + score.unanswered,
    };

    try {
      submittedRef.current = true;
      setIsSubmittingResult(true);
      toast.info('Saving your result...');
      const res = await axios.post(`${API_BASE}/api/results`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        timeout: 10000,
      });

      if (res.data && res.data.success) {
        toast.success('result saved!');
      }
      else {
        toast.warn('result not saved.')
        submittedRef.current = false;
      }
    }
    catch (err) {
      submittedRef.current = false;
      console.error(
        "Error saving result:",
        err?.response?.data || err.message || err
      );
      toast.error("Could not save result. Check console or network.");
    } finally {
      setIsSubmittingResult(false);
    }
  }, [getAuthHeader, score.correct, score.total, score.unanswered, score.wrong, selectedLevel, selectedTech]);

  const finalizeQuiz = useCallback(async ({ automatic = false } = {}) => {
    if (showResults || reviewMode || submittedRef.current || !questions.length) return;
    if (automatic && autoSubmittedRef.current) return;

    autoSubmittedRef.current = automatic;
    setShowResults(true);
    if (soundEnabled) playTone("submit");
    notifyStudent(
      automatic ? "Daily quiz auto-submitted when timer ended" : "Quiz submitted successfully",
      "quiz"
    );
    await submitResult();
  }, [questions.length, reviewMode, showResults, soundEnabled, submitResult]);

  useEffect(() => {
    if (!selectedLevel || showResults || reviewMode || isLoadingQuestions || !questions.length) return;

    if (timeLeft <= 0) {
      finalizeQuiz({ automatic: true });
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [finalizeQuiz, isLoadingQuestions, questions.length, reviewMode, selectedLevel, showResults, timeLeft]);

  const startDailyChallenge = () => {
    const available = technologies.filter((tech) => tech.levels?.length);
    if (!available.length) return;
    const daySeed = new Date().getDate();
    const tech = available[daySeed % available.length];
    const level = tech.levels[daySeed % tech.levels.length];
    setSelectedTech(tech.id);
    handleLevelSelect(level.id);
    toast.info(`Daily challenge: ${tech.name} - ${level.name}`);
    notifyStudent(`Daily challenge started: ${tech.name}`, "daily");
  };

  return (
    <div className={sidebarStyles.pageContainer}>
      {isSidebarOpen && (
        <div
          onClick={() =>
            window.innerWidth < 768 && setIsSidebarOpen(false)
          }
          className={sidebarStyles.mobileOverlay}
        ></div>
      )}

      <div className={sidebarStyles.mainContainer}>
        <aside
          ref={asideRef}
          className={`${sidebarStyles.sidebar} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className={sidebarStyles.sidebarHeader}>
            <div className={sidebarStyles.headerDecoration1}></div>
            <div className={sidebarStyles.headerDecoration2}></div>

            <div className={sidebarStyles.headerContent}>
              <div className={sidebarStyles.logoContainer}>
                <div className={sidebarStyles.logoIcon}>
                  <BookOpen
                    size={28}
                    className="text-indigo-700"
                  />
                </div>
                <div>
                  <h1 className={sidebarStyles.logoTitle}>Tech Quiz Master</h1>
                  <p className={sidebarStyles.logoSubtitle}>
                    Test your knowledge & improve skills
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className={sidebarStyles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className={sidebarStyles.sidebarContent}>
            <div className={sidebarStyles.technologiesHeader}>
              <h2 className={sidebarStyles.technologiesTitle}>Technologies</h2>
              <span className={sidebarStyles.technologiesCount}>
                {visibleTechnologies.length} options
              </span>
            </div>

            <div className="mb-4 grid gap-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] py-2.5 pl-9 pr-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                  placeholder="Search categories..."
                />
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={`flex-none rounded-lg border px-3 py-2 text-xs font-black transition ${
                      categoryFilter === category
                        ? "border-cyan-300/30 bg-cyan-300 text-slate-950"
                        : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={startDailyChallenge}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-200 to-cyan-300 px-3 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5"
              >
                <Shuffle size={16} />
                Daily Challenge
              </button>
            </div>

            {isLoadingTechnologies && (
              <div className="grid gap-3" role="status" aria-live="polite">
                <span className="sr-only">Loading technologies</span>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                    <div className="flex items-center gap-3">
                      <SkeletonBlock className="h-10 w-10" />
                      <SkeletonBlock className="h-4 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingTechnologies && technologyError && (
              <div className="rounded-lg border border-rose-300/25 bg-rose-400/10 p-4 text-sm font-semibold text-rose-100">
                <p>{technologyError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                >
                  Reload
                </button>
              </div>
            )}

            {!isLoadingTechnologies && !technologyError && visibleTechnologies.map((tech) => (
              <div
                key={tech.id}
                className={sidebarStyles.techItem}
                data-tech={tech.id}
              >
                <button
                  onClick={() => handleTechSelect(tech.id)}
                  className={`${sidebarStyles.techButton} ${selectedTech === tech.id
                      ? `${tech.color} ${sidebarStyles.techButtonSelected}`
                      : sidebarStyles.techButtonNormal
                    }`}
                >
                  <div className={sidebarStyles.techButtonContent}>
                    <span className={`${sidebarStyles.techIcon} ${tech.color}`}>
                      {tech.icon}
                    </span>
                    <span className={sidebarStyles.techName}>{tech.name}</span>
                  </div>

                  {selectedTech === tech.id ? (
                    <ChevronDown size={18} className=" text-current" />
                  ) : (
                    <ChevronRight size={18} className=" text-gray-400" />
                  )}
                </button>

                {selectedTech === tech.id && (
                  <div className={sidebarStyles.levelsContainer}>
                    <h3 className={sidebarStyles.levelsTitle}>
                      <span>Select Difficulty</span>
                      <span className={sidebarStyles.techBadge}>
                        {selectedTechData?.name}
                      </span>
                    </h3>

                    {selectedLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`${sidebarStyles.levelButton} ${selectedLevel === level.id
                            ? `${level.color} ${sidebarStyles.levelButtonSelected}`
                            : sidebarStyles.levelButtonNormal
                          }`}
                      >
                        <div className={sidebarStyles.levelButtonContent}>
                          <span className={`${sidebarStyles.levelIcon} ${selectedLevel === level.id ? 'bg-white/20' : 'bg-white/10'
                            }`}>
                            {level.icon}
                          </span>
                          <span>{level.name}</span>
                        </div>
                        <span className={sidebarStyles.levelQuestions}>
                          {level.questions} Qs
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!isLoadingTechnologies && !technologyError && !visibleTechnologies.length && (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm font-semibold text-slate-400">
                No technologies match your filters.
              </div>
            )}
          </div>

          <div className={sidebarStyles.sidebarFooter}>
            <div className={sidebarStyles.footerContent}>
              <div className={sidebarStyles.footerContentCenter}>
                <p>Master your skills one quiz at a time</p>
                <p className={sidebarStyles.footerHighlight}>
                  Keep Learning, Keep Growing!
                </p>
              </div>
            </div>
          </div>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={sidebarStyles.mainContent}
        >
          <div className={sidebarStyles.mobileHeader}>
            <button
              onClick={toggleSidebar}
              className={sidebarStyles.menuButton}
            >
              <Menu size={20} />
            </button>

            <div className={sidebarStyles.mobileTitle}>
              {selectedTech ? (
                <div className={sidebarStyles.mobileTechInfo}>
                  <div
                    className={`${sidebarStyles.mobileTechIcon} ${selectedTechData?.color || ""
                      }`}
                  >
                    {selectedTechData?.icon}
                  </div>
                  <div className={sidebarStyles.mobileTechText}>
                    <div className={sidebarStyles.mobileTechName}>
                      {selectedTechData?.name}
                    </div>
                    <div className={sidebarStyles.mobileTechLevel}>
                      {selectedLevel
                        ? `${selectedLevel.charAt(0).toUpperCase() +
                        selectedLevel.slice(1)
                        } level`
                        : "Select level"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={sidebarStyles.mobilePlaceholder}>
                  Select a technology from the menu
                </div>
              )}
            </div>
          </div>

          {selectedTech && !selectedLevel && (
            <div className={sidebarStyles.mobileLevels}>
              <div className={sidebarStyles.mobileLevelsContainer}>
                {selectedLevels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLevelSelect(l.id)}
                    className={sidebarStyles.mobileLevelButton}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedTech ? (
            <div className={sidebarStyles.welcomeContainer}>
              <div className={sidebarStyles.welcomeContent}>
                <div className={sidebarStyles.welcomeIcon}>
                  <Award size={64} className="text-indigo-700" />
                </div>
                <h2 className={sidebarStyles.welcomeTitle}>
                  Welcome to Tech Quiz Master
                </h2>
                <p className={sidebarStyles.welcomeDescription}>
                  Select a technology from the sidebar to start your quiz
                  journey. Test your knowledge at basic, intermediate, or
                  advanced levels.
                </p>

                <div className={sidebarStyles.featuresGrid}>
                  <div className={sidebarStyles.featureCard}>
                    <div className={sidebarStyles.featureIcon}>
                      <Star size={20} />
                    </div>
                    <h3 className={sidebarStyles.featureTitle}>
                      Multiple Technologies
                    </h3>
                    <p className={sidebarStyles.featureDescription}>
                      HTML, CSS, JavaScript, React, and more
                    </p>
                  </div>

                  <div className={sidebarStyles.featureCard}>
                    <div className={sidebarStyles.featureIcon}>
                      <Zap size={20} />
                    </div>
                    <h3 className={sidebarStyles.featureTitle}>
                      Three Difficulty Levels
                    </h3>
                    <p className={sidebarStyles.featureDescription}>
                      Basic, Intermediate, and Advanced challenges
                    </p>
                  </div>

                  <div className={sidebarStyles.featureCard}>
                    <div className={sidebarStyles.featureIcon}>
                      <Target size={20} />
                    </div>
                    <h3 className={sidebarStyles.featureTitle}>
                      Instant Feedback
                    </h3>
                    <p className={sidebarStyles.featureDescription}>
                      Get detailed results and performance analysis
                    </p>
                  </div>
                </div>

                <div className={sidebarStyles.welcomePrompt}>
                  <p className={sidebarStyles.welcomePromptText}>
                    <Sparkles size={16} className="mr-2" />
                    Select any technology to begin your learning adventure!
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={startDailyChallenge}
                    className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/15"
                  >
                    Daily Challenge
                  </button>
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-300">
                    {bookmarks.length} Bookmarks
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((value) => !value)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
                  >
                    <Volume2 size={16} />
                    Sound {soundEnabled ? "On" : "Off"}
                  </button>
                </div>

                <section className="mt-4 rounded-lg border border-white/10 bg-slate-950/35 p-4 text-left">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                        Top Performers
                      </p>
                      <h3 className="text-lg font-black text-white">
                        Campus leaderboard preview
                      </h3>
                    </div>
                    <Trophy size={20} className="text-amber-200" />
                  </div>
                  <div className="grid gap-2">
                    {topPerformers.map((student) => (
                      <article
                        key={student.userId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-cyan-300 text-xs font-black text-slate-950">
                            {student.rank}
                          </span>
                          <p className="truncate text-sm font-black text-white">
                            {student.name}
                          </p>
                        </div>
                        <p className="text-sm font-black text-amber-100">
                          {student.highestScore}%
                        </p>
                      </article>
                    ))}
                    {!topPerformers.length && (
                      <p className="rounded-lg border border-white/10 bg-white/[0.05] p-3 text-sm font-semibold text-slate-400">
                        Complete a quiz to appear on the leaderboard.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : !selectedLevel ? (
            <div className={sidebarStyles.levelSelectionContainer}>
              <div className={sidebarStyles.levelSelectionContent}>
                <div
                  className={`${sidebarStyles.techSelectionIcon} ${selectedTechData?.color
                    }`}
                >
                  {selectedTechData?.icon}
                </div>
                <h2 className={sidebarStyles.techSelectionTitle}>
                  {selectedTechData?.name} Quiz
                </h2>
                <p className={sidebarStyles.techSelectionDescription}>
                  Select a difficulty level to begin your challenge
                </p>

                <div className={sidebarStyles.techSelectionPrompt}>
                  <p className={sidebarStyles.techSelectionPromptText}>
                    Get ready to test your{" "}
                    {selectedTechData?.name}{" "}
                    knowledge!
                  </p>
                </div>
              </div>
            </div>
          ) : showResults ? (
            <div className={sidebarStyles.resultsContainer}>
              <div className="w-full max-w-6xl animate-[fadeIn_.35s_ease-out]">
                <div className={sidebarStyles.resultsContent}>
                  <div className={sidebarStyles.resultsHeader}>
                    <div
                      className={`${sidebarStyles.performanceIcon} ${performance.color}`}
                    >
                      {performance.icon}
                    </div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                      Quiz submitted
                    </p>
                    <h2 className={sidebarStyles.resultsTitle}>
                      {score.correct}/{score.total} correct
                    </h2>
                    <p className={sidebarStyles.resultsSubtitle}>
                      {selectedTechData?.name} - {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level
                    </p>
                    <div
                      className={`${sidebarStyles.performanceBadge} ${performance.color}`}
                    >
                      {performance.text}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <div className={sidebarStyles.scoreCard}>
                        <div className={sidebarStyles.scoreIcon}>
                          <CheckCircle size={22} />
                        </div>
                        <p className={sidebarStyles.scoreNumber}>{score.correct}</p>
                        <p className={sidebarStyles.scoreLabel}>Correct</p>
                      </div>
                      <div className={sidebarStyles.scoreCard}>
                        <div className={sidebarStyles.scoreIcon}>
                          <Circle size={22} />
                        </div>
                        <p className={sidebarStyles.scoreNumber}>{score.wrong}</p>
                        <p className={sidebarStyles.scoreLabel}>Wrong</p>
                      </div>
                      <div className={sidebarStyles.scoreCard}>
                        <div className={sidebarStyles.scoreIcon}>
                          <BookOpen size={22} />
                        </div>
                        <p className={sidebarStyles.scoreNumber}>{score.unanswered}</p>
                        <p className={sidebarStyles.scoreLabel}>Skipped</p>
                      </div>
                      <div className={sidebarStyles.scoreCard}>
                        <div className={sidebarStyles.scoreIcon}>
                          <BarChart3 size={22} />
                        </div>
                        <p className={sidebarStyles.scoreNumber}>{score.percentage}%</p>
                        <p className={sidebarStyles.scoreLabel}>Accuracy</p>
                      </div>
                      <div className={sidebarStyles.scoreCard}>
                        <div className={sidebarStyles.scoreIcon}>
                          <Clock3 size={22} />
                        </div>
                        <p className={sidebarStyles.scoreNumber}>{formatTime(elapsedSeconds)}</p>
                        <p className={sidebarStyles.scoreLabel}>Time Used</p>
                      </div>
                    </div>

                    <div className={`${sidebarStyles.scoreProgress} mt-6 text-left`}>
                      <div className={sidebarStyles.scoreProgressHeader}>
                        <span className={sidebarStyles.scoreProgressTitle}>
                          Performance Summary
                        </span>
                        <span className={sidebarStyles.scoreProgressPercentage}>
                          {score.percentage}%
                        </span>
                      </div>
                      <div className={sidebarStyles.scoreProgressBar}>
                        <div
                          className={`${sidebarStyles.scoreProgressFill} ${
                            score.percentage >= 80
                              ? "bg-emerald-400"
                              : score.percentage >= 60
                                ? "bg-amber-300"
                                : "bg-rose-400"
                          }`}
                          style={{ width: `${score.percentage}%` }}
                        />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        {score.percentage >= 80
                          ? "Strong command of this topic. Keep the streak alive with a harder set."
                          : score.percentage >= 60
                            ? "Good progress. Review the missed answers and try again for a cleaner run."
                            : "This topic needs more practice. The review below shows exactly where to focus."}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={resetQuiz}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                      >
                        <RotateCcw size={18} />
                        Retake Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewMode(true);
                          setShowResults(false);
                          setCurrentQuestion(0);
                          notifyStudent("Quiz review mode opened", "review");
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-300/15"
                      >
                        <BookOpen size={18} />
                        Review Mode
                      </button>
                    </div>
                  </div>
                </div>

                <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-5">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Answer Review
                      </p>
                      <h3 className="text-xl font-black text-white">
                        Correct and wrong answers
                      </h3>
                    </div>
                    <span className="text-sm font-bold text-slate-400">
                      {score.answered}/{score.total} answered
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {questions.map((question, index) => {
                      const selectedAnswer = userAnswers[index];
                      const isCorrect = selectedAnswer === question.correctAnswer;
                      const wasSkipped = selectedAnswer === undefined;

                      return (
                        <article
                          key={question._id || question.id || `${question.question}-${index}`}
                          className="rounded-lg border border-white/10 bg-slate-950/35 p-4 text-left"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <span
                                className={`mb-2 inline-flex rounded-md px-2.5 py-1 text-xs font-black ${
                                  wasSkipped
                                    ? "bg-slate-300/10 text-slate-300"
                                    : isCorrect
                                      ? "bg-emerald-300/15 text-emerald-100"
                                      : "bg-rose-400/15 text-rose-100"
                                }`}
                              >
                                {wasSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
                              </span>
                              <h4 className="text-sm font-black leading-6 text-white">
                                {index + 1}. {question.question}
                              </h4>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            <p className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
                              Your answer:{" "}
                              <span className="font-bold text-white">
                                {wasSkipped ? "Not answered" : question.options[selectedAnswer]}
                              </span>
                            </p>
                            <p className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                              Correct answer:{" "}
                              <span className="font-bold">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          ) : isLoadingQuestions ? (
            <div className={sidebarStyles.loadingContainer}>
              <div className={sidebarStyles.loadingContent}>
                <div className={sidebarStyles.loadingSpinner} />
                <h3 className={sidebarStyles.loadingTitle}>
                  Preparing Your Quiz
                </h3>
                <p className={sidebarStyles.loadingDescription}>
                  Loading teacher questions...
                </p>
              </div>
            </div>
          ) : currentQ ? (
            <div className={sidebarStyles.quizContainer}>
              <div className={sidebarStyles.quizHeader}>
                <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                      {reviewMode ? "Review mode" : `${selectedTechData?.category || "Quiz"} category`}
                    </p>
                    <h1 className={sidebarStyles.quizTitle}>
                      {selectedTechData?.name} - {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Level
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:w-[650px]">
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Timer
                      </p>
                      <p className={`mt-1 text-lg font-black ${timeLeft <= 30 ? "text-rose-300" : "text-cyan-100"}`}>
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Question
                      </p>
                      <p className="mt-1 text-lg font-black text-white">
                        {currentQuestion + 1}/{questions.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Answered
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-100">
                        {answeredCount}/{questions.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Score
                      </p>
                      <p className="mt-1 text-lg font-black text-amber-100">
                        {score.correct}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(currentQ)}
                      className="rounded-lg border border-white/10 bg-white/[0.06] p-3 text-left transition hover:bg-white/10"
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Bookmark
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-black text-cyan-100">
                        {bookmarks.some((item) => item.key === (currentQ?._id || `${selectedTech}-${selectedLevel}-${currentQ?.question}`)) ? (
                          <BookmarkCheck size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                        Save
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Question progress</span>
                      <span>{quizProgress}%</span>
                    </div>
                    <div className={sidebarStyles.progressBar}>
                      <div
                        className={sidebarStyles.progressFill}
                        style={{ width: `${quizProgress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Answered</span>
                      <span>{answeredProgress}%</span>
                    </div>
                    <div className={sidebarStyles.progressBar}>
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-300 to-lime-300 transition-all duration-700"
                        style={{ width: `${answeredProgress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Time remaining</span>
                      <span>{timerProgress}%</span>
                    </div>
                    <div className={sidebarStyles.progressBar}>
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${
                          timeLeft <= 30
                            ? "bg-rose-400"
                            : "bg-gradient-to-r from-sky-300 to-cyan-300"
                        }`}
                        style={{ width: `${timerProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={sidebarStyles.questionContainer}>
                <div className={sidebarStyles.questionHeader}>
                  <div className={sidebarStyles.questionIcon}>
                    <Target size={20} />
                  </div>
                  <h2 className={sidebarStyles.questionText}>
                    {currentQ.question}
                  </h2>
                </div>

                <div className={sidebarStyles.optionsContainer}>
                  {currentQ.options.map((option, index) => {
                    const isSelected = userAnswers[currentQuestion] === index;
                    const isCorrect = index === currentQ.correctAnswer;
                    const showFeedback =
                      reviewMode || userAnswers[currentQuestion] !== undefined;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={reviewMode || userAnswers[currentQuestion] !== undefined}
                        className={`${sidebarStyles.optionButton} ${isSelected
                            ? isCorrect
                              ? sidebarStyles.optionCorrect
                              : sidebarStyles.optionIncorrect
                            : showFeedback && isCorrect
                              ? sidebarStyles.optionCorrect
                              : sidebarStyles.optionNormal
                          }`}
                      >
                        <div className={sidebarStyles.optionContent}>
                          {showFeedback ? (
                            reviewMode && isCorrect ? (
                              <CheckCircle
                                size={20}
                                className={sidebarStyles.optionIconCorrect}
                              />
                            ) : isSelected ? (
                              isCorrect ? (
                                <CheckCircle
                                  size={20}
                                  className={sidebarStyles.optionIconCorrect}
                                />
                              ) : (
                                <Circle
                                  size={20}
                                  className={sidebarStyles.optionIconIncorrect}
                                />
                              )
                            ) : isCorrect ? (
                              <CheckCircle
                                size={20}
                                className={sidebarStyles.optionIconCorrect}
                              />
                            ) : (
                              <div className={sidebarStyles.optionIconEmpty} />
                            )
                          ) : (
                            <div className={sidebarStyles.optionIconEmpty} />
                          )}
                          <span className={sidebarStyles.optionText}>
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {questions.map((question, index) => {
                      const answered = userAnswers[index] !== undefined;
                      const active = index === currentQuestion;

                      return (
                        <button
                          key={question._id || question.id || index}
                          type="button"
                          onClick={() => goToQuestion(index)}
                          className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-black transition ${
                            active
                              ? "border-cyan-300/40 bg-cyan-300 text-slate-950"
                              : answered
                                ? "border-emerald-300/25 bg-emerald-300/15 text-emerald-100"
                                : "border-white/10 bg-white/[0.05] text-slate-400 hover:bg-white/10"
                          }`}
                          aria-label={`Go to question ${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                    <button
                      type="button"
                      onClick={goToPreviousQuestion}
                      disabled={isFirstQuestion}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-40"
                    >
                      <ArrowLeft size={18} />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={goToNextQuestion}
                      disabled={isLastQuestion}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-40"
                    >
                      Next
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => finalizeQuiz()}
                      disabled={isSubmittingResult || reviewMode}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <Send size={18} />
                      {reviewMode ? "Reviewing" : isSubmittingResult ? "Saving..." : "Submit"}
                    </button>
                    {reviewMode && (
                      <button
                        type="button"
                        onClick={() => setShowResults(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 sm:col-span-3"
                      >
                        Back to Summary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={sidebarStyles.loadingContainer}>
              <div className={sidebarStyles.loadingContent}>
                <BookOpen size={36} className="mx-auto text-indigo-700" />
                <h3 className={sidebarStyles.loadingTitle}>
                  No Questions Available
                </h3>
                <p className={sidebarStyles.loadingDescription}>
                  Ask the admin to add questions for this technology and level.
                </p>
              </div>
            </div>
          )}
        </motion.main>
      </div>
      <style>{sidebarStyles.customStyles}</style>
    </div>
  );
};

export default Sidebar;
