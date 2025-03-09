import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    term: { type: Number, required: true },
    status: { type: String, required: true },
    monthlyPayment: { type: Number, required: true }
});

module.exports = mongoose.model("Loan", LoanSchema);