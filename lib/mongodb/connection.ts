import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not set in .env');
}

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, maxPoolSize: 10 };
    cached.promise = mongoose.connect(MONGODB_URI, opts).catch((err) => {
      console.error('Mongo Connection Error:', err);
      throw err;
    });
  }
  try {
    cached.conn = await cached.promise;
    console.log('Mongo Connected');
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export default connectDB;
