import React, { useState, useEffect, useRef } from 'react';

function LookbookCard({ item }) {
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
      className={`masonry-item ${isVisible ? 'card-entrance-visible' : 'card-entrance-hidden'}`}
      style={{
        aspectRatio: isVisible ? 'auto' : '2/3',
        minHeight: isVisible ? 'auto' : '300px',
      }}
    >
      <img 
        className="masonry-img" 
        src={isVisible ? item.img : ''} 
        loading="lazy" 
        alt={`${item.name}'s ${item.occ}`} 
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
      />
      <div className="masonry-overlay">
        <h4 className="masonry-name">{item.name}</h4>
        <span className="masonry-occ">{item.occ}</span>
      </div>
    </div>
  );
}

export default function LookbookView() {
  const items = [
    { name: 'Yuktaa Bride', occ: 'Bridal Polki Look', img: '/assets/jewel_74.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Reception Elegance', img: '/assets/jewel_66.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Festive Glam', img: '/assets/jewel_67.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Sangeet Night', img: '/assets/jewel_68.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Wedding Celebration', img: '/assets/jewel_69.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Bridal Look', img: '/assets/jewel_71.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Heritage Style', img: '/assets/jewel_73.jpeg' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="collection-hero">
        <div>
          <h1 className="brand-font">Lookbook</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
            Real Brides. Real Beauty.
          </p>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="masonry-grid">
            {items.map((item, idx) => (
              <LookbookCard key={idx} item={item} />
            ))}
          </div>

          {/* Submit Look CTA */}
          <div className="lookbook-cta-box fade-up-element visible">
            <h3 className="brand-font">Were You a Yuktaa Bride?</h3>
            <p>
              We'd love to feature you in our lookbook! Send us your high-resolution event photographs wearing our jewellery sets directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/919987600673?text=Hi%20Varsha,%20I%20would%20like%20to%20share%20my%20wedding%20photos%20for%20the%20Yuktaa%20lookbook."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-shimmer"
            >
              Submit Your Look
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
