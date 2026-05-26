import mongoose from "mongoose";
import { isProduction } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    return new ApiError(400, "Validation failed", Object.values(err.errors).map((item) => item.message));
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, "Invalid resource id");
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return new ApiError(409, `${field} already exists`);
  }

  return err;
};

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled API error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && isProduction ? "Server error" : error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(!isProduction && statusCode >= 500 ? { stack: error.stack } : {}),
  });
};
