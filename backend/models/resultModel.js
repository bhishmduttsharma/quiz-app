 import mongoose from "mongoose";

 const performanceEnum = ["Excellent", "Good", "Average", "Needs Work"];

 const ResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
     technology: {
      type: String,
      required: true,
      trim: true,
    },
    level: { type: String, required: true, lowercase: true, trim: true },
    totalQuestions: { type: Number, required: true, min: 0 },
    correct: { type: Number, required: true, min: 0, default: 0 },
    wrong: { type: Number, required: true, min: 0, default: 0 },
    score: { type: Number, min: 0, max: 100, default: 0 },
    performance: { type: String, enum: performanceEnum, default: "Needs Work" },
 },{
    timestamps: true
 });

 // compute score and performance 
 ResultSchema.pre('save', function () {
    const total = Number(this.totalQuestions) || 0;
    const correct = Number(this.correct) ||0;

    this.score = total ? Math.round((correct / total) * 100) : 0;

if (this.score >= 85) this.performance = 'Excellent';
else if (this.score >= 65) this.performance = 'Good';
else if (this.score >= 45) this.performance = 'Average';
else this.performance = 'Needs Work';

if ((this.wrong === undefined || this.wrong === null) && total) {
  this.wrong = Math.max(0, total - correct);
}


});

ResultSchema.index({ user: 1, createdAt: -1 });
ResultSchema.index({ technology: 1, score: -1 });
ResultSchema.index({ createdAt: -1 });

const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);
export default Result;
