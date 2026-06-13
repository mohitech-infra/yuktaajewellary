import React from 'react';

export default function Footer() {
  const handleSubscribe = () => {
    alert('Thank you for subscribing to Yuktaa Circle!');
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          {/* Col 1: About & Socials */}
          <div className="footer-col-about">
            <a href="#home" className="logo-container" style={{ color: 'var(--color-white)' }}>
              <span className="logo-main" style={{ color: 'var(--color-white)', fontSize: '2.2rem' }}>
                YUKTAA
              </span>
              <span className="footer-logo-sub">Designer Jewellery</span>
            </a>
            <p className="footer-about-text">
              Yuktaa is Goregaon West's most-loved jewellery rental boutique, curated by Varsha Jain. Every set is handpicked, cleaned, and ready for your most special moments.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com/yuktaa_jewellery" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://wa.me/919987600673" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="WhatsApp">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a href="https://www.facebook.com/profile.php?id=100091540044079" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-menu">
              <li><a href="#home" className="footer-menu-item">Home</a></li>
              <li><a href="#collection" className="footer-menu-item">Our Collection</a></li>
              <li><a href="#occasions" className="footer-menu-item">Occasions</a></li>
              <li><a href="#how-it-works" className="footer-menu-item">How It Works</a></li>
              <li><a href="#lookbook" className="footer-menu-item">Lookbook</a></li>
              <li><a href="#contact" className="footer-menu-item">Contact Us</a></li>
            </ul>
          </div>

          {/* Col 3: Occasions */}
          <div>
            <h4 className="footer-col-title">Occasions</h4>
            <ul className="footer-menu">
              <li><a href="#occasions/bridal" className="footer-menu-item">Bridal Sets</a></li>
              <li><a href="#occasions/haldi" className="footer-menu-item">Haldi Ceremony</a></li>
              <li><a href="#occasions/mehendi" className="footer-menu-item">Mehendi Night</a></li>
              <li><a href="#occasions/sangeet" className="footer-menu-item">Sangeet Glam</a></li>
              <li><a href="#occasions/reception" className="footer-menu-item">Reception Elegance</a></li>
              <li><a href="#occasions/party" className="footer-menu-item">Festive & Party Looks</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Trust */}
          <div>
            <h4 className="footer-col-title">Join the Circle</h4>
            <p className="footer-newsletter-text">Join the Yuktaa Circle for sneak peeks at new arrivals and early booking access.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" aria-label="Email for newsletter" />
              <button className="newsletter-btn" onClick={handleSubscribe}>
                Subscribe
              </button>
            </div>

          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Yuktaa Designer Jewellery. All Rights Reserved. | by Varsha Jain</p>
            <div className="footer-bottom-links">
              <a href="#how-it-works" style={{ marginRight: '1.5rem' }}>Booking Policy</a>
              <a href="#how-it-works" style={{ marginRight: '1.5rem' }}>Damage Policy</a>
              <a href="#admin" style={{ color: 'var(--color-accent)' }}>
                <i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i> Admin Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
