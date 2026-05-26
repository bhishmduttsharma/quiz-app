import Result from "../models/resultModel.js";
import User from "../models/userModel.js";
import {
  buildLeaderboard,
  buildSmartCoach,
  buildSubjectAnalytics,
  normalizeTechnology,
  toPercent,
} from "../services/analyticsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { cleanLower, cleanString, toNumber } from "../utils/validators.js";

export const createResult = asyncHandler(async (req, res) => {
  const { title, technology, level, totalQuestions, correct, wrong } = req.body;
  const total = toNumber(totalQuestions);
  const correctCount = toNumber(correct);

  const result = await Result.create({
    title: cleanString(title),
    technology: cleanLower(technology),
    level: cleanLower(level),
    totalQuestions: total,
    correct: correctCount,
    wrong: wrong !== undefined ? toNumber(wrong) : Math.max(0, total - correctCount),
    user: req.user._id,
  });

  return sendSuccess(res, {
    message: "Result created",
    result,
  }, 201);
});

export const listResults = asyncHandler(async (req, res) => {
  const technology = cleanLower(req.query.technology || "all");
  const query = { user: req.user._id };

  if (technology !== "all") {
    query.technology = technology;
  }

  const results = await Result.find(query).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, { results });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const subject = normalizeTechnology(req.query.subject || "all");
  const results = await Result.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const leaderboard = buildLeaderboard(results, subject);
  const subjects = Array.from(
    new Set(results.map((result) => normalizeTechnology(result.technology)))
  ).sort();

  return sendSuccess(res, {
    subject,
    subjects,
    leaderboard,
  });
});

export const getTopPerformers = asyncHandler(async (req, res) => {
  const results = await Result.find({})
    .populate("user", "name avatar college")
    .sort({ createdAt: -1 })
    .lean();

  const topPerformers = buildLeaderboard(results)
    .slice(0, 5)
    .map((student) => ({
      userId: student.userId,
      name: student.name,
      rank: student.rank,
      attempts: student.attempts,
      highestScore: student.highestScore,
      averageScore: student.averageScore,
      accuracy: student.accuracy,
    }));

  return sendSuccess(res, { topPerformers });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [userResults, allResults, students] = await Promise.all([
    Result.find({ user: req.user._id }).sort({ createdAt: 1 }).lean(),
    Result.find({}).populate("user", "name email").sort({ createdAt: -1 }).lean(),
    User.countDocuments({ role: "student" }),
  ]);

  const totalAttempts = userResults.length;
  const totalQuestions = userResults.reduce(
    (sum, item) => sum + Number(item.totalQuestions || 0),
    0
  );
  const totalCorrect = userResults.reduce(
    (sum, item) => sum + Number(item.correct || 0),
    0
  );
  const totalWrong = userResults.reduce(
    (sum, item) => sum + Number(item.wrong || 0),
    0
  );
  const averageScore = totalAttempts
    ? Math.round(
        userResults.reduce((sum, item) => sum + Number(item.score || 0), 0) /
          totalAttempts
      )
    : 0;
  const highestScore = userResults.reduce(
    (high, item) => Math.max(high, Number(item.score || 0)),
    0
  );

  const subjectAnalytics = buildSubjectAnalytics(userResults);
  const weakSubjects = subjectAnalytics
    .filter((item) => item.averageScore < 70 || item.accuracy < 70)
    .slice(0, 5);

  const history = userResults
    .slice()
    .reverse()
    .map((item) => ({
      id: item._id,
      title: item.title,
      technology: item.technology,
      level: item.level,
      score: item.score,
      correct: item.correct,
      wrong: item.wrong,
      totalQuestions: item.totalQuestions,
      accuracy: toPercent(Number(item.correct || 0), Number(item.totalQuestions || 0)),
      performance: item.performance,
      date: item.createdAt,
    }));

  const trend = userResults.map((item, index) => ({
    attempt: `A${index + 1}`,
    score: Number(item.score || 0),
    accuracy: toPercent(Number(item.correct || 0), Number(item.totalQuestions || 0)),
    technology: item.technology,
    date: item.createdAt,
  }));

  const rankedStudents = buildLeaderboard(allResults);
  const globalLeaderboard = rankedStudents.slice(0, 10);
  const currentRank =
    rankedStudents.find((item) => item.userId === String(req.user._id))?.rank || null;

  return sendSuccess(res, {
    stats: {
      totalAttempts,
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageScore,
      highestScore,
      accuracy: toPercent(totalCorrect, totalQuestions),
      subjectsPracticed: subjectAnalytics.length,
      currentRank,
      totalStudents: students,
    },
    subjectAnalytics,
    weakSubjects,
    history,
    trend,
    globalLeaderboard,
    smartCoach: buildSmartCoach(userResults),
  });
});
