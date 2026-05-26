import User from "../models/userModel.js";
import { verifyJwtToken } from "../utils/generateToken.js";
import { forbidden, unauthorized } from "../utils/apiError.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw unauthorized("Not authorized, token missing");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyJwtToken(token);
    const user = await User.findById(payload.id).select("-password").lean();

    if (!user) {
      throw unauthorized("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err.isOperational ? err : unauthorized("Token invalid or expired"));
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(forbidden("Admin access required"));
  }

  next();
};

export default verifyToken;
