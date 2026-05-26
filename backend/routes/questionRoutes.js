import express from "express";
import {
  createQuestion,
  deleteQuestion,
  listPublicQuestions,
  listTeacherQuestions,
  updateQuestion,
} from "../controllers/questionController.js";
import authMiddleware from "../middleware/auth.js";
import { validateObjectIdParam, validateQuestion } from "../middleware/validateRequest.js";

const questionRouter = express.Router();

questionRouter.get("/", listPublicQuestions);
questionRouter.get("/mine", authMiddleware, listTeacherQuestions);
questionRouter.post("/", authMiddleware, validateQuestion, createQuestion);
questionRouter.put("/:id", authMiddleware, validateObjectIdParam("id"), validateQuestion, updateQuestion);
questionRouter.delete("/:id", authMiddleware, validateObjectIdParam("id"), deleteQuestion);

export default questionRouter;
