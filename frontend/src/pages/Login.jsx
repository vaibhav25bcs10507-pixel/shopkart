import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(data) {
  const errors = {};

  const email = data.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      await api.post('/customers/login', formData);
      navigate('/home');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Please try again.');
      } else if (err.response.status >= 500) {
        setError('Something went wrong on the server. Please try again.');
      } else {
        setError('Invalid Credentials');
      }
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} noValidate>
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

        {error && <div className="error">{error}</div>}

        <button type="submit">Login</button>
      </form>

      <div className="link-text">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default Login;
