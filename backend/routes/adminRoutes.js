import express from "express";
import {
  getAdminStats,
  listAllResults,
  listStudents,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";

const adminRouter = express.Router();

adminRouter.use(authMiddleware, adminAuth);

adminRouter.get("/stats", getAdminStats);
adminRouter.get("/students", listStudents);
adminRouter.get("/results", listAllResults);

export default adminRouter;
