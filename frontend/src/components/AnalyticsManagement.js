import React, { useState, useEffect } from 'react';
import './Management.css';

function AnalyticsManagement() {
  const [analytics, setAnalytics] = useState({
    singleRoomsLastWeek: null,
    monthlyData: null,
    maintenanceByRoom: [],
    guestsWithPayments: [],
    roomsByGuest: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [
        singleRoomsRes,
        monthlyDataRes,
        maintenanceRes,
        guestsPaymentsRes,
        roomsByGuestRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/single-rooms-per-week`),
        fetch(`${API_BASE_URL}/api/analytics/monthly-bookings-income`),
        fetch(`${API_BASE_URL}/api/analytics/maintenance-by-room`),
        fetch(`${API_BASE_URL}/api/analytics/guests-with-payments`),
        fetch(`${API_BASE_URL}/api/analytics/rooms-booked-by-guest`)
      ]);

      const singleRoomsData = await singleRoomsRes.json();
      const monthlyData = await monthlyDataRes.json();
      const maintenanceData = await maintenanceRes.json();
      const guestsPaymentsData = await guestsPaymentsRes.json();
      const roomsByGuestData = await roomsByGuestRes.json();

      setAnalytics({
        singleRoomsLastWeek: singleRoomsData,
        monthlyData: monthlyData,
        maintenanceByRoom: maintenanceData.maintenance_by_room || [],
        guestsWithPayments: guestsPaymentsData.guests_with_payments || [],
        roomsByGuest: roomsByGuestData.rooms_by_guest || []
      });
    } catch (err) {
      setError('Failed to fetch analytics data: ' + err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return (
    <div className="management-container">
      <h2>Analytics Dashboard</h2>
      
      <button 
        onClick={fetchAllAnalytics} 
        className="refresh-btn"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh Analytics'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {/* Section 1: Single Rooms Booked Last Week */}
      <div className="analytics-section">
        <h3>📊 Single Rooms Booked (Last Week)</h3>
        {analytics.singleRoomsLastWeek && (
          <div className="analytics-card">
            <div className="stat-value">
              {analytics.singleRoomsLastWeek.single_room_bookings_last_week}
            </div>
            <div className="stat-label">Single Room Bookings in Past 7 Days</div>
          </div>
        )}
      </div>

      {/* Section 2: Monthly Bookings and Income */}
      <div className="analytics-section">
        <h3>📈 Monthly Statistics</h3>
        {analytics.monthlyData && (
          <div className="analytics-cards-grid">
            <div className="analytics-card">
              <div className="stat-value">
                {analytics.monthlyData.total_bookings_last_month}
              </div>
              <div className="stat-label">Total Bookings (Last Month)</div>
            </div>
            <div className="analytics-card">
              <div className="stat-value">
                ₹{analytics.monthlyData.total_income_last_month.toFixed(2)}
              </div>
              <div className="stat-label">Total Income (Last Month)</div>
            </div>
            <div className="analytics-card">
              <div className="stat-value">
                ₹{analytics.monthlyData.avg_income_last_month.toFixed(2)}
              </div>
              <div className="stat-label">Average Income per Payment</div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Maintenance Requests by Room */}
      <div className="analytics-section">
        <h3>🔧 Maintenance Requests by Room</h3>
        {analytics.maintenanceByRoom.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Maintenance Requests</th>
              </tr>
            </thead>
            <tbody>
              {analytics.maintenanceByRoom.map((room, index) => (
                <tr key={index}>
                  <td>{room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>
                    <span className={`badge ${room.maintenance_count > 0 ? 'badge-warning' : 'badge-success'}`}>
                      {room.maintenance_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No maintenance data available</p>
        )}
      </div>

      {/* Section 4: Guests with Payments by Room */}
      <div className="analytics-section">
        <h3>💰 Guests with Payments by Room</h3>
        {analytics.guestsWithPayments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Guest Name</th>
                <th>Phone Number</th>
                <th>Total Paid</th>
                <th>Payment Count</th>
              </tr>
            </thead>
            <tbody>
              {analytics.guestsWithPayments.map((item, index) => (
                <tr key={index}>
                  <td>{item.room_number}</td>
                  <td>{item.room_type}</td>
                  <td>{item.guest_name}</td>
                  <td>{item.phone_number}</td>
                  <td>₹{item.total_paid.toFixed(2)}</td>
                  <td>{item.payment_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No payment data available</p>
        )}
      </div>

      {/* Section 5: Rooms Booked by Each Guest */}
      <div className="analytics-section">
        <h3>👥 Rooms Booked by Each Guest</h3>
        {analytics.roomsByGuest.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Unique Rooms Booked</th>
                <th>Total Bookings</th>
              </tr>
            </thead>
            <tbody>
              {analytics.roomsByGuest.map((guest, index) => (
                <tr key={index}>
                  <td>{guest.full_name}</td>
                  <td>{guest.phone_number}</td>
                  <td>{guest.email || 'N/A'}</td>
                  <td>
                    <span className="badge badge-info">
                      {guest.rooms_booked}
                    </span>
                  </td>
                  <td>{guest.total_bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No guest booking data available</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsManagement;
