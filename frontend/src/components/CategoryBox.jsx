import React, { useState, useEffect } from 'react';
import { Users, Check, ArrowRight, BedDouble, ShieldCheck, Sparkles, Lock, Star } from 'lucide-react';

const CATEGORY_DETAILS = {
  Single: {
    displayName: 'Single Sanctuary',
    tagline: 'Solitude & Serenity for Solo Travelers',
    rating: '4.8 (124 reviews)'
  },
  Double: {
    displayName: 'Double Heritage Room',
    tagline: 'Artisanal Elegance for Couples & Pairs',
    rating: '4.9 (186 reviews)'
  },
  Suite: {
    displayName: 'Executive Royal Suite',
    tagline: 'Spacious Luxury with Panoramic Balcony',
    rating: '5.0 (210 reviews)'
  },
  Deluxe: {
    displayName: 'Deluxe Palace Haven',
    tagline: 'Opulent Marble Bath & Bespoke Butler Service',
    rating: '4.9 (142 reviews)'
  },
  Family: {
    displayName: 'Grand Family Retreat',
    tagline: 'Expansive Multi-Bed Heritage Villa',
    rating: '4.9 (98 reviews)'
  }
};

export default function CategoryBox({ category, rooms = [], onSelectBook }) {
  const details = CATEGORY_DETAILS[category] || {
    displayName: `${category} Accommodation`,
    tagline: 'Luxury Comfort & Heritage Warmth',
    rating: '4.9 (150 reviews)'
  };

  const sample = rooms[0] || {};
  const availableRooms = rooms.filter((r) => r.is_available);
  const totalCount = rooms.length;
  const availableCount = availableRooms.length;

  // Selected room state (defaults to first available room, or first room)
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    return availableRooms.length > 0 ? availableRooms[0].id : rooms[0]?.id;
  });

  // Keep selected room in sync if rooms list updates
  useEffect(() => {
    const current = rooms.find((r) => r.id === selectedRoomId);
    if (!current || !current.is_available) {
      if (availableRooms.length > 0) {
        setSelectedRoomId(availableRooms[0].id);
      }
    }
  }, [rooms]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleBookClick = () => {
    if (selectedRoom && selectedRoom.is_available) {
      onSelectBook(selectedRoom);
    }
  };

  return (
    <article className="category-showcase-box" aria-labelledby={`category-title-${category}`}>
      {/* Category Visual Media Banner */}
      <div className="category-media-header">
        <img 
          src={sample.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
          alt={details.displayName}
          className="category-hero-image"
          loading="lazy"
        />
        <div className="category-media-overlay"></div>

        {/* Top Badges */}
        <div className="category-top-tags">
          <span className="category-badge-pill">
            <BedDouble size={14} />
            <span>{category.toUpperCase()} CATEGORY</span>
          </span>
          <span className={`category-availability-pill ${availableCount > 0 ? 'available' : 'booked-out'}`}>
            <span className="status-ping"></span>
            <span>{availableCount} of {totalCount} Rooms Available</span>
          </span>
        </div>

        {/* Floating Price & Rating on Image */}
        <div className="category-floating-info">
          <div className="category-rating-tag">
            <Star size={13} className="star-icon-filled" />
            <span>{details.rating}</span>
          </div>
          <div className="category-rate-chip">
            <span className="rate-amount">₹{sample.price ? sample.price.toLocaleString() : 'N/A'}</span>
            <span className="rate-period">/ night</span>
          </div>
        </div>
      </div>

      {/* Category Body Details */}
      <div className="category-box-body">
        <div className="category-info-header">
          <div>
            <h3 id={`category-title-${category}`} className="category-display-title">
              {details.displayName}
            </h3>
            <p className="category-tagline-text">{details.tagline}</p>
          </div>
          <div className="category-capacity-badge">
            <Users size={16} />
            <span>Up to {sample.capacity || 2} Guests</span>
          </div>
        </div>

        <p className="category-description">
          {sample.description || 'Artisanal luxury suite featuring authentic heritage architecture, modern amenities, and curated furnishings.'}
        </p>

        {/* Curated Amenities List */}
        <div className="category-amenities-row">
          {(sample.amenities || ['Free Wi-Fi', 'Air Conditioning', 'En-suite Bathroom', 'Room Service']).map((item, idx) => (
            <span key={idx} className="amenity-chip">
              <Check size={12} className="amenity-check-icon" />
              <span>{item}</span>
            </span>
          ))}
        </div>

        {/* 5 Rooms ID Grid (User Requirement) */}
        <div className="category-rooms-section">
          <div className="rooms-section-header">
            <div className="rooms-section-title">
              <Sparkles size={15} className="gold-text" />
              <span>5 Rooms in this Category (Select Room ID):</span>
            </div>
            {selectedRoom && (
              <span className="selected-room-indicator">
                Selected: <strong>Room #{selectedRoom.id}</strong>
              </span>
            )}
          </div>

          <div className="room-ids-grid" role="radiogroup" aria-label={`Select room in ${category} category`}>
            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const isAvail = room.is_available;

              return (
                <button
                  key={room.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!isAvail}
                  id={`room-chip-${room.id}`}
                  className={`room-chip-btn ${isSelected ? 'selected' : ''} ${!isAvail ? 'chip-reserved' : 'chip-free'}`}
                  onClick={() => setSelectedRoomId(room.id)}
                  title={isAvail ? `Select Room #${room.id} (Available)` : `Room #${room.id} is currently Reserved`}
                >
                  <div className="chip-content-wrap">
                    <div className="chip-top-row">
                      <span className={`chip-dot ${isAvail ? 'dot-free' : 'dot-busy'}`}></span>
                      <span className="chip-number">#{room.id}</span>
                    </div>
                    <span className="chip-label">
                      {isAvail ? 'Available' : 'Reserved'}
                    </span>
                  </div>
                  {isSelected && isAvail && (
                    <span className="chip-active-indicator">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Box Action Footer */}
        <div className="category-box-footer">
          <div className="footer-room-summary">
            {selectedRoom ? (
              <div>
                <span className="summary-pre">Ready to Reserve</span>
                <div className="summary-main">
                  <strong>Room #{selectedRoom.id}</strong> ({category}) • <span className="gold-text">₹{selectedRoom.price.toLocaleString()}</span> / night
                </div>
              </div>
            ) : (
              <div>
                <span className="summary-pre">Category Status</span>
                <strong>All 5 Rooms Currently Reserved</strong>
              </div>
            )}
          </div>

          {availableCount > 0 ? (
            <button
              id={`book-category-${category.toLowerCase()}-btn`}
              className="btn-category-book"
              onClick={handleBookClick}
              aria-label={`Book Room #${selectedRoom?.id} in ${details.displayName}`}
            >
              <span>Book Room #{selectedRoom?.id || availableRooms[0]?.id}</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="btn-category-book disabled-btn" 
              disabled 
              title="All 5 rooms in this category are reserved"
            >
              <Lock size={16} />
              <span>All 5 Rooms Booked</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
