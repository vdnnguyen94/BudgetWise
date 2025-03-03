import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalBudget: { type: Number, required: true },  
    category: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
