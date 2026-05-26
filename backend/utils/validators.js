import mongoose from "mongoose";
import validator from "validator";

export const cleanString = (value, fallback = "") =>
  String(value ?? fallback).trim();

export const cleanLower = (value, fallback = "") =>
  cleanString(value, fallback).toLowerCase();

export const isValidEmail = (email) => validator.isEmail(cleanString(email));

export const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const slugify = (value) =>
  cleanLower(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(cleanLower(value));
};

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
