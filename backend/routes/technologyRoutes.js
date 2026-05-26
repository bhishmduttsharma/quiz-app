import express from "express";
import {
  createTechnology,
  deleteTechnology,
  listTechnologies,
  updateTechnology,
} from "../controllers/technologyController.js";
import adminAuth from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";
import { validateTechnology } from "../middleware/validateRequest.js";

const technologyRouter = express.Router();

technologyRouter.get("/admin", authMiddleware, adminAuth, listTechnologies);
technologyRouter.get("/", listTechnologies);
technologyRouter.post("/", authMiddleware, adminAuth, validateTechnology, createTechnology);
technologyRouter.put("/:id", authMiddleware, adminAuth, validateTechnology, updateTechnology);
technologyRouter.delete("/:id", authMiddleware, adminAuth, deleteTechnology);

export default technologyRouter;
