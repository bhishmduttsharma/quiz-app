import express from "express";
import adminRouter from "./adminRoutes.js";
import authRouter from "./authRoutes.js";
import questionRouter from "./questionRoutes.js";
import resultRouter from "./resultRoutes.js";
import technologyRouter from "./technologyRoutes.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/results", resultRouter);
apiRouter.use("/questions", questionRouter);
apiRouter.use("/technologies", technologyRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
