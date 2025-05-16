import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    try {
        // Return cached connection if already connected
        if (cached.conn) {
            console.log("Using existing database connection");
            return cached.conn;
        }

        // Check if MongoDB URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        const connectionString = `${process.env.MONGODB_URI}/quickcart`;
        console.log(`Connecting to MongoDB at: ${connectionString}`);

        // Create a new connection if one doesn't exist
        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
                serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            };

            cached.promise = mongoose
                .connect(connectionString, opts)
                .then((mongoose) => {
                    console.log("MongoDB connection successful");
                    return mongoose;
                })
                .catch((error) => {
                    console.error("MongoDB connection error:", error);
                    cached.promise = null; // Reset promise on error
                    throw error;
                });
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("Failed to connect to database:", error);
        throw error; // Re-throw for caller handling
    }
}

export default connectDB;