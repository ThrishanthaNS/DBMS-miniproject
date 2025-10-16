import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    activeBookings: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [guestsRes, roomsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/guests`),
        fetch(`${API_BASE}/api/rooms`),
        fetch(`${API_BASE}/api/bookings`)
      ]);

      const [guests, rooms, bookings] = await Promise.all([
        guestsRes.json(),
        roomsRes.json(),
        bookingsRes.json()
      ]);

      setStats({
        totalGuests: guests.length,
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.occupancy_status === 'Available').length,
        occupiedRooms: rooms.filter(r => r.occupancy_status === 'Occupied').length,
        activeBookings: bookings.filter(b => b.booking_status === 'Active').length,
        totalBookings: bookings.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const occupancyRate = stats.totalRooms > 0 
    ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) 
    : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Paid Guest Management System</h1>
        <p className="subtitle">Welcome to your PG management dashboard</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card card-guests">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Guests</h3>
            <p className="card-number">{stats.totalGuests}</p>
            <span className="card-label">Registered guests</span>
          </div>
        </div>

        <div className="dashboard-card card-rooms">
          <div className="card-icon">🏠</div>
          <div className="card-content">
            <h3>Total Rooms</h3>
            <p className="card-number">{stats.totalRooms}</p>
            <span className="card-label">Available: {stats.availableRooms}</span>
          </div>
        </div>

        <div className="dashboard-card card-bookings">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Active Bookings</h3>
            <p className="card-number">{stats.activeBookings}</p>
            <span className="card-label">Total: {stats.totalBookings}</span>
          </div>
        </div>

        <div className="dashboard-card card-occupancy">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Occupancy Rate</h3>
            <p className="card-number">{occupancyRate}%</p>
            <span className="card-label">{stats.occupiedRooms} of {stats.totalRooms} occupied</span>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>🎯 Quick Actions</h3>
          <ul>
            <li>Add new guests to the system</li>
            <li>Create and manage room inventory</li>
            <li>Book rooms for guests</li>
            <li>Track booking status and payments</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>📈 System Overview</h3>
          <div className="overview-stats">
            <div className="overview-item">
              <span className="overview-label">Occupied Rooms:</span>
              <span className="overview-value">{stats.occupiedRooms}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Available Rooms:</span>
              <span className="overview-value">{stats.availableRooms}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Active Bookings:</span>
              <span className="overview-value">{stats.activeBookings}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Guests:</span>
              <span className="overview-value">{stats.totalGuests}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-message">
        <h2>Welcome to Hostel Management System</h2>
        <p>Use the navigation menu above to manage guests, rooms, and bookings.</p>
      </div>
    </div>
  );
}

export default Dashboard;
