import React, { useState, useEffect} from 'react';
import './Loan.css';
import { set } from 'mongoose';

/* This is User Story: Loan Summary - Student Role */ 

const Loan = () => { // Added for user to input data for loan 
    const [loanSummary, setLoanSummary] = useState([]);
    const [loanDetails, setLoanDetails] = useState({
        amount: '',
        interestRate: '',
        term: '',
        status: 'Pending'
    });

    useEffect(() => {
        // going to re-edit to use a database// Want to test function first 
        const tempData = [
            { id: 1, amount: 5000, interestRate: 5, term: 12, status: 'Approved' },
            { id: 2, amount: 10000, interestRate: 4.5, term: 24, status: 'Pending' },
            
        ];
        setLoanSummary(tempData);
    }, []);

    const handleChange = (e) => { 
        const { name, value } = e.target;
        setLoanDetails({ ...loanDetails, [name]: value });  
    }

    const calculateMonthlyPayment = (amount, interestRate, term) => {
        const monthlyInterestRate = interestRate / 100 / 12;
        const numberOfPayments = term;
        const principal = parseFloat(amount);
        
        if (monthlyInterestRate === 0) {
            return principal / numberOfPayments;
        }

        const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

        return monthlyPayment;
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 
        const newLoan = {
            id: loanSummary.length + 1,
            amount: parseFloat(loanDetails.amount) || 0,
            interestRate: parseFloat(loanDetails.interestRate) || 0, 
            term: parseInt(loanDetails.term, 10) || 0,
            status: loanDetails.status,
            monthlyPayment: calculateMonthlyPayment(loanDetails.amount, loanDetails.interestRate, loanDetails.term).toFixed(2)

        };
        setLoanSummary([...loanSummary, newLoan]);
        setLoanDetails({ amount: '', 
                        interestRate: '', 
                        term: '', 
                        status: 'Pending' 
                    });
                };
        const handleDelete = (id) => {
            setLoanSummary(loanSummary.filter(loan => loan.id !== id));
        };

        /*Function to Export Reports - potential reusability across app - 
        it works in a limited capacity 
        This is User Story: Export Reporrts - Student Role */ 
        
        const exportReport = (loanSummary) => { 
            if (!loanSummary || loanSummary.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Loan ID', 'Amount', 'Interest Rate', 'Term', 'Status', 'Monthly Payment'];
            const rows =  loanSummary.map(loan => [
                loan.id, 
                loan.amount, 
                loan.interestRate, 
                loan.term, 
                loan.status, 
                loan.monthlyPayment ?? 'N/A'
            ]);

            let csvContent = headers.join(',') + '\n'; // Add headers to CSV
            rows.forEach(row => {
                csvContent += row.join(',') + '\n'; // Add rows to CSV
            });

            const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'loan-summary.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };


 return (
       <div>
        <h1>Loan Summary</h1>
        <h2>Enter Loan Amount Here</h2>
        <form className="loan-form" onSubmit={handleSubmit}>
            <div>
                <label>Amount:</label>
                <input
                    type="number"
                    name="amount"
                    value={loanDetails.amount}
                    onChange={handleChange}
                    required
                />      
            </div>
            <div>
                <label>Interest Rate:</label>
                <input
                    type="number"
                    step="0.01"
                    name="interestRate"
                    value={loanDetails.interestRate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Term (Months):</label>
                <input
                    type="number"
                    name="term"
                    value={loanDetails.term}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Status:</label>
                <select
                    name="status"
                    value={loanDetails.status}
                    onChange={handleChange}
                    >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                    </select>
            </div>
            <button type="submit">Submit</button>
        </form>
        <h2>Loan Summary</h2>
        <button onClick={() => exportReport(loanSummary)}>Export Report</button> 
        <br />
        <table className="loan-summary-table">
            <thead>
                <tr>
                    <th>Amount</th>
                    <th>Interest Rate</th>
                    <th>Term</th>
                    <th>Status</th>
                    <th>Monthly Payment</th>
                    <th>Remove</th>
                </tr>
            </thead>
            <tbody>
                {loanSummary.map((loan) => (
                    <tr key={loan.id}>
                        <td>{loan.amount}</td>
                        <td>{loan.interestRate}</td>
                        <td>{loan.term}</td>
                        <td>{loan.status}</td>
                        <td>${loan.monthlyPayment}</td>
                        <td>
                            <button onClick={() => handleDelete(loan.id)}>Remove</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

export default Loan;