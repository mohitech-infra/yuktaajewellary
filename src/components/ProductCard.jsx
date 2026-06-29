import { useState, useEffect, useRef } from 'react';

export default function ProductCard({ product, isActive, className = '' }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    
    const current = cardRef.current;
    if (current) {
      observer.observe(current);
    }
    
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`product-card ${isActive ? 'active-card' : ''} ${isVisible ? 'card-entrance-visible' : 'card-entrance-hidden'} ${className}`}
      onClick={() => {
        window.location.hash = `#product/${product.id}`;
      }}
      style={{ cursor: 'pointer' }}
    >
      <span className="card-category">{product.categoryTag}</span>
      <div className="card-img-wrapper">
        <div
          className="card-placeholder"
          style={{
            backgroundImage: isVisible ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.15)), url('${product.img}')` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: 'var(--color-accent-light)',
          }}
        >
          {/* Cover image via style */}
        </div>
        <div className="card-action-overlay">
          <button className="card-btn">Check Availability</button>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{product.name}</h3>
        <span className="card-meta">Occasion: {product.occasions.join(' · ')}</span>
        <div className="card-price-row">
          <span className="card-price-label">Rental Price</span>
          <span className="card-price">
            ₹{product.price.toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>
              / event
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

