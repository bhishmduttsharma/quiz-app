import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technology: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          Array.isArray(options) &&
          options.length === 4 &&
          options.every((option) => String(option).trim().length > 0),
        message: "Exactly four options are required",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.pre("validate", function normalizeQuestion() {
  if (this.technology) this.technology = this.technology.toLowerCase().trim();
  if (this.level) this.level = this.level.toLowerCase().trim();
  if (Array.isArray(this.options)) {
    this.options = this.options.map((option) => String(option).trim());
  }
});

questionSchema.index({ technology: 1, level: 1, isActive: 1, createdAt: -1 });
questionSchema.index({ createdBy: 1, createdAt: -1 });

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;
