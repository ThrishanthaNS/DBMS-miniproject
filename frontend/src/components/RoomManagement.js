import React, { useState, useEffect } from 'react';
import './Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    monthly_rent: '',
    occupancy_status: 'Available'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rooms`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setRooms(data);
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
      const response = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create room');
      }
      
      await fetchRooms();
      setShowForm(false);
      setFormData({
        room_number: '',
        room_type: '',
        monthly_rent: '',
        occupancy_status: 'Available'
      });
      alert('Room added successfully!');
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

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`badge badge-${statusClass}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading rooms...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const availableRooms = rooms.filter(r => r.occupancy_status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.occupancy_status === 'Occupied').length;
  const maintenanceRooms = rooms.filter(r => r.occupancy_status === 'Maintenance').length;

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Room Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Room'}
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Available</h4>
          <p className="stat-number">{availableRooms}</p>
        </div>
        <div className="stat-card">
          <h4>Occupied</h4>
          <p className="stat-number">{occupiedRooms}</p>
        </div>
        <div className="stat-card">
          <h4>Maintenance</h4>
          <p className="stat-number">{maintenanceRooms}</p>
        </div>
        <div className="stat-card">
          <h4>Total Rooms</h4>
          <p className="stat-number">{rooms.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Room</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 101, A-201"
                />
              </div>
              <div className="form-group">
                <label>Room Type *</label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monthly Rent (₹) *</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="form-group">
                <label>Occupancy Status *</label>
                <select
                  name="occupancy_status"
                  value={formData.occupancy_status}
                  onChange={handleChange}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              Add Room
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>All Rooms ({rooms.length})</h3>
        {rooms.length === 0 ? (
          <p className="no-data">No rooms found. Add your first room!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Monthly Rent</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_id}</td>
                  <td><strong>{room.room_number}</strong></td>
                  <td>{room.room_type}</td>
                  <td>₹{parseFloat(room.monthly_rent).toLocaleString()}</td>
                  <td>{getStatusBadge(room.occupancy_status)}</td>
                  <td>{new Date(room.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RoomManagement;
