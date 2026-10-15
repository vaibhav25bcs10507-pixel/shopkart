const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const { sendProductNotFound } = require('../utils/responses');

const PRODUCT_FIELDS = 'name price image stock';

// Shared shape for every response that returns the cart, so the frontend
// always gets populated product info alongside the quantity.
async function sendCart(req, res, status) {
  await req.user.populate({
    path: 'cart.product',
    select: PRODUCT_FIELDS
  });

  return res.status(status).json({
    success: true,
    message: 'Cart updated',
    cart: req.user.cart
  });
}

// POST /cart/:productId
// Not in the cart yet -> add it with quantity 1.
// Already in the cart -> increase quantity by 1, as long as stock allows it.
async function addToCart(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return sendProductNotFound(res);
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      req.user.cart.push({ product: productId, quantity: 1 });
    }

    await req.user.save();

    return sendCart(req, res, 201);
  } catch (err) {
    next(err);
  }
}

// GET /cart
async function getCart(req, res, next) {
  try {
    return sendCart(req, res, 200);
  } catch (err) {
    next(err);
  }
}

// PATCH /cart/:productId  { quantity }
async function updateCartQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a number of at least 1'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendProductNotFound(res);
    }

    const item = req.user.cart.find(
      (entry) => entry.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    item.quantity = quantity;
    await req.user.save();

    return sendCart(req, res, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /cart/:productId
async function removeFromCart(req, res, next) {
  try {
    const { productId } = req.params;

    const lengthBefore = req.user.cart.length;
    req.user.cart = req.user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (req.user.cart.length === lengthBefore) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    await req.user.save();

    return sendCart(req, res, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
