const express = require('express');
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
} = require('../controllers/order.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

// Every order route requires a logged-in customer
router.use(authMiddleware);

router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getOrders);
router.get('/:id', validateObjectId('id', 'order ID'), getOrderById);

module.exports = router;
