import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  description: { type: String },

  alertPercentages: { type: [Number], default: [25, 50, 75, 100] },
  alertBeforeDays: { type: Number, default: 7 }, 
  alertedPercents: { type: [Number], default: [] },
  lastDeadlineAlertDate: { type: Date, default: null },
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
