import mongoose from "mongoose"; 

const IncomeSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   source: { type: String, required: true },
   amount: { type: Number, required: true },
   description: { type: String },
   date: { type: Date, default: Date.now },
   recurrence: { type: String, enum: ["one-time", "monthly", "weekly"], default: "one-time" } 
});

const Income = mongoose.model("Income", IncomeSchema);
export default Income;
