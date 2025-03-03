import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Student', 'Professional', 'Admin'], 
        default: 'Student' 
    }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
