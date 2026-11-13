import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, CreditCard, AlertCircle, ShieldCheck, Lock, KeyRound, Sparkles } from 'lucide-react';

export default function BookingModal({ 
  room, 
  initialDates, 
  onClose, 
  onBookingSuccess, 
  currentUser, 
  onRequireAuth 
}) {
  // Today's date in YYYY-MM-DD
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Up to 1 week (7 days) in advance for check-in scheduling
  const maxCheckIn = new Date();
  maxCheckIn.setDate(today.getDate() + 7);
  const maxCheckInStr = maxCheckIn.toISOString().split('T')[0];

  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [startDate, setStartDate] = useState(initialDates?.startDate || todayStr);
  const [stayDuration, setStayDuration] = useState(initialDates?.nights || 1); // in days/nights
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update name when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.name || '');
      setErrorMessage('');
    }
  }, [currentUser]);

  if (!room) return null;

  // Auto-calculate check-out date from check-in + stay duration
  const computeCheckOutDate = (start, days) => {
    try {
      const dateObj = new Date(start);
      if (isNaN(dateObj.getTime())) return '';
      dateObj.setDate(dateObj.getDate() + Number(days));
      return dateObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const computedEndDate = computeCheckOutDate(startDate, stayDuration);
  const nights = Number(stayDuration);
  const totalPrice = nights > 0 ? nights * room.price : room.price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Rule: Booking confirmed ONLY when registered or logged in
    if (!currentUser) {
      setErrorMessage('Registration or Sign In is required to confirm your reservation. Please sign in or register with your 4-digit PIN below.');
      if (onRequireAuth) {
        onRequireAuth(room, { startDate, endDate: computedEndDate, nights });
      }
      return;
    }

    if (nights <= 0) {
      setErrorMessage('Stay duration must be at least 1 day.');
      return;
    }

    if (!guestName.trim()) {
      setErrorMessage('Please enter guest full name.');
      return;
    }

    setSubmitting(true);
    try {
      await onBookingSuccess({
        room_id: room.id,
        user_id: currentUser.id,
        user_name: guestName.trim(),
        user_email: currentUser.email,
        start_date: startDate,
        end_date: computedEndDate
      });
    } catch (err) {
      setErrorMessage(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthRedirect = () => {
    if (onRequireAuth) {
      onRequireAuth(room, { startDate, endDate: computedEndDate, nights });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-pre-title">RAJMAHAL RESIDENCY RESERVATION</span>
            <h2 id="modal-title" className="modal-title">{room.type} (Room #{room.id})</h2>
          </div>
          <button 
            id="close-modal-btn"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMessage && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Authentication Status Gate Banner */}
          {!currentUser ? (
            <div className="auth-gate-banner" role="status">
              <div className="auth-gate-icon">
                <Lock size={22} />
              </div>
              <div className="auth-gate-info">
                <div className="auth-gate-title">
                  <strong>Registration or Sign In Required</strong>
                  <span className="auth-gate-tag">Step 1 of 2</span>
                </div>
                <p>
                  To confirm your stay at Rajmahal Residency, you must be logged in. Sign in or register in seconds with your 4-digit PIN to finalize this booking.
                </p>
              </div>
              <button 
                type="button" 
                className="btn-auth-gate-quick"
                onClick={handleAuthRedirect}
              >
                <KeyRound size={15} />
                <span>Sign In / Register</span>
              </button>
            </div>
          ) : (
            <div className="auth-verified-banner" role="status">
              <div className="verified-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="verified-info">
                <strong>Booking as Verified Patron</strong>
                <p>{currentUser.name} • {currentUser.email}</p>
              </div>
              <div className="verified-badge">
                <Sparkles size={13} />
                <span>Member Privileges Active</span>
              </div>
            </div>
          )}

          {/* Room quick preview */}
          <div className="modal-room-summary">
            <img src={room.image} alt={room.type} className="modal-room-thumb" />
            <div className="modal-room-details">
              <span className="room-rate">₹{room.price.toLocaleString()} / night</span>
              <span className="room-capacity-text">Accommodates {room.capacity || 2} Guests</span>
              <div className="modal-amenities-mini">
                {(room.amenities || []).slice(0, 3).map((a, i) => (
                  <span key={i} className="mini-tag">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="form-grid">
            {/* Guest Full Name (Full width since Email is removed) */}
            <div className="form-group full-width-group">
              <label htmlFor="guest-name">
                <User size={15} /> Guest Full Name
              </label>
              <input
                id="guest-name"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={currentUser ? "Enter full name" : "Log in to autofill name"}
                className={`form-input ${!currentUser ? 'disabled-hint' : ''}`}
                readOnly={!currentUser}
              />
            </div>

            {/* Check-in Date (Schedulable up to 1 week in advance) */}
            <div className="form-group">
              <div className="label-with-meta">
                <label htmlFor="start-date">
                  <Calendar size={15} /> Check-in Date
                </label>
                <span className="field-schedule-badge">Schedule up to 7 days</span>
              </div>
              <input
                id="start-date"
                type="date"
                required
                min={todayStr}
                max={maxCheckInStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input date-input-highlight"
              />
              <span className="field-sub-hint">
                Select between today ({todayStr}) & next 7 days ({maxCheckInStr})
              </span>
            </div>

            {/* Check-out Date (Non-editable, Auto-calculated from Stay Duration) */}
            <div className="form-group">
              <div className="label-with-meta">
                <label htmlFor="end-date">
                  <Calendar size={15} /> Check-out Date
                </label>
                <span className="auto-calculated-tag">
                  <Lock size={11} /> Auto-calculated
                </span>
              </div>
              <div className="readonly-date-wrapper">
                <input
                  id="end-date"
                  type="date"
                  readOnly
                  disabled
                  value={computedEndDate}
                  className="form-input readonly-date-input"
                  title="Check-out date is auto-calculated based on your Stay Duration"
                />
              </div>
              <span className="field-sub-hint checkout-hint">
                🔒 Auto-calculated: <strong>{computedEndDate}</strong> ({stayDuration} {stayDuration === 1 ? 'day' : 'days'} stay)
              </span>
            </div>
          </div>

          {/* Stay Duration Selector (How many days/nights client wants to stay) */}
          <div className="stay-duration-section">
            <div className="duration-header-row">
              <div className="duration-title">
                <Clock size={16} className="gold-text" />
                <span>How many days do you want to stay?</span>
              </div>
              <span className="duration-badge-selected">
                {stayDuration} {stayDuration === 1 ? 'Day / 1 Night' : `Days / ${stayDuration} Nights`}
              </span>
            </div>

            {/* Quick Days/Nights Selector Chips */}
            <div className="duration-chips-grid" role="radiogroup" aria-label="Select stay duration">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  aria-checked={stayDuration === days}
                  className={`duration-chip-btn ${stayDuration === days ? 'active' : ''}`}
                  onClick={() => setStayDuration(days)}
                >
                  <span className="chip-day-number">{days}</span>
                  <span className="chip-day-unit">{days === 1 ? 'Day' : 'Days'}</span>
                </button>
              ))}
            </div>

            {/* Extended / Custom Duration Selector */}
            <div className="custom-duration-row">
              <span className="custom-duration-label">Or select longer stay:</span>
              <select
                id="stay-duration-select"
                value={stayDuration}
                onChange={(e) => setStayDuration(Number(e.target.value))}
                className="custom-duration-dropdown"
                aria-label="Select custom number of days"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'Day (1 Night)' : `Days (${d} Nights)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price breakdown card */}
          <div className="price-summary-card">
            <div className="summary-row">
              <span>Rate per night</span>
              <span>₹{room.price.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Stay Duration</span>
              <span className="highlight-duration">
                {stayDuration} {stayDuration === 1 ? 'Day (1 night)' : `Days (${stayDuration} nights)`}
              </span>
            </div>
            <div className="summary-row">
              <span>Schedule</span>
              <span>{startDate} <span className="arrow-sep">➔</span> {computedEndDate}</span>
            </div>
            <div className="summary-row">
              <span>Taxes & Luxury Resort Fee</span>
              <span className="fee-free">Included (₹0)</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total Payable Amount</span>
              <span className="total-amount">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            {currentUser ? (
              <button
                id="confirm-booking-btn"
                type="submit"
                className="btn-primary"
                disabled={submitting || nights <= 0}
              >
                {submitting ? (
                  <span className="spinner-text">Processing Reservation...</span>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Confirm Booking (₹{totalPrice.toLocaleString()})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="auth-required-confirm-btn"
                type="button"
                className="btn-primary btn-auth-prompt"
                onClick={handleAuthRedirect}
              >
                <KeyRound size={18} />
                <span>Sign In / Register to Confirm Stay</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
