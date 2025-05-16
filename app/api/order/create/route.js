import Product from "@/models/product";
import User from "@/models/user";
import Order from "@/models/order";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }
        
        const { items, address } = await request.json();
        
        if (!address || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: "Invalid order data - address and items are required" },
                { status: 400 }
            );
        }

        await connectDB();
        
        // Calculate total amount
        let amount = 0;
        
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                amount += product.offerPrice * item.quantity;
            } else {
                console.error(`Product not found: ${item.product}`);
            }
        }
        
        // Add 2% tax or service fee
        const totalAmount = amount + Math.floor(amount * 0.02);
        
        console.log("Creating order directly in MongoDB");
        
        // Create order directly in the database
        const newOrder = await Order.create({
            userId,
            items,
            amount: totalAmount,
            address,
            date: Date.now()
        });
        
        console.log("Order created successfully:", newOrder._id);
        
        // Enhanced Inngest event sending for automatic processing
        try {
            const eventData = {
                orderId: newOrder._id.toString(),
                userId,
                itemCount: items.length,
                orderTotal: totalAmount,
                orderDate: newOrder.date,
                status: "new"
            };
            
            console.log("Sending order event to Inngest:", eventData);
            
            // Send the event directly to trigger automatic processing
            const inngestResult = await inngest.send({
                name: "order/created",
                data: eventData
            });
            
            console.log("Inngest event sent successfully, ID:", inngestResult?.id || "unknown");
        } catch (inngestError) {
            console.error("Failed to send Inngest event - but continuing with order processing");
            console.error("Error message:", inngestError.message);
        }
        
        // Clear user cart
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.cartItems = {};
            await user.save();
            console.log("User cart cleared");
        }

        return NextResponse.json({ 
            success: true, 
            message: "Order created successfully", 
            orderAmount: totalAmount,
            orderId: newOrder._id
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to create order" 
        }, { status: 500 });
    }
}
