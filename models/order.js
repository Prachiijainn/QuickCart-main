import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "user",
    },
    items: [orderItemSchema],
    amount: {
        type: Number,
        required: true,
    },
    address: {
        fullName: String,
        phoneNumber: String,
        pincode: String,
        area: String,
        city: String,
        state: String,
        userId: String
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
