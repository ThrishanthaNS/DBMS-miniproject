import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import GuestManagement from './components/GuestManagement';
import RoomManagement from './components/RoomManagement';
import BookingManagement from './components/BookingManagement';
import PaymentManagement from './components/PaymentManagement';
import MaintenanceManagement from './components/MaintenanceManagement';
import AnalyticsManagement from './components/AnalyticsManagement';
import ViewsTriggersManagement from './components/ViewsTriggersManagement';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'guests':
        return <GuestManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'analytics':
        return <AnalyticsManagement />;
      case 'views':
        return <ViewsTriggersManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🏨 PG Management</h1>
        </div>
        <div className="nav-links">
          <button
            className={currentView === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={currentView === 'guests' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('guests')}
          >
            👥 Guests
          </button>
          <button
            className={currentView === 'rooms' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('rooms')}
          >
            🏠 Rooms
          </button>
          <button
            className={currentView === 'bookings' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('bookings')}
          >
            📋 Bookings
          </button>
          <button
            className={currentView === 'payments' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('payments')}
          >
            💰 Payments
          </button>
          <button
            className={currentView === 'maintenance' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('maintenance')}
          >
            🔧 Maintenance
          </button>
          <button
            className={currentView === 'analytics' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={currentView === 'views' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentView('views')}
          >
            🗂️ Views & Triggers
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderView()}
      </main>

      <footer className="app-footer">
        <p>© 2025 Hostel Management System | Built with React & FastAPI</p>
      </footer>
    </div>
  );
}

export default App;
