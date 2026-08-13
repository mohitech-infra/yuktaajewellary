import React from 'react';

export default function BottomNav({ currentRoute, onOpenBookingModal }) {
  const navItems = [
    { label: 'Home', route: 'home', hash: '#home', icon: 'fa-house' },
    { label: 'Collection', route: 'collection', hash: '#collection', icon: 'fa-gem' },
    { label: 'Book Slot', route: 'book-slot', isAction: true, icon: 'fa-calendar-days' },
    { label: 'Lookbook', route: 'lookbook', hash: '#lookbook', icon: 'fa-images' },
    { label: 'Contact', route: 'contact', hash: '#contact', icon: 'fa-phone' },
  ];

  return (
    <div 
      className="bottom-nav" 
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #eee',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        padding: '10px 0',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        zIndex: 1000
      }}
    >
      {navItems.map((item, idx) => {
        if (item.isAction) {
          return (
            <button
              key={idx}
              className="bottom-nav-item bottom-nav-book-btn"
              onClick={onOpenBookingModal}
              aria-label="Book Slot"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.5rem',
                transform: 'translateY(-20px)',
                boxShadow: '0 4px 12px rgba(139,154,84,0.4)',
                cursor: 'pointer'
              }}
            >
              <i className={`fa-solid ${item.icon}`}></i>
            </button>
          );
        }

        const isActive = currentRoute === item.route;

        return (
          <a
            key={idx}
            href={item.hash}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary)' : '#888',
              fontSize: '0.7rem',
              fontWeight: isActive ? '700' : '500',
              gap: '4px',
              transition: 'color 0.2s ease'
            }}
          >
            <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.2rem' }}></i>
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
