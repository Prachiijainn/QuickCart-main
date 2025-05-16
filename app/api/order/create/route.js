import Product from "@/models/product";
import User from "@/models/user";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";
import connectDB from "@/config/db";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { items, address } = await request.json();
        
        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid data" });
        }

        await connectDB();
        
        //calculate total amount
        let amount = 0;
        
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                amount += product.offerPrice * item.quantity;
            }
        }
        
        const totalAmount = amount + Math.floor(amount * 0.02);
        
        console.log("Sending event to Inngest");
        
        // Send event to Inngest with correct event name
        await inngest.send({
            name: "order/created",
            data: {
                userId,
                items,
                amount: totalAmount,
                address,
                date: Date.now()
            }
        });
        
        console.log("Event sent to Inngest");
        
        //clear user cart
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.cartItems = {};
            await user.save();
        }

        return NextResponse.json({ 
            success: true, 
            message: "Order created successfully", 
            orderAmount: totalAmount 
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to create order" 
        }, { status: 500 });
    }
}
