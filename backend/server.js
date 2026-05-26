import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";
import { ensureAdminUser, seedDefaultTechnologies } from './utils/seedDefaults.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    // Seed data keeps demos reliable on a fresh database.
    await seedDefaultTechnologies();
    await ensureAdminUser();

    app.listen(env.port, () => {
      console.log(`Server started on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
