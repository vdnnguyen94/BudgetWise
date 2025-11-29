import { http } from '@google-cloud/functions-framework';
import app from './app.js'; 
import connectToDatabase from './db.js'; // Reuse your existing DB logic

const startServer = async (req, res) => {
  // Ensure DB is connected before processing any request
  await connectToDatabase();
  
  // Hand off to Express
  app(req, res);
};

// Register the function
http('api', startServer);