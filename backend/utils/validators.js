const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^\p{L}[\p{L}\s.'-]*$/u;
const PHONE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;

// true when a field was not provided at all (undefined, null, empty or spaces only)
function isMissing(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  );
}

// Each validator returns an error message, or null when the value is fine

function validateFullName(value) {
  if (typeof value !== 'string') return 'Full name must be text';
  const name = value.trim();
  if (name.length < 2 || name.length > 50) {
    return 'Full name must be 2 to 50 characters';
  }
  if (!NAME_REGEX.test(name)) {
    return 'Full name can only contain letters, spaces, dots, hyphens and apostrophes';
  }
  return null;
}

function validateEmail(value) {
  if (typeof value !== 'string') return 'Email must be text';
  const email = value.trim();
  if (email.length > 254) return 'Email is too long';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(value) {
  if (typeof value !== 'string') return 'Password must be text';
  if (value.length < 6) return 'Password must be at least 6 characters long';
  // bcrypt only uses the first 72 bytes, so longer passwords are rejected
  if (Buffer.byteLength(value, 'utf8') > 72) {
    return 'Password must be at most 72 characters long';
  }
  return null;
}

function validatePhone(value) {
  if (typeof value !== 'string' || !PHONE_REGEX.test(value.trim())) {
    return 'Phone number must be exactly 10 digits';
  }
  return null;
}

function validateRequiredText(label, value, maxLength) {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${label} is required`;
  }
  if (value.trim().length > maxLength) {
    return `${label} must be at most ${maxLength} characters`;
  }
  return null;
}

function validatePincode(value) {
  if (typeof value !== 'string' || !PINCODE_REGEX.test(value.trim())) {
    return 'Pincode must contain 6 digits';
  }
  return null;
}

// Returns the first problem found in a shipping address, or null when it is fine
function validateShippingAddress(address) {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return 'Shipping address is required';
  }

  return (
    validateFullName(address.fullName) ||
    validatePhone(address.phone) ||
    validateRequiredText('Address', address.addressLine1, 200) ||
    validateRequiredText('City', address.city, 100) ||
    validateRequiredText('State', address.state, 100) ||
    validatePincode(address.pincode)
  );
}

module.exports = {
  isMissing,
  validateFullName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateShippingAddress
};
