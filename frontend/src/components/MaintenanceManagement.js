import React, { useState, useEffect } from 'react';
import './Management.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function MaintenanceManagement() {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    guest_id: '',
    issue_description: '',
    reported_date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, roomsRes, guestsRes] = await Promise.all([
        fetch(`${API_BASE}/api/maintenance`),
        fetch(`${API_BASE}/api/rooms`),
        fetch(`${API_BASE}/api/guests`)
      ]);

      if (!requestsRes.ok || !roomsRes.ok || !guestsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [requestsData, roomsData, guestsData] = await Promise.all([
        requestsRes.json(),
        roomsRes.json(),
        guestsRes.json()
      ]);

      setRequests(requestsData);
      setRooms(roomsData);
      setGuests(guestsData);
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
      const response = await fetch(`${API_BASE}/api/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          room_id: parseInt(formData.room_id),
          guest_id: formData.guest_id ? parseInt(formData.guest_id) : null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create maintenance request');
      }
      
      await fetchData();
      setShowForm(false);
      setFormData({
        room_id: '',
        guest_id: '',
        issue_description: '',
        reported_date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      });
      alert('Maintenance request created successfully!');
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

  const getRoomInfo = (roomId) => {
    const room = rooms.find(r => r.room_id === roomId);
    return room ? `${room.room_number} - ${room.room_type}` : 'Unknown';
  };

  const getGuestName = (guestId) => {
    if (!guestId) return '-';
    const guest = guests.find(g => g.guest_id === guestId);
    return guest ? guest.full_name : 'Unknown';
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const resolvedDate = newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : null;
      const response = await fetch(`${API_BASE}/api/maintenance/${requestId}?status=${newStatus}${resolvedDate ? `&resolved_date=${resolvedDate}` : ''}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update maintenance request');
      }
      
      await fetchData();
      alert('Maintenance request status updated!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading maintenance requests...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'In Progress').length;
  const resolvedRequests = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Maintenance Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create Request'}
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Pending</h4>
          <p className="stat-number">{pendingRequests}</p>
        </div>
        <div className="stat-card">
          <h4>In Progress</h4>
          <p className="stat-number">{inProgressRequests}</p>
        </div>
        <div className="stat-card">
          <h4>Resolved</h4>
          <p className="stat-number">{resolvedRequests}</p>
        </div>
        <div className="stat-card">
          <h4>Total Requests</h4>
          <p className="stat-number">{requests.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Create Maintenance Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Room *</label>
                <select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_number} - {room.room_type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Guest (Optional)</label>
                <select
                  name="guest_id"
                  value={formData.guest_id}
                  onChange={handleChange}
                >
                  <option value="">Select Guest</option>
                  {guests.map(guest => (
                    <option key={guest.guest_id} value={guest.guest_id}>
                      {guest.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reported Date *</label>
                <input
                  type="date"
                  name="reported_date"
                  value={formData.reported_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Issue Description *</label>
              <textarea
                name="issue_description"
                value={formData.issue_description}
                onChange={handleChange}
                rows="4"
                required
                placeholder="Describe the maintenance issue in detail..."
              />
            </div>

            <button type="submit" className="btn btn-success">
              Create Request
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>Maintenance Requests ({requests.length})</h3>
        {requests.length === 0 ? (
          <p className="no-data">No maintenance requests found. Create your first request!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Room</th>
                <th>Guest</th>
                <th>Issue Description</th>
                <th>Reported Date</th>
                <th>Status</th>
                <th>Resolved Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.request_id}</td>
                  <td><strong>{getRoomInfo(request.room_id)}</strong></td>
                  <td>{getGuestName(request.guest_id)}</td>
                  <td className="issue-cell">{request.issue_description}</td>
                  <td>{new Date(request.reported_date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{request.resolved_date ? new Date(request.resolved_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {request.status !== 'Resolved' && (
                      <div className="action-buttons">
                        {request.status === 'Pending' && (
                          <button 
                            className="btn-small btn-warning"
                            onClick={() => handleStatusUpdate(request.request_id, 'In Progress')}
                          >
                            Start
                          </button>
                        )}
                        <button 
                          className="btn-small btn-success"
                          onClick={() => handleStatusUpdate(request.request_id, 'Resolved')}
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MaintenanceManagement;
