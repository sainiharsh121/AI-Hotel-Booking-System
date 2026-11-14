import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function LocationSection() {
  return (
    <section className="rk-info" aria-label="Find us and how booking works">
      <div className="rk-info-col">
        <h2 className="rk-h2">Find us in Gurgaon</h2>
        <ul className="rk-contact">
          <li><MapPin size={18} aria-hidden="true" /> <span>Sector 55, Gurgaon, Haryana, India</span></li>
          <li><Phone size={18} aria-hidden="true" /> <a href="tel:+919876543210">+91 98765 43210</a></li>
          <li><Mail size={18} aria-hidden="true" /> <a href="mailto:reservations@rajmahalresidency.com">reservations@rajmahalresidency.com</a></li>
        </ul>
      </div>

      <div className="rk-info-col">
        <h2 className="rk-h2">How booking works</h2>
        <ul className="rk-rules">
          <li>Pick a free room from the key board. Check-in dates open up to 7 days ahead.</li>
          <li>Sign in with your email and 4-digit PIN to confirm the reservation.</li>
          <li>Cancel from My bookings if your plans change.</li>
        </ul>
      </div>
    </section>
  );
}
