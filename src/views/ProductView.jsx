import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';

export default function ProductView({ productId, products, onOpenBookingModal, onOpenBuyModal, addToCart, addToWishlist, wishlist }) {
  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(product.img);
  const [activeThumb, setActiveThumb] = useState(0);

  // Reset states when product changes
  useEffect(() => {
    setSelectedImage(product.img);
    setActiveThumb(0);
    window.scrollTo(0, 0);
  }, [productId, product]);

  const thumbs = (product.images && product.images.length > 0)
    ? product.images.map((imgUrl, idx) => ({ url: imgUrl }))
    : [
        { url: product.img },
        { url: '/assets/jewel_14.jpeg' },
        { url: '/assets/jewel_15.jpeg' },
      ];

  const handleThumbClick = (url, index) => {
    setSelectedImage(url);
    setActiveThumb(index);
  };

  const handleWhatsAppEnquiry = () => {
    let message = `Hi Varsha! I am interested in renting the "${product.name}" from your Goregaon boutique.`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
  };

  // Recommendations
  const recommendations = products.filter((p) => p.id !== product.id).slice(0, 4);

  const isWishlisted = wishlist && wishlist.some(item => item.id === product.id);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ padding: '20px 15px' }}>
        
        {/* Back Link */}
        <a href="#collection" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to Collection
        </a>

        {/* Main Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'flex-start' }}>
          
          {/* Left: Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '12px', backgroundImage: `url('${selectedImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f9f9f9' }}></div>
            
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {thumbs.map((t, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleThumbClick(t.url, idx)}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '8px', 
                    backgroundImage: `url('${t.url}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    border: activeThumb === idx ? '2px solid var(--color-primary)' : '2px solid transparent',
                    opacity: activeThumb === idx ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#222', margin: '0 0 10px 0', lineHeight: 1.2 }}>{product.name}</h1>
                {addToWishlist && (
                  <button 
                    onClick={() => addToWishlist(product)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: isWishlisted ? 'var(--color-primary)' : '#ccc' }}
                  >
                    <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.occasions.map((occ) => (
                  <span key={occ} style={{ backgroundColor: '#f0f0f0', color: '#555', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {occ}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Rental Price</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{product.price.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 500 }}>/ event</span></span>
              </div>
              
              {product.buy_price && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Buy Price (One-time)</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#444' }}>₹{product.buy_price.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              {addToCart && (
                <button 
                  onClick={() => addToCart(product)}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,154,84,0.3)' }}
                >
                  <i className="fa-solid fa-cart-plus" style={{ marginRight: '8px' }}></i> Add to Cart
                </button>
              )}

              <button 
                onClick={handleWhatsAppEnquiry}
                style={{ width: '100%', padding: '16px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Enquire via WhatsApp
              </button>

              {product.buy_price && onOpenBuyModal && (
                <button 
                  onClick={() => onOpenBuyModal(product)}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#444', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                >
                  Buy This Set
                </button>
              )}
            </div>

            {/* Details */}
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333', marginBottom: '10px' }}>Description</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>{product.description}</p>
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#888', fontWeight: 600, fontSize: '0.9rem' }}>Materials</span>
                  <span style={{ color: '#333', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>{product.materials}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#888', fontWeight: 600, fontSize: '0.9rem' }}>Set Includes</span>
                  <span style={{ color: '#333', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>{product.includes}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Recommendations Grid */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '30px', fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
            YOU MAY ALSO LIKE
          </h2>
          <CarouselWrapper
            items={recommendations}
            desktopGridClass="catalog-grid"
            autoScrollInterval={0}
            renderItem={(p, index, isActive) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isActive={isActive} 
                addToCart={addToCart}
                addToWishlist={addToWishlist}
                isWishlisted={wishlist && wishlist.some(i => i.id === p.id)}
              />
            )}
          />
        </div>

      </div>
    </div>
  );
}
