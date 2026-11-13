import React from 'react';
import { Users, Check, ArrowRight } from 'lucide-react';

export default function RoomCard({ room, onSelectBook }) {
  const isAvailable = room.is_available;

  return (
    <article className={`room-card ${!isAvailable ? 'room-card-unavailable' : ''}`}>
      <div className="room-image-wrapper">
        <img 
          src={room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
          alt={room.type} 
          className="room-image"
          loading="lazy"
        />
        <div className="room-badges">
          <span className={`room-status-badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}>
            <span className="dot"></span>
            {isAvailable ? 'Available' : 'Reserved'}
          </span>
          <span className="room-id-badge">Room #{room.id}</span>
        </div>
      </div>

      <div className="room-content">
        <div className="room-header">
          <div>
            <h3 className="room-title">{room.type}</h3>
            <div className="room-capacity">
              <Users size={15} />
              <span>Up to {room.capacity || 2} Guests</span>
            </div>
          </div>
          <div className="room-pricing">
            <span className="price-amount">₹{room.price.toLocaleString()}</span>
            <span className="price-unit">/ night</span>
          </div>
        </div>

        <p className="room-description">{room.description || 'Premium accommodation with modern amenities and scenic ambiance.'}</p>

        <div className="room-amenities">
          {(room.amenities || ['Free Wi-Fi', 'Air Conditioning', 'Flat TV', 'Room Service']).map((item, idx) => (
            <span key={idx} className="amenity-tag">
              <Check size={12} className="amenity-check" />
              {item}
            </span>
          ))}
        </div>

        <div className="room-footer">
          {isAvailable ? (
            <button
              id={`book-room-${room.id}-btn`}
              className="book-now-btn"
              onClick={() => onSelectBook(room)}
            >
              <span>Book This Room</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="book-now-btn disabled"
              disabled
              title="This room is currently reserved"
            >
              <span>Currently Reserved</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
