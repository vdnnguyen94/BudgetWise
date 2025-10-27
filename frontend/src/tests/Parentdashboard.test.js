import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ParentDashboard from '../pages/ParentDashboard';
import parentService from '../services/parentService';
import { toast } from 'react-toastify';

// Mock the services and toast
jest.mock('../services/parentService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Helper function to render with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ParentDashboard Component - Simple Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'userRole') return 'Parent';
      return null;
    });
  });

  // ========================================
  // TEST 1: Component Renders Successfully
  // ========================================
  it('should render the parent dashboard', async () => {
    parentService.getChildren.mockResolvedValue({ children: [] });

    renderWithRouter(<ParentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Manage Children Accounts')).toBeInTheDocument();
      expect(screen.getByText('Add Child Account')).toBeInTheDocument();
    });
  });

  // ========================================
  // TEST 2: Display Children List
  // ========================================
  it('should display list of children when they exist', async () => {
    const mockChildren = [
      {
        _id: 'child1',
        username: 'Alice',
        email: 'alice@example.com',
        role: 'Child',
        allowance: 20
      },
      {
        _id: 'child2',
        username: 'Bob',
        email: 'bob@example.com',
        role: 'Child',
        allowance: 15
      }
    ];

    parentService.getChildren.mockResolvedValue({ children: mockChildren });

    renderWithRouter(<ParentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });

  // ========================================
  // TEST 3: Remove Child Function
  // ========================================
  it('should remove child when confirmed', async () => {
    const mockChildren = [{
      _id: 'child1',
      username: 'Alice',
      email: 'alice@example.com',
      role: 'Child',
      allowance: 20
    }];

    parentService.getChildren
      .mockResolvedValueOnce({ children: mockChildren })
      .mockResolvedValueOnce({ children: [] });

    parentService.removeChild.mockResolvedValue({
      message: 'Child account removed successfully'
    });

    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    renderWithRouter(<ParentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(parentService.removeChild).toHaveBeenCalledWith('child1');
      expect(toast.success).toHaveBeenCalledWith('Child account removed successfully!');
    });
  });

  // ========================================
  // TEST 4: Empty State Display
  // ========================================
  it('should display empty state when no children exist', async () => {
    parentService.getChildren.mockResolvedValue({ children: [] });

    renderWithRouter(<ParentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No child accounts yet.')).toBeInTheDocument();
      expect(screen.getByText('Click "Add Child Account" to get started.')).toBeInTheDocument();
    });
  });

  // ========================================
  // TEST 5: Error Handling
  // ========================================
  it('should show error toast when fetching children fails', async () => {
    parentService.getChildren.mockRejectedValue(new Error('Failed to load children'));

    renderWithRouter(<ParentDashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load children');
    });
  });
});