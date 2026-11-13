import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Sophia M.',
    location: 'New York, USA',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    comment: '“A hidden gem! Beautiful rooms, amazing service, and the perfect location for complete tranquility.”'
  },
  {
    id: 2,
    name: 'James T.',
    location: 'London, UK',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    comment: '“The attention to detail is unmatched. Felt like a personalized luxury experience from start to finish.”'
  },
  {
    id: 3,
    name: 'Priya K.',
    location: 'Dubai, UAE',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    comment: '“Peaceful, stylish, and exceptionally clean. The private terrace and bedding were out of this world!”'
  }
];

export default function ReviewsSection() {
  return (
    <section className="reviews-section" aria-label="Guest Testimonials and Reviews">
      <div className="section-pre-title">GUEST REVIEWS</div>
      <h2 className="section-serif-heading">Loved by our guests</h2>
      
      <div className="reviews-grid">
        {REVIEWS.map((rev) => (
          <article key={rev.id} className="review-card" aria-label={`Review by ${rev.name}`}>
            <div className="review-stars" aria-label={`${rev.rating} out of 5 stars`}>
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} size={16} className="star-filled" fill="currentColor" />
              ))}
            </div>

            <p className="review-comment">{rev.comment}</p>

            <div className="review-author">
              <img 
                src={rev.avatar} 
                alt={rev.name} 
                className="review-avatar"
                loading="lazy"
              />
              <div className="author-meta">
                <strong className="author-name">{rev.name}</strong>
                <span className="author-location">{rev.location}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
