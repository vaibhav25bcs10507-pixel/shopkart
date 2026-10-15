const validateObjectId = require('./validateObjectId.middleware');

// Rejects requests whose :productId is not a valid MongoDB ObjectId
module.exports = validateObjectId('productId', 'product ID');
