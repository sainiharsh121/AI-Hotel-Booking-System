import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoryBox from './components/CategoryBox';
import { CATEGORY_ORDER } from './lib/rooms';
import BookingModal from './components/BookingModal';
import BookingsList from './components/BookingsList';
import AuthPage from './components/AuthPage';
import LocationSection from './components/LocationSection';
import HomePage from './components/HomePage';
import SightseeingPage from './components/SightseeingPage';
import AgentPage from './components/AgentPage';
import Toast from './components/Toast';
import { api } from './services/api';
import { toLocalISO } from './lib/dates';
import { RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';
import './home.css';

export default function App() {
  // 'home' | 'rooms' | 'sightseeing' | 'agent' | 'bookings' | 'auth'
  // Guests who are not signed in land on Home; returning signed-in guests go straight to Rooms.
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('rajmahal_user') ? 'rooms' : 'home';
    } catch {
      return 'home';
    }
  });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [toast, setToast] = useState(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rajmahal_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Pending room booking when guest was redirected to sign in / register
  const [pendingBooking, setPendingBooking] = useState(null);

  // The stay the guest is planning on the home page, and the room they have picked on the key board
  const [stay, setStay] = useState(() => ({ startDate: toLocalISO(new Date()), nights: 1, guests: 2 }));
  const [pickedRoomId, setPickedRoomId] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('rajmahal_user', JSON.stringify(userData));
    if (pendingBooking?.room) {
      setSelectedRoomForBooking(pendingBooking.room);
      showToast('success', `Welcome back, ${userData.name}!`, `You can now confirm your reservation for ${pendingBooking.room.type}.`);
      setPendingBooking(null);
      setActiveTab('rooms');
    } else {
      showToast('success', `Welcome, ${userData.name}!`, 'You are now signed into Rajmahal Residency.');
      setActiveTab('rooms');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rajmahal_user');
    setPendingBooking(null);
    showToast('info', 'Signed Out', 'You have been safely signed out. See you soon!');
  };

  const handleRequireAuthForBooking = (room, dates) => {
    setPendingBooking({ room, dates });
    setSelectedRoomForBooking(null);
    setActiveTab('auth');
    showToast('info', 'Sign In Required', `Please sign in or register to complete your reservation for ${room.type}.`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        api.getRooms(true),
        api.getBookings()
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setIsOnline(true);
    } catch (err) {
      console.error('Error fetching data from API:', err);
      setIsOnline(false);
      showToast('error', 'Server Connection Error', 'Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Each tab opens at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // The room highlighted on the key board: the guest's pick if it is still free and big enough,
  // otherwise the cheapest free room that fits the party.
  const pickedRoom = useMemo(() => {
    const usable = (r) => r.is_available && (r.capacity || 1) >= stay.guests;
    return (
      rooms.find((r) => r.id === pickedRoomId && usable(r)) ||
      rooms.filter(usable).sort((a, b) => a.price - b.price || a.id - b.id)[0] ||
      null
    );
  }, [rooms, pickedRoomId, stay.guests]);

  const categoryGroups = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        rooms: rooms
          .filter((r) => r.type.toLowerCase() === category.toLowerCase())
          .sort((a, b) => a.id - b.id)
      })).filter((group) => group.rooms.length > 0),
    [rooms]
  );

  const handleReserve = (room) => {
    setPickedRoomId(room.id);
    setSelectedRoomForBooking(room);
  };

  const handleBookingSuccess = async (bookingPayload) => {
    if (!currentUser) {
      showToast('error', 'Authentication Required', 'You must register or log in with an account to confirm a room booking.');
      setPendingBooking({ room: selectedRoomForBooking });
      setSelectedRoomForBooking(null);
      setActiveTab('auth');
      return;
    }

    const res = await api.bookRoom({
      ...bookingPayload,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email
    });
    showToast('success', 'Reservation Confirmed! 🎉', res.message || 'Room booked successfully.');
    setSelectedRoomForBooking(null);
    setPendingBooking(null);
    await loadData();
    setActiveTab('bookings'); // Take user to bookings tab to see their stay!
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.cancelBooking(bookingId);
      showToast('info', 'Booking Cancelled', res.message || 'Your booking has been cancelled.');
      await loadData();
    } catch (err) {
      showToast('error', 'Cancellation Failed', err.message || 'Could not cancel booking.');
    }
  };

  return (
    <div className="app-layout rk-app">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookings.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {!isOnline && !loading && (
          <div className="offline-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Backend server offline:</strong> could not connect to <code>http://127.0.0.1:5000</code>. Start it with <code>python backend/app.py</code>.
            </div>
            <button className="btn-retry" onClick={loadData}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {activeTab === 'auth' && (
          <AuthPage
            initialMode="login"
            pendingBooking={pendingBooking}
            onAuthSuccess={handleAuthSuccess}
            onBackToRooms={() => setActiveTab('rooms')}
            showToast={showToast}
          />
        )}

        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}

        {activeTab === 'sightseeing' && <SightseeingPage onNavigate={setActiveTab} />}

        {activeTab === 'agent' && <AgentPage onNavigate={setActiveTab} />}

        {activeTab === 'rooms' && (
          <div>
            <HeroSection
              rooms={rooms}
              loading={loading}
              stay={stay}
              setStay={setStay}
              pickedRoom={pickedRoom}
              onPick={setPickedRoomId}
              onReserve={handleReserve}
            />

            <section id="accommodations-section" className="rk-section" aria-labelledby="rk-rooms-heading">
              <div className="rk-section-head">
                <h2 id="rk-rooms-heading" className="rk-h2">Five kinds of room</h2>
                <button type="button" className="rk-text-btn" onClick={loadData} aria-label="Refresh room availability">
                  <RefreshCw size={15} className={loading ? 'spinning' : ''} aria-hidden="true" /> Refresh
                </button>
              </div>

              {loading ? (
                <p className="rk-empty" role="status">Loading rooms…</p>
              ) : categoryGroups.length === 0 ? (
                <p className="rk-empty">No rooms to show yet. Check that the backend is running, then refresh.</p>
              ) : (
                <div className="rk-cats">
                  {categoryGroups.map((group) => (
                    <CategoryBox
                      key={group.category}
                      category={group.category}
                      rooms={group.rooms}
                      guests={stay.guests}
                      pickedId={pickedRoom?.id}
                      onPick={setPickedRoomId}
                      onReserve={handleReserve}
                    />
                  ))}
                </div>
              )}
            </section>

            <LocationSection />
          </div>
        )}

        {activeTab === 'bookings' && (
          <BookingsList
            bookings={bookings}
            currentUser={currentUser}
            onCancelBooking={handleCancelBooking}
            onBrowseRooms={() => setActiveTab('rooms')}
            onRequireAuth={() => setActiveTab('auth')}
          />
        )}
      </main>

      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          initialDates={pendingBooking?.dates || { startDate: stay.startDate, nights: stay.nights }}
          currentUser={currentUser}
          onClose={() => setSelectedRoomForBooking(null)}
          onRequireAuth={handleRequireAuthForBooking}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      <footer className="rk-footer">
        <div className="rk-footer-inner">
          <div className="rk-footer-brand">
            <img src="/rajmahal-logo.jpg" alt="" className="rk-brand-logo" />
            <div>
              <p className="rk-footer-name">Rajmahal Residency</p>
              <p className="rk-footer-hindi" lang="hi">राजमहल रेज़िडेंसी</p>
            </div>
          </div>
          <ul className="rk-footer-links">
            <li><button type="button" onClick={() => setActiveTab('home')}>Home</button></li>
            <li><button type="button" onClick={() => setActiveTab('rooms')}>Rooms</button></li>
            <li><button type="button" onClick={() => setActiveTab('sightseeing')}>Sightseeing</button></li>
            <li><button type="button" onClick={() => setActiveTab('agent')}>AI Agent</button></li>
            <li><button type="button" onClick={() => setActiveTab('bookings')}>My bookings</button></li>
            <li>
              <button type="button" onClick={() => setActiveTab('auth')}>
                {currentUser ? currentUser.name : 'Sign in'}
              </button>
            </li>
          </ul>
        </div>
        <p className="rk-footer-legal">© {new Date().getFullYear()} Rajmahal Residency, Sector 55, Gurgaon, Haryana.</p>
      </footer>
    </div>
  );
}
