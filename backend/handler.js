import serverless from 'serverless-http';
import appJs from './app.js';
import connectToDatabase from './db.js'; // Import the helper

const serverlessApp = serverless(appJs);

export const app = async (event, context) => {
  // Make sure to wait for the database connection
  await connectToDatabase();
  
  // Now, handle the request with the Express app
  return await serverlessApp(event, context);
};