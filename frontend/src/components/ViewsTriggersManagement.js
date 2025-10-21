import React, { useState, useEffect } from 'react';
import './Management.css';

function ViewsTriggersManagement() {
  const [viewsData, setViewsData] = useState({
    activeBookings: [],
    roomRevenue: [],
    guestPayments: [],
    maintenanceSummary: [],
    roomOccupancy: []
  });
  const [triggersInfo, setTriggersInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('views');

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const fetchAllViews = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [
        activeBookingsRes,
        roomRevenueRes,
        guestPaymentsRes,
        maintenanceRes,
        roomOccupancyRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/views/active-bookings`),
        fetch(`${API_BASE_URL}/api/views/room-revenue`),
        fetch(`${API_BASE_URL}/api/views/guest-payments`),
        fetch(`${API_BASE_URL}/api/views/maintenance-summary`),
        fetch(`${API_BASE_URL}/api/views/room-occupancy`)
      ]);

      const activeBookingsData = await activeBookingsRes.json();
      const roomRevenueData = await roomRevenueRes.json();
      const guestPaymentsData = await guestPaymentsRes.json();
      const maintenanceData = await maintenanceRes.json();
      const roomOccupancyData = await roomOccupancyRes.json();

      setViewsData({
        activeBookings: activeBookingsData.active_bookings || [],
        roomRevenue: roomRevenueData.room_revenue || [],
        guestPayments: guestPaymentsData.guest_payments || [],
        maintenanceSummary: maintenanceData.maintenance_summary || [],
        roomOccupancy: roomOccupancyData.room_occupancy || []
      });
    } catch (err) {
      setError('Failed to fetch views data: ' + err.message);
      console.error('Error fetching views:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTriggersInfo = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/triggers/info`);
      const data = await response.json();
      setTriggersInfo(data);
    } catch (err) {
      setError('Failed to fetch triggers info: ' + err.message);
      console.error('Error fetching triggers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'views') {
      fetchAllViews();
    } else {
      fetchTriggersInfo();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="management-container">
      <h2>Database Views & Triggers</h2>
      
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'views' ? 'active' : ''}`}
          onClick={() => setActiveTab('views')}
        >
          📊 Views
        </button>
        <button 
          className={`tab-btn ${activeTab === 'triggers' ? 'active' : ''}`}
          onClick={() => setActiveTab('triggers')}
        >
          ⚡ Triggers
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'views' && (
        <div className="views-container">
          <button 
            onClick={fetchAllViews} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : '🔄 Refresh All Views'}
          </button>

          {/* View 1: Active Bookings Summary */}
          <div className="analytics-section">
            <h3>📋 Active Bookings Summary (View)</h3>
            <p className="view-description">Shows all active bookings with guest and room details</p>
            {viewsData.activeBookings.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Monthly Rent</th>
                    <th>Check-in Date</th>
                    <th>Check-out Date</th>
                  </tr>
                </thead>
                <tbody>
                  {viewsData.activeBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{booking.booking_id}</td>
                      <td>{booking.guest_name}</td>
                      <td>{booking.guest_phone}</td>
                      <td><strong>{booking.room_number}</strong></td>
                      <td>{booking.room_type}</td>
                      <td>₹{booking.monthly_rent?.toFixed(2)}</td>
                      <td>{formatDate(booking.check_in_date)}</td>
                      <td>{formatDate(booking.check_out_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No active bookings</p>
            )}
          </div>

          {/* View 2: Room Revenue Summary */}
          <div className="analytics-section">
            <h3>💰 Room Revenue Summary (View)</h3>
            <p className="view-description">Total revenue generated by each room</p>
            {viewsData.roomRevenue.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Monthly Rent</th>
                    <th>Total Bookings</th>
                    <th>Total Revenue</th>
                    <th>Avg Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {viewsData.roomRevenue.map((room, index) => (
                    <tr key={index}>
                      <td><strong>{room.room_number}</strong></td>
                      <td>{room.room_type}</td>
                      <td>₹{room.monthly_rent?.toFixed(2)}</td>
                      <td>{room.total_bookings}</td>
                      <td className="revenue-cell">₹{room.total_revenue?.toFixed(2)}</td>
                      <td>₹{room.avg_payment?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No revenue data available</p>
            )}
          </div>

          {/* View 3: Guest Payment History */}
          <div className="analytics-section">
            <h3>👥 Guest Payment History (View)</h3>
            <p className="view-description">Payment history for all guests</p>
            {viewsData.guestPayments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Total Bookings</th>
                    <th>Total Payments</th>
                    <th>Total Paid</th>
                    <th>Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {viewsData.guestPayments.map((guest, index) => (
                    <tr key={index}>
                      <td>{guest.full_name}</td>
                      <td>{guest.phone_number}</td>
                      <td>{guest.email || 'N/A'}</td>
                      <td>{guest.total_bookings}</td>
                      <td>{guest.total_payments}</td>
                      <td className="revenue-cell">₹{guest.total_paid?.toFixed(2)}</td>
                      <td>{formatDate(guest.last_payment_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No guest payment data</p>
            )}
          </div>

          {/* View 4: Maintenance Requests Summary */}
          <div className="analytics-section">
            <h3>🔧 Maintenance Requests Summary (View)</h3>
            <p className="view-description">Maintenance requests with room and guest details</p>
            {viewsData.maintenanceSummary.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Room</th>
                    <th>Issue</th>
                    <th>Reported By</th>
                    <th>Contact</th>
                    <th>Reported Date</th>
                    <th>Status</th>
                    <th>Days Open</th>
                  </tr>
                </thead>
                <tbody>
                  {viewsData.maintenanceSummary.map((request, index) => (
                    <tr key={index}>
                      <td>{request.request_id}</td>
                      <td><strong>{request.room_number}</strong> ({request.room_type})</td>
                      <td className="issue-cell">{request.issue_description}</td>
                      <td>{request.reported_by || 'N/A'}</td>
                      <td>{request.contact_number || 'N/A'}</td>
                      <td>{formatDate(request.reported_date)}</td>
                      <td><span className={`badge badge-${request.status.toLowerCase()}`}>{request.status}</span></td>
                      <td>{request.days_open} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No maintenance requests</p>
            )}
          </div>

          {/* View 5: Room Occupancy Status */}
          <div className="analytics-section">
            <h3>🏠 Room Occupancy Status (View)</h3>
            <p className="view-description">Current occupancy status with booking statistics</p>
            {viewsData.roomOccupancy.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th>Active Bookings</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
                    <th>Total Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {viewsData.roomOccupancy.map((room, index) => (
                    <tr key={index}>
                      <td><strong>{room.room_number}</strong></td>
                      <td>{room.room_type}</td>
                      <td>₹{room.monthly_rent?.toFixed(2)}</td>
                      <td><span className={`badge badge-${room.occupancy_status.toLowerCase()}`}>{room.occupancy_status}</span></td>
                      <td><span className="badge badge-info">{room.active_bookings}</span></td>
                      <td>{room.completed_bookings}</td>
                      <td>{room.cancelled_bookings}</td>
                      <td>{room.total_bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No room occupancy data</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'triggers' && (
        <div className="triggers-container">
          <button 
            onClick={fetchTriggersInfo} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : '🔄 Refresh Trigger Info'}
          </button>

          {triggersInfo && (
            <>
              <div className="analytics-section">
                <h3>⚡ Database Triggers Overview</h3>
                <div className="trigger-stats">
                  <div className="stat-card">
                    <h4>Total Triggers</h4>
                    <p className="stat-number">{triggersInfo.total_triggers}</p>
                  </div>
                </div>
              </div>

              <div className="analytics-section">
                <h3>📜 Trigger Descriptions</h3>
                <div className="trigger-descriptions">
                  {Object.entries(triggersInfo.description).map(([name, desc]) => (
                    <div key={name} className="trigger-card">
                      <h4>🔹 {name.replace(/_/g, ' ').toUpperCase()}</h4>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <h3>🔍 Trigger Details</h3>
                {triggersInfo.triggers.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Trigger Name</th>
                        <th>Event</th>
                        <th>Table</th>
                        <th>Timing</th>
                        <th>Statement (Preview)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {triggersInfo.triggers.map((trigger, index) => (
                        <tr key={index}>
                          <td><strong>{trigger.name}</strong></td>
                          <td><span className="badge badge-info">{trigger.event}</span></td>
                          <td>{trigger.table}</td>
                          <td><span className="badge badge-success">{trigger.timing}</span></td>
                          <td className="statement-cell">{trigger.statement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No triggers found</p>
                )}
              </div>

            
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewsTriggersManagement;
