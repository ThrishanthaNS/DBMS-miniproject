import React, { useState, useEffect } from 'react';
import './Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    booking_status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, guestsRes, roomsRes] = await Promise.all([
        fetch(`${API_BASE}/api/bookings`),
        fetch(`${API_BASE}/api/guests`),
        fetch(`${API_BASE}/api/rooms`)
      ]);

      if (!bookingsRes.ok || !guestsRes.ok || !roomsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [bookingsData, guestsData, roomsData] = await Promise.all([
        bookingsRes.json(),
        guestsRes.json(),
        roomsRes.json()
      ]);

      setBookings(bookingsData);
      setGuests(guestsData);
      setRooms(roomsData);
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
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          guest_id: parseInt(formData.guest_id),
          room_id: parseInt(formData.room_id)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create booking');
      }
      
      await fetchData();
      setShowForm(false);
      setFormData({
        guest_id: '',
        room_id: '',
        check_in_date: '',
        check_out_date: '',
        booking_status: 'Active'
      });
      alert('Booking created successfully!');
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
    const statusClass = status.toLowerCase();
    return <span className={`badge badge-${statusClass}`}>{status}</span>;
  };

  const getGuestName = (guestId) => {
    const guest = guests.find(g => g.guest_id === guestId);
    return guest ? guest.full_name : 'Unknown';
  };

  const getRoomNumber = (roomId) => {
    const room = rooms.find(r => r.room_id === roomId);
    return room ? room.room_number : 'Unknown';
  };

  if (loading) return <div className="loading">Loading bookings...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const availableRooms = rooms.filter(r => r.occupancy_status === 'Available');
  const activeBookings = bookings.filter(b => b.booking_status === 'Active').length;

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Booking Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create New Booking'}
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Active Bookings</h4>
          <p className="stat-number">{activeBookings}</p>
        </div>
        <div className="stat-card">
          <h4>Total Bookings</h4>
          <p className="stat-number">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <h4>Available Rooms</h4>
          <p className="stat-number">{availableRooms.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Create New Booking</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Guest *</label>
                <select
                  name="guest_id"
                  value={formData.guest_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Guest</option>
                  {guests.map(guest => (
                    <option key={guest.guest_id} value={guest.guest_id}>
                      {guest.full_name} ({guest.phone_number})
                    </option>
                  ))}
                </select>
                {guests.length === 0 && (
                  <small className="form-hint">No guests available. Add a guest first.</small>
                )}
              </div>
              <div className="form-group">
                <label>Room *</label>
                <select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_number} - {room.room_type} (₹{parseFloat(room.monthly_rent).toLocaleString()})
                    </option>
                  ))}
                </select>
                {availableRooms.length === 0 && (
                  <small className="form-hint">No available rooms.</small>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  name="check_in_date"
                  value={formData.check_in_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Check-out Date</label>
                <input
                  type="date"
                  name="check_out_date"
                  value={formData.check_out_date}
                  onChange={handleChange}
                  min={formData.check_in_date}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Booking Status *</label>
              <select
                name="booking_status"
                value={formData.booking_status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-success"
              disabled={guests.length === 0 || availableRooms.length === 0}
            >
              Create Booking
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>All Bookings ({bookings.length})</h3>
        {bookings.length === 0 ? (
          <p className="no-data">No bookings found. Create your first booking!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{getGuestName(booking.guest_id)}</td>
                  <td><strong>{getRoomNumber(booking.room_id)}</strong></td>
                  <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                  <td>{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : '-'}</td>
                  <td>{getStatusBadge(booking.booking_status)}</td>
                  <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BookingManagement;
