import connectDB from "@/config/db";
import Order from "@/models/order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }
        
        // Get request data
        const { orderId, status } = await request.json();
        
        // Validate request
        if (!orderId || !status) {
            return NextResponse.json(
                { success: false, message: "Order ID and status are required" },
                { status: 400 }
            );
        }
        
        // Connect to database
        await connectDB();
        
        // Find the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }
        
        // Update status directly
        const previousStatus = order.status;
        order.status = status;
        await order.save();
        
        console.log(`Updated order ${orderId} status from "${previousStatus}" to "${status}"`);
        
        // Send event to Inngest
        try {
            console.log("Sending order status update event to Inngest");
            await inngest.send({
                name: "order/status.updated",
                data: {
                    orderId,
                    status,
                    userId,
                    previousStatus,
                    updatedAt: Date.now()
                }
            });
            console.log("Inngest status update event sent successfully");
        } catch (inngestError) {
            // Log but don't fail the request if Inngest event fails
            console.error("Failed to send Inngest status update event:", inngestError);
        }
        
        return NextResponse.json({
            success: true,
            message: `Order status updated from "${previousStatus}" to "${status}"`,
            order: {
                _id: order._id,
                status: order.status
            }
        });
        
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to update order status"
        }, { status: 500 });
    }
} 