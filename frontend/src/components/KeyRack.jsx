import React from 'react';
import { CATEGORY_ORDER } from '../lib/rooms';


const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function KeyRack({ rooms, loading, guests, pickedId, onPick }) {
  const rows = CATEGORY_ORDER.map((type) => {
    const list = rooms
      .filter((r) => r.type.toLowerCase() === type.toLowerCase())
      .sort((a, b) => a.id - b.id);
    return { type, rooms: list, price: list[0]?.price };
  });

  let fobIndex = 0;

  return (
    <div className="rk-board" role="group" aria-label="Room key board" aria-busy={loading}>
      {rows.map((row) => (
        <div className="rk-row" key={row.type}>
          <div className="rk-row-label">
            <span className="rk-row-name">{row.type}</span>
            {row.price != null && <span className="rk-row-price">{money(row.price)}</span>}
          </div>

          <ul className="rk-slots">
            {loading
              ? [0, 1, 2, 3, 4].map((i) => (
                  <li key={i}>
                    <span className="rk-slot is-loading" aria-hidden="true" />
                  </li>
                ))
              : row.rooms.map((room) => {
                  const free = room.is_available;
                  const fits = (room.capacity || 1) >= guests;
                  const usable = free && fits;
                  const picked = usable && room.id === pickedId;
                  const state = !free ? 'is-taken' : !fits ? 'is-small' : 'is-free';
                  const label = !free
                    ? `Room ${room.id}, ${room.type}, reserved`
                    : !fits
                      ? `Room ${room.id}, ${room.type}, sleeps ${room.capacity}, too small for ${guests} ${guests === 1 ? 'guest' : 'guests'}`
                      : `Room ${room.id}, ${room.type}, ${money(room.price)} a night, free`;
                  const idx = fobIndex++;

                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        className={`rk-slot ${state} ${picked ? 'is-picked' : ''}`}
                        disabled={!usable}
                        aria-pressed={usable ? picked : undefined}
                        aria-label={label}
                        onClick={() => onPick(room.id)}
                      >
                        <span className="rk-hook" aria-hidden="true" />
                        {free && (
                          <span className="rk-fob" style={{ '--i': idx }} aria-hidden="true">
                            <span className="rk-fob-hole" />
                            <span className="rk-fob-num">{room.id}</span>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
          </ul>
        </div>
      ))}

      <p className="rk-legend">
        <span className="rk-legend-item"><span className="rk-swatch is-free" /> Free</span>
        <span className="rk-legend-item"><span className="rk-swatch is-taken" /> Reserved</span>
        <span className="rk-legend-item"><span className="rk-swatch is-small" /> Too small for your party</span>
      </p>
    </div>
  );
}
