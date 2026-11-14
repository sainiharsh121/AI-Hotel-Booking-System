import React from 'react';
import { PLACES, GROUPS } from '../data/sightseeing';

export default function SightseeingPage({ onNavigate }) {
  return (
    <div className="rk-page">
      <header className="rk-page-head">
        <h1 className="rk-page-title">Around Gurgaon</h1>
        <p className="rk-page-lede">
          Places worth a visit during your stay. Distances are approximate road distances from Sector 55, so check the route before you set out.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.key} className="rk-places" aria-labelledby={`rk-places-${group.key}`}>
          <div className="rk-places-head">
            <h2 id={`rk-places-${group.key}`} className="rk-h2">{group.title}</h2>
            <p className="rk-places-blurb">{group.blurb}</p>
          </div>
          <ul className="rk-place-list">
            {PLACES.filter((p) => p.group === group.key).map((place) => (
              <li key={place.id} className="rk-place">
                <div className="rk-place-main">
                  <h3 className="rk-place-name">{place.name}</h3>
                  <p className="rk-place-text">{place.text}</p>
                </div>
                <p className="rk-place-km">
                  <span className="rk-place-num">about {place.km}</span> km
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="rk-page-foot">
        Planning a visit? <button type="button" className="rk-text-btn" onClick={() => onNavigate('rooms')}>Choose your room</button>.
      </p>
    </div>
  );
}
