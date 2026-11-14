import React from 'react';

const ARCHES = [
  { src: '/home-photos/web/courtyard.jpg', alt: 'Marble courtyard with a fountain, carved arches and a hanging lantern', caption: 'The marble courtyard', pos: 'left' },
  { src: '/home-photos/web/entrance.jpg', alt: 'The Rajmahal Residency entrance, with staff in white and turbans greeting guests beside vintage cars', caption: 'The entrance court', pos: 'mid' },
  { src: '/home-photos/web/suite.jpg', alt: 'A suite with a four-poster bed under a painted, vaulted ceiling and chandelier', caption: 'A suite under a vaulted ceiling', pos: 'right' }
];

const DIFFERENCES = [
  {
    title: 'You choose the exact room',
    text: 'Every room has its number on our key board. Pick 204 or 305 yourself, instead of waiting for one to be assigned at the desk.'
  },
  {
    title: 'You see what is free first',
    text: 'The board shows which rooms are free and which are reserved right now, and hides the ones too small for your party.'
  },
  {
    title: 'You can ask before you book',
    text: 'Our AI agent answers questions about room types and prices, and suggests a room for couples, families or solo travellers.'
  },
  {
    title: 'You can change your mind',
    text: 'Cancel a reservation yourself from My bookings. No phone call needed.'
  }
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="rk-home">
      <section className="rk-welcome" aria-labelledby="rk-welcome-title">
        <div className="rk-welcome-copy">
          <h1 id="rk-welcome-title" className="rk-hero-title">A palace-style stay in Gurgaon.</h1>
          <p className="rk-hero-lede">
            Rajmahal Residency is built around carved sandstone arches, a marble courtyard with a fountain, and rooms lit by lantern and chandelier. Choose your exact room and book it here.
          </p>
          <div className="rk-pick-actions">
            <button type="button" className="rk-btn" onClick={() => onNavigate('rooms')}>Choose a room</button>
            <button type="button" className="rk-text-btn" onClick={() => onNavigate('agent')}>Ask the AI agent</button>
          </div>
        </div>

        <ul className="rk-arches">
          {ARCHES.map((a) => (
            <li key={a.pos} className={`rk-arch-item is-${a.pos}`}>
              <figure>
                <img className="rk-arch" src={a.src} alt={a.alt} />
                <figcaption>{a.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section className="rk-details" aria-labelledby="rk-details-title">
        <div className="rk-details-copy">
          <h2 id="rk-details-title" className="rk-h2">Details you will notice</h2>
          <p>
            Rajmahal Residency is part of the Rajmahal Group of Hotels. Our terraces are open to the afternoon light, and our suites are finished with painted ceilings, gilded work and marigold garlands.
          </p>
        </div>
        <figure className="rk-detail-fig">
          <img src="/home-photos/web/terrace.jpg" alt="A carved sandstone terrace with arched openings" loading="lazy" />
          <figcaption>A carved sandstone terrace</figcaption>
        </figure>
        <figure className="rk-detail-fig">
          <img src="/home-photos/web/gilded-suite.jpg" alt="A suite with a gold painted ceiling, hanging garlands and a chandelier" loading="lazy" />
          <figcaption>A suite with a painted gold ceiling</figcaption>
        </figure>
      </section>

      <section className="rk-diff" aria-labelledby="rk-diff-title">
        <h2 id="rk-diff-title" className="rk-h2">What is different about booking here</h2>
        <dl className="rk-diff-list">
          {DIFFERENCES.map((d) => (
            <div key={d.title} className="rk-diff-item">
              <dt>{d.title}</dt>
              <dd>{d.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
