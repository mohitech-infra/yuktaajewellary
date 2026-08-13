import React, { useState } from 'react';

export default function Navbar({ 
  currentRoute, 
  cartCount, 
  wishlistCount, 
  onOpenAuthModal, 
  onOpenWishlistModal, 
  onOpenCartModal 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', route: 'home', hash: '#home' },
    { label: 'Our Collection', route: 'collection', hash: '#collection' },
    { label: 'Occasions', route: 'occasions', hash: '#occasions' },
    { label: 'Contact', route: 'contact', hash: '#contact' },
  ];

  return (
    <>

      <nav className="navbar solid" id="main-navbar" style={{ position: 'relative', height: 'auto', borderBottom: 'none', padding: '4px 0', backgroundColor: '#a7b165' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Left: Hamburger */}
          <div 
            className="hamburger open" 
            style={{ display: 'flex', cursor: 'pointer', zIndex: 1001 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fa-solid fa-bars" style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}></i>
          </div>

          <a href="#home" className="logo-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/assets/yuktaa_logo.png" alt="Yuktaa Logo" style={{ height: '55px', width: 'auto', display: 'block' }} />
          </a>

          {/* Right: Icons */}
          <div className="nav-actions" style={{ display: 'flex', gap: '18px', alignItems: 'center', color: 'var(--color-text)' }}>
            <i 
              className="fa-regular fa-user" 
              style={{ fontSize: '1.2rem', cursor: 'pointer' }}
              onClick={onOpenAuthModal}
              title="Sign In / Account"
            />
            
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={onOpenWishlistModal}
              title="Wishlist"
            >
              <i className="fa-regular fa-heart" style={{ fontSize: '1.2rem' }} />
              {wishlistCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '50%' }}>
                  {wishlistCount}
                </span>
              )}
            </div>

            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={onOpenCartModal}
              title="Cart"
            >
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: '1.2rem' }} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '50%' }}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <ul style={{ listStyle: 'none', padding: '1rem', margin: 0 }}>
              {navItems.map((item) => (
                <li key={item.route} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <a
                    href={item.hash}
                    style={{ color: currentRoute === item.route ? 'var(--color-primary)' : 'var(--color-text)', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.9rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Search Bar Row */}
      <div style={{ background: '#f4f4f4', padding: '10px 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '1280px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
          <input 
            type="text" 
            placeholder="Search For Jewellery" 
            style={{ width: '100%', padding: '12px 12px 12px 45px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.95rem', background: 'transparent' }} 
          />
        </div>
      </div>

      {/* Free Shipping Banner */}
      <div style={{ backgroundColor: '#909c4d', color: 'white', textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
        FREE SHIPPING FOR PREPAID ORDERS
      </div>
    </>
  );
}
