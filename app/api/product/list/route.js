import connectDB from "../../../../config/db";
import authSeller from "../../../../lib/authSeller";
import Product from "../../../../models/product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
       

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