import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      try {
        const res = await api.get('/customers/me');
        if (!ignore) setCustomer(res.data);
      } catch (err) {
        if (ignore) return;

        if (err.response && err.response.status === 401) {
          // Not logged in (or session expired)
          navigate('/login');
        } else {
          setError('Could not load your profile. Please try again.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="profile-box">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="profile-box">
        <h2>Welcome, {customer.fullName}</h2>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
      </div>
    </div>
  );
}

export default Home;
