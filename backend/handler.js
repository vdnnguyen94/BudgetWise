// handler.js
import serverless from 'serverless-http';
import appJs from './app.js';
import connectToDatabase from './db.js'; // <-- Import the helper

const serverlessApp = serverless(appJs);

export const app = async (event, context) => {

  await connectToDatabase();
  
  return await serverlessApp(event, context);
};