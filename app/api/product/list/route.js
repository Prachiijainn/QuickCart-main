import connectDB from "../../../../config/db";
import Product from "../../../../models/product";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Check that env variable is available
console.log("CLERK_SECRET_KEY from env:", process.env.CLERK_SECRET_KEY);

export async function GET(request) {
    const { userId } = getAuth(request);
    console.log("userId from Clerk auth:", userId);

    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("Connected!");

        let products;

        if (userId) {
            console.log("Fetching Clerk user...");
            const client = await clerkClient();
        const user =await client.users.getUser(userId)
            console.log("Fetched user:", {
                id: user.id,
                email: user.emailAddresses?.[0]?.emailAddress,
                role: user?.publicMetadata?.role || user?.privateMetadata?.role,
            });

            const isSeller = user?.publicMetadata?.role === "seller" || user?.privateMetadata?.role === "seller";

            if (isSeller) {
                console.log("User is a seller. Fetching their products...");
                products = await Product.find({ userId });
            } else {
                console.log("User is not a seller. Fetching all products...");
                products = await Product.find({});
            }
        } else {
            console.log("No userId found. Fetching all products for guest user...");
            products = await Product.find({});
        }

        console.log("Fetched products:", products.length);

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("Server error in /api/product/list:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: error.message,
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
