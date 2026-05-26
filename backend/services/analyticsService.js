export const toPercent = (value, total) =>
  total ? Math.round((value / total) * 100) : 0;

export const normalizeTechnology = (value) =>
  String(value || "General").toLowerCase();

export const buildLeaderboard = (results, subject = "all") => {
  const users = new Map();

  results.forEach((result) => {
    if (!result.user) return;
    const technology = normalizeTechnology(result.technology);
    if (subject !== "all" && technology !== subject) return;

    const userId = String(result.user._id || result.user);
    const existing = users.get(userId) || {
      userId,
      name: result.user.name || "Student",
      email: result.user.email || "",
      attempts: 0,
      totalScore: 0,
      highestScore: 0,
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
      subjects: new Set(),
      latestAttempt: null,
    };

    const score = Number(result.score || 0);
    existing.attempts += 1;
    existing.totalScore += score;
    existing.highestScore = Math.max(existing.highestScore, score);
    existing.totalQuestions += Number(result.totalQuestions || 0);
    existing.correct += Number(result.correct || 0);
    existing.wrong += Number(result.wrong || 0);
    existing.subjects.add(technology);
    existing.latestAttempt =
      !existing.latestAttempt || result.createdAt > existing.latestAttempt
        ? result.createdAt
        : existing.latestAttempt;

    users.set(userId, existing);
  });

  return Array.from(users.values())
    .map((item) => ({
      ...item,
      subjects: item.subjects.size,
      averageScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
      accuracy: toPercent(item.correct, item.totalQuestions),
    }))
    .sort(
      (a, b) =>
        b.highestScore - a.highestScore ||
        b.averageScore - a.averageScore ||
        b.accuracy - a.accuracy ||
        b.attempts - a.attempts
    )
    .map((item, index) => ({ ...item, rank: index + 1 }));
};

export const buildSubjectAnalytics = (results) => {
  const subjects = new Map();

  results.forEach((result) => {
    const technology = normalizeTechnology(result.technology);
    const existing = subjects.get(technology) || {
      technology,
      attempts: 0,
      totalScore: 0,
      highestScore: 0,
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
    };

    const score = Number(result.score || 0);
    existing.attempts += 1;
    existing.totalScore += score;
    existing.highestScore = Math.max(existing.highestScore, score);
    existing.totalQuestions += Number(result.totalQuestions || 0);
    existing.correct += Number(result.correct || 0);
    existing.wrong += Number(result.wrong || 0);
    subjects.set(technology, existing);
  });

  return Array.from(subjects.values())
    .map((item) => ({
      ...item,
      averageScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
      accuracy: toPercent(item.correct, item.totalQuestions),
    }))
    .sort((a, b) => a.averageScore - b.averageScore);
};

const nextLevelFor = (level = "basic", score = 0) => {
  const normalized = normalizeTechnology(level);
  if (score >= 82 && normalized === "basic") return "intermediate";
  if (score >= 82 && normalized === "intermediate") return "advanced";
  if (score < 55 && normalized === "advanced") return "intermediate";
  if (score < 55 && normalized === "intermediate") return "basic";
  return normalized || "basic";
};

const getRecentMomentum = (results) => {
  if (results.length < 2) return 0;
  const recent = results.slice(-3);
  const first = Number(recent[0]?.score || 0);
  const last = Number(recent[recent.length - 1]?.score || 0);
  return last - first;
};

// Smart Coach converts raw attempt history into practical next-step guidance.
export const buildSmartCoach = (results) => {
  const subjectAnalytics = buildSubjectAnalytics(results);
  const recentResults = results.slice(-5);
  const latest = results[results.length - 1] || null;
  const weakest =
    subjectAnalytics.find((item) => item.averageScore < 75 || item.accuracy < 75) ||
    subjectAnalytics[0] ||
    null;
  const strongest = subjectAnalytics
    .slice()
    .sort((a, b) => b.averageScore - a.averageScore || b.accuracy - a.accuracy)[0];
  const momentum = getRecentMomentum(results);
  const averageScore = results.length
    ? Math.round(
        results.reduce((sum, item) => sum + Number(item.score || 0), 0) /
          results.length
      )
    : 0;

  const recommendedTechnology =
    weakest?.technology || latest?.technology || strongest?.technology || "html";
  const lastForRecommended = results
    .slice()
    .reverse()
    .find((item) => normalizeTechnology(item.technology) === recommendedTechnology);
  const recommendedLevel = nextLevelFor(
    lastForRecommended?.level || "basic",
    Number(lastForRecommended?.score ?? weakest?.averageScore ?? 0)
  );
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        averageScore * 0.55 +
          (strongest?.accuracy || 0) * 0.25 +
          Math.max(-15, Math.min(15, momentum)) +
          Math.min(10, results.length)
      )
    )
  );

  const insights = [];

  if (!results.length) {
    insights.push({
      type: "start",
      title: "Start with a baseline quiz",
      message:
        "Complete one basic quiz so Smart Coach can personalize recommendations from real performance data.",
    });
  } else {
    insights.push({
      type: momentum >= 0 ? "momentum" : "recovery",
      title: momentum >= 0 ? "Positive learning momentum" : "Momentum dip detected",
      message:
        momentum >= 0
          ? `Your recent score trend is up by ${momentum} points. This is a good time to increase difficulty carefully.`
          : `Your recent score trend is down by ${Math.abs(momentum)} points. A focused review set should stabilize performance.`,
    });
  }

  if (weakest) {
    insights.push({
      type: "weakness",
      title: `${weakest.technology.toUpperCase()} needs attention`,
      message: `Average score is ${weakest.averageScore}% with ${weakest.accuracy}% accuracy across ${weakest.attempts} attempt(s).`,
    });
  }

  if (strongest && strongest.averageScore >= 80) {
    insights.push({
      type: "strength",
      title: `${strongest.technology.toUpperCase()} is a strength area`,
      message: `You are presentation-ready here with a ${strongest.averageScore}% average score.`,
    });
  }

  return {
    readinessScore,
    momentum,
    recommendedPractice: {
      technology: recommendedTechnology,
      level: recommendedLevel,
      targetScore: weakest?.averageScore && weakest.averageScore < 70 ? 75 : 85,
      reason: weakest
        ? `Recommended because ${weakest.technology.toUpperCase()} is your lowest confidence subject.`
        : "Recommended as a starter path for your next adaptive practice session.",
    },
    focusPlan: [
      "Review wrong answers from the most recent attempt",
      "Take one timed adaptive practice round",
      "Retake the same subject and target a higher accuracy score",
    ],
    insights,
    recentWindow: recentResults.map((item) => ({
      technology: item.technology,
      level: item.level,
      score: Number(item.score || 0),
      date: item.createdAt,
    })),
  };
};
