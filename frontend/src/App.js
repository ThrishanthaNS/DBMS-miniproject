import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${API_BASE}${endpoint}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => mounted && setData(json))
      .catch(err => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [endpoint]);

  return { data, loading, error };
}

function Table({ title, data }) {
  if (!data || data.length === 0) return <div className="table-empty">No {title.toLowerCase()} found</div>;
  const headers = Object.keys(data[0]);
  return (
    <div className="table-wrap">
      <h3>{title} ({data.length})</h3>
      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map(h => <td key={h}>{String(row[h] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function App() {
  const guests = useFetch('/api/guests');
  const rooms = useFetch('/api/rooms');
  const bookings = useFetch('/api/bookings');

  return (
    <div className="App">
      <header className="App-header">
        <h1>PAID GUEST MANAGEMENT — DB Viewer</h1>
        <p>Displays tables from the backend database (Guests, Rooms, Bookings)</p>
      </header>

      <main className="App-main">
        <section>
          {guests.loading ? <div className="loading">Loading guests…</div> : guests.error ? <div className="error">Guests error: {guests.error}</div> : <Table title="Guests" data={guests.data} />}
        </section>

        <section>
          {rooms.loading ? <div className="loading">Loading rooms…</div> : rooms.error ? <div className="error">Rooms error: {rooms.error}</div> : <Table title="Rooms" data={rooms.data} />}
        </section>

        <section>
          {bookings.loading ? <div className="loading">Loading bookings…</div> : bookings.error ? <div className="error">Bookings error: {bookings.error}</div> : <Table title="Bookings" data={bookings.data} />}
        </section>
      </main>

      <footer className="App-footer">
        <small>API: {API_BASE}</small>
      </footer>
    </div>
  );
}

export default App;
