
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Get financial insights using Hugging Face AI
 */
export const getFinancialInsights = async (userMessage, financialData) => {
  try {
    const {
      totalExpenses,
      totalIncome,
      expensesByCategory,
      recentExpenses,
      budget,
      savingsGoals,
      monthlyAverage
    } = financialData;

    const systemContext = `You are a helpful financial advisor for BudgetWise app.

USER'S FINANCIAL DATA:
- Income: $${totalIncome.toFixed(2)}
- Expenses: $${totalExpenses.toFixed(2)}
- Balance: $${(totalIncome - totalExpenses).toFixed(2)}
- Budget: $${budget || 'Not set'}
- Monthly Average: $${monthlyAverage.toFixed(2)}

EXPENSES BY CATEGORY:
${Object.entries(expensesByCategory)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

RECENT EXPENSES:
${recentExpenses.slice(0, 5).map(e => `- ${e.description}: $${e.amount.toFixed(2)}`).join('\n')}

Provide clear, helpful advice in 2-3 paragraphs.`;

    // NEW — HUGGINGFACE CHAT COMPLETION
    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);

    if (error.message?.includes('401') || error.message?.includes('Invalid token')) {
      throw new Error('Invalid API token. Please check your HUGGINGFACE_API_KEY in .env');
    }

    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }

    throw new Error('Failed to get AI insights. Please try again.');
  }
};

/**
 * Get financial tips
 */
export const getFinancialTips = async (financialData) => {
  try {
    const { totalExpenses, totalIncome, expensesByCategory } = financialData;

    const highestCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    const prompt = `You are a financial advisor. Based on:
- Income: $${totalIncome}
- Expenses: $${totalExpenses}
- Highest spending: ${highestCategory[0]} ($${highestCategory[1]})

Give 3 specific tips to improve their finances.`;

    // FIXED TO chatCompletion
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: "You are a helpful financial advisor." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error getting tips:', error);
    throw new Error('Failed to get tips. Please try again.');
  }
};

/**
 * Test API connection
 */
export const testGeminiConnection = async () => {
  try {
    console.log('Testing Hugging Face API...');

    // Test using chatCompletion
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "user", content: "Say hello!" }
      ]
    });

    console.log('✅ Hugging Face works!');
    console.log('   Response:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ Hugging Face failed:', error.message);
    return false;
  }
};

export default {
  getFinancialInsights,
  getFinancialTips,
  testGeminiConnection
};
