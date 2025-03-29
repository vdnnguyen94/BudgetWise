import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory", required: false },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    goalId: { type: mongoose.Schema.Types.ObjectId,  ref: 'Goal', default: null },
    paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'Other'], default: 'Other', select: true }
});

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;
