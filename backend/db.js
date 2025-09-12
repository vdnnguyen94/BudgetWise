// db.js
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  try {
    const db = await mongoose.connect(MONGO_URI, {});
    console.log('MongoDB Connected...');
    console.log(MONGO_URI);
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export default connectToDatabase;