const mongoose = require('mongoose');

const requiredText = { type: String, required: true, trim: true };

// A snapshot of the product at purchase time. Name, price and image are
// copied on purpose, so an old order never changes when the Product does.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: requiredText,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: requiredText,
      phone: requiredText,
      addressLine1: requiredText,
      city: requiredText,
      state: requiredText,
      pincode: requiredText
    },

    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING'
    },

    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT'
    },

    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  { timestamps: true }
);

// "My Orders" always asks for one user's orders, newest first
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
