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
    <div className="bottom-nav">
      {navItems.map((item, idx) => {
        if (item.isAction) {
          return (
            <button
              key={idx}
              className="bottom-nav-item bottom-nav-book-btn"
              onClick={onOpenBookingModal}
              aria-label="Book Slot"
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
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
