// handler.js
import serverless from 'serverless-http';
import appJs from './app.js';
import connectToDatabase from './db.js'; // <-- Import the helper

const serverlessApp = serverless(appJs);

export const app = async (event, context) => {
  // Wait for the DB connection before running the app
  await connectToDatabase();
  return await serverlessApp(event, context);
};