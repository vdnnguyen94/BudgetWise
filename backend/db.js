import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// Maintain a cached connection
let cachedDb = null;

// Function to connect to the database
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {});
    console.log('MongoDB Connected...');
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if cannot connect
  }
}

export default connectToDatabase;