import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CarouselWrapper converts standard grid elements to swipeable/snapping
 * carousels on mobile devices with Left/Right chevrons and active dot indicators.
 */
export default function CarouselWrapper({ 
  items, 
  renderItem, 
  desktopGridClass = "catalog-grid", 
  autoScrollInterval = 3000 
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const containerRef = useRef(null);

  // Calculate centered index dynamically on scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const children = container.children;
    let minDistance = Infinity;
    let active = 0;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        active = i;
      }
    }
    setActiveIdx(active);
  }, []);

  // Scroll smooth to a card centered in the view
  const scrollToCard = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;
    const children = container.children;
    if (index >= 0 && index < children.length) {
      const child = children[index];
      container.scrollTo({
        left: child.offsetLeft - (container.clientWidth - child.clientWidth) / 2,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-scroll loop on mobile
  useEffect(() => {
    const checkMobileAndScroll = () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile || userInteracted || autoScrollInterval <= 0) return;

      const totalItems = items.length;
      if (totalItems <= 0) return;
      const nextIdx = (activeIdx + 1) % totalItems;
      scrollToCard(nextIdx);
    };

    const interval = setInterval(checkMobileAndScroll, autoScrollInterval);
    return () => clearInterval(interval);
  }, [userInteracted, activeIdx, scrollToCard, items.length, autoScrollInterval]);

  const handlePrev = () => {
    setUserInteracted(true);
    const prevIdx = (activeIdx - 1 + items.length) % items.length;
    scrollToCard(prevIdx);
  };

  const handleNext = () => {
    setUserInteracted(true);
    const nextIdx = (activeIdx + 1) % items.length;
    scrollToCard(nextIdx);
  };

  const handleDotClick = (index) => {
    setUserInteracted(true);
    scrollToCard(index);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel-wrapper-component">
      <div 
        className={`${desktopGridClass} grid-to-carousel-container`}
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={() => setUserInteracted(true)}
        onMouseDown={() => setUserInteracted(true)}
        onWheel={() => setUserInteracted(true)}
      >
        {items.map((item, index) => renderItem(item, index, activeIdx === index))}
      </div>

      {/* Mobile-only controls below cards */}
      <div className="carousel-controls hide-on-desktop">
        <button type="button" className="carousel-control-btn prev-btn" onClick={handlePrev} aria-label="Previous card">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="carousel-dots">
          {items.map((_, idx) => (
            <span
              key={idx}
              className={`carousel-dot ${activeIdx === idx ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
            ></span>
          ))}
        </div>
        <button type="button" className="carousel-control-btn next-btn" onClick={handleNext} aria-label="Next card">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
