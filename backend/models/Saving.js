import mongoose from "mongoose";

const savingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "SavingGoal", required: true }, 
    amount: { type: Number, required: true },        
    date:   { type: Date, default: Date.now },
    description: String,
  },
  { timestamps: true }
);

savingSchema.index({ userId: 1, goalId: 1, date: 1 });

export default mongoose.model("Saving", savingSchema);
