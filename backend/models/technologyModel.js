import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const technologySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
    levels: {
      type: [levelSchema],
      default: [],
      validate: {
        validator: (levels) => levels.length > 0,
        message: "At least one level is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

technologySchema.pre("validate", function normalizeTechnology() {
  if (this.id) this.id = this.id.toLowerCase().trim();
  if (this.category) this.category = String(this.category).trim();
  if (Array.isArray(this.levels)) {
    this.levels = this.levels.map((level) => ({
      id: String(level.id || "").toLowerCase().trim(),
      name: String(level.name || "").trim(),
    }));
  }
});

technologySchema.index({ isActive: 1, name: 1 });
technologySchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Technology ||
  mongoose.model("Technology", technologySchema);
