import loan from "../models/loan.js";

// Create or Update A loan
export const createOrUpdateLoan = async (req, res) => {
    try {
        const { amount, interestRate, loanTerm, loanType } = req.body;

        const loanExists = await loan.findOne({ loanType });

        if (loanExists) {
            loanExists.amount = amount;
            loanExists.interestRate = interestRate;
            loanExists.loanTerm = loanTerm;

            const updatedLoan = await loanExists.save();
            res.status(201).json(updatedLoan);
        } else {
            const newLoan = await loan.create({
                amount,
                interestRate,
                loanTerm,
                loanType,
            });

            res.status(201).json(newLoan);
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get User Loans 
export const getUserLoans = async (req, res) => {
    try {
        const loans = await loan.find({ userId: req.user._id });

        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete loans 
export const deleteLoan = async (req, res) => {
    try {
        const loanId = req.params.loanId;

        const deletedLoan = await loan.findByIdAndDelete(loanId);
        if(!deletedLoan) {
            return res.status(404).json({ message: "Loan not found" });
        }   
        
        res.status(200).json({ message: "Loan deleted successfully" });
    } catch (error) {
        console.error("Error Deleting Loan:", error);
        res.status(500).json({ message: "Server Error" });
    }
}; 

// Function help calculate the monthly payment 
const calculateMonthlyPayment = (amount, interestRate, loanTerm) => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;
    const principal = parseFloat(amount);

    if (monthlyInterestRate === 0) {
        return principal / numberOfPayments;
    }

    const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    return monthlyPayment;
};