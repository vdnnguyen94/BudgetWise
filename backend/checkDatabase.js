import mongoose from 'mongoose';

const mongoURI = "mongodb://127.0.0.1:27017/BudgetWiseIncomeDB";

//const mongoURI = "mongodb+srv://ypate116:6duz2JghaKygxJMc@cluster0.k2rtz.mongodb.net/budget?retryWrites=true&w=majority"; // Replace with your connection string

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    // // Define the Budget & Expense schemas
    // const Budget = mongoose.model("Budget", new mongoose.Schema({ userId: String, totalBudget: Number }));
    // const Expense = mongoose.model("Expense", new mongoose.Schema({ userId: String, amount: Number }));

    // // Query for any existing Budget and Expenses
    // const budgetExists = await Budget.exists({});
    // const expenseExists = await Expense.exists({});

    // console.log("📌 Budget Exists:", budgetExists ? "Yes" : "No");
    // console.log("📌 Expense Exists:", expenseExists ? "Yes" : "No");


    // mongoose.connection.close();

    // const Budget = mongoose.model("Budget", new mongoose.Schema({ userId: String, totalBudget: Number, categories: Array }));
    // const Expense = mongoose.model("Expense", new mongoose.Schema({ userId: String, amount: Number, category: String, date: Date }));

    // // Fetch first 5 budgets and expenses
    // const budgets = await Budget.find().limit(5);
    // const expenses = await Expense.find().limit(5);

    // console.log("📊 Budgets:", budgets);
    // console.log("📊 Expenses:", expenses);

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
