import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';
import OfferEnvelope from '../components/OfferEnvelope';

export default function HomeView({ products, onOpenBookingModal }) {
  // Slices for lists
  const newArrivals = products.slice(0, 6);
  const mostLoved = products.slice(2, 8);

  const [activeSlide, setActiveSlide] = useState(0);
  const slideIntervalRef = useRef(null);
  const statsSectionRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Stats refs
  const setsRef = useRef(null);
  const bridesRef = useRef(null);
  const ratingRef = useRef(null);

  // Lookbook items static collection
  const lookbookItems = [
    { name: 'Yuktaa Bride', occ: 'Bridal Polki Look', img: '/assets/jewel_74.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Reception Elegance', img: '/assets/jewel_66.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Festive Glam', img: '/assets/jewel_67.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Sangeet Night', img: '/assets/jewel_68.jpeg' },
    { name: 'Yuktaa Bride', occ: 'Wedding Celebration', img: '/assets/jewel_69.jpeg' },
  ];





  // Hero Slider logic
  const stopSlider = useCallback(() => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
  }, []);

  const startSlider = useCallback(() => {
    stopSlider();
    slideIntervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 2);
    }, 4000);
  }, [stopSlider]);

  useEffect(() => {
    startSlider();
    return () => stopSlider();
  }, [startSlider, stopSlider]);

  const handleDotClick = (index) => {
    setActiveSlide(index);
    startSlider(); // reset timer
  };

  // GSAP Counter Animations on Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);

            // Animate each counter using GSAP
            const animateCounter = (ref, target, formatFn) => {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: target,
                duration: 2.5,
                ease: "power2.out",
                snap: { val: 1 },
                onUpdate: () => {
                  if (ref.current) {
                    ref.current.textContent = formatFn(Math.floor(obj.val));
                  }
                }
              });
            };

            animateCounter(setsRef, 200, (v) => `${v}+`);
            animateCounter(bridesRef, 500, (v) => `${v}+`);
            animateCounter(ratingRef, 5, (v) => `${v} ★`);
          }
        });
      },
      { threshold: 0.15 }
    );

    const currentStatsSection = statsSectionRef.current;
    if (currentStatsSection) {
      observer.observe(currentStatsSection);
    }

    return () => {
      if (currentStatsSection) {
        observer.unobserve(currentStatsSection);
      }
    };
  }, [statsAnimated]);

  const navigateToOccasion = (key) => {
    window.location.hash = `#occasions/${key}`;
  };



  return (
    <div>
      {/* Hero Slider */}
      <section className="hero-slider" id="home-hero">
        {/* Slide 1 */}
        <div className={`slide slide-1 ${activeSlide === 0 ? 'active' : ''}`}>
          <div
            className="slide-img-bg"
            style={{
              backgroundImage:
                "linear-gradient(rgba(80, 27, 58, 0.45), rgba(80, 27, 58, 0.45)), url('/assets/jewel_68.jpeg')",
            }}
          ></div>
          <div className="slide-overlay"></div>
          <div className="container">
            <div className="slide-content">
              <span className="slide-subtitle">Exclusive. Elegant. Yours for a Day.</span>
              <h1 className="slide-title heading-xl">Wear the Extraordinary</h1>
              <p className="slide-desc">Exclusive designer jewellery rentals for your most beautiful moments.</p>
              <div className="slide-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-accent btn-shimmer" onClick={() => onOpenBookingModal("")}>
                  Book Your Slot
                </button>
                <a href="#wallet" className="btn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-gift" style={{ color: '#ffd700' }}></i>
                  Claim ₹2,000 Voucher
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className={`slide slide-2 ${activeSlide === 1 ? 'active' : ''}`}>
          <div
            className="slide-img-bg"
            style={{
              backgroundImage:
                "linear-gradient(rgba(80, 27, 58, 0.45), rgba(80, 27, 58, 0.45)), url('/assets/jewel_73.jpeg')",
            }}
          ></div>
          <div className="slide-overlay"></div>
          <div className="container">
            <div className="slide-content">
              <span className="slide-subtitle">Boutique Jewellery Rental</span>
              <h1 className="slide-title heading-xl">Your Day. Our Jewellery.</h1>
              <p className="slide-desc">Bridal, festive, and occasion jewellery — available to rent from our Goregaon West boutique.</p>
              <div className="slide-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="#collection" className="btn btn-accent btn-shimmer">
                  Explore Collection
                </a>
                <a href="#wallet" className="btn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-gift" style={{ color: '#ffd700' }}></i>
                  Claim ₹2,000 Voucher
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="slider-dots">
          <span className={`dot ${activeSlide === 0 ? 'active' : ''}`} onClick={() => handleDotClick(0)}></span>
          <span className={`dot ${activeSlide === 1 ? 'active' : ''}`} onClick={() => handleDotClick(1)}></span>
        </div>
      </section>

      {/* Scrolling Announcement Marquee */}
      <div className="announcement-bar">
        <div className="marquee-content">
          <span>✦ JEWELLERY RENTAL BOUTIQUE IN GOREGAON WEST ✦</span>
          <span>BRIDAL SETS ✦</span>
          <span>HALDI ✦</span>
          <span>MEHENDI ✦</span>
          <span>SANGEET ✦</span>
          <span>RECEPTION ✦</span>
          <span>BOOK YOUR SLOT TODAY ✦</span>
          {/* Duplicate for seamless loop */}
          <span>✦ JEWELLERY RENTAL BOUTIQUE IN GOREGAON WEST ✦</span>
          <span>BRIDAL SETS ✦</span>
          <span>HALDI ✦</span>
          <span>MEHENDI ✦</span>
          <span>SANGEET ✦</span>
          <span>RECEPTION ✦</span>
          <span>BOOK YOUR SLOT TODAY ✦</span>
        </div>
      </div>

      {/* New in the Collection */}
      <section className="section-padding fade-up-element visible">
        <div className="container">
          <div className="section-header-row">
            <div className="section-title-left">
              <h2 className="brand-font" style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>
                New in the Collection
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                Explore the latest premium handpicked additions to our boutique.
              </p>
            </div>
            <a href="#collection" className="view-all-link">
              View All <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className="scroll-container-wrapper">
            <CarouselWrapper
              items={newArrivals}
              desktopGridClass="scroll-container"
              autoScrollInterval={3000}
              renderItem={(product, index, isActive) => (
                <ProductCard key={product.id} product={product} isActive={isActive} />
              )}
            />
          </div>
        </div>
      </section>

      {/* Shop by Occasion Grid */}
      <section
        className="section-padding fade-up-element visible"
        style={{
          backgroundColor: 'var(--color-white)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container">
          <h2 className="heading-lg">Find Your Perfect Set</h2>
          <p className="subheading">Curated for every celebration, styled for you.</p>

          <div className="occasion-grid">
            {/* Bridal */}
            <div className="occasion-card" onClick={() => navigateToOccasion('bridal')}>
              <div
                className="occ-img-bg"
                style={{
                  backgroundImage:
                    "url('/assets/jewel_74.jpeg')",
                }}
              ></div>
              <div className="occ-overlay"></div>
              <div className="occ-content">
                <h3 className="occ-title">Bridal</h3>
                <span className="occ-link">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>

            {/* Haldi */}
            <div className="occasion-card" onClick={() => navigateToOccasion('haldi')}>
              <div
                className="occ-img-bg"
                style={{
                  backgroundImage:
                    "url('/assets/jewel_69.jpeg')",
                }}
              ></div>
              <div className="occ-overlay"></div>
              <div className="occ-content">
                <h3 className="occ-title">Haldi</h3>
                <span className="occ-link">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>

            {/* Sangeet */}
            <div className="occasion-card" onClick={() => navigateToOccasion('sangeet')}>
              <div
                className="occ-img-bg"
                style={{
                  backgroundImage:
                    "url('/assets/jewel_68.jpeg')",
                }}
              ></div>
              <div className="occ-overlay"></div>
              <div className="occ-content">
                <h3 className="occ-title">Sangeet</h3>
                <span className="occ-link">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>

            {/* Reception */}
            <div className="occasion-card" onClick={() => navigateToOccasion('reception')}>
              <div
                className="occ-img-bg"
                style={{
                  backgroundImage:
                    "url('/assets/jewel_66.jpeg')",
                }}
              ></div>
              <div className="occ-overlay"></div>
              <div className="occ-content">
                <h3 className="occ-title">Reception</h3>
                <span className="occ-link">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Renting Works */}
      <section className="section-padding fade-up-element visible">
        <div className="container">
          <h2 className="heading-lg">How Renting Works</h2>
          <p className="subheading">Beautiful jewellery. Zero commitment. Pure joy.</p>

          <div className="steps-container">
            <div className="steps-connector"></div>

            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-heading">Browse</h3>
              <p className="step-desc">Select from our collection of premium bridal & occasion sets online.</p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-heading">Reserve Slot</h3>
              <p className="step-desc">Pick your event date and reserve your slot online. The deposit is payable on visit.</p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-heading">Visit Boutique</h3>
              <p className="step-desc">Visit our Goregaon West boutique to try it on and finalize details.</p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-heading">Wear & Return</h3>
              <p className="step-desc">Dazzle on your big day, and return the set to us the day after the event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Welcome Offer (Gift Envelope) */}
      <OfferEnvelope />

      {/* Most Loved Sets */}
      <section
        className="section-padding fade-up-element visible"
        style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="container">
          <h2 className="heading-lg">Most Loved Sets</h2>
          <p className="subheading">Our most sought-after signature pieces, loved by brides.</p>

          <CarouselWrapper
            items={mostLoved}
            desktopGridClass="catalog-grid"
            autoScrollInterval={0}
            renderItem={(product, index, isActive) => (
              <ProductCard key={product.id} product={product} isActive={isActive} />
            )}
          />
        </div>
      </section>

      {/* Split Banner */}
      <section className="split-banner fade-up-element visible">
        {/* Left Panel: Bridal Sets */}
        <div className="split-panel panel-green" onClick={() => navigateToOccasion('bridal')}>
          <div
            className="split-panel-bg"
            style={{
              backgroundImage:
                "url('/assets/jewel_73.jpeg')",
            }}
          ></div>
          <h2 className="panel-title">Bridal Sets</h2>
          <p className="panel-subtitle">Majestic, heritage Kundan, Polki, and premium doublet sets for your wedding day.</p>
          <span className="panel-link">
            Book for Your Big Day <i className="fa-solid fa-arrow-right"></i>
          </span>
        </div>

        {/* Right Panel: Festive & Party Looks */}
        <div className="split-panel panel-cream" onClick={() => navigateToOccasion('party')}>
          <div
            className="split-panel-bg"
            style={{
              backgroundImage:
                "url('/assets/jewel_71.jpeg')",
            }}
          ></div>
          <h2 className="panel-title">Festive & Party Looks</h2>
          <p className="panel-subtitle">Delicate earrings, Maang Tikkas, and contemporary styles for side functions.</p>
          <span className="panel-link">
            Explore Occasion Sets <i className="fa-solid fa-arrow-right"></i>
          </span>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="stats-bar fade-up-element visible" id="trust-stats-section" ref={statsSectionRef}>
        <div className="container">
          <div className="stats-grid">
            {/* Stat 1 */}
            <div className="stat-item active">
              <span className="stat-number" ref={setsRef}>
                0
              </span>
              <span className="stat-label">Sets Available</span>
            </div>
            {/* Stat 2 */}
            <div className="stat-item active">
              <span className="stat-number" ref={bridesRef}>
                0
              </span>
              <span className="stat-label">Happy Brides</span>
            </div>
            {/* Stat 3 */}
            <div className="stat-item active">
              <span className="stat-number" ref={ratingRef}>
                0
              </span>
              <span className="stat-label">★ Google Rating</span>
            </div>
            {/* Stat 4 */}
            <div className="stat-item active">
              <span className="stat-number" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginTop: '0.8rem' }}>
                Goregaon
              </span>
              <span className="stat-label">West Boutique</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Brides lookbook strip */}
      <section className="section-padding fade-up-element visible">
        <div className="container">
          <h2 className="heading-lg">Real Brides. Real Beauty.</h2>
          <p className="subheading" style={{ marginBottom: '3.5rem' }}>
            Our customers wearing Yuktaa jewellery on their special days.
          </p>
        </div>
        <CarouselWrapper
          items={lookbookItems}
          desktopGridClass="lookbook-strip"
          autoScrollInterval={3500}
          renderItem={(item, index, isActive) => (
            <div 
              key={index} 
              className={`lookbook-strip-card ${isActive ? 'active-card' : ''}`}
              onClick={() => (window.location.hash = '#lookbook')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="lookbook-strip-img"
                style={{
                  backgroundImage: `url('${item.img}')`,
                }}
              ></div>
              <div className="lookbook-strip-overlay">
                <h4 className="lookbook-strip-name">{item.name}</h4>
                <span className="lookbook-strip-occ">{item.occ}</span>
              </div>
            </div>
          )}
        />
      </section>

      {/* Instagram Feed Strip */}
      <section
        className="section-padding fade-up-element visible"
        style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="brand-font" style={{ fontSize: '2.8rem', marginBottom: '0.2rem' }}>
            Follow Our Story
          </h2>
          <a
            href="https://instagram.com/yuktaa_jewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="view-all-link"
            style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: '3rem', fontWeight: 700, letterSpacing: '1px', fontSize: '0.95rem' }}
          >
            @yuktaa_jewellery on Instagram <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.8rem', marginLeft: '0.3rem' }}></i>
          </a>

          <div className="insta-grid">
            {[
              "/assets/jewel_35.jpeg",
              "/assets/jewel_36.jpeg",
              "/assets/jewel_37.jpeg",
              "/assets/jewel_38.jpeg",
              "/assets/jewel_39.jpeg",
              "/assets/jewel_40.jpeg",
            ].map((url, index) => (
              <div key={index} className="insta-tile">
                <div className="insta-img" style={{ backgroundImage: `url('${url}')` }}></div>
                <div className="insta-overlay">
                  <i className="fa-brands fa-instagram"></i>
                </div>
              </div>
            ))}
          </div>

          <a href="https://instagram.com/yuktaa_jewellery" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-shimmer">
            Visit Instagram Page
          </a>
        </div>
      </section>
    </div>
  );
}
