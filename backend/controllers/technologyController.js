import Question from "../models/questionModel.js";
import Technology from "../models/technologyModel.js";
import { ApiError, notFound } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { cleanString, slugify, toBoolean } from "../utils/validators.js";

const normalizeLevels = (levels = []) =>
  levels
    .map((level) => ({
      id: slugify(level.id || level.name),
      name: cleanString(level.name || level.id),
    }))
    .filter((level) => level.id && level.name);

const normalizeCategory = (value) =>
  cleanString(value || "General").slice(0, 40) || "General";

export const listTechnologies = asyncHandler(async (req, res) => {
    const includeInactive = req.user?.role === "admin" && req.query.includeInactive === "true";
    const query = includeInactive ? {} : { isActive: true };
    const technologies = await Technology.find(query).sort({ name: 1 }).lean();

    return sendSuccess(res, { technologies });
});

export const createTechnology = asyncHandler(async (req, res) => {
    const id = slugify(req.body.id || req.body.name);
    const name = cleanString(req.body.name);
    const category = normalizeCategory(req.body.category);
    const levels = normalizeLevels(req.body.levels);

    if (!id || !name || !levels.length) {
      throw new ApiError(400, "Technology name and at least one level are required");
    }

    const technology = await Technology.create({
      id,
      name,
      category,
      levels,
      isActive: toBoolean(req.body.isActive, true),
    });

    return sendSuccess(res, {
      message: "Technology created successfully",
      technology,
    }, 201);
});

export const updateTechnology = asyncHandler(async (req, res) => {
    const name = cleanString(req.body.name);
    const category = normalizeCategory(req.body.category);
    const levels = normalizeLevels(req.body.levels);

    if (!name || !levels.length) {
      throw new ApiError(400, "Technology name and at least one level are required");
    }

    const technology = await Technology.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        category,
        levels,
        isActive: toBoolean(req.body.isActive, true),
      },
      { new: true, runValidators: true }
    );

    if (!technology) {
      throw notFound("Technology");
    }

    return sendSuccess(res, {
      message: "Technology updated successfully",
      technology,
    });
});

export const deleteTechnology = asyncHandler(async (req, res) => {
    const technology = await Technology.findOneAndDelete({ id: req.params.id });

    if (!technology) {
      throw notFound("Technology");
    }

    const result = await Question.deleteMany({ technology: req.params.id });

    return sendSuccess(res, {
      message: "Technology and its questions deleted successfully",
      deletedQuestions: result.deletedCount,
    });
});
