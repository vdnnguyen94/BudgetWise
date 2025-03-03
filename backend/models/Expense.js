import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        category: { type: String, required: true },
        date: { type: Date, required: true },
        description: { type: String, required: false },
    },
    { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
