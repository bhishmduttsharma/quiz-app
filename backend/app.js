import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { attachRequestId, basicRateLimit, securityHeaders } from "./middleware/security.js";

const app = express();

const corsOptions = {
  origin: env.clientOrigin === "*" ? true : env.clientOrigin.split(",").map((origin) => origin.trim()),
  credentials: env.clientOrigin !== "*",
};

// Core API middleware is registered once here so routes stay focused on domain logic.
app.disable("x-powered-by");
app.use(attachRequestId);
app.use(securityHeaders);
app.use(basicRateLimit);
app.use(cors(corsOptions));
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonLimit }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API WORKING",
    version: "1.0.0",
  });
});

app.use("/api", apiRouter);

// Keep error responses consistent for unknown routes and unexpected failures.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
