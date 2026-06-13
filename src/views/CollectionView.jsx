import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';

export default function CollectionView({ products }) {
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Filter logic
  const filteredProducts = products.filter((product) => {
    // Filter by occasion
    const matchOccasion = occasionFilter === 'all' || product.occasions.includes(occasionFilter);

    // Filter by stone color
    const matchColor = colorFilter === 'all' || product.color === colorFilter;

    // Filter by price
    let matchPrice = true;
    if (priceFilter === 'low') {
      matchPrice = product.price < 1000;
    } else if (priceFilter === 'med') {
      matchPrice = product.price >= 1000 && product.price <= 2000;
    } else if (priceFilter === 'high') {
      matchPrice = product.price > 2000;
    }

    return matchOccasion && matchColor && matchPrice;
  });

  const occasions = [
    { label: 'All', value: 'all' },
    { label: 'Bridal', value: 'bridal' },
    { label: 'Haldi', value: 'haldi' },
    { label: 'Mehendi', value: 'mehendi' },
    { label: 'Sangeet', value: 'sangeet' },
    { label: 'Reception', value: 'reception' },
    { label: 'Party / Festive', value: 'party' },
  ];

  const colors = [
    { label: 'All Colors', value: 'all' },
    { label: 'Emerald Green', value: 'emerald' },
    { label: 'Ruby Red', value: 'ruby' },
    { label: 'Polki / Gold', value: 'gold' },
    { label: 'Mint Green', value: 'mint' },
    { label: 'White / Pearl', value: 'pearl' },
    { label: 'Yellow / Meenakari', value: 'yellow' },
  ];

  const prices = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹1,000', value: 'low' },
    { label: '₹1,000 - ₹2,000', value: 'med' },
    { label: 'Over ₹2,000', value: 'high' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="collection-hero">
        <div>
          <h1 className="brand-font">Our Collection</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
            Explore our premium pieces curated for you
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="container filter-container">
          {/* Filter by Occasion */}
          <div className="filter-section">
            <span className="filter-label">Occasion:</span>
            <div className="filter-pills mobile-swipe-pills" id="filter-occasions">
              {occasions.map((o) => (
                <button
                  key={o.value}
                  className={`filter-pill ${occasionFilter === o.value ? 'active' : ''}`}
                  onClick={() => setOccasionFilter(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Stone Color */}
          <div className="filter-section">
            <span className="filter-label">Stone Color:</span>
            <div className="filter-pills mobile-swipe-pills" id="filter-colors">
              {colors.map((c) => (
                <button
                  key={c.value}
                  className={`filter-pill ${colorFilter === c.value ? 'active' : ''}`}
                  onClick={() => setColorFilter(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Price */}
          <div className="filter-section">
            <span className="filter-label">Price Range:</span>
            <div className="filter-pills mobile-swipe-pills" id="filter-prices">
              {prices.map((p) => (
                <button
                  key={p.value}
                  className={`filter-pill ${priceFilter === p.value ? 'active' : ''}`}
                  onClick={() => setPriceFilter(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalogue Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-wrapper">
            {filteredProducts.length === 0 ? (
              <div className="no-results">
                <i className="fa-solid fa-gem" style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '1rem', display: 'block' }}></i>
                No matching jewellery sets found. Try updating your filters.
              </div>
            ) : (
              <CarouselWrapper
                items={filteredProducts}
                desktopGridClass="catalog-grid"
                autoScrollInterval={0}
                renderItem={(product, index, isActive) => (
                  <ProductCard key={product.id} product={product} isActive={isActive} />
                )}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
