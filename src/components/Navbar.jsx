import React, { useState, useEffect } from 'react';

export default function Navbar({ currentRoute, onOpenBookingModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (currentRoute === 'home' && window.scrollY < 100) {
        setIsSolid(false);
      } else {
        setIsSolid(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentRoute]);

  const navItems = [
    { label: 'Home', route: 'home', hash: '#home' },
    { label: 'Our Collection', route: 'collection', hash: '#collection' },
    { label: 'Occasions', route: 'occasions', hash: '#occasions' },
    { label: 'How It Works', route: 'how-it-works', hash: '#how-it-works' },
    { label: 'Lookbook', route: 'lookbook', hash: '#lookbook' },
    { label: 'Contact', route: 'contact', hash: '#contact' },
  ];

  return (
    <nav className={`navbar ${isSolid ? 'solid' : 'transparent'}`} id="main-navbar">
      <div className="container">
        {/* Left: Logo */}
        <a href="#home" className="logo-container">
          <span className={`logo-main ${!isSolid ? 'white-text' : ''}`} id="logo-text-main">
            YUKTAA
          </span>
          <span className="logo-sub">Designer Jewellery</span>
          <span className={`logo-owner ${!isSolid ? 'white-text' : ''}`} id="logo-text-owner">
            by Varsha Jain
          </span>
        </a>

        {/* Center Nav Links (Hidden on Mobile) */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''} hide-on-mobile`} id="navbar-links">
          {navItems.map((item) => (
            <li key={item.route}>
              <a
                href={item.hash}
                className={`nav-item ${currentRoute === item.route ? 'active' : ''}`}
                data-page={item.route}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Actions (WhatsApp + Booking Button) */}
        <div className="nav-actions">
          <a
            href="https://wa.me/919987600673?text=Hi%20Varsha,%20I%20would%20like%20to%20enquire%20about%20booking%20a%20slot%20at%20your%20boutique."
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn-nav"
            aria-label="Contact on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>
          <button className="btn btn-accent btn-shimmer hide-on-mobile" onClick={onOpenBookingModal}>
            Book Your Slot
          </button>
          <div
            className={`hamburger ${mobileMenuOpen ? 'open' : ''} hide-on-mobile`}
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}
