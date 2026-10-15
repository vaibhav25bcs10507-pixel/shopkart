const mongoose = require('mongoose');

// Builds a middleware that rejects requests whose URL param is not a valid
// MongoDB ObjectId. One factory serves every route that has an id in the path.
function validateObjectId(paramName, label) {
  return function (req, res, next) {
    if (!mongoose.isObjectIdOrHexString(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${label}`
      });
    }

    next();
  };
}

module.exports = validateObjectId;
