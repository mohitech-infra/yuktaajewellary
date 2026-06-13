import React, { useState } from 'react';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    eventType: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();

    const dateText = formData.date ? `Date: ${formData.date}` : 'Date: Not specified';
    const occasionText = formData.eventType ? `Occasion: ${formData.eventType}` : 'Occasion: General';

    const fullMsg = `Hello Varsha Jain! I would like to make an enquiry regarding Yuktaa Designer Jewellery:
Name: ${formData.name}
Phone: ${formData.phone}
${dateText}
${occasionText}
Message: ${formData.message}`;

    const encodedMsg = encodeURIComponent(fullMsg);
    window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="collection-hero">
        <div>
          <h1 className="brand-font">Contact Us</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
            Connect with Varsha Jain at Goregaon West
          </p>
        </div>
      </section>

      {/* Details & Form Layout */}
      <section className="section-padding">
        <div className="container">
          <div className="contact-layout">
            
            {/* Left Info column */}
            <div className="contact-info-col fade-up-element visible">
              <h2 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
                Visit Our Boutique
              </h2>
              
              <div className="contact-details">
                {/* Address */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="contact-text">
                    <h4>Boutique Location</h4>
                    <p>
                      Yuktaa Designer Jewellery,
                      <br />
                      Near SV Road, Goregaon West,
                      <br />
                      Mumbai, Maharashtra - 400104
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/iANaBGAR4HNvZkVTA" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', marginTop: '0.8rem', display: 'inline-flex', borderRadius: '4px' }}
                    >
                      <i className="fa-solid fa-map-location-dot" style={{ marginRight: '0.5rem' }}></i> View on Google Maps
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div className="contact-text">
                    <h4>WhatsApp Enquiries</h4>
                    <p>
                      <a href="https://wa.me/919987600673" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                        +91 99876 00673
                      </a>{' '}
                      (by Varsha Jain)
                    </p>
                  </div>
                </div>

                {/* Instagram */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fa-brands fa-instagram"></i>
                  </div>
                  <div className="contact-text">
                    <h4>Instagram Handlers</h4>
                    <p>
                      <a href="https://instagram.com/yuktaa_jewellery" target="_blank" rel="noopener noreferrer">
                        @yuktaa_jewellery
                      </a>
                    </p>
                  </div>
                </div>

                {/* Facebook */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fa-brands fa-facebook-f"></i>
                  </div>
                  <div className="contact-text">
                    <h4>Facebook Page</h4>
                    <p>
                      <a href="https://www.facebook.com/profile.php?id=100091540044079" target="_blank" rel="noopener noreferrer">
                        Yuktaa Designer Jewellery
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map wrapper */}
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.790938834458!2d72.84628837598692!3d19.159142099457833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b7e4b36c9529%3A0x4826cab934ef2101!2sYuktaa%20Designer%20Jewellery!5e0!3m2!1sen!2sin!4v1716500000000!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  title="Yuktaa Designer Jewellery Location Map"
                ></iframe>
              </div>
            </div>

            {/* Right Form column */}
            <div className="contact-info-col fade-up-element visible">
              <div className="contact-form-card">
                <h3 className="contact-form-title brand-font">Send an Enquiry</h3>
                <p className="contact-form-subtitle">Fill in details and click submit to connect instantly on WhatsApp</p>
                
                <form id="contact-whatsapp-form" onSubmit={handleContactSubmit}>
                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Your Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      placeholder="e.g. Anjali Sharma"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Phone & Date row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        className="form-input"
                        placeholder="e.g. 9876543210"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Event Date</label>
                      <input
                        type="date"
                        id="date"
                        className="form-input"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Dropdown Event Type */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="eventType">Event Type</label>
                    <select
                      id="eventType"
                      className="form-input"
                      value={formData.eventType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select event occasion</option>
                      <option value="Bridal">Bridal Wedding</option>
                      <option value="Haldi">Haldi / Mehendi</option>
                      <option value="Sangeet">Sangeet / Cocktails</option>
                      <option value="Reception">Reception</option>
                      <option value="Festive / Party">Festive Party</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Message / Description *</label>
                    <textarea
                      id="message"
                      className="form-input"
                      placeholder="Which jewellery set or style are you looking for?"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary btn-shimmer" style={{ width: '100%' }}>
                    Submit & Send WhatsApp
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
