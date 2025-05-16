import connectDB from "../../../../config/db";
import Product from "../../../../models/product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get all products
    const products = await Product.find({});
    
    return NextResponse.json({
      success: true,
      message: 'Products retrieved successfully',
      products
    });
  } catch (error) {
    console.error('Error in product list API:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
