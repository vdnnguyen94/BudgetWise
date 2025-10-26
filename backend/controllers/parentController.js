import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// Add a child account
export const addChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { username, email, password, dateOfBirth, allowance } = req.body;

        // Verify parent exists and has Parent role
        const parent = await User.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        if (parent.role !== 'Parent') {
            return res.status(403).json({ message: 'Only parent accounts can add children' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create child user
        const childUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'Child',
            parentId: parentId,
            dateOfBirth: dateOfBirth || null,
            allowance: allowance || 0
        });

        await childUser.save();

        // Add child to parent's children array
        parent.children.push(childUser._id);
        await parent.save();

        res.status(201).json({
            message: 'Child account created successfully',
            child: {
                _id: childUser._id,
                username: childUser.username,
                email: childUser.email,
                role: childUser.role,
                dateOfBirth: childUser.dateOfBirth,
                allowance: childUser.allowance
            }
        });
    } catch (error) {
        console.error('Error adding child:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all children for a parent
export const getChildren = async (req, res) => {
    try {
        const parentId = req.user.id;

        const parent = await User.findById(parentId).populate('children', '-password');
        
        if (!parent) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        if (parent.role !== 'Parent') {
            return res.status(403).json({ message: 'Only parent accounts can view children' });
        }

        res.json({
            children: parent.children
        });
    } catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a specific child's details
export const getChildById = async (req, res) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.childId;

        const parent = await User.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        if (parent.role !== 'Parent') {
            return res.status(403).json({ message: 'Only parent accounts can view child details' });
        }

        // Verify this child belongs to this parent
        if (!parent.children.includes(childId)) {
            return res.status(403).json({ message: 'This child does not belong to your account' });
        }

        const child = await User.findById(childId).select('-password');
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        res.json({ child });
    } catch (error) {
        console.error('Error fetching child:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove a child account
export const removeChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.childId;

        const parent = await User.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        if (parent.role !== 'Parent') {
            return res.status(403).json({ message: 'Only parent accounts can remove children' });
        }

        // Verify this child belongs to this parent
        if (!parent.children.includes(childId)) {
            return res.status(403).json({ message: 'This child does not belong to your account' });
        }

        const child = await User.findById(childId);
        if (!child) {
            return res.status(404).json({ message: 'Child account not found' });
        }

        // Remove child from parent's children array
        parent.children = parent.children.filter(
            id => id.toString() !== childId.toString()
        );
        await parent.save();

        // Delete the child account
        await child.deleteOne();

        res.json({ message: 'Child account removed successfully' });
    } catch (error) {
        console.error('Error removing child:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update child account details (allowance, dateOfBirth, etc.)
export const updateChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.childId;
        const { username, dateOfBirth, allowance } = req.body;

        const parent = await User.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        if (parent.role !== 'Parent') {
            return res.status(403).json({ message: 'Only parent accounts can update children' });
        }

        // Verify this child belongs to this parent
        if (!parent.children.includes(childId)) {
            return res.status(403).json({ message: 'This child does not belong to your account' });
        }

        const child = await User.findById(childId);
        if (!child) {
            return res.status(404).json({ message: 'Child account not found' });
        }

        // Update allowed fields
        if (username) child.username = username;
        if (dateOfBirth) child.dateOfBirth = dateOfBirth;
        if (allowance !== undefined) child.allowance = allowance;

        await child.save();

        res.json({
            message: 'Child account updated successfully',
            child: {
                _id: child._id,
                username: child.username,
                email: child.email,
                dateOfBirth: child.dateOfBirth,
                allowance: child.allowance
            }
        });
    } catch (error) {
        console.error('Error updating child:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};