import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token missing'
            });
        }

        const token = authHeader.split(' ')[1];

        const payload = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;

        next();

    } catch (err) {

        console.error('JWT Verification Error:', err);

        return res.status(401).json({
            success: false,
            message: 'Token invalid or expired'
        });
    }
};

export default authMiddleware;