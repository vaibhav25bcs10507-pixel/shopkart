const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');
const {
  isMissing,
  validateFullName,
  validateEmail,
  validatePassword,
  validatePhone
} = require('../utils/validators');

// POST /customers/register
async function registerCustomer(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body || {};

    if (
      isMissing(fullName) ||
      isMissing(email) ||
      isMissing(password) ||
      isMissing(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const validationError =
      validateFullName(fullName) ||
      validateEmail(email) ||
      validatePassword(password) ||
      validatePhone(phone);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await Customer.findOne({ email: normalizedEmail });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If two requests race past the check above, MongoDB's unique index
    // throws code 11000, which the error handler turns into a 409.
    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /customers/login
async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (isMissing(email) || isMissing(password)) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password must be text'
      });
    }

    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({
        success: false,
        message: emailError
      });
    }

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() });

    // Same response for wrong email and wrong password
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(customer);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (err) {
    next(err);
  }
}

// GET /customers/me
async function getProfile(req, res) {
  return res.status(200).json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone
  });
}

// POST /customers/logout
async function logoutCustomer(req, res) {
  res.clearCookie('token', { httpOnly: true });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

// PATCH /customers/change-password (Bonus)
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body || {};

    if (isMissing(oldPassword) || isMissing(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Old and new password are required'
      });
    }

    if (typeof oldPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Old password must be text'
      });
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError.replace('Password', 'New password')
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the old password'
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword
};
