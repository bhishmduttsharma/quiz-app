import Result from "../models/resultModel.js";
import User from "../models/userModel.js";
import Question from "../models/questionModel.js";
import Technology from "../models/technologyModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const listStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { students });
});

export const listAllResults = asyncHandler(async (req, res) => {
    const results = await Result.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { results });
});

export const getAdminStats = asyncHandler(async (req, res) => {
    const [students, questions, technologies, attempts, results] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Question.countDocuments(),
        Technology.countDocuments(),
        Result.countDocuments(),
        Result.find({}).select("score").lean(),
      ]);

    const averageScore = results.length
      ? Math.round(
          results.reduce((total, item) => total + Number(item.score || 0), 0) /
            results.length
        )
      : 0;

    const allResults = await Result.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const performers = new Map();
    const subjects = new Map();
    allResults.forEach((result) => {
      if (result.user) {
        const userId = String(result.user._id);
        const existing = performers.get(userId) || {
          userId,
          name: result.user.name,
          email: result.user.email,
          attempts: 0,
          totalScore: 0,
          highestScore: 0,
        };
        existing.attempts += 1;
        existing.totalScore += Number(result.score || 0);
        existing.highestScore = Math.max(existing.highestScore, Number(result.score || 0));
        performers.set(userId, existing);
      }

      const technology = String(result.technology || "general").toLowerCase();
      const subject = subjects.get(technology) || {
        technology,
        attempts: 0,
        totalScore: 0,
        correct: 0,
        totalQuestions: 0,
      };
      subject.attempts += 1;
      subject.totalScore += Number(result.score || 0);
      subject.correct += Number(result.correct || 0);
      subject.totalQuestions += Number(result.totalQuestions || 0);
      subjects.set(technology, subject);
    });

    const topPerformers = Array.from(performers.values())
      .map((item) => ({
        ...item,
        averageScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
      }))
      .sort((a, b) => b.highestScore - a.highestScore || b.averageScore - a.averageScore)
      .slice(0, 5);

    const subjectStats = Array.from(subjects.values())
      .map((item) => ({
        ...item,
        averageScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
        accuracy: item.totalQuestions ? Math.round((item.correct / item.totalQuestions) * 100) : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    return sendSuccess(res, {
      stats: {
        students,
        questions,
        technologies,
        attempts,
        averageScore,
        topPerformers,
        subjectStats,
      },
    });
});
