import React from 'react';

const CATEGORY_DETAILS = {
  Single: { name: 'Single Sanctuary', tagline: 'A quiet room for one traveller' },
  Double: { name: 'Double Heritage Room', tagline: 'Queen bed and an en-suite for two' },
  Suite: { name: 'Executive Royal Suite', tagline: 'Separate living area and a balcony' },
  Deluxe: { name: 'Deluxe Palace Haven', tagline: 'Marble bath and 24/7 room service' },
  Family: { name: 'Grand Family Retreat', tagline: 'Two double beds and a kitchenette' }
};

const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Drop a category photo at /public/rooms/<category>.jpg (for example single.jpg)
// to replace the backend's stock image for that row.
const handleImageError = (fallback) => (e) => {
  const img = e.currentTarget;
  img.onerror = null;
  if (fallback) img.src = fallback;
};

export default function CategoryBox({ category, rooms = [], guests, pickedId, onPick, onReserve }) {
  const details = CATEGORY_DETAILS[category] || { name: `${category} room`, tagline: '' };
  const sample = rooms[0] || {};
  const capacity = sample.capacity || 1;
  const fits = capacity >= guests;
  const freeRooms = rooms.filter((r) => r.is_available);
  const rowRoom =
    freeRooms.find((r) => r.id === pickedId) || freeRooms[0] || null;

  const guestWord = guests === 1 ? 'guest' : 'guests';
  const canReserve = Boolean(rowRoom) && fits;

  return (
    <article className="rk-cat" aria-labelledby={`rk-cat-${category}`}>
      <img
        className="rk-cat-photo"
        src={`/rooms/${category.toLowerCase()}.jpg`}
        onError={handleImageError(sample.image)}
        alt={`${details.name}`}
        loading="lazy"
      />

      <div className="rk-cat-body">
        <h3 id={`rk-cat-${category}`} className="rk-cat-name">{details.name}</h3>
        <p className="rk-cat-tagline">{details.tagline}</p>

        <p className="rk-cat-desc">{sample.description}</p>
        {sample.amenities?.length > 0 && (
          <p className="rk-cat-amenities">{sample.amenities.join(', ')}.</p>
        )}

        <dl className="rk-cat-facts">
          <div><dt>From</dt><dd>{sample.price != null ? `${money(sample.price)} a night` : 'Price on request'}</dd></div>
          <div><dt>Sleeps</dt><dd>{capacity}</dd></div>
          <div><dt>Free now</dt><dd>{freeRooms.length} of {rooms.length}</dd></div>
        </dl>

        <div className="rk-cat-pick" role="group" aria-label={`Choose a ${category} room`}>
          <span className="rk-cat-pick-label">Room</span>
          {rooms.map((room) => {
            const free = room.is_available;
            const on = free && fits && rowRoom?.id === room.id;
            return (
              <button
                key={room.id}
                type="button"
                className={`rk-room-btn ${on ? 'is-picked' : ''}`}
                disabled={!free}
                aria-pressed={free ? on : undefined}
                aria-label={free ? `Room ${room.id}, free` : `Room ${room.id}, reserved`}
                onClick={() => onPick(room.id)}
              >
                {room.id}
              </button>
            );
          })}
        </div>

        <div className="rk-cat-action">
          <button
            type="button"
            className="rk-btn"
            disabled={!canReserve}
            onClick={() => canReserve && onReserve(rowRoom)}
          >
            {!rowRoom
              ? 'All rooms reserved'
              : !fits
                ? `Too small for ${guests} ${guestWord}`
                : `Reserve room ${rowRoom.id}`}
          </button>
          {rowRoom && !fits && (
            <span className="rk-cat-hint">Sleeps {capacity}. Change guests at the top of the page.</span>
          )}
        </div>
      </div>
    </article>
  );
}
