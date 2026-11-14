import React from 'react';
import KeyRack from './KeyRack';
import { toLocalISO, addDays, formatDay } from '../lib/dates';

const NIGHT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14];
const GUEST_OPTIONS = [1, 2, 3, 4];

const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function HeroSection({
  rooms,
  loading,
  stay,
  setStay,
  pickedRoom,
  onPick,
  onReserve
}) {
  const today = new Date();
  const todayStr = toLocalISO(today);
  const lastCheckIn = new Date(today);
  lastCheckIn.setDate(today.getDate() + 7);
  const lastCheckInStr = toLocalISO(lastCheckIn);

  const checkOut = addDays(stay.startDate, stay.nights);
  const checkOutValid = !Number.isNaN(checkOut.getTime());

  const guestWord = stay.guests === 1 ? 'guest' : 'guests';
  const freeFitting = rooms.filter((r) => r.is_available && (r.capacity || 1) >= stay.guests).length;

  const update = (patch) => setStay((prev) => ({ ...prev, ...patch }));

  return (
    <section className="rk-hero" aria-labelledby="rk-hero-title">
      <div className="rk-hero-intro">
        <h1 id="rk-hero-title" className="rk-hero-title">Rooms in Gurgaon, ready tonight.</h1>
        <p className="rk-hero-lede">
          Every key on the board is a real room. Choose your dates and party size, then pick the one you want.
        </p>
      </div>

      <form className="rk-stay" onSubmit={(e) => e.preventDefault()} aria-label="Your stay">
        <div className="rk-field">
          <label htmlFor="rk-checkin">Check-in</label>
          <input
            id="rk-checkin"
            type="date"
            value={stay.startDate}
            min={todayStr}
            max={lastCheckInStr}
            onChange={(e) => e.target.value && update({ startDate: e.target.value })}
          />
        </div>
        <div className="rk-field">
          <label htmlFor="rk-nights">Nights</label>
          <select
            id="rk-nights"
            value={stay.nights}
            onChange={(e) => update({ nights: Number(e.target.value) })}
          >
            {NIGHT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'night' : 'nights'}</option>
            ))}
          </select>
        </div>
        <div className="rk-field">
          <label htmlFor="rk-guests">Guests</label>
          <select
            id="rk-guests"
            value={stay.guests}
            onChange={(e) => update({ guests: Number(e.target.value) })}
          >
            {GUEST_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
        <p className="rk-stay-note" aria-live="polite">
          {checkOutValid && <>Check-out {formatDay(checkOut)}. </>}
          {loading
            ? 'Loading rooms…'
            : `${freeFitting} of ${rooms.length} rooms are free right now and fit ${stay.guests} ${guestWord}.`}
        </p>
      </form>

      <div className="rk-rack-wrap">
        <KeyRack
          rooms={rooms}
          loading={loading}
          guests={stay.guests}
          pickedId={pickedRoom?.id}
          onPick={onPick}
        />
      </div>

      <div className="rk-pick" aria-live="polite">
        {pickedRoom ? (
          <p className="rk-pick-text">
            <strong>Room {pickedRoom.id}</strong>, {pickedRoom.type}. {money(pickedRoom.price)} a night, sleeps {pickedRoom.capacity}.
          </p>
        ) : (
          <p className="rk-pick-text">
            {loading ? 'Loading rooms…' : `No free room fits ${stay.guests} ${guestWord} right now.`}
          </p>
        )}
        <div className="rk-pick-actions">
          <button
            type="button"
            className="rk-btn"
            disabled={!pickedRoom}
            onClick={() => pickedRoom && onReserve(pickedRoom)}
          >
            {pickedRoom ? `Reserve room ${pickedRoom.id}` : 'Reserve a room'}
          </button>
          <a className="rk-text-link" href="#accommodations-section">Compare room types</a>
        </div>
      </div>
    </section>
  );
}
