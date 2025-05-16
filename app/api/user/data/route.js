// File: /app/api/user/data/route.js
import connectDB from "../../../../config/db";
import User from "../../../../models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("Auth userId:", userId); // Debug log

    if (!userId) {
      console.log("No userId found in auth"); // Debug log
      return NextResponse.json(
        { success: false, message: "Unauthorized - No user ID found" },
        { status: 401 }
      );
    }

    await connectDB(); // Make sure the DB is connected before querying

    // Debug: Log all users in database
    const allUsers = await User.find({});
    console.log("All users in DB:", allUsers);

    // Query the user based on Clerk's user ID (_id)
    const user = await User.findOne({ _id: userId });
    console.log("Found user:", user); // Debug log

    if (!user) {
      // If user not found, create a new user document
      console.log("User not found, creating new user..."); // Debug log
      const newUser = await User.create({
        _id: userId,
        name: "New User", // You might want to get this from Clerk
        email: "user@example.com", // You might want to get this from Clerk
        imageUrl: "", // You might want to get this from Clerk
        cartItems: {}
      });
      console.log("Created new user:", newUser); // Debug log
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in /api/user/data:", error); // More detailed error logging
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal Server Error",
        error: error.toString() // Include error details
      },
      { status: 500 }
    );
  }
}
