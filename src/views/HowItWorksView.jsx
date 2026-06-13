import React, { useState } from 'react';

export default function HowItWorksView() {
  const [activeFaq, setActiveFaq] = useState(null);

  const steps = [
    { num: '01', icon: 'fa-solid fa-laptop', title: 'Browse Online', desc: 'Explore our curated collection of bridal chokers, necklaces, earrings, and Maang Tikkas from the comfort of your home.' },
    { num: '02', icon: 'fa-solid fa-calendar-check', title: 'Pick Your Date', desc: 'Use the interactive calendar on any set to check availability for your event day, then click "Book This Set".' },
    { num: '03', icon: 'fa-solid fa-shield-halved', title: 'Reserve Slot Online', desc: 'Submit your slot reservation request online for free. The 30% refundable security deposit is payable during your boutique visit to secure your slot.' },
    { num: '04', icon: 'fa-brands fa-whatsapp', title: 'WhatsApp Confirmation', desc: 'Receive an instant booking confirmation via WhatsApp containing your order details and slot timing.' },
    { num: '05', icon: 'fa-solid fa-store', title: 'Visit Our Boutique', desc: 'Visit our Goregaon West boutique to try on the jewellery, finalize sizing, and pick up the set. Bring your outfit along!' },
    { num: '06', icon: 'fa-solid fa-rotate-left', title: 'Wear & Return', desc: 'Shine like royalty on your event. Simply return the jewellery set to our boutique the following day to receive your full deposit refund.' },
  ];

  const faqs = [
    { q: 'Is the security deposit fully refundable?', a: 'Yes, absolutely. The 30% security deposit is fully refunded immediately upon the safe return of the jewellery set without major damages or missing stones.' },
    { q: 'How far in advance should I book my set?', a: 'We recommend booking your set at least 15 to 30 days in advance, especially during the wedding season, to ensure your favorite design is locked in for your date.' },
    { q: 'Can I rent multiple sets for different functions?', a: 'Yes! You can rent as many sets as you need for Haldi, Sangeet, Wedding, and Reception. Each set will have its own individual slot booked and tracked.' },
    { q: 'What if something is damaged or lost?', a: 'Minor wear and tear (like a loose jump ring or a fallen bead) is acceptable. However, major structural damages, deep scratches, or lost components will result in deduction from the refundable deposit, as detailed in our damage policy.' },
    { q: 'What occasions do you cater to?', a: 'We have specialized collections curated for Bridal, Haldi, Sangeet, Mehendi, Reception, and Festive Parties. You can filter and view them on our Collection page.' },
    { q: 'Can I visit the boutique without booking?', a: 'While you are welcome to visit, booking an online slot ensures that Varsha Jain or a personal stylist is dedicatedly available to guide you, and guarantees that the specific sets you want to try are in the store and not rented out.' },
  ];

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="collection-hero">
        <div>
          <h1 className="brand-font">How Renting Works</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
            Beautiful jewellery. Zero commitment. Pure joy.
          </p>
        </div>
      </section>

      {/* Steps Deep Dive */}
      <section className="section-padding">
        <div className="container">
          <div className="how-detailed-grid">
            {steps.map((step, idx) => (
              <div key={idx} className="how-detail-card fade-up-element visible">
                <span className="how-detail-num">{step.num}</span>
                <div className="how-detail-icon">
                  <i className={step.icon}></i>
                </div>
                <h3 className="how-detail-heading">{step.title}</h3>
                <p className="how-detail-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="section-padding fade-up-element visible"
        style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="container">
          <h2 className="heading-lg">Frequently Asked Questions</h2>
          <p className="subheading">Got questions? We have compiled the answers for you.</p>

          <div className="faq-container">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(idx)} style={{ cursor: 'pointer' }}>
                  <span className="faq-title">{faq.q}</span>
                  <span className="faq-icon">
                    <i className="fa-solid fa-chevron-down"></i>
                  </span>
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
