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
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://budgetwise-yash.netlify.app'],
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/budget", budgetCategoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
