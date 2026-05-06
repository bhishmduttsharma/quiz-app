import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://bhishmduttsharma814_db_user:quizapp12@cluster0.d5nd7hb.mongodb.net/QuizApp')
    .then(() => { console.log('DB CONNECTED')})
}