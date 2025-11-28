import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Income from '../pages/Income';
import incomeService from '../services/incomeService';
import { toast } from 'react-toastify';

// Mock services (match your component methods)
jest.mock('../services/incomeService', () => ({
  getIncome: jest.fn(),
  createIncome: jest.fn(),  // ← fix: matches handleAddIncome
  updateIncome: jest.fn(),
  deleteIncome: jest.fn(),
}));
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/React Router/.test(args[0])) return;
    originalError(...args);
  };
});
afterAll(() => (console.error = originalError));

const renderWithRouter = (component) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

describe('Income Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn((k) =>
      k === 'userId' ? 'parent123' : null
    );
  });

  // 1. Load data test
  it('should render income page and load data', async () => {
    incomeService.getIncome.mockResolvedValue([
      { _id: '1', source: 'Job', amount: 4500, date: '2025-10-31', recurrence: 'Monthly' },
      { _id: '2', source: 'Freelance', amount: 800, date: '2025-11-04', recurrence: 'One-Time' },
    ]);

    renderWithRouter(<Income />);
    await waitFor(() => {
      expect(screen.getByText('Your Income History')).toBeInTheDocument();
      expect(screen.getByText('Job')).toBeInTheDocument();
      expect(screen.getByText('Freelance')).toBeInTheDocument();
    });
  });

  // 2. Add new income
  it('should add a new income successfully', async () => {
    incomeService.getIncome.mockResolvedValue([]);
    incomeService.createIncome.mockResolvedValue({ message: 'Income added successfully' });

    renderWithRouter(<Income />);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Salary' } }); 
    fireEvent.change(screen.getByPlaceholderText(/amount/i), { target: { value: '4500' } });
    fireEvent.change(screen.getByPlaceholderText(/description/i), { target: { value: 'November Salary' } });
    fireEvent.change(selects[1], { target: { value: 'monthly' } }); 
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2025-11-01' } });

    fireEvent.click(screen.getByText(/Add Income/i));

    await waitFor(() => {
      expect(incomeService.createIncome).toHaveBeenCalledWith(
        'parent123',
        expect.objectContaining({
          source: 'Salary',
          amount: 4500,
          date: '2025-11-01',
        })
      );
    });
  });

  //3. Edit income
  it('should edit an existing income entry', async () => {
    const mockIncomes = [
      { _id: '1', source: 'Job', amount: 4500, date: '2025-10-30', recurrence: 'Monthly' },
    ];
    incomeService.getIncome.mockResolvedValue(mockIncomes);
    incomeService.updateIncome.mockResolvedValue({ message: 'Income updated successfully' });

    renderWithRouter(<Income />);
    await waitFor(() => expect(screen.getByText('Job')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Edit/i));
    const amountInput = screen.getByDisplayValue('4500');
    fireEvent.change(amountInput, { target: { value: '4800' } });
    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(incomeService.updateIncome).toHaveBeenCalledWith(
        'parent123',
        '1',
        expect.objectContaining({ amount: 4800 })
      );
    });
  });

  //4. Delete income
  it('should delete an income entry', async () => {
    const mockIncomes = [
      { _id: '1', source: 'Job', amount: 4500, date: '2025-10-31', recurrence: 'Monthly' },
    ];
    incomeService.getIncome
      .mockResolvedValueOnce(mockIncomes)
      .mockResolvedValueOnce([]);

    incomeService.deleteIncome.mockResolvedValue({ message: 'Income deleted successfully' });
    window.confirm = jest.fn(() => true);

    renderWithRouter(<Income />);
    await waitFor(() => expect(screen.getByText('Job')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Delete/i));

    await waitFor(() => {
      expect(incomeService.deleteIncome).toHaveBeenCalledWith('parent123', '1');
      expect(toast.success).toHaveBeenCalledWith('Income deleted successfully');
    });
  });

  //5. Empty state
  it('should display empty state message when no incomes exist', async () => {
    incomeService.getIncome.mockResolvedValue([]);
    renderWithRouter(<Income />);
    await waitFor(() =>
      expect(screen.getByText('No income records found.')).toBeInTheDocument()
    );
  });

  //6. Error handling
  it('should display error message when fetching income fails', async () => {
    incomeService.getIncome.mockRejectedValue(new Error('Failed to load income'));
    renderWithRouter(<Income />);
    await waitFor(() =>
      expect(screen.getByText('Failed to fetch income.')).toBeInTheDocument()
    );
  });
});
