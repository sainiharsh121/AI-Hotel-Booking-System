import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoryBox from './components/CategoryBox';
import BookingModal from './components/BookingModal';
import BookingsList from './components/BookingsList';
import AuthPage from './components/AuthPage';
import ReviewsSection from './components/ReviewsSection';
import Toast from './components/Toast';
import { api } from './services/api';
import { RefreshCw, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'bookings' | 'auth'
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

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
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
      showToast('error', 'Server Connection Error', 'Make sure the Flask backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 5 Categories Architecture with 5 rooms in each category
  const categoryGroups = useMemo(() => {
    const ALL_CATEGORIES = ['Single', 'Double', 'Suite', 'Deluxe', 'Family'];

    return ALL_CATEGORIES.map((catKey) => {
      const catRooms = rooms.filter((r) => r.type.toLowerCase() === catKey.toLowerCase());
      const availableRooms = catRooms.filter((r) => r.is_available);
      return {
        category: catKey,
        rooms: catRooms,
        availableCount: availableRooms.length,
        totalCount: catRooms.length,
        sampleRoom: catRooms[0] || null
      };
    }).filter((group) => {
      // Category match
      if (selectedCategory !== 'All' && group.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = group.category.toLowerCase().includes(query);
        const matchesRooms = group.rooms.some(r => 
          r.id.toString().includes(query) ||
          (r.description || '').toLowerCase().includes(query) ||
          (r.amenities || []).some(a => a.toLowerCase().includes(query))
        );
        if (!matchesName && !matchesRooms) return false;
      }
      // Availability filter
      if (onlyAvailable && group.availableCount === 0) {
        return false;
      }
      // Price filter
      if (group.sampleRoom && group.sampleRoom.price > maxPrice) {
        return false;
      }
      return true;
    });
  }, [rooms, selectedCategory, searchTerm, onlyAvailable, maxPrice]);

  const availableCount = rooms.filter(r => r.is_available).length;

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
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableRoomsCount={availableCount}
        bookingsCount={bookings.length}
        isOnline={isOnline}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* Offline Warning Banner */}
        {!isOnline && !loading && (
          <div className="offline-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Backend Server Offline:</strong> Could not connect to <code>http://127.0.0.1:5000</code>. Please start the Flask backend using <code>python backend/app.py</code>.
            </div>
            <button className="btn-retry" onClick={loadData}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* View 1: Auth (Registration & Login Split Page) */}
        {activeTab === 'auth' && (
          <AuthPage
            initialMode="login"
            pendingBooking={pendingBooking}
            onAuthSuccess={handleAuthSuccess}
            onBackToRooms={() => setActiveTab('rooms')}
            showToast={showToast}
          />
        )}

        {/* View 2: Rooms & Suites */}
        {activeTab === 'rooms' && (
          <div>
            <HeroSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onlyAvailable={onlyAvailable}
              setOnlyAvailable={setOnlyAvailable}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              totalRooms={rooms.length}
              filteredCount={categoryGroups.reduce((acc, g) => acc + g.rooms.length, 0)}
            />

            <section id="accommodations-section" className="rooms-container" aria-label="Rajmahal Residency Accommodations">
              <div className="section-header-row">
                <div className="section-headings-col">
                  <span className="section-pre-title">5 ROOM CATEGORIES • 5 ROOMS EACH</span>
                  <h2 className="section-serif-heading">Royal Accommodations Collection</h2>
                  <p className="section-subtitle">
                    Select your preferred category and choose your specific Room ID from 5 curated suites per collection.
                  </p>
                </div>
                <button className="btn-refresh" onClick={loadData} title="Refresh room list" aria-label="Refresh available rooms">
                  <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading available luxury suites...</p>
                </div>
              ) : categoryGroups.length === 0 ? (
                <div className="no-results-card">
                  <h3>No Categories Match Your Criteria</h3>
                  <p>Try resetting filters or adjusting your max price slider to discover other options.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchTerm('');
                      setOnlyAvailable(false);
                      setMaxPrice(10000);
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="categories-boxes-grid">
                  {categoryGroups.map((group) => (
                    <CategoryBox
                      key={group.category}
                      category={group.category}
                      rooms={group.rooms}
                      onSelectBook={(selected) => setSelectedRoomForBooking(selected)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Guest Reviews Section (Verde Boutique Hotel Reference) */}
            <ReviewsSection />
          </div>
        )}

        {/* View 3: My Bookings */}
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

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          initialDates={pendingBooking?.dates}
          currentUser={currentUser}
          onClose={() => setSelectedRoomForBooking(null)}
          onRequireAuth={handleRequireAuthForBooking}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              <img src="/rajmahal-logo.jpg" alt="Rajmahal Logo" className="footer-logo-img" />
              <h3 className="footer-brand">Rajmahal Residency</h3>
            </div>
            <p className="footer-desc">
              Exemplary royal hospitality, heritage architecture, and authentic warmth. Dedicated to offering unforgettable memories in every stay.
            </p>
            <div className="contact-details">
              <div className="contact-item"><MapPin size={15} /> Rohtak, Haryana, India</div>
              <div className="contact-item"><Phone size={15} /> +91 98765 43210</div>
              <div className="contact-item"><Mail size={15} /> reservations@rajmahalresidency.com</div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => setActiveTab('rooms')}>Explore Suites</button></li>
              <li><button onClick={() => setActiveTab('bookings')}>Manage Bookings</button></li>
              <li><button onClick={() => setActiveTab('auth')}>{currentUser ? `Member: ${currentUser.name}` : 'Member Sign In / Register'}</button></li>
              <li><a href="#about">About Our Heritage</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Guest Services</h4>
            <ul>
              <li><span>24/7 Concierge</span></li>
              <li><span>Airport Chauffeur</span></li>
              <li><span>Private Dining</span></li>
              <li><span>Express Check-in</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Rajmahal Residency. Crafted with excellence.</p>
          <p className="tech-badge">Powered by Flask REST API & Modern React (Vite)</p>
        </div>
      </footer>
    </div>
  );
}
