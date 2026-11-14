import React from 'react';
import { LogOut } from 'lucide-react';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'sightseeing', label: 'Sightseeing' },
  { key: 'agent', label: 'AI Agent' }
];

export default function Navbar({ activeTab, setActiveTab, bookingsCount, currentUser, onLogout }) {
  return (
    <header className="rk-nav">
      <div className="rk-nav-inner">
        <button type="button" className="rk-brand" onClick={() => setActiveTab('home')} aria-label="Rajmahal Residency, go to home">
          <img src="/rajmahal-logo.jpg" alt="" className="rk-brand-logo" />
          <span className="rk-brand-text">
            <span className="rk-brand-name">Rajmahal Residency</span>
            <span className="rk-brand-hindi" lang="hi">राजमहल रेज़िडेंसी</span>
          </span>
        </button>

        <nav className="rk-nav-links" aria-label="Main navigation">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              id={`nav-${tab.key}-btn`}
              type="button"
              className={`rk-nav-link ${activeTab === tab.key ? 'is-current' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
          <button
            id="nav-bookings-btn"
            type="button"
            className={`rk-nav-link ${activeTab === 'bookings' ? 'is-current' : ''}`}
            onClick={() => setActiveTab('bookings')}
            aria-current={activeTab === 'bookings' ? 'page' : undefined}
          >
            My bookings{bookingsCount > 0 && <span className="rk-count">{bookingsCount}</span>}
          </button>

          {currentUser ? (
            <span className="rk-user">
              <span className="rk-user-name">{currentUser.name}</span>
              <button type="button" className="rk-nav-link rk-signout" onClick={onLogout}>
                <LogOut size={15} aria-hidden="true" /> Sign out
              </button>
            </span>
          ) : (
            <button
              id="nav-auth-btn"
              type="button"
              className={`rk-nav-link rk-signin ${activeTab === 'auth' ? 'is-current' : ''}`}
              onClick={() => setActiveTab('auth')}
              aria-current={activeTab === 'auth' ? 'page' : undefined}
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
