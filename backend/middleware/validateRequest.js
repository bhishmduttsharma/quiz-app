import { badRequest } from "../utils/apiError.js";
import { cleanString, isObjectId, isValidEmail, toNumber } from "../utils/validators.js";

const reject = (message) => {
  throw badRequest(message);
};

export const validateObjectIdParam = (paramName = "id") => (req, res, next) => {
  try {
    if (!isObjectId(req.params[paramName])) reject("Invalid resource id");
    next();
  } catch (err) {
    next(err);
  }
};

export const validateRegister = (req, res, next) => {
  try {
    if (!cleanString(req.body.name)) reject("Name is required");
    if (!isValidEmail(req.body.email)) reject("Please enter a valid email");
    if (cleanString(req.body.password).length < 6) {
      reject("Password must be at least 6 characters");
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const validateLogin = (req, res, next) => {
  try {
    if (!isValidEmail(req.body.email)) reject("Please enter a valid email");
    if (!cleanString(req.body.password)) reject("Password is required");
    next();
  } catch (err) {
    next(err);
  }
};

export const validateProfile = (req, res, next) => {
  try {
    if (!cleanString(req.body.name)) reject("Name is required");
    if (req.body.avatar && !cleanString(req.body.avatar).startsWith("data:image/")) {
      reject("Avatar must be an image data URL");
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const validateResult = (req, res, next) => {
  try {
    if (!cleanString(req.body.title)) reject("Title is required");
    if (!cleanString(req.body.technology)) reject("Technology is required");
    if (!cleanString(req.body.level)) reject("Level is required");
    if (toNumber(req.body.totalQuestions, -1) < 0) reject("Total questions must be valid");
    if (toNumber(req.body.correct, -1) < 0) reject("Correct answers must be valid");
    next();
  } catch (err) {
    next(err);
  }
};

export const validateQuestion = (req, res, next) => {
  try {
    const options = req.body.options;
    const correctAnswer = toNumber(req.body.correctAnswer, -1);

    if (!cleanString(req.body.technology)) reject("Technology is required");
    if (!cleanString(req.body.level)) reject("Level is required");
    if (cleanString(req.body.question).length < 5) {
      reject("Question must be at least 5 characters");
    }
    if (!Array.isArray(options) || options.length !== 4) {
      reject("Exactly four options are required");
    }
    if (options.some((option) => !cleanString(option))) {
      reject("All four options must be filled");
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      reject("Correct answer must be one of the four options");
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const validateTechnology = (req, res, next) => {
  try {
    if (!cleanString(req.body.name)) reject("Technology name is required");
    if (!Array.isArray(req.body.levels) || req.body.levels.length === 0) {
      reject("At least one level is required");
    }
    next();
  } catch (err) {
    next(err);
  }
};
