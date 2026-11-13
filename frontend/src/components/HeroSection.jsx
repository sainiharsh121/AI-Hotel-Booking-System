import React, { useState } from 'react';
import { Search, SlidersHorizontal, Calendar, Users, MapPin, Check } from 'lucide-react';

const CATEGORIES = ['All', 'Single', 'Double', 'Suite', 'Deluxe', 'Family'];

export default function HeroSection({
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onlyAvailable,
  setOnlyAvailable,
  maxPrice,
  setMaxPrice,
  totalRooms,
  filteredCount
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxCheckIn = new Date();
  maxCheckIn.setDate(today.getDate() + 7);
  const maxCheckInStr = maxCheckIn.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [stayNights, setStayNights] = useState(1);
  const [guestCount, setGuestCount] = useState('2 Guests');

  const checkOut = (() => {
    try {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + Number(stayNights));
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  })();

  const handleCheckAvailability = () => {
    // Scrolls smoothly down to rooms section
    const el = document.getElementById('accommodations-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" aria-label="Rajmahal Residency Hero Showcase">
      <div className="hero-bg-overlay"></div>
      
      <div className="hero-content">
        {/* Heritage Tagline */}
        <div className="hero-location-pill">
          <img src="/rajmahal-logo.jpg" alt="Rajmahal Emblem" className="hero-pill-logo" />
          <span>RAJMAHAL RESIDENCY • SANCTUARY</span>
        </div>

        {/* Reference: "Stay, differently" in Serif Italic */}
        <h1 className="hero-title">
          Stay, <span className="hero-serif-italic">differently</span>
        </h1>
        
        <p className="hero-subtitle">
          ROYAL COMFORT. MEMORABLE MOMENTS.
        </p>

        {/* Floating Off-White Availability Widget (Exact reference match) */}
        <div className="floating-booking-widget" role="search" aria-label="Search Room Availability">
          <div className="widget-grid">
            
            {/* Check-In Field */}
            <div className="widget-field">
              <label htmlFor="hero-check-in" className="widget-label">
                <span>CHECK-IN</span>
              </label>
              <div className="widget-input-row">
                <input
                  id="hero-check-in"
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  max={maxCheckInStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="widget-date-input"
                  aria-label="Check-in date (schedule up to 7 days ahead)"
                />
                <Calendar size={18} className="widget-icon" />
              </div>
            </div>

            {/* Stay Duration Selector */}
            <div className="widget-field">
              <label htmlFor="hero-stay-nights" className="widget-label">
                <span>STAY DURATION</span>
              </label>
              <div className="widget-input-row">
                <select
                  id="hero-stay-nights"
                  value={stayNights}
                  onChange={(e) => setStayNights(Number(e.target.value))}
                  className="widget-select-input"
                  aria-label="Number of nights to stay"
                >
                  <option value={1}>1 Day (1 Night)</option>
                  <option value={2}>2 Days (2 Nights)</option>
                  <option value={3}>3 Days (3 Nights)</option>
                  <option value={4}>4 Days (4 Nights)</option>
                  <option value={5}>5 Days (5 Nights)</option>
                  <option value={6}>6 Days (6 Nights)</option>
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={10}>10 Days</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                </select>
              </div>
            </div>

            {/* Check-Out Field (Auto-calculated, Read-only) */}
            <div className="widget-field">
              <label htmlFor="hero-check-out" className="widget-label">
                <span>CHECK-OUT (AUTO)</span>
              </label>
              <div className="widget-input-row">
                <input
                  id="hero-check-out"
                  type="date"
                  value={checkOut}
                  readOnly
                  disabled
                  className="widget-date-input readonly-input"
                  aria-label="Check-out date auto-calculated"
                />
                <Calendar size={18} className="widget-icon" />
              </div>
            </div>

            {/* Guests Selector */}
            <div className="widget-field">
              <label htmlFor="hero-guests-select" className="widget-label">
                <span>GUESTS</span>
              </label>
              <div className="widget-input-row">
                <select
                  id="hero-guests-select"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="widget-select-input"
                  aria-label="Number of guests"
                >
                  <option value="1 Guest">1 Guest</option>
                  <option value="2 Guests">2 Guests</option>
                  <option value="3 Guests">3 Guests</option>
                  <option value="4+ Guests">4+ Guests</option>
                </select>
                <Users size={18} className="widget-icon" />
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="widget-btn-col">
              <button 
                id="hero-check-availability-btn"
                type="button" 
                className="btn-check-availability"
                onClick={handleCheckAvailability}
              >
                <span>CHECK AVAILABILITY</span>
              </button>
            </div>

          </div>

          {/* Micro-guarantee guarantee beneath card */}
          <div className="widget-footer-meta">
            <span><Check size={14} /> Best Rate Guarantee</span>
            <span className="dot-sep">•</span>
            <span>No Booking Fees</span>
            <span className="dot-sep">•</span>
            <span>Instant Confirmation</span>
          </div>
        </div>

        {/* Refined Search, Filter Chips & Price Slider */}
        <div className="hero-subfilters-card">
          <div className="subfilter-top-row">
            
            {/* Search Input */}
            <div className="hero-search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                id="hero-search-input"
                type="text"
                placeholder="Search suites by name, view or luxury amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero-search-input"
                aria-label="Search rooms and suites"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Max Price Slider */}
            <div className="hero-price-wrapper">
              <label htmlFor="hero-price-slider">
                Budget: <strong className="price-val">₹{maxPrice.toLocaleString()}</strong> / night
              </label>
              <input
                id="hero-price-slider"
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="hero-price-range"
                aria-label="Filter maximum price per night"
              />
            </div>

            {/* Available Only Switch */}
            <label className="available-toggle-label">
              <input
                id="available-only-checkbox"
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              <span>Available Only</span>
            </label>

          </div>

          {/* Category Chips */}
          <div className="hero-category-chips" role="group" aria-label="Room Category Filters">
            <span className="chips-label">
              <SlidersHorizontal size={14} /> Collection:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="results-counter">
            Showing <strong>{filteredCount}</strong> of {totalRooms} rooms curated for your stay
          </div>
        </div>

      </div>
    </section>
  );
}
