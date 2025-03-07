import mongoose from "mongoose";

const BudgetCategorySchema = new mongoose.Schema({
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    name: { type: String, required: true },
    limit: { type: Number, required: true }
});

export default mongoose.model("BudgetCategory", BudgetCategorySchema);
