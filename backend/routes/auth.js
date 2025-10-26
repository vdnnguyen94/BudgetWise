// @ts-nocheck
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


// LOGIN ROUTE

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });

            res.json({
                message: 'Login successful!',
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// LOGOUT ROUTE

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful!' });
});

// GET CURRENT USER

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// REGISTER ROUTE Parent login was not registered before

router.post(
    '/register',
    [
        body('username').trim().notEmpty().withMessage('Username is required')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Please provide a valid email')
            .custom(async (email) => {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    throw new Error('Email already in use');
                }
            }),
        body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
        body('role').optional().isIn(['Student', 'Professional', 'Admin', 'Parent', 'Child'])
            .withMessage('Invalid role')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role } = req.body;

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: role || 'Student'
            });

            await newUser.save();

            const token = jwt.sign(
                { id: newUser._id, role: newUser.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });

            res.status(201).json({
                message: 'User registered successfully!',
                token,
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }
);

// ADMIN: GET ALL USERS

router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// ADMIN: DELETE USER

router.delete('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// ADMIN: UPDATE USER ROLE

router.put('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
    const { role } = req.body;

    if (!['Student', 'Professional', 'Admin', 'Parent', 'Child'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;