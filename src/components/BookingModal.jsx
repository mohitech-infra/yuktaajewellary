import { useState, useEffect } from 'react';

export default function BookingModal({ isOpen, productId, initialDate, onClose, products, onBookingSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    eventType: ''
  });

  // Pre-fill date when modal opens or when initialDate changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        phone: '',
        date: initialDate || '',
        eventType: ''
      });
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  // Lookup product details
  const product = products.find((p) => p.id === productId) || null;
  const productName = product ? product.name : "Custom Slot Booking (Consultation)";
  const productPrice = product ? product.price : 0;
  const depositAmount = productPrice > 0 ? Math.round(productPrice * 0.3) : 0;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate form inputs
      if (!formData.name || !formData.phone || !formData.date || !formData.eventType) {
        alert("Please fill out all required fields.");
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = () => {
    if (onBookingSuccess) {
      onBookingSuccess(productId, formData.date, {
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        eventType: formData.eventType,
        productId: productId,
        productName: productName,
        depositAmount: depositAmount,
        paymentMethod: 'Pay on Visit',
        timestamp: new Date().toISOString()
      });
    }
    setStep(3);
    sendBookingWhatsAppNotification();
  };

  const sendBookingWhatsAppNotification = () => {
    const depositText = depositAmount > 0 
      ? `Refundable deposit (30% payable on visit): ₹${depositAmount}` 
      : "Requested Boutique styling session";
      
    const msg = `Hi Varsha Jain! I just booked a slot at Yuktaa Designer Jewellery:
Name: ${formData.name}
Phone: ${formData.phone}
Date: ${formData.date}
Occasion: ${formData.eventType}
Set: ${productName}
Details: ${depositText}
Please confirm my slot.`;

    const encodedMsg = encodeURIComponent(msg);
    setTimeout(() => {
      window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
    }, 2000);
  };

  return (
    <div className="modal-backdrop open" id="booking-modal-backdrop">
      <div className="booking-modal">
        <div className="modal-header">
          <span className="modal-close-btn" onClick={onClose} style={{ cursor: 'pointer' }} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </span>
          <h3 className="modal-title brand-font">Boutique Slot Booking</h3>
          <span className="modal-subtitle">Yuktaa Designer Jewellery</span>
        </div>

        {/* Step Indicator Dots */}
        {step < 3 && (
          <div className="modal-steps-indicator">
            <div className={`modal-step-dot-container ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} id="dot-step-1">
              <div className="modal-step-dot">1</div>
              <span className="modal-step-label">Details</span>
            </div>
            <div className={`modal-step-dot-container ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} id="dot-step-2">
              <div className="modal-step-dot">2</div>
              <span className="modal-step-label">Summary</span>
            </div>
          </div>
        )}

        {/* Modal Content Wizard Views */}
        <div className="modal-body">
          {/* Step 1: Customer Details Form */}
          {step === 1 && (
            <form id="modal-booking-form" onSubmit={handleNextStep}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  required
                  placeholder="e.g. Priya Mehta"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    required
                    placeholder="e.g. 9820098200"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Event Date *</label>
                  <input
                    type="date"
                    id="date"
                    className="form-input"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="eventType">Event Type *</label>
                <select
                  id="eventType"
                  className="form-input"
                  required
                  value={formData.eventType}
                  onChange={handleInputChange}
                >
                  <option value="">Select occasion</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Haldi">Haldi</option>
                  <option value="Mehendi">Mehendi</option>
                  <option value="Sangeet">Sangeet</option>
                  <option value="Reception">Reception</option>
                  <option value="Party">Festive / Party</option>
                </select>
              </div>
            </form>
          )}

          {/* Step 2: Booking Summary */}
          {step === 2 && (
            <div className="modal-step-view active" id="modal-view-step-2">
              <div className="booking-summary-card">
                <div className="summary-row">
                  <span className="summary-label">Jewellery Set:</span>
                  <span className="summary-val" id="summary-set-name">{productName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Occasion / Type:</span>
                  <span className="summary-val" id="summary-event-type">{formData.eventType} Ceremony</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Selected Event Date:</span>
                  <span className="summary-val" id="summary-booking-date">
                    {new Date(formData.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Rental Price (Per Occasion):</span>
                  <span className="summary-val summary-total" id="summary-rental-price">
                    {productPrice > 0 ? `₹${productPrice.toLocaleString('en-IN')}` : "Settled at boutique"}
                  </span>
                </div>
                 <div className="summary-row" style={{ backgroundColor: 'var(--color-accent-light)', padding: '0.8rem', marginTop: '0.5rem' }}>
                  <span className="summary-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    Refundable Deposit (30% - Payable on Visit):
                  </span>
                  <span className="summary-val summary-deposit" id="summary-deposit-price">
                    ₹{depositAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                * A 30% refundable security deposit is payable during your boutique visit to secure your slot. No payment is collected on this website. The rental fee and remaining balance will be settled at the Goregaon West boutique upon pickup.
              </p>
            </div>
          )}

          {/* Step 3: Final Success Screen */}
          {step === 3 && (
            <div className="modal-step-view active" id="modal-view-step-3">
              <div className="success-screen">
                <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
                <h4 className="success-title brand-font">Slot Requested Successfully!</h4>
                <p className="success-text" id="success-message-text">
                  Your slot request for the set <strong>"{productName}"</strong> has been submitted for <strong>{formData.date}</strong>.<br /><br />
                  The 30% refundable security deposit of <strong>₹{depositAmount.toLocaleString('en-IN')}</strong> will be payable during your boutique visit.<br /><br />
                  We are redirecting you to WhatsApp to complete your slot confirmation with Varsha Jain.<br /><br />
                  <strong>See you at our boutique in Goregaon West! Please bring your outfit along to trial match.</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Navigation Buttons) */}
        <div className="modal-footer" id="modal-footer-btns">
          {step === 1 && (
            <button className="btn btn-primary" onClick={handleNextStep} style={{ width: '100%' }}>
              Continue
            </button>
          )}
          {step === 2 && (
            <>
              <button className="btn btn-secondary" onClick={handlePrevStep}>
                Back
              </button>
              <button className="btn btn-accent btn-shimmer" onClick={handleConfirmBooking}>
                Confirm Booking
              </button>
            </>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Close Window
              </button>
              <button 
                className="btn btn-accent btn-shimmer" 
                onClick={() => {
                  const depositText = depositAmount > 0 
                    ? `Refundable deposit (30% payable on visit): ₹${depositAmount}` 
                    : "Requested Boutique styling session";
                  const msg = `Hi Varsha Jain! I just booked a slot at Yuktaa Designer Jewellery:
Name: ${formData.name}
Phone: ${formData.phone}
Date: ${formData.date}
Occasion: ${formData.eventType}
Set: ${productName}
Details: ${depositText}
Please confirm my slot.`;
                  window.open(`https://wa.me/919987600673?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                style={{ flex: 1 }}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '0.5rem' }}></i> Confirm on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
