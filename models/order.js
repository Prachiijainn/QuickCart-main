import mongoose from "mongoose";
import Address from "./address";


const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "user",
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product", required: true,
        
        quantity: {
            type: Number,
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
        },
    }
    ],
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "order placed",
    },
    date: {
        type: Number,
        required: true,
    },
});

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;
