import connectDB from "@/config/db";
import Address from "@/models/address";
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
        const addresses = await Address.find({ userId });

        if (!addresses || addresses.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No addresses found for this user" 
            });
        }

        return NextResponse.json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error("Error fetching addresses:", error);
        return NextResponse.json({
            success: false, 
            message: error.message || "Failed to fetch addresses"
        }, 
        { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No user ID found" },
                { status: 401 }
            );
        }
        
        const { address } = await request.json();
        
        if (!address) {
            return NextResponse.json(
                { success: false, message: "No address provided" },
                { status: 400 }
            );
        }

        await connectDB();
        const newAddress = await Address.create({...address, userId});

        return NextResponse.json({
            success: true,
            message: "Address added successfully",
            address: newAddress
        });
        
    } catch (error) {
        console.error("Error adding address:", error);
        return NextResponse.json({
            success: false, 
            message: error.message || "Failed to add address"
        }, 
        { status: 500 });
    }
} 