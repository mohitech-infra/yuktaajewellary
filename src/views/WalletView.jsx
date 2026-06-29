import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function WalletView() {
  const [isClaimed, setIsClaimed] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const claimed = localStorage.getItem('yuktaa_claimed_offer') === 'true';
    setIsClaimed(claimed);
    if (claimed) {
      setUserName(localStorage.getItem('yuktaa_user_name') || 'Celebration Guest');
    }
  }, []);

  const triggerConfetti = () => {
    const colors = ['#D4AF37', '#501B3A', '#FFD700', '#FF3366', '#33CC99', '#3399FF'];
    const newConfetti = [];
    for (let i = 0; i < 40; i++) {
      const left = Math.random() * 90 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.5;
      const size = Math.random() * 6 + 6;
      const duration = Math.random() * 2 + 1.5;
      newConfetti.push({
        id: i,
        style: {
          left: `${left}%`,
          backgroundColor: color,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }
      });
    }
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill out all fields.");
      return;
    }

    localStorage.setItem('yuktaa_claimed_offer', 'true');
    localStorage.setItem('yuktaa_user_name', formData.name);
    localStorage.setItem('yuktaa_user_phone', formData.phone);
    
    // Copy coupon code to clipboard
    try {
      navigator.clipboard.writeText('YUKTAA2000');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    setIsClaimed(true);
    setUserName(formData.name);
    setIsSubmitted(true);
    triggerConfetti();

    // Dispatch event to update Navbar in real-time
    window.dispatchEvent(new Event('wallet-update'));

    // Push lead to Supabase
    try {
      await supabase.from('leads').insert({
        name: formData.name,
        phone: formData.phone,
        source: 'Wallet Page'
      });
    } catch (err) {
      console.warn('Failed to sync lead to Supabase', err);
    }

    // WhatsApp redirect
    const msg = `Hi Varsha! I just signed up on your website to claim my ₹2,000 welcome voucher (Code: YUKTAA2000).\nName: ${formData.name}\nPhone: ${formData.phone}\nPlease confirm my discount voucher.`;
    const encodedMsg = encodeURIComponent(msg);
    setTimeout(() => {
      window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
    }, 1500);
  };

  return (
    <div className="wallet-page-view">
      {confetti.map((c) => (
        <div key={c.id} className="confetti-particle" style={c.style} />
      ))}

      {/* Hero Banner */}
      <section className="collection-hero" style={{ height: '220px' }}>
        <div>
          <h1 className="brand-font">Yuktaa Wallet</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
            Exclusive Rental Credits & Perks
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div className="wallet-layout">
            
            {/* Left Column: Digital Card & Status */}
            <div className="wallet-card-column">
              
              {/* Premium Digital Card */}
              <div className={`digital-wallet-card ${isClaimed ? 'active-card' : 'inactive-card'}`}>
                <div className="card-header-row">
                  <div className="card-brand">YUKTAA</div>
                  <div className="card-network-chip">
                    <div className="gold-chip-line"></div>
                    <div className="gold-chip-line"></div>
                  </div>
                </div>

                <div className="card-number-mock">•••• •••• •••• 2026</div>

                <div className="card-balance-block">
                  <span className="card-balance-label">AVAILABLE CREDIT</span>
                  <span className="card-balance-amount">{isClaimed ? '₹2,000.00' : '₹0.00'}</span>
                </div>

                <div className="card-footer-row">
                  <div className="card-holder-info">
                    <span className="card-holder-label">VALUED MEMBER</span>
                    <span className="card-holder-name">{isClaimed ? userName : 'Celebration Guest'}</span>
                  </div>
                  <div className="card-expiry-info">
                    <span className="card-holder-label">VALID THRU</span>
                    <span className="card-holder-name">06/27</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="wallet-status-box">
                {isClaimed ? (
                  <div className="claimed-status-content">
                    <span className="status-badge active"><span className="dot"></span> Active Credit</span>
                    <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      Voucher code <strong style={{ color: 'var(--color-primary)' }}>YUKTAA2000</strong> is linked to this device and copied to your clipboard.
                    </p>
                  </div>
                ) : (
                  <div className="unclaimed-status-content">
                    <span className="status-badge pending"><span className="dot"></span> Locked</span>
                    <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      Sign up below to activate your ₹2,000 welcome credit instantly.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sign Up or Redemption Guide */}
            <div className="wallet-action-column">
              {!isClaimed ? (
                <div className="wallet-signup-card">
                  <h3 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Activate ₹2,000 Credit
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Welcome to Yuktaa Designer Jewellery! Enter your name and phone number to unlock your first-time rental discount.
                  </p>
                  
                  <form onSubmit={handleClaim}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group-wallet">
                        <label className="wallet-form-label">Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="Enter your name" 
                          className="wallet-form-input" 
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group-wallet">
                        <label className="wallet-form-label">WhatsApp Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="Enter WhatsApp number" 
                          className="wallet-form-input" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-accent btn-shimmer" style={{ width: '100%', padding: '1rem' }}>
                      Unlock Welcome Bonus
                    </button>
                  </form>
                </div>
              ) : (
                <div className="redemption-guide-card">
                  <h3 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                    How to Redeem Your Credits
                  </h3>
                  
                  <div className="redemption-steps">
                    <div className="red-step">
                      <div className="red-step-num">1</div>
                      <div className="red-step-content">
                        <strong>Browse Collection</strong>
                        <p>Explore our premium Kundan, Polki, and bridal sets catalog online.</p>
                      </div>
                    </div>

                    <div className="red-step">
                      <div className="red-step-num">2</div>
                      <div className="red-step-content">
                        <strong>Choose Your Set</strong>
                        <p>Click "Book & Enquire via WhatsApp" on any product detail page.</p>
                      </div>
                    </div>

                    <div className="red-step">
                      <div className="red-step-num">3</div>
                      <div className="red-step-content">
                        <strong>Mention Your Code</strong>
                        <p>Let our coordinator know your code <strong>YUKTAA2000</strong> to get ₹2,000 off your total rental bill.</p>
                      </div>
                    </div>
                  </div>

                  <div className="redemption-footer">
                    <a href="#collection" className="btn btn-primary" style={{ padding: '0.9rem 1.5rem', width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.8rem' }}>
                      Browse Collection
                    </a>
                    <a 
                      href={`https://wa.me/919987600673?text=${encodeURIComponent(`Hi Varsha! I want to consult and book a jewellery set using my claimed ₹2,000 voucher (Code: YUKTAA2000).`)}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-whatsapp-large"
                      style={{ padding: '0.9rem 1.5rem', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Offer Terms & Conditions */}
          <div className="wallet-terms-box">
            <h4 className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: 'var(--color-primary)' }}>
              Terms & Conditions
            </h4>
            <ul>
              <li>The welcome discount voucher code is valid for first-time clients only.</li>
              <li>This offer is restricted to one claim per device/browser session.</li>
              <li>Voucher code is valid for 1 year from the date of activation.</li>
              <li>Discount is applicable on jewellery rental bookings only and cannot be exchanged for cash.</li>
              <li>Applicable at our Goregaon West boutique styling session.</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
