import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import expenseRoutes from "./routes/expenseRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import budgetCategoryRoutes from "./routes/budgetCategoryRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import goalRoutes from './routes/goalRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import savingRoutes from "./routes/savingRoutes.js";
import savingGoalRoutes from "./routes/savingGoalRoutes.js";
import parentRoutes from './routes/parentRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173', 'https://budgetwise-mu.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(cookieParser());

// --- Root route for testing ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'BudgetWise Server is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/budget", budgetCategoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/saving-goals", savingGoalRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/notifications", notificationRoutes);

//  Database Connection
// mongoose.connect(process.env.MONGO_URI, {
// }).then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// if (process.env.IS_OFFLINE) {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`);
//   });
// }

export default app;