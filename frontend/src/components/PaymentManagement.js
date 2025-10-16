import React, { useState, useEffect } from 'react';
import './Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    booking_id: '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, bookingsRes, guestsRes, roomsRes] = await Promise.all([
        fetch(`${API_BASE}/api/payments`),
        fetch(`${API_BASE}/api/bookings`),
        fetch(`${API_BASE}/api/guests`),
        fetch(`${API_BASE}/api/rooms`)
      ]);

      if (!paymentsRes.ok || !bookingsRes.ok || !guestsRes.ok || !roomsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [paymentsData, bookingsData, guestsData, roomsData] = await Promise.all([
        paymentsRes.json(),
        bookingsRes.json(),
        guestsRes.json(),
        roomsRes.json()
      ]);

      setPayments(paymentsData);
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
      const response = await fetch(`${API_BASE}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          booking_id: parseInt(formData.booking_id),
          amount_paid: parseFloat(formData.amount_paid)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment');
      }
      
      await fetchData();
      setShowForm(false);
      setFormData({
        booking_id: '',
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        remarks: ''
      });
      alert('Payment recorded successfully!');
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

  const getBookingInfo = (bookingId) => {
    const booking = bookings.find(b => b.booking_id === bookingId);
    if (!booking) return 'Unknown';
    
    const guest = guests.find(g => g.guest_id === booking.guest_id);
    const room = rooms.find(r => r.room_id === booking.room_id);
    
    return `${guest?.full_name || 'Unknown'} - Room ${room?.room_number || 'Unknown'}`;
  };

  const calculateTotalPayments = () => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
  };

  if (loading) return <div className="loading">Loading payments...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const totalPayments = calculateTotalPayments();

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Payment Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Payments</h4>
          <p className="stat-number">{payments.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Amount</h4>
          <p className="stat-number">₹{totalPayments.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>This Month</h4>
          <p className="stat-number">
            {payments.filter(p => {
              const paymentDate = new Date(p.payment_date);
              const now = new Date();
              return paymentDate.getMonth() === now.getMonth() && 
                     paymentDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Record New Payment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Booking *</label>
                <select
                  name="booking_id"
                  value={formData.booking_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Booking</option>
                  {bookings.filter(b => b.booking_status === 'Active').map(booking => {
                    const guest = guests.find(g => g.guest_id === booking.guest_id);
                    const room = rooms.find(r => r.room_id === booking.room_id);
                    return (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        Booking #{booking.booking_id} - {guest?.full_name || 'Unknown'} - Room {room?.room_number || 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Amount Paid (₹) *</label>
                <input
                  type="number"
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Optional notes about the payment"
              />
            </div>

            <button type="submit" className="btn btn-success">
              Record Payment
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>Payment History ({payments.length})</h3>
        {payments.length === 0 ? (
          <p className="no-data">No payments recorded yet. Record your first payment!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking Info</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th>Remarks</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td>{getBookingInfo(payment.booking_id)}</td>
                  <td><strong>₹{parseFloat(payment.amount_paid).toLocaleString()}</strong></td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-payment">{payment.payment_method}</span>
                  </td>
                  <td>{payment.remarks || '-'}</td>
                  <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PaymentManagement;
