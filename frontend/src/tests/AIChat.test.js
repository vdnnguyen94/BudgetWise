// frontend/src/tests/AIChat.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AIChat from '../pages/AIChat';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage properly
const mockLocalStorage = (() => {
  let store = { token: 'mock-token' };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    // @ts-ignore
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Suppress console errors and warnings
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  console.error = (...args) => {
    if (/React Router/.test(args[0]) || /Error sending message/.test(args[0])) return;
    originalError(...args);
  };
  console.warn = (...args) => {
    if (/React Router/.test(args[0])) return;
    originalWarn(...args);
  };
});
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

const renderWithRouter = (component) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

describe('AIChat Component Tests', () => {
  const mockSummary = {
    summary: {
      totalIncome: 5000,
      totalExpenses: 3000,
      netBalance: 2000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.fetch.mockClear();
    mockLocalStorage.setItem('token', 'mock-token');
  });

  it('should render AI Chat component', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary
    });

    renderWithRouter(<AIChat />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Financial Assistant/i })).toBeInTheDocument();
    });
  });

  it('should display sample questions', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary
    });

    renderWithRouter(<AIChat />);

    await waitFor(() => {
      expect(screen.getByText(/How much did I spend last month?/i)).toBeInTheDocument();
      expect(screen.getByText(/What's my biggest expense category?/i)).toBeInTheDocument();
    });
  });

  it('should fetch financial summary on mount', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary
    });

    renderWithRouter(<AIChat />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/summary'),
        expect.any(Object)
      );
    });
  });

  it('should send message and receive AI response', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ aiResponse: 'You spent $3000 last month.' })
      });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByPlaceholderText(/Ask me about your finances/i));

    const input = screen.getByPlaceholderText(/Ask me about your finances/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'How much did I spend?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/message'),
        expect.any(Object)
      );
    });
  });

  it('should display AI response in chat', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ aiResponse: 'You spent $3000 last month.' })
      });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByPlaceholderText(/Ask me about your finances/i));

    const input = screen.getByPlaceholderText(/Ask me about your finances/i);
    fireEvent.change(input, { target: { value: 'How much did I spend?' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('You spent $3000 last month.')).toBeInTheDocument();
    });
  });

  it('should not send empty messages', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSummary });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByRole('button', { name: /send/i }));

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should send message when sample question is clicked', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ aiResponse: 'Response' })
      });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByText(/How much did I spend last month?/i));

    const sampleQuestion = screen.getByText(/How much did I spend last month?/i);
    fireEvent.click(sampleQuestion);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/message'),
        expect.any(Object)
      );
    });
  });

  it('should show error toast when API call fails', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByPlaceholderText(/Ask me about your finances/i));

    const input = screen.getByPlaceholderText(/Ask me about your finances/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should handle network errors gracefully', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByPlaceholderText(/Ask me about your finances/i));

    const input = screen.getByPlaceholderText(/Ask me about your finances/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should clear input field after sending message', async () => {
    global.fetch
      // @ts-ignore
      .mockResolvedValueOnce({ ok: true, json: async () => mockSummary })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ aiResponse: 'Response' })
      });

    renderWithRouter(<AIChat />);

    await waitFor(() => screen.getByPlaceholderText(/Ask me about your finances/i));

    const input = screen.getByPlaceholderText(/Ask me about your finances/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      // @ts-ignore
      expect(input.value).toBe('');
    });
  });
});