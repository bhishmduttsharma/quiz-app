import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password:{
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,
        default: ""
    },
    college: {
        type: String,
        trim: true,
        default: ""
    },
    bio: {
        type: String,
        trim: true,
        default: ""
    },
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('isAdmin').get(function () {
    return this.role === 'admin';
});

userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
