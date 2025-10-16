import React, { useState, useEffect } from 'react';
import './Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    id_proof_type: '',
    id_proof_number: '',
    address: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/guests`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setGuests(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create guest');
      }
      
      await fetchGuests();
      setShowForm(false);
      setFormData({
        full_name: '',
        phone_number: '',
        email: '',
        id_proof_type: '',
        id_proof_number: '',
        address: ''
      });
      alert('Guest added successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Loading guests...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Guest Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Guest'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Guest</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>ID Proof Type</label>
                <select
                  name="id_proof_type"
                  value={formData.id_proof_type}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Aadhar">Aadhar</option>
                  <option value="PAN">PAN</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ID Proof Number</label>
                <input
                  type="text"
                  name="id_proof_number"
                  value={formData.id_proof_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-success">
              Add Guest
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>All Guests ({guests.length})</h3>
        {guests.length === 0 ? (
          <p className="no-data">No guests found. Add your first guest!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>ID Proof</th>
                <th>ID Number</th>
                <th>Address</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.guest_id}>
                  <td>{guest.guest_id}</td>
                  <td>{guest.full_name}</td>
                  <td>{guest.phone_number}</td>
                  <td>{guest.email || '-'}</td>
                  <td>{guest.id_proof_type || '-'}</td>
                  <td>{guest.id_proof_number || '-'}</td>
                  <td>{guest.address || '-'}</td>
                  <td>{new Date(guest.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GuestManagement;
