import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory", required: false },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

const Bill = mongoose.model("Bill", BillSchema);
export default Bill;