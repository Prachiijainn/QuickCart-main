import connectDB from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        // Validate user authentication
        if (!userId) {
            console.error("No userId in auth context");
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }

        // Get cart data from request
        const { cartData } = await request.json();
        
        // Validate cart data
        if (!cartData) {
            console.error("No cart data provided");
            return NextResponse.json(
                { success: false, message: "No cart data provided" },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();
        
        // Find user and update cart
        const user = await User.findById(userId);
        
        // Check if user exists
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Log the current and new cart items for debugging
        console.log("Current cart items:", user.cartItems);
        console.log("New cart items:", cartData);
        
        // Update cart items
        user.cartItems = cartData;
        await user.save();
        
        console.log("Cart updated successfully");
        
        return NextResponse.json({
            success: true,
            message: "Cart updated successfully",
            updatedCart: user.cartItems
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