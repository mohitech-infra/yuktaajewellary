import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function OfferEnvelope() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => localStorage.getItem('yuktaa_claimed_offer') === 'true');
  const [formData, setFormData] = useState(() => ({
    name: localStorage.getItem('yuktaa_user_name') || '',
    phone: localStorage.getItem('yuktaa_user_phone') || ''
  }));
  const [confetti, setConfetti] = useState([]);
  const sectionRef = useRef(null);

  // Trigger confetti burst when envelope is opened
  const triggerConfetti = () => {
    const colors = ['#D4AF37', '#501B3A', '#FFD700', '#FF3366', '#33CC99', '#3399FF'];
    const newConfetti = [];
    
    // Generate 40 particles
    for (let i = 0; i < 40; i++) {
      const left = Math.random() * 90 + 5; // randomize horizontal origin %
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.5;
      const size = Math.random() * 6 + 6; // size between 6px and 12px
      const duration = Math.random() * 2 + 1.5; // duration 1.5s - 3.5s
      
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
    
    // Clear confetti after animation completes
    setTimeout(() => {
      setConfetti([]);
    }, 4000);
  };

  const handleOpenEnvelope = () => {
    if (!isOpen) {
      setIsOpen(true);
      triggerConfetti();
      // Delay showing the sign up form slightly to let the envelope animation play out
      setTimeout(() => {
        setShowForm(true);
      }, 700);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClaimVoucher = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill out both Name and Phone number to claim your voucher.");
      return;
    }
    
    setIsSubmitted(true);
    
    // Store in localStorage & dispatch event to update Navbar
    localStorage.setItem('yuktaa_claimed_offer', 'true');
    localStorage.setItem('yuktaa_user_name', formData.name);
    localStorage.setItem('yuktaa_user_phone', formData.phone);
    window.dispatchEvent(new Event('wallet-update'));

    // Push lead to Supabase
    try {
      await supabase.from('leads').insert({
        name: formData.name,
        phone: formData.phone,
        source: 'Shagun Envelope'
      });
    } catch (err) {
      console.warn('Failed to sync lead to Supabase', err);
    }
    
    // Copy discount code to clipboard
    try {
      navigator.clipboard.writeText('YUKTAA2000');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
    
    // Trigger second confetti burst on successful claim!
    triggerConfetti();

    // Redirect to WhatsApp after a brief delay
    const msg = `Hi Varsha! I just signed up on your website to claim my ₹2,000 welcome voucher (Code: YUKTAA2000).\nName: ${formData.name}\nPhone: ${formData.phone}\nPlease confirm my discount voucher.`;
    const encodedMsg = encodeURIComponent(msg);
    setTimeout(() => {
      window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
    }, 1500);
  };

  return (
    <section className="offer-section" id="shagun-offer-section" ref={sectionRef}>
      {/* Render Confetti Particles */}
      {confetti.map((c) => (
        <div 
          key={c.id} 
          className="confetti-particle" 
          style={c.style} 
        />
      ))}

      <div className="offer-container">
        <span className="offer-tag">✦ Exclusive Celebration Offer ✦</span>
        <h2 className="offer-title brand-font">Claim Your Shagun Gift</h2>
        <p className="offer-desc">
          {!isOpen 
            ? "We welcome you to the Yuktaa family with an exclusive voucher. Tap the traditional envelope below to unlock your gift." 
            : "Congratulations! You have unlocked your ₹2,000 welcome voucher."
          }
        </p>

        {/* Envelope Animation */}
        <div 
          className={`envelope-wrapper ${isOpen ? 'open' : ''}`} 
          onClick={handleOpenEnvelope}
        >
          <div className="envelope">
            <div className="envelope-flap" />
            <div className="envelope-seal">
              {!isOpen && <i className="fa-solid fa-gift" style={{ color: '#fff' }} />}
            </div>
            
            {/* The letter inside that slides up */}
            <div className="letter">
              <span className="letter-title">WELCOME GIFT</span>
              <span className="letter-amount">₹2,000 OFF</span>
              <span className="letter-code-tag">Voucher: YUKTAA2000</span>
            </div>
            
            <div className="envelope-front-pocket" />
          </div>
        </div>

        {/* Sign Up Form / Claim Success */}
        <div className={`claim-form-wrapper ${showForm ? 'visible' : ''}`}>
          {!isSubmitted ? (
            <form onSubmit={handleClaimVoucher}>
              <h3 className="brand-font" style={{ fontSize: '1.8rem', marginBottom: '1.2rem', color: 'var(--color-accent)' }}>
                Sign Up & Claim Voucher
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#ebd1df', marginBottom: '1.5rem' }}>
                Enter your details to receive your ₹2,000 shopping voucher. It will be copied to your clipboard and verified on WhatsApp!
              </p>
              
              <div className="claim-input-group">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Full Name" 
                  className="claim-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Your WhatsApp Phone Number" 
                  className="claim-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-accent btn-shimmer" style={{ width: '100%', padding: '1rem' }}>
                Claim My ₹2,000 Off <i className="fa-solid fa-chevron-right" style={{ marginLeft: '0.3rem' }} />
              </button>
            </form>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '3.5rem', color: 'var(--color-accent)', marginBottom: '1rem', display: 'block' }} />
              <h3 className="brand-font" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-white)' }}>
                Voucher Claimed!
              </h3>
              <p style={{ color: '#ebd1df', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Voucher code <strong>YUKTAA2000</strong> has been copied to your clipboard.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#ebd1df', marginBottom: '1.5rem' }}>
                We are redirecting you to WhatsApp to verify your voucher and start your jewellery shopping consult. If it didn't open automatically, click below:
              </p>
              <a 
                href={`https://wa.me/919987600673?text=${encodeURIComponent(`Hi Varsha! I want to claim my ₹2,000 welcome voucher YUKTAA2000.\nName: ${formData.name}\nPhone: ${formData.phone}`)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-accent btn-shimmer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem' }}
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.3rem' }} /> Go to WhatsApp Chat
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
