import connectDB from "@/config/db";
import Order from "@/models/order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }

        await connectDB();
        
        // Find all orders for this user, sorted by date (newest first)
        const orders = await Order.find({ userId })
            .sort({ date: -1 })
            .populate('items.product'); // Populate product information

        if (!orders || orders.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No orders found for this user" 
            });
        }

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json({
            success: false, 
            message: error.message || "Failed to fetch orders"
        }, 
        { status: 500 });
    }
} 