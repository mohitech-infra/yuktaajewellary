import React from 'react';
import ProductCard from '../components/ProductCard';
import CarouselWrapper from '../components/CarouselWrapper';

export default function HomeView({ products, onOpenBookingModal, addToCart, addToWishlist, cart, wishlist, homePhotos }) {
  const bestSellers = products.slice(0, 4);
  const recentlyAdded = products.slice(4, 8);

  const categories = homePhotos?.categories || [
    { name: 'Bracelet/Bangles', img: '/assets/jewel_74.jpeg' },
    { name: 'Earrings', img: '/assets/jewel_66.jpeg' },
    { name: 'Jewellery Sets', img: '/assets/jewel_67.jpeg' },
    { name: 'Necklace', img: '/assets/jewel_68.jpeg' },
  ];

  const exploreCategories = homePhotos?.exploreCategories || [
    { name: 'BRACELET/BANGLES', img: '/assets/jewel_74.jpeg' },
    { name: 'EARRINGS', img: '/assets/jewel_66.jpeg' },
    { name: 'JEWELLERY SETS', img: '/assets/jewel_67.jpeg' },
    { name: 'NECKLACE', img: '/assets/jewel_68.jpeg' },
    { name: 'PENDANT SETS', img: '/assets/jewel_69.jpeg' },
    { name: 'HAND HARNESS', img: '/assets/jewel_73.jpeg' },
    { name: 'RINGS', img: '/assets/jewel_35.jpeg' },
    { name: 'MANGALSUTRA', img: '/assets/jewel_36.jpeg' },
    { name: 'NOSE RINGS', img: '/assets/jewel_37.jpeg' },
    { name: 'HEADGEARS', img: '/assets/jewel_38.jpeg' }
  ];

  const promoImages = homePhotos?.promoImages || [
    '/assets/jewel_74.jpeg',
    '/assets/jewel_66.jpeg',
    '/assets/jewel_67.jpeg',
    '/assets/jewel_68.jpeg',
  ];

  const testimonials = [
    { text: "Absolutely loved the bridal set! The quality is amazing and it looks exactly like the pictures.", author: "Neha S.", rating: 5 },
    { text: "Best place to rent jewellery in Goregaon. The process was so smooth and the staff is very helpful.", author: "Priya M.", rating: 5 },
    { text: "Stunning pieces! I got so many compliments at my sister's wedding.", author: "Aarti K.", rating: 5 }
  ];

  return (
    <div style={{ backgroundColor: 'transparent', paddingBottom: '80px' }}>
      {/* Categories Row */}
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
              <div style={{ width: '85px', height: '85px', borderRadius: '15px', backgroundImage: `url(${cat.img})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text)' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div style={{ backgroundColor: 'transparent', textAlign: 'center', padding: '30px 15px' }}>
        <h4 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Exclusive Offer</h4>
        <h1 style={{ color: '#3a202c', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>SIGNUP & CLAIM</h1>
        <h1 style={{ color: '#3a202c', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: 0, marginBottom: '15px' }}><span style={{ color: 'var(--color-primary)' }}>₹2,000</span> GIFT CARD</h1>
        <a href="#wallet" style={{ color: 'white', backgroundColor: 'var(--color-primary)', padding: '12px 25px', display: 'inline-block', borderRadius: '30px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(139,154,84,0.4)' }}>CLAIM OFFER</a>
      </div>

      {/* Promo Images Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', padding: '5px' }}>
        {promoImages.map((img, idx) => (
          <div key={idx} style={{ height: '220px', backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '5px' }}></div>
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div style={{ position: 'fixed', bottom: '85px', left: '20px', zIndex: 100 }}>
        <a href="#wallet" style={{ textDecoration: 'none' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(139,154,84,0.4)', cursor: 'pointer' }} title="Claim Offer / Voucher">
            <i className="fa-solid fa-gift" style={{ color: 'white', fontSize: '1.3rem' }}></i>
          </div>
        </a>
      </div>
      <div style={{ position: 'fixed', bottom: '85px', right: '20px', zIndex: 100 }}>
        <a href="https://wa.me/919987600673" target="_blank" rel="noopener noreferrer">
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(37,211,102,0.4)' }}>
            <i className="fa-brands fa-whatsapp" style={{ color: 'white', fontSize: '1.7rem' }}></i>
          </div>
        </a>
      </div>

      {/* Explore Our Range */}
      <div className="container" style={{ padding: '40px 15px', textAlign: 'center', backgroundColor: 'transparent' }}>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', fontFamily: 'var(--font-sans)' }}>EXPLORE OUR RANGE OF<br/>JEWELLERY</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {exploreCategories.map((cat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundImage: `url(${cat.img})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '10px', backgroundColor: 'transparent' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Google Testimonials */}
      <div style={{ backgroundColor: 'transparent', padding: '40px 15px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>Google Testimonials</h2>
        <CarouselWrapper
          items={testimonials}
          desktopGridClass="scroll-container"
          autoScrollInterval={3000}
          renderItem={(item, index) => (
            <div key={index} style={{ minWidth: '280px', backgroundColor: 'transparent', border: '1px solid #e0d5c1', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', margin: '0 10px', textAlign: 'left' }}>
              <div style={{ color: '#fbbc04', fontSize: '1.2rem', marginBottom: '10px' }}>★★★★★</div>
              <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px', fontStyle: 'italic' }}>"{item.text}"</p>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>- {item.author}</span>
            </div>
          )}
        />
      </div>

      {/* Best Sellers */}
      <div className="container" style={{ padding: '40px 15px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '30px', fontFamily: 'var(--font-sans)' }}>OUR BEST<br/>SELLERS</h2>
        <CarouselWrapper
          items={bestSellers}
          desktopGridClass="catalog-grid"
          autoScrollInterval={0}
          renderItem={(product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              addToCart={addToCart} 
              addToWishlist={addToWishlist} 
              isWishlisted={wishlist.some(i => i.id === product.id)}
            />
          )}
        />
      </div>

      {/* Recently Added */}
      <div className="container" style={{ padding: '40px 15px', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', fontFamily: 'var(--font-sans)' }}>RECENTLY ADDED</h2>
        <CarouselWrapper
          items={recentlyAdded}
          desktopGridClass="catalog-grid"
          autoScrollInterval={0}
          renderItem={(product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              addToCart={addToCart} 
              addToWishlist={addToWishlist}
              isWishlisted={wishlist.some(i => i.id === product.id)} 
            />
          )}
        />
      </div>
    </div>
  );
}
