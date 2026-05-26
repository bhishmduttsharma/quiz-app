import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { cleanLower, cleanString } from '../utils/validators.js';
import { env } from '../config/env.js';

const sanitizeUser = (user) => {
    const role = user.role || 'student';

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role,
        avatar: user.avatar || '',
        college: user.college || '',
        bio: user.bio || '',
        isAdmin: role === 'admin'
    };
};

// Register student accounts normally; admin accounts require the private invite code.
export const register = asyncHandler(async (req, res) => {
        const name = cleanString(req.body.name);
        const email = cleanLower(req.body.email);
        const password = cleanString(req.body.password);
        const requestedRole = cleanLower(req.body.role || 'student');
        const adminCode = cleanString(req.body.adminCode);
        const role = requestedRole === 'admin' ? 'admin' : 'student';

        if (role === 'admin') {
            if (!env.adminInviteCode || adminCode !== env.adminInviteCode) {
                throw new ApiError(403, 'Invalid admin invitation code');
            }
        }

        const exists = await User.findOne({ email }).lean();
        if (exists) {
            throw new ApiError(409, 'User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = generateToken(user);

        return sendSuccess(res, {
            message: 'Account created successfully!',
            token,
            user: sanitizeUser(user)
        }, 201);
});

export const getProfile = asyncHandler(async (req, res) => {
        return sendSuccess(res, {
            user: sanitizeUser(req.user)
        });
});

export const updateProfile = asyncHandler(async (req, res) => {
        const name = cleanString(req.body.name || req.user.name);
        const college = cleanString(req.body.college).slice(0, 120);
        const bio = cleanString(req.body.bio).slice(0, 240);
        const avatar = cleanString(req.body.avatar);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, college, bio, avatar },
            { new: true }
        ).select('-password');

        return sendSuccess(res, {
            message: 'Profile updated',
            user: sanitizeUser(user)
        });
});

// login student/admin account
export const login = asyncHandler(async (req, res) => {
        const email = cleanLower(req.body.email);
        const password = cleanString(req.body.password);
        const selectedRole = cleanLower(req.body.role);

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const role = user.role || 'student';
        if (selectedRole && selectedRole !== role) {
            throw new ApiError(403, `This account is registered as ${role}`);
        }

        const token = generateToken(user);

        return sendSuccess(res, {
            message: 'Login successfully!',
            token,
            user: sanitizeUser(user)
        });
});
