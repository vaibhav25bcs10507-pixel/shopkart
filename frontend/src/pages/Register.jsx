import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^\p{L}[\p{L}\s.'-]*$/u;
const PHONE_REGEX = /^\d{10}$/;

// Same rules as the backend, so the user gets instant feedback
function validate(data) {
  const errors = {};

  const name = data.fullName.trim();
  if (!name) {
    errors.fullName = 'Full name is required';
  } else if (name.length < 2 || name.length > 50) {
    errors.fullName = 'Full name must be 2 to 50 characters';
  } else if (!NAME_REGEX.test(name)) {
    errors.fullName = 'Full name can only contain letters, spaces, dots, hyphens and apostrophes';
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (data.password.length > 72) {
    errors.password = 'Password must be at most 72 characters';
  }

  const phone = data.phone.trim();
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  return errors;
}

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  function handleChange(e) {
    let { name, value } = e.target;

    // Phone accepts digits only
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = validate(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await api.post('/customers/register', formData);
      navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Please try again.');
      } else {
        setError(err.response.data?.message || 'Registration failed');
      }
    }
  }

  return (
    <div className="container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
        {fieldErrors.fullName && <div className="error">{fieldErrors.fullName}</div>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {fieldErrors.email && <div className="error">{fieldErrors.email}</div>}

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {fieldErrors.password && <div className="error">{fieldErrors.password}</div>}

        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          inputMode="numeric"
          maxLength={10}
          value={formData.phone}
          onChange={handleChange}
        />
        {fieldErrors.phone && <div className="error">{fieldErrors.phone}</div>}

        {error && <div className="error">{error}</div>}

        <button type="submit">Create Account</button>
      </form>

      <div className="link-text">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Register;
