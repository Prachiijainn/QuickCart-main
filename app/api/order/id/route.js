import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/order";

export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const { id } = params;
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        await connectDB();
        
        // Find the specific order and populate product information
        const order = await Order.findById(id)
            .populate('items.product');
        
        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }
        
        // Security check - ensure the order belongs to the authenticated user
        if (order.userId !== userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - You don't have permission to view this order" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to fetch order details"
        }, 
        { status: 500 });
    }
} 