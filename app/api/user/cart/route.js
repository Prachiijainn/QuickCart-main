import connectDB from "../../../../config/db";
import User from "../../../../models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No user ID found" },
        { status: 401 }
      );
    }

    // Get cart data from request body
    const { cartItems } = await request.json();
    
    if (!cartItems) {
      return NextResponse.json(
        { success: false, message: "No cart items provided" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update the user's cart items
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { cartItems } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update cart",
        error: error.toString()
      },
      { status: 500 }
    );
  }
} 