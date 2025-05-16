import Product from "@/models/product";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const { userId} = getAuth(request);
        const { items,address } = await request.json();
        if (!address || !items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid data" });
        }

        //calculate total amount
        const amount = items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return acc + product.offerPrice * item.quantity;},0)

            await inngest.send({
                name: "create/order",
                data: {
                    userId,
                    items,
                    amount : amount + Math.floor(amount*0.02),
                    address,
                    date: Date.now()
                }
            })
            //clear user cart

            const user = await User.findById(userId);
            user.cartItems = [];
            await user.save();

            return NextResponse.json({ success: true, message: "Order created successfully" });


    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message });
    }
}
