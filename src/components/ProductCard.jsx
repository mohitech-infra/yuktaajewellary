import { useState, useEffect, useRef } from 'react';

export default function ProductCard({ product, isActive, className = '', addToCart, addToWishlist, isWishlisted }) {
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
      style={{ backgroundColor: 'white', border: 'none', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if(addToWishlist) addToWishlist(product);
        }}
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '50%' }}
      >
        <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: isWishlisted ? 'var(--color-primary)' : '#888', fontSize: '1.2rem' }}></i>
      </div>

      <div 
        className="card-img-wrapper" 
        style={{ aspectRatio: '2/3', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => {
          window.location.hash = `#product/${product.id}`;
        }}
      >
        <div
          className="card-placeholder"
          style={{
            backgroundImage: isVisible ? `url('${product.img}')` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: 'var(--color-accent-light)',
            transition: 'transform 0.4s ease'
          }}
        >
        </div>
      </div>
      <div className="card-info" style={{ padding: '15px 10px', textAlign: 'center', backgroundColor: '#fff', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--color-text)', marginBottom: '5px' }}>{product.name}</h3>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Rs. {product.price.toLocaleString('en-IN')}
          </span>
        </div>
        <div style={{ marginTop: '15px', borderTop: '1px solid var(--color-primary)' }}>
          <button 
            style={{ width: '100%', padding: '10px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              if(addToCart) addToCart(product);
            }}
          >
            +ADD
          </button>
        </div>
      </div>
    </div>
  );
}
