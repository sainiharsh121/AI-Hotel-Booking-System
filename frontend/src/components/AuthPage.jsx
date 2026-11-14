import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, onBackToRooms, showToast, pendingBooking }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle mode switch
  const switchMode = (newMode) => {
    setMode(newMode);
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Only allow numbers and max 4 digits for password
  const handlePasswordChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 4) {
      setPassword(val);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleConfirmChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) {
      setConfirmPassword(val);
      if (errorMessage) setErrorMessage('');
    }
  };

  const pinsMismatch = mode === 'register' && confirmPassword.length === 4 && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (cleanPassword.length !== 4) {
      setErrorMessage('Security PIN must be exactly 4 numeric digits.');
      return;
    }

    if (mode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (confirmPassword !== cleanPassword) {
        setErrorMessage('The PINs you entered do not match. Please re-enter your PIN.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.register({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword
        });

        setSuccessMessage('Account created successfully! Redirecting...');
        if (showToast) {
          showToast('success', 'Registration Successful! 🎉', `Welcome to Rajmahal Residency, ${res.user.name}.`);
        }
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please check your details.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      setLoading(true);
      try {
        const res = await api.login({
          email: cleanEmail,
          password: cleanPassword
        });

        setSuccessMessage('Login successful! Redirecting...');
        if (showToast) {
          showToast('success', 'Welcome Back! ✨', `Glad to have you back, ${res.user.name}.`);
        }
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } catch (err) {
        setErrorMessage(err.message || 'Invalid email or 4-digit PIN. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="auth-page-container" role="main" aria-label="Authentication Page">
      <div className="auth-split-wrapper">
        
        {/* Registration & Login Form Card */}
        <section 
          className="auth-form-panel"
          aria-label={mode === 'register' ? 'Guest Registration Form' : 'Guest Sign In Form'}
        >
          <div className="auth-form-card">
            
            {/* Top Navigation: Back to Rooms */}
            <div className="form-card-top-nav">
              <button 
                type="button" 
                className="btn-back-link"
                onClick={onBackToRooms}
                aria-label="Back to available hotel suites"
              >
                <ArrowLeft size={16} />
                <span>Return to Hotel Suites</span>
              </button>
            </div>

            {/* Pending Booking Context Alert */}
            {pendingBooking?.room && (
              <div className="auth-pending-booking-callout" role="alert">
                <Sparkles size={18} className="gold-icon" />
                <div className="callout-text">
                  <strong>Complete Booking for {pendingBooking.room.type}</strong>
                  <p>Sign in or register below to confirm your reservation and lock in your dates.</p>
                </div>
              </div>
            )}

            {/* Toggle Switch Tabs (Sign In vs Create Account) */}
            <div 
              className="auth-mode-switch" 
              role="tablist" 
              aria-label="Authentication Options"
            >
              <button
                type="button"
                id="tab-login"
                role="tab"
                aria-selected={mode === 'login'}
                aria-controls="auth-form-content"
                className={`mode-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-register"
                role="tab"
                aria-selected={mode === 'register'}
                aria-controls="auth-form-content"
                className={`mode-tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMessage && (
              <div 
                className="auth-alert-box error" 
                role="alert" 
                aria-live="polite"
                id="auth-error-msg"
              >
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div 
                className="auth-alert-box success" 
                role="status" 
                aria-live="polite"
              >
                <CheckCircle2 size={18} className="alert-icon" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Interactive Form */}
            <form 
              id="auth-form-content"
              onSubmit={handleSubmit} 
              className="auth-main-form"
              noValidate
            >
              {/* Full Name field (Only in Register Mode) */}
              {mode === 'register' && (
                <div className="auth-field-group">
                  <label htmlFor="reg-name" className="auth-label">
                    <User size={16} aria-hidden="true" />
                    <span>Full Name <strong className="required-star" aria-hidden="true">*</strong></span>
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="e.g. Harsh Saini"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-text-input"
                      aria-required="true"
                    />
                  </div>
                </div>
              )}

              {/* Email Address field */}
              <div className="auth-field-group">
                <label htmlFor="auth-email-input" className="auth-label">
                  <Mail size={16} aria-hidden="true" />
                  <span>Email Address <strong className="required-star" aria-hidden="true">*</strong></span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="auth-email-input"
                    type="email"
                    name="email"
                    autoComplete="username"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-text-input"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* 4-Digit Security PIN / Password field */}
              <div className="auth-field-group">
                <div className="label-with-hint">
                  <label htmlFor="auth-pin-input" className="auth-label">
                    <Lock size={16} aria-hidden="true" />
                    <span>4-Digit Security PIN <strong className="required-star" aria-hidden="true">*</strong></span>
                  </label>
                  <span className="pin-badge-hint">4 Numbers</span>
                </div>

                <div className="auth-input-wrapper password-wrapper">
                  <input
                    id="auth-pin-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                    placeholder="••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className="auth-text-input pin-input"
                    aria-required="true"
                    aria-describedby="pin-instructions"
                  />

                  {/* Show/Hide PIN Button */}
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide security PIN' : 'Show security PIN'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* 4-Digit Visual Progress Indicator Dots */}
                <div className="pin-progress-row" id="pin-instructions">
                  <div className="pin-dots-container" aria-label={`${password.length} of 4 digits entered`}>
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`pin-dot ${idx < password.length ? 'filled' : ''} ${idx === password.length ? 'current' : ''}`}
                        aria-hidden="true"
                      ></span>
                    ))}
                  </div>
                  <span className="pin-hint-text">
                    {password.length === 4 ? (
                      <span className="pin-valid-text">
                        <CheckCircle2 size={13} /> Complete 4-digit PIN
                      </span>
                    ) : (
                      <span>Enter exactly 4 numeric digits (0-9)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Confirm PIN (Register Mode Only) */}
              {mode === 'register' && (
                <div className="auth-field-group">
                  <label htmlFor="auth-confirm-pin-input" className="auth-label">
                    <Lock size={16} aria-hidden="true" />
                    <span>Confirm PIN <strong className="required-star" aria-hidden="true">*</strong></span>
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-confirm-pin-input"
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      autoComplete="new-password"
                      required
                      placeholder="••••"
                      value={confirmPassword}
                      onChange={handleConfirmChange}
                      className="auth-text-input pin-input"
                      aria-required="true"
                      aria-invalid={pinsMismatch}
                      aria-describedby="confirm-pin-hint"
                    />
                  </div>
                  <span className="pin-hint-text" id="confirm-pin-hint" aria-live="polite">
                    {pinsMismatch ? (
                      <span className="pin-mismatch-text">PINs do not match</span>
                    ) : confirmPassword.length === 4 ? (
                      <span className="pin-valid-text">
                        <CheckCircle2 size={13} /> PINs match
                      </span>
                    ) : (
                      <span>Re-enter your 4-digit PIN</span>
                    )}
                  </span>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                className="btn-auth-submit"
                disabled={loading || password.length !== 4 || !email || (mode === 'register' && confirmPassword.length !== 4)}
              >
                {loading ? (
                  <span className="spinner-text">
                    <span className="button-spinner"></span>
                    {mode === 'register' ? 'Creating Account...' : 'Authenticating...'}
                  </span>
                ) : (
                  <>
                    <span>{mode === 'register' ? 'Complete Registration' : 'Sign In to Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="auth-card-footer">
              {mode === 'register' ? (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="link-switch-mode"
                    onClick={() => switchMode('login')}
                  >
                    Sign In here
                  </button>
                </p>
              ) : (
                <p>
                  New patron at Rajmahal Residency?{' '}
                  <button 
                    type="button" 
                    className="link-switch-mode"
                    onClick={() => switchMode('register')}
                  >
                    Create an Account
                  </button>
                </p>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="auth-security-guarantee">
              <ShieldCheck size={14} />
              <span>Sign in to manage your reservations</span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
