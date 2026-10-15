const express = require('express');
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  getWishlistCount,
  removeFromWishlist,
  toggleWishlist
} = require('../controllers/wishlist.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const validateProductId = require('../middlewares/validateProductId.middleware');

// Every wishlist route requires a logged-in customer
router.use(authMiddleware);

router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.post('/:productId', validateProductId, addToWishlist);
router.delete('/:productId', validateProductId, removeFromWishlist);
router.patch('/:productId/toggle', validateProductId, toggleWishlist);

module.exports = router;
