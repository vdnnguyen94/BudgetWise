import mongoose from "mongoose";

const savingGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },               
    targetAmount: { type: Number, required: true, min: 0.01 },
    targetDate: { type: Date },                             
    description: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

savingGoalSchema.index({ userId: 1, title: 1 }, { unique: true });

export default mongoose.model("SavingGoal", savingGoalSchema);
