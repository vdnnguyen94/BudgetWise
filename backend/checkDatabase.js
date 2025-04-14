import mongoose from 'mongoose';

const mongoURI = "mongodb+srv://syedarimmsha21:FF9SmmtFNFguLNQA@income.xqdk.mongodb.net/BudgetWiseIncomeDB?retryWrites=true&w=majority"


// OR use this const mongoURI = "mongodb+srv://ypate116:6duz2JghaKygxJMc@cluster0.k2rtz.mongodb.net/budget?retryWrites=true&w=majority"; // Replace with your connection string

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

 
    // Define models
    const Budget = mongoose.model("Budget", new mongoose.Schema({}));
    const Expense = mongoose.model("Expense", new mongoose.Schema({}));
    const Bill = mongoose.model("Bill", new mongoose.Schema({}));
    // Delete all budgets & expenses
    await Budget.deleteMany({});
    await Expense.deleteMany({});
    await Bill.deleteMany({});
 
    console.log("🗑️ All budgets, bills and expenses have been deleted!");

    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
