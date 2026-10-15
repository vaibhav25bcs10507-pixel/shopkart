const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const validateProductId = require('../middlewares/validateProductId.middleware');

// Every cart route requires a logged-in customer
router.use(authMiddleware);

router.get('/', getCart);
router.post('/:productId', validateProductId, addToCart);
router.patch('/:productId', validateProductId, updateCartQuantity);
router.delete('/:productId', validateProductId, removeFromCart);

module.exports = router;
