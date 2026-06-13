import React from 'react';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';
import { OCCASIONS_META } from '../data/products';

export default function OccasionsView({ products, occasionKey, onOpenBookingModal, occasionsMeta }) {
  const currentMeta = occasionsMeta || OCCASIONS_META;
  const meta = currentMeta[occasionKey] || currentMeta.bridal;
  
  // Filter products for this occasion
  const curatedProducts = products.filter((p) => p.occasions.includes(occasionKey));

  return (
    <div>
      {/* Dynamic Occasion Banner */}
      <section
        className="occasion-showcase-hero"
        id="occasion-hero-bg"
        style={{
          backgroundImage: `linear-gradient(rgba(80, 27, 58, 0.75), rgba(80, 27, 58, 0.75)), url('${meta.bg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="occasion-showcase-title" id="occasion-hero-title">
          {meta.title}
        </h1>
        <p className="occasion-showcase-desc" id="occasion-hero-desc">
          {meta.desc}
        </p>
      </section>

      {/* Occasion Collection List */}
      <section className="section-padding">
        <div className="container">
          <CarouselWrapper
            items={curatedProducts}
            desktopGridClass="catalog-grid"
            autoScrollInterval={0}
            renderItem={(product, index, isActive) => (
              <ProductCard key={product.id} product={product} isActive={isActive} />
            )}
          />

          <div style={{ textAlign: 'center', marginTop: '5rem' }} className="fade-up-element visible">
            <h3 className="brand-font" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>
              Ready to Find Your Signature Look?
            </h3>
            <button className="btn btn-accent btn-shimmer" onClick={() => onOpenBookingModal("")}>
              Book a Slot At Our Boutique
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
