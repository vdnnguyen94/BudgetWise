import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './AIChat.css';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const messagesEndRef = useRef(null);

  // Sample questions
  const sampleQuestions = [
    "How much did I spend last month?",
    "What's my biggest expense category?",
    "Am I saving enough money?",
    "Show me my income vs expenses",
    "Give me tips to save more money"
  ];

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: "👋 Hi! I'm your AI financial assistant. Ask me anything about your finances!",
        timestamp: new Date()
      }
    ]);

    // Fetch financial summary for context
    fetchSummary();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/chat/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          role: 'assistant',
          content: data.aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        toast.error(data.error || 'Failed to get response');
        // Add error message to chat
        const errorMessage = {
          role: 'assistant',
          content: "I'm sorry, I couldn't process that request. Please try again.",
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSampleQuestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How can I help you with your finances?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="ai-chat-container" style={{ marginTop: '80px', paddingTop: '20px' }}>
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1 className="chat-title">🤖 AI Financial Assistant</h1>
          <p className="chat-subtitle">Ask me anything about your finances</p>
        </div>
        <button onClick={clearChat} className="clear-chat-btn">
          Clear Chat
        </button>
      </div>

      {/* Financial Summary Card */}
      {summary && (
        <div className="summary-card">
          <h3>📊 Your Financial Overview</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Income:</span>
              <span className="summary-value income">${summary.totalIncome.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Expenses:</span>
              <span className="summary-value expense">${summary.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Balance:</span>
              <span className={`summary-value ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                ${summary.netBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
          >
            <div className="message-avatar">
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Questions */}
      {messages.length <= 1 && (
        <div className="sample-questions">
          <p className="sample-title">Try asking:</p>
          <div className="sample-buttons">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestion(question)}
                className="sample-question-btn"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about your finances... (Press Enter to send)"
          className="chat-input"
          // @ts-ignore
          rows="2"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </form>

      {/* Help Text */}
      <div className="chat-help">
        <p>💡 <strong>Tip:</strong> I can help you analyze spending, track budgets, and give personalized financial advice!</p>
      </div>
    </div>
  );
};

export default AIChat;