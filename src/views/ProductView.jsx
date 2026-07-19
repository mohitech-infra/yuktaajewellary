import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';

export default function ProductView({ productId, products, onOpenBookingModal, onOpenBuyModal }) {
  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(product.img);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeThumb, setActiveThumb] = useState(0);

  // Reset states when product changes
  useEffect(() => {
    setSelectedImage(product.img);
    setSelectedDate('');
    setActiveThumb(0);
  }, [productId, product]);

  const thumbs = (product.images && product.images.length > 0)
    ? product.images.map((imgUrl, idx) => ({
        label: idx === 0 ? 'Main Set' : idx === 1 ? 'Earrings View' : `Detail Angle ${idx}`,
        url: imgUrl
      }))
    : [
        { label: 'Main Set', url: product.img },
        { label: 'Earrings View', url: '/assets/jewel_14.jpeg' },
        { label: 'Close-up Details', url: '/assets/jewel_15.jpeg' },
      ];

  const handleThumbClick = (url, index) => {
    setSelectedImage(url);
    setActiveThumb(index);
  };

  const handleWhatsAppEnquiry = () => {
    let message = `Hi Varsha! I am interested in renting the "${product.name}" from your Goregaon boutique.`;
    if (selectedDate) {
      message += ` I'd like to check its availability for my event on ${selectedDate}.`;
    }
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
  };

  // Recommendations: filter out current product, take first 3
  const recommendations = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div>
      <section className="section-padding">
        <div className="container">
          {/* Back Link */}
          <a
            href="#collection"
            className="view-all-link"
            style={{ marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Collection
          </a>

          {/* Main Layout */}
          <div className="product-detail-layout" id="product-detail-wrapper">
            {/* Left: Gallery Layout */}
            <div className="gallery-container fade-up-element visible">
              <div className="gallery-main">
                <div
                  className="gallery-main-placeholder"
                  id="main-gallery-view"
                  style={{
                    backgroundImage: `url('${selectedImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  {/* Main Display */}
                </div>
              </div>
              <div className="gallery-thumbs">
                {thumbs.map((t, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb ${activeThumb === idx ? 'active' : ''}`}
                    onClick={() => handleThumbClick(t.url, idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Information & Calendar */}
            <div className="prod-info-panel fade-up-element visible">
              <span className="prod-badge">Available to Rent</span>
              <h1 className="prod-title">{product.name}</h1>

              <div className="prod-occ-tags">
                {product.occasions.map((occ) => (
                  <span key={occ} className="prod-occ-tag">
                    {occ}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="prod-price-box" style={{ flex: 1 }}>
                  <div className="prod-price-box-label">Rental Price (Per Occasion)</div>
                  <div className="prod-price-box-val">₹{product.price.toLocaleString('en-IN')}</div>
                </div>
                {product.buy_price && (
                  <div className="prod-price-box prod-price-box--buy" style={{ flex: 1 }}>
                    <div className="prod-price-box-label">Buy Price (One-time)</div>
                    <div className="prod-price-box-val" style={{ color: 'var(--color-gold-dark)' }}>₹{product.buy_price.toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>

              <h4 className="prod-desc-title">Description</h4>
              <p className="prod-desc-text">{product.description}</p>

              <div className="prod-specs">
                <div className="spec-item">
                  <span className="spec-label">Materials</span>
                  <span className="spec-val">{product.materials}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Set Includes</span>
                  <span className="spec-val">{product.includes}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="prod-actions">
                <button 
                  className="btn btn-whatsapp-large btn-shimmer" 
                  onClick={handleWhatsAppEnquiry}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', width: '100%', padding: '1.2rem 2rem', fontSize: '1.1rem' }}
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.5rem' }}></i>{' '}
                  Book & Enquire via WhatsApp
                </button>
                {product.buy_price && (
                  <button
                    className="btn btn-buy btn-shimmer"
                    onClick={() => onOpenBuyModal && onOpenBuyModal(product)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', width: '100%', padding: '1.2rem 2rem', fontSize: '1.1rem', marginTop: '0.75rem' }}
                  >
                    <i className="fa-solid fa-bag-shopping" style={{ fontSize: '1.3rem' }}></i>{' '}
                    Buy This Set — ₹{product.buy_price.toLocaleString('en-IN')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div style={{ marginTop: '6rem' }} className="fade-up-element visible">
            <h2 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
              You May Also Like
            </h2>
            <CarouselWrapper
              items={recommendations}
              desktopGridClass="catalog-grid"
              autoScrollInterval={0}
              renderItem={(p, index, isActive) => (
                <ProductCard key={p.id} product={p} isActive={isActive} />
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
