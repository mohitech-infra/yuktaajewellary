import React from 'react';

export default function WishlistModal({ isOpen, onClose, wishlist, removeFromWishlist, addToCart }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '-5px 0 25px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-accent-light)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-heart"></i> Saved Wishlist ({wishlist.length})
          </h2>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>

        {/* Wishlist Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
              <i className="fa-regular fa-heart" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ddd' }}></i>
              <p style={{ fontSize: '1rem', margin: 0 }}>Your wishlist is empty</p>
              <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '5px' }}>Click the heart icon on any product to save it here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {wishlist.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '65px',
                    height: '65px',
                    borderRadius: '6px',
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--color-text)' }}>{item.name}</h4>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                      ₹{(item.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(item);
                      removeFromWishlist(item.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add to Cart
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer', padding: '5px' }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
