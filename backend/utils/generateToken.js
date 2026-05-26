import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (user) => {
  const role = user.role || "student";

  return jwt.sign(
    {
      id: user._id.toString(),
      role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
};

export const verifyJwtToken = (token) => jwt.verify(token, env.jwtSecret);
