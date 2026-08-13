import React from 'react';

export default function CartModal({ isOpen, onClose, cart, removeFromCart, onCheckout }) {
  if (!isOpen) return null;

  const totalRentAmount = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalBuyAmount = cart.reduce((sum, item) => sum + (item.buy_price || item.price || 0), 0);
  const hasBuyableItems = cart.some(item => item.buy_price);

  const handleWhatsAppCheckout = (type) => {
    if (cart.length === 0) return;
    const itemList = cart.map(i => {
      const price = type === 'buy' && i.buy_price ? i.buy_price : (i.price || 0);
      const typeLabel = type === 'buy' && i.buy_price ? 'Buy' : 'Rent';
      return `• ${i.name} (₹${price.toLocaleString('en-IN')}) - ${typeLabel}`;
    }).join('\n');
    
    const total = type === 'buy' ? totalBuyAmount : totalRentAmount;
    const msg = `Hi Varsha! I would like to place an order for the following items:\n\n${itemList}\n\nTotal Amount: ₹${total.toLocaleString('en-IN')}\nOrder Type: ${type === 'buy' ? 'Buy (where available)' : 'Rent'}`;
    window.open(`https://wa.me/919987600673?text=${encodeURIComponent(msg)}`, '_blank');
  };

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
        boxShadow: '-5px 0 25px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease'
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
            <i className="fa-solid fa-cart-shopping"></i> Shopping Cart ({cart.length})
          </h2>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ddd' }}></i>
              <p style={{ fontSize: '1rem', margin: 0 }}>Your cart is empty</p>
              <button 
                onClick={onClose}
                style={{
                  marginTop: '15px',
                  padding: '8px 20px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Explore Jewellery
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cart.map((item) => (
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                        Rent: ₹{(item.price || 0).toLocaleString('en-IN')}
                      </span>
                      {item.buy_price && (
                         <span style={{ fontWeight: '600', color: '#666', fontSize: '0.85rem' }}>
                           Buy: ₹{item.buy_price.toLocaleString('en-IN')}
                         </span>
                      )}
                      {!item.buy_price && (
                         <span style={{ fontSize: '0.75rem', color: '#888' }}>(Rent Only)</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px' }}
                    title="Remove item"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1rem', fontWeight: 'bold' }}>
              <span>Total Rent Amount:</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{totalRentAmount.toLocaleString('en-IN')}</span>
            </div>
            
            {hasBuyableItems && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1rem', fontWeight: 'bold' }}>
                <span>Total Buy Amount:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{totalBuyAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => handleWhatsAppCheckout('rent')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#25D366',
                  border: '2px solid #25D366',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Checkout for RENT
              </button>
              
              {hasBuyableItems && (
                <button
                  onClick={() => handleWhatsAppCheckout('buy')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
                  }}
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Checkout to BUY
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
