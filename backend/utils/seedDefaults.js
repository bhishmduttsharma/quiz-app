import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import Technology from "../models/technologyModel.js";
import User from "../models/userModel.js";

const defaultTechnologies = [
  { id: "html", name: "HTML", category: "Frontend" },
  { id: "css", name: "CSS", category: "Frontend" },
  { id: "js", name: "JavaScript", category: "Frontend" },
  { id: "react", name: "React", category: "Frontend" },
  { id: "node", name: "Node.js", category: "Backend" },
  { id: "mongodb", name: "MongoDB", category: "Backend" },
  { id: "java", name: "Java", category: "Programming" },
  { id: "python", name: "Python", category: "Programming" },
  { id: "cpp", name: "C++", category: "Programming" },
  { id: "bootstrap", name: "Bootstrap", category: "Frontend" },
];

const defaultLevels = [
  { id: "basic", name: "Basic" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

export async function seedDefaultTechnologies() {
  const count = await Technology.countDocuments();
  if (count > 0) return;

  await Technology.insertMany(
    defaultTechnologies.map((technology) => ({
      ...technology,
      levels: defaultLevels,
      isActive: true,
    }))
  );
}

export async function ensureAdminUser() {
  const email = env.adminEmail;
  const password = env.adminPassword;
  const name = env.adminName;

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });
}
