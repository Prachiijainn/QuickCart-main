import connectDB from "../../../../config/db";
import authSeller from "../../../../lib/authSeller";
import Product from "../../../../models/product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request)

        // Check if user is a seller
        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'not authorized'}, { status: 403 })
        }

        await connectDB()

        // Get products for this seller only
        const products = await Product.find({ userId })
        
        return NextResponse.json({ 
            success: true, 
            message: 'Products retrieved successfully',
            products
        });
    } catch (error) {
        console.error('Error in seller-list API:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
} 