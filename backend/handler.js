import serverless from 'serverless-http';
import appJs from './app.js';


export const app = serverless(appJs);
