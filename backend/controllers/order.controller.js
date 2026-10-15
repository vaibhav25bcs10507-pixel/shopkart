const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { getRazorpay, getRazorpayKeys } = require('../config/razorpay');
const { validateShippingAddress } = require('../utils/validators');
const { sendError } = require('../utils/responses');

const SHIPPING_FIELDS = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

// Keep only the known address fields, trimmed. Anything else the client
// sent (including a fake totalAmount) is simply never read.
function pickShippingAddress(address) {
  return Object.fromEntries(
    SHIPPING_FIELDS.map((field) => [field, address[field].trim()])
  );
}

// Razorpay wants the smallest currency unit: rupees x 100 = paise
function toPaise(rupees) {
  return Math.round(rupees * 100);
}

// Loads the LATEST product data for every cart row, re-checks stock, and
// builds the purchase-time snapshot plus the total. The server owns pricing,
// so nothing here comes from the frontend. Returns { error } on any problem.
async function buildOrderSnapshot(cart) {
  const products = await Product.find({
    _id: { $in: cart.map((row) => row.product) }
  });
  const productsById = new Map(products.map((p) => [p._id.toString(), p]));

  const items = [];

  for (const row of cart) {
    const product = productsById.get(row.product.toString());

    if (!product) {
      return { error: 'A product in your cart is no longer available.' };
    }

    if (row.quantity > product.stock) {
      return { error: `Insufficient stock for ${product.name}.` };
    }

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: row.quantity,
      image: product.image
    });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, totalAmount: Math.round(total * 100) / 100 };
}

// Razorpay signs "razorpay_order_id|razorpay_payment_id" with the key secret.
// We rebuild it ourselves with the order id WE stored and compare.
function isValidSignature(razorpayOrderId, paymentId, signature) {
  const { keySecret } = getRazorpayKeys();

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const givenBuffer = Buffer.from(signature);

  // timingSafeEqual needs equal lengths; a wrong length is simply invalid
  return (
    expectedBuffer.length === givenBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, givenBuffer)
  );
}

// POST /orders/create-payment-order
async function createPaymentOrder(req, res, next) {
  try {
    const { shippingAddress } = req.body || {};

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return sendError(res, 400, addressError);
    }

    if (req.user.cart.length === 0) {
      return sendError(res, 400, 'Your cart is empty');
    }

    // Fail early (before saving anything) if the payment keys are missing
    const { keyId } = getRazorpayKeys();

    const snapshot = await buildOrderSnapshot(req.user.cart);
    if (snapshot.error) {
      return sendError(res, 400, snapshot.error);
    }

    // Saved as PENDING_PAYMENT. The cart is NOT touched here.
    const order = await Order.create({
      user: req.user._id,
      items: snapshot.items,
      shippingAddress: pickShippingAddress(shippingAddress),
      totalAmount: snapshot.totalAmount
    });

    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: toPaise(order.totalAmount),
        currency: 'INR',
        receipt: order._id.toString()
      });
    } catch (gatewayError) {
      console.error('Razorpay order creation failed:', gatewayError);
      order.paymentStatus = 'FAILED';
      await order.save();
      return sendError(res, 502, 'Unable to start payment. Please try again.');
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Only the public Key ID is sent. The Key Secret never leaves the server.
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });
  } catch (err) {
    next(err);
  }
}

// POST /orders/verify-payment
async function verifyPayment(req, res, next) {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = req.body || {};

    const detailsAreValid =
      mongoose.isObjectIdOrHexString(shopKartOrderId) &&
      [razorpayOrderId, paymentId, signature].every(
        (value) => typeof value === 'string' && value !== ''
      );

    if (!detailsAreValid) {
      return sendError(res, 400, 'Missing or invalid payment details');
    }

    // Looking up by user too means nobody can verify someone else's order
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Already confirmed (e.g. the request was sent twice): nothing more to do
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order
      });
    }

    // The order id used for the signature is the one we stored, never the browser's
    const signatureOk =
      razorpayOrderId === order.razorpayOrderId &&
      isValidSignature(order.razorpayOrderId, paymentId, signature);

    if (!signatureOk) {
      // Order stays pending and the cart stays untouched
      return sendError(res, 400, 'Invalid payment signature');
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = paymentId;
    await order.save();

    // The cart is cleared only now, after the payment is verified
    req.user.cart = [];
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified. Order placed.',
      order
    });
  } catch (err) {
    next(err);
  }
}

// GET /orders
async function getOrders(req, res, next) {
  try {
    // Unpaid, abandoned checkouts are not real orders, so they are left out
    const orders = await Order.find({
      user: req.user._id,
      status: { $ne: 'PENDING_PAYMENT' }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
}

// GET /orders/:id
async function getOrderById(req, res, next) {
  try {
    // Filtering by user means someone else's order looks exactly like a missing one
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
};
