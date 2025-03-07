import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalBudget: { type: Number, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory" }]
});

export default mongoose.model("Budget", BudgetSchema);
