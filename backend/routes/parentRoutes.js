import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { addChild, getChildren, getChildById, removeChild, updateChild} from '../controllers/parentController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET all children for the authenticated parent
router.get('/children', getChildren);

// GET a specific child by ID
router.get('/children/:childId', getChildById);

// POST - Add a new child account
router.post(
    '/children',
    [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Please provide a valid date'),
        body('allowance')
            .optional()
            .isNumeric()
            .withMessage('Allowance must be a number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await addChild(req, res);
    }
);

// PUT - Update a child account
router.put(
    '/children/:childId',
    [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Please provide a valid date'),
        body('allowance')
            .optional()
            .isNumeric()
            .withMessage('Allowance must be a number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await updateChild(req, res);
    }
);

// DELETE - Remove a child account
router.delete('/children/:childId', removeChild);

export default router;