const jwt = require('jsonwebtoken');

function generateToken(customer) {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '1d'
    }
  );
}

module.exports = generateToken;
