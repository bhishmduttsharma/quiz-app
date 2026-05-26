import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jsonLimit: process.env.JSON_LIMIT || "2mb",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME || "Quiz Admin",
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",
};

export const isProduction = env.nodeEnv === "production";

export const validateEnv = () => {
  const required = [
    ["MONGODB_URI", env.mongoUri],
    ["JWT_SECRET", env.jwtSecret],
    ["ADMIN_EMAIL", env.adminEmail],
    ["ADMIN_PASSWORD", env.adminPassword],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
