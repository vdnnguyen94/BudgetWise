import Bill from "../models/bill.js";
import BudgetCategory from '../models/BudgetCategory.js';

// 📌 Create Bill
export const createBill = async (req, res) => {
    try {
        const { categoryId, amount, description, date } = req.body; // Get date from the request body

        // // Ensure the date is valid
        // if (new Date(date) > new Date()) {
        //     return res.status(400).json({ message: "Bill date cannot be in the future." });
        // }

        const category = await BudgetCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: "Invalid category ID." });
        }

        const bill = new Bill({
            userId: req.params.userId,
            categoryId,
            amount,
            description,
            date
        });
        await bill.save();

        res.status(201).json(bill);  // Return the created bill
    } catch (error) {
        res.status(500).json({ message: "Error creating bill", error: error.message });
    }
};;

// 📌 Get All Bills for a User
export const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.params.userId }).populate('categoryId');;
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills", error: error.message });
    }
};

// 📌 Get Single Bill
export const getBill = async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.billId, userId: req.params.userId });
        if (!bill) return res.status(404).json({ message: "Bill not found" });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bill", error: error.message });
    }
};

// In billController.js
export const updateBill = async (req, res) => {
    try {
        const { billId, userId } = req.params;
        const { category, amount, description, date } = req.body;

        // // Ensure the date is valid
        // if (new Date(date) > new Date()) {
        //     return res.status(400).json({ message: "Bill date cannot be in the future." });
        // }

        const updatedBill = await Bill.findOneAndUpdate(
            { _id: billId, userId: userId },
            { category, amount, description, date },  // Update with the new date
            { new: true }  // This ensures the updated data is returned
        );

        if (!updatedBill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.json(updatedBill);  // Return the updated bill
    } catch (error) {
        res.status(500).json({ message: "Error updating bill", error: error.message });
    }
};



// 📌 Delete Bill
export const deleteBill = async (req, res) => {
    try {
        await Bill.findOneAndDelete({ _id: req.params.billId, userId: req.params.userId });
        res.json({ message: "Bill deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting bill", error: error.message });
    }
};
