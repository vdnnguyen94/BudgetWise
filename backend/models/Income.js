import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
       categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory", required: false },
       amount: { type: Number, required: true },
       description: { type: String },
       date: { type: Date, default: Date.now }
  
});

const Income = mongoose.model("Income", IncomeSchema);
export default Income;
