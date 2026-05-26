import Question from "../models/questionModel.js";
import Technology from "../models/technologyModel.js";
import { ApiError, notFound } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { cleanLower, toBoolean, toNumber } from "../utils/validators.js";

const buildQuestionPayload = (body) => {
  const { technology, level, question, options, correctAnswer, isActive } = body;

  return {
    technology,
    level,
    question,
    options,
    correctAnswer: toNumber(correctAnswer),
    ...(isActive !== undefined ? { isActive: toBoolean(isActive) } : {}),
  };
};

const validateQuestionPayload = (payload) => {
  if (!payload.technology || !payload.level || !payload.question) {
    return "Technology, level, and question are required";
  }

  if (!Array.isArray(payload.options) || payload.options.length !== 4) {
    return "Exactly four options are required";
  }

  if (payload.options.some((option) => !String(option).trim())) {
    return "All four options must be filled";
  }

  if (!Number.isInteger(payload.correctAnswer) || payload.correctAnswer < 0 || payload.correctAnswer > 3) {
    return "Correct answer must be one of the four options";
  }

  return null;
};

const validateTechnologyLevel = async (payload) => {
  const technology = await Technology.findOne({
    id: String(payload.technology || "").toLowerCase(),
    isActive: true,
  }).lean();

  if (!technology) return "Technology does not exist";

  const hasLevel = technology.levels.some(
    (level) => level.id === String(payload.level || "").toLowerCase()
  );

  return hasLevel ? null : "Selected level does not exist for this technology";
};

export const listPublicQuestions = asyncHandler(async (req, res) => {
    const { technology, level } = req.query;
    const query = { isActive: true };

    if (technology) query.technology = cleanLower(technology);
    if (level) query.level = cleanLower(level);

    const questions = await Question.find(query)
      .select("technology level question options correctAnswer createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { questions });
});

export const listTeacherQuestions = asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email isAdmin")
      .lean();

    return sendSuccess(res, { questions });
});

export const createQuestion = asyncHandler(async (req, res) => {
    const payload = buildQuestionPayload(req.body);
    const validationError = validateQuestionPayload(payload);

    if (validationError) {
      throw new ApiError(400, validationError);
    }

    const technologyError = await validateTechnologyLevel(payload);
    if (technologyError) {
      throw new ApiError(400, technologyError);
    }

    const question = await Question.create({
      ...payload,
      createdBy: req.user._id,
    });

    return sendSuccess(res, {
      message: "Question created successfully",
      question,
    }, 201);
});

export const updateQuestion = asyncHandler(async (req, res) => {
    const payload = buildQuestionPayload(req.body);
    const validationError = validateQuestionPayload(payload);

    if (validationError) {
      throw new ApiError(400, validationError);
    }

    const technologyError = await validateTechnologyLevel(payload);
    if (technologyError) {
      throw new ApiError(400, technologyError);
    }

    const query = req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user._id };

    const question = await Question.findOneAndUpdate(
      query,
      payload,
      { new: true, runValidators: true }
    );

    if (!question) {
      throw notFound("Question");
    }

    return sendSuccess(res, {
      message: "Question updated successfully",
      question,
    });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
    const query = req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user._id };
    const question = await Question.findOneAndDelete(query);

    if (!question) {
      throw notFound("Question");
    }

    return sendSuccess(res, {
      message: "Question deleted successfully",
    });
});
