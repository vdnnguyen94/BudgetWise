import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Student', 'Professional', 'Admin', 'Parent', 'Child'],  //  Added 'Parent' and 'Child'
        default: 'Student' 
    },
    // Parent-Child relationship fields
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Child account specific fields
    dateOfBirth: {
        type: Date,
        default: null
    },
    allowance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);