import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory", required: false },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;
