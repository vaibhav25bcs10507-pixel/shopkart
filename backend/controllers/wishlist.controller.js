const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const { sendProductNotFound } = require('../utils/responses');

const PRODUCT_FIELDS = 'name price category image stock';

// $addToSet only adds the id if it is not already in the array, so a
// modifiedCount of 1 means "added" and 0 means "was already there".
// Doing this in one atomic update also stops duplicates when two
// requests arrive at the same time.
async function addProductToWishlist(customerId, productId) {
  const result = await Customer.updateOne(
    { _id: customerId },
    { $addToSet: { wishlist: productId } }
  );
  return result.modifiedCount === 1;
}

// Returns true when the product was in the wishlist and got removed
async function removeProductFromWishlist(customerId, productId) {
  const result = await Customer.updateOne(
    { _id: customerId },
    { $pull: { wishlist: productId } }
  );
  return result.modifiedCount === 1;
}

// POST /wishlist/:productId
async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    if (!(await Product.exists({ _id: productId }))) {
      return sendProductNotFound(res);
    }

    const added = await addProductToWishlist(req.user._id, productId);

    if (!added) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (err) {
    next(err);
  }
}

// GET /wishlist
async function getWishlist(req, res, next) {
  try {
    // req.user was loaded by the auth middleware from the JWT,
    // so the client never chooses whose wishlist is returned.
    await req.user.populate({
      path: 'wishlist',
      select: PRODUCT_FIELDS
    });

    return res.status(200).json({
      success: true,
      count: req.user.wishlist.length,
      wishlist: req.user.wishlist
    });
  } catch (err) {
    next(err);
  }
}

// GET /wishlist/count
async function getWishlistCount(req, res, next) {
  try {
    // Count only products that still exist, so this always matches
    // the number of products GET /wishlist returns.
    const count = await Product.countDocuments({
      _id: { $in: req.user.wishlist }
    });

    return res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /wishlist/:productId
async function removeFromWishlist(req, res, next) {
  try {
    const removed = await removeProductFromWishlist(
      req.user._id,
      req.params.productId
    );

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /wishlist/:productId/toggle (Bonus)
async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    if (!(await Product.exists({ _id: productId }))) {
      return sendProductNotFound(res);
    }

    // Saved -> remove it. Not saved -> add it.
    const removed = await removeProductFromWishlist(req.user._id, productId);

    if (!removed) {
      await addProductToWishlist(req.user._id, productId);
    }

    const saved = !removed;

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? 'Product added to wishlist' : 'Product removed from wishlist'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  getWishlistCount,
  removeFromWishlist,
  toggleWishlist
};
