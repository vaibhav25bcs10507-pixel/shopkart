// Field list drives both the form (what to render) and the validation
// (what to check), so the two can never drift apart.
export const SHIPPING_FIELDS = [
  { name: 'fullName', label: 'Full Name', autoComplete: 'name' },
  { name: 'phone', label: 'Phone Number', autoComplete: 'tel', inputMode: 'numeric' },
  { name: 'addressLine1', label: 'Address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', autoComplete: 'postal-code', inputMode: 'numeric' }
];

export const EMPTY_SHIPPING = Object.fromEntries(
  SHIPPING_FIELDS.map((field) => [field.name, ''])
);

const NAME_REGEX = /^\p{L}[\p{L}\s.'-]*$/u;
const PHONE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;

function required(label, value) {
  return value.trim() === '' ? `${label} is required.` : null;
}

// Each rule returns an error message, or null when the value is fine.
// Whitespace-only input counts as empty everywhere.
const RULES = {
  fullName: (v) =>
    required('Full name', v) ||
    (v.trim().length < 2 || v.trim().length > 50
      ? 'Full name must be 2 to 50 characters.'
      : null) ||
    (!NAME_REGEX.test(v.trim()) ? 'Full name can only contain letters and spaces.' : null),
  phone: (v) =>
    required('Phone number', v) ||
    (!PHONE_REGEX.test(v.trim()) ? 'Phone number must be exactly 10 digits.' : null),
  addressLine1: (v) => required('Address', v),
  city: (v) => required('City', v),
  state: (v) => required('State', v),
  pincode: (v) =>
    required('Pincode', v) ||
    (!PINCODE_REGEX.test(v.trim()) ? 'Pincode must contain 6 digits.' : null)
};

// Returns { fieldName: message } for every invalid field ({} means all good)
export function validateShipping(values) {
  const errors = {};

  SHIPPING_FIELDS.forEach(({ name }) => {
    const message = RULES[name](values[name]);
    if (message) errors[name] = message;
  });

  return errors;
}

// What actually gets sent to the backend: trimmed values only
export function cleanShipping(values) {
  return Object.fromEntries(
    SHIPPING_FIELDS.map(({ name }) => [name, values[name].trim()])
  );
}
