import serverless from 'serverless-http';
import app from './app.js';


export const http = serverless(app);