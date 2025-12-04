import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true, // e.g. "BUDGET_OVERALL_EXCEEDED"
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "read", "dismissed"],
      default: "new",
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },

    // Optional context
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetCategory",
      default: null,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    limit: {
      type: Number,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },

    // For future “remind me later” logic if you want
    snoozeUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", AlertSchema);
