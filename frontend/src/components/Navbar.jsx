import React from 'react';
import { Hotel, BookmarkCheck, BedDouble, User, KeyRound, LogOut } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  availableRoomsCount, 
  bookingsCount, 
  isOnline,
  currentUser,
  onLogout 
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => setActiveTab('rooms')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('rooms')}>
          <img 
            src="/rajmahal-logo.jpg" 
            alt="Rajmahal Group of Hotels Logo" 
            className="brand-logo-img" 
          />
          <div className="brand-text">
            <div className="brand-name">
              <span className="verde-title">RAJMAHAL</span>
            </div>
            <span className="brand-tagline">RESIDENCY</span>
          </div>
        </div>

        <nav className="navbar-nav" aria-label="Main Navigation">
          <button 
            id="nav-rooms-btn"
            className={`nav-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
            aria-current={activeTab === 'rooms' ? 'page' : undefined}
          >
            <BedDouble size={18} />
            <span>Rooms & Suites</span>
            {availableRoomsCount > 0 && (
              <span className="badge badge-success">{availableRoomsCount} available</span>
            )}
          </button>

          <button 
            id="nav-bookings-btn"
            className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            aria-current={activeTab === 'bookings' ? 'page' : undefined}
          >
            <BookmarkCheck size={18} />
            <span>My Bookings</span>
            {bookingsCount > 0 && (
              <span className="badge badge-primary">{bookingsCount}</span>
            )}
          </button>
        </nav>

        <div className="navbar-actions-group">
          {/* User Profile or Sign In Button */}
          {currentUser ? (
            <div className="nav-user-chip" aria-label={`Logged in as ${currentUser.name}`}>
              <div className="user-avatar-circle">
                <User size={15} />
              </div>
              <span className="user-display-name">{currentUser.name}</span>
              <button 
                type="button"
                className="btn-nav-logout"
                onClick={onLogout}
                title="Sign out of account"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              id="nav-auth-btn"
              type="button"
              className={`nav-auth-pill-btn ${activeTab === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveTab('auth')}
              aria-label="Sign In or Register an Account"
            >
              <KeyRound size={16} />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* BOOK NOW CTA */}
          <button 
            type="button"
            className="btn-verde-book-now"
            onClick={() => {
              if (activeTab !== 'rooms') setActiveTab('rooms');
              setTimeout(() => {
                const el = document.getElementById('accommodations-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </header>
  );
}
