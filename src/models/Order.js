const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    address: { type: String },
    pincode: { type: String },
    paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);


