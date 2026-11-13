import React, { useState } from 'react';
import { Calendar, User, Trash2, BedDouble, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export default function BookingsList({ 
  bookings = [], 
  currentUser, 
  onCancelBooking, 
  onBrowseRooms, 
  onRequireAuth 
}) {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelClick = async (bookingId) => {
    if (window.confirm(`Are you sure you want to cancel Reservation #${bookingId}? The room will be made available for other guests.`)) {
      setCancellingId(bookingId);
      try {
        await onCancelBooking(bookingId);
      } finally {
        setCancellingId(null);
      }
    }
  };

  // State 1: User is not logged in
  if (!currentUser) {
    return (
      <div className="empty-bookings-container" role="status">
        <div className="empty-icon-box">
          <KeyRound size={48} className="empty-icon" />
        </div>
        <h2 className="empty-title">Sign In to View Your Reservations</h2>
        <p className="empty-subtitle">
          To protect guest privacy, please sign in or register with your 4-digit PIN to access your itinerary, booking receipts, and confirmed suites at Rajmahal Residency.
        </p>
        <button 
          id="signin-view-bookings-btn"
          className="btn-primary empty-action-btn"
          onClick={onRequireAuth}
        >
          <KeyRound size={18} />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  // Filter bookings belonging to this authenticated user
  const userBookings = bookings.filter(
    (b) => b.user_id === currentUser.id || b.user_email?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  // State 2: User is logged in, but has no active bookings
  if (!userBookings || userBookings.length === 0) {
    return (
      <div className="empty-bookings-container" role="status">
        <div className="empty-icon-box">
          <BedDouble size={48} className="empty-icon" />
        </div>
        <h2 className="empty-title">No Reservations for {currentUser.name}</h2>
        <p className="empty-subtitle">
          You don't have any confirmed stays at Rajmahal Residency yet. Explore our luxury suites and reserve your serene heritage sanctuary today.
        </p>
        <button 
          id="empty-browse-btn"
          className="btn-primary empty-action-btn"
          onClick={onBrowseRooms}
        >
          <span>Explore Available Suites</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // State 3: User is logged in with active reservations
  return (
    <div className="bookings-view-container">
      <div className="bookings-view-header">
        <div>
          <h2 className="section-title">My Active Reservations</h2>
          <p className="section-subtitle">
            Welcome back, <strong>{currentUser.name}</strong> ({currentUser.email}). Here are your confirmed stays at Rajmahal Residency.
          </p>
        </div>
        <div className="bookings-count-pill">
          <ShieldCheck size={16} /> {userBookings.length} Confirmed Stay{userBookings.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="bookings-grid">
        {userBookings.map((b) => (
          <div key={b.id} className="booking-card">
            <div className="booking-card-media">
              <img 
                src={b.room_image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'} 
                alt={b.room_type} 
                className="booking-room-img"
              />
              <span className="booking-id-tag">Booking #{b.id}</span>
            </div>

            <div className="booking-card-content">
              <div className="booking-title-row">
                <div>
                  <h3 className="booking-room-name">{b.room_type}</h3>
                  <span className="booking-room-num">Room ID: #{b.room_id}</span>
                </div>
                <div className="booking-status-tag">
                  <Sparkles size={12} /> Confirmed
                </div>
              </div>

              <div className="booking-details-list">
                <div className="detail-item">
                  <User size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Patron Guest</span>
                    <span className="detail-val">{b.user_name} ({b.user_email || currentUser.email})</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar size={16} className="detail-icon" />
                  <div>
                    <span className="detail-label">Reservation Schedule</span>
                    <span className="detail-val">
                      {b.start_date} <span className="arrow-sep">➔</span> {b.end_date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-card-footer">
                <div className="nightly-rate-info">
                  <span>Rate: </span>
                  <strong>₹{b.room_price ? b.room_price.toLocaleString() : 'N/A'}</strong> / night
                </div>

                <button
                  id={`cancel-booking-${b.id}-btn`}
                  className="cancel-booking-btn"
                  onClick={() => handleCancelClick(b.id)}
                  disabled={cancellingId === b.id}
                  title="Cancel this reservation"
                >
                  <Trash2 size={16} />
                  <span>{cancellingId === b.id ? 'Cancelling...' : 'Cancel Stay'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
