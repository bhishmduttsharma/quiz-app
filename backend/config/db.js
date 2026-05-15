import mongoose from "mongoose";

export const connectDB = async () => {

    await mongoose.connect(process.env.MONGODB_URI)

    .then(() => {
        console.log('DB CONNECTED');
    })

    .catch((error) => {
        console.log('DB ERROR:', error);
    });

}