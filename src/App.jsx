import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import BuyOrderModal from './components/BuyOrderModal';
import BottomNav from './components/BottomNav';
import { PRODUCTS, OCCASIONS_META } from './data/products';
import { supabase } from './utils/supabaseClient';

// Views
import HomeView from './views/HomeView';
import CollectionView from './views/CollectionView';
import OccasionsView from './views/OccasionsView';
import ProductView from './views/ProductView';
import HowItWorksView from './views/HowItWorksView';
import LookbookView from './views/LookbookView';
import ContactView from './views/ContactView';
import AdminView from './views/AdminView';
import WalletView from './views/WalletView';

export default function App() {
  const [route, setRoute] = useState('home');
  const [routeParam, setRouteParam] = useState('');
  const [dbMode, setDbMode] = useState('Local Cache');

  // Local Database State (Cached Defaults)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('yuktaa_products_v2');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge buy_price from static data for any cached products missing it
          return parsed.map((p) => {
            if (p.buy_price != null) return p;
            const localMatch = PRODUCTS.find((lp) => lp.id === p.id);
            return { ...p, buy_price: localMatch ? localMatch.buy_price : null };
          });
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return PRODUCTS;
  });

  const [occasionsMeta, setOccasionsMeta] = useState(() => {
    try {
      const saved = localStorage.getItem('yuktaa_occasions_meta_v2');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading occasionsMeta from localStorage:', e);
    }
    return OCCASIONS_META;
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('yuktaa_bookings');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading bookings from localStorage:', e);
    }
    return [];
  });

  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);

  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      welcome_voucher_code: 'YUKTAA2000',
      welcome_voucher_amount: 2000,
      welcome_voucher_min_bill: 6000,
      wallet_redeem_limit_pct: 50,
      wallet_terms: [
        "The welcome discount voucher code is valid for first-time clients only.",
        "This offer is restricted to one claim per device/browser session.",
        "Voucher code is valid for 1 year from the date of activation.",
        "Discount is applicable on jewellery rental bookings only and cannot be exchanged for cash.",
        "Applicable at our Goregaon West boutique styling session.",
        "Wallet balance can be redeemed for up to 50% of the bill amount.",
        "The welcome offer of ₹2,000 is applicable on a minimum bill of ₹6,000."
      ]
    };
    try {
      const saved = localStorage.getItem('yuktaa_settings');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return defaultSettings;
  });

  // Sync state changes with localStorage (Client-side offline cache)
  useEffect(() => {
    if (settings) {
      localStorage.setItem('yuktaa_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (products) {
      localStorage.setItem('yuktaa_products_v2', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (occasionsMeta) {
      localStorage.setItem('yuktaa_occasions_meta_v2', JSON.stringify(occasionsMeta));
    }
  }, [occasionsMeta]);

  useEffect(() => {
    if (bookings) {
      localStorage.setItem('yuktaa_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  // Supabase Background Live Database Synchronizer
  useEffect(() => {
    async function syncWithSupabase() {
      try {
        // 1. Fetch live products
        const { data: dbProducts, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!prodError && dbProducts && dbProducts.length > 0) {
          // Merge buy_price from local static data as fallback
          // (in case the buy_price DB migration hasn't been run yet)
          const mergedProducts = dbProducts.map((dbProd) => {
            const localMatch = PRODUCTS.find((lp) => lp.id === dbProd.id);
            return {
              ...dbProd,
              buy_price: dbProd.buy_price ?? (localMatch ? localMatch.buy_price : null),
            };
          });
          setProducts(mergedProducts);
          setDbMode('Live Database');
        }

        // 2. Fetch live occasions
        const { data: dbOccasions, error: occError } = await supabase
          .from('occasions')
          .select('*');

        if (!occError && dbOccasions && dbOccasions.length > 0) {
          const occasionsObj = dbOccasions.reduce((acc, curr) => {
            acc[curr.key] = curr;
            return acc;
          }, {});
          setOccasionsMeta(occasionsObj);
        }

        // 3. Fetch live bookings
        const { data: dbBookings, error: bookError } = await supabase
          .from('bookings')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!bookError && dbBookings) {
          const parsedBookings = dbBookings.map((b) => ({
            name: b.name,
            phone: b.phone,
            date: b.date,
            eventType: b.eventType,
            productId: b.productId,
            productName: b.productName,
            depositAmount: b.depositAmount,
            paymentMethod: b.paymentMethod,
            timestamp: b.timestamp
          }));
          setBookings(parsedBookings);
        }

        // 4. Fetch live leads
        const { data: dbLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (!leadsError && dbLeads) {
          setLeads(dbLeads);
        }

        // 5. Fetch live orders
        const { data: dbOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersError && dbOrders) {
          setOrders(dbOrders);
        }

        // 6. Fetch live settings
        const { data: dbSettings, error: settingsError } = await supabase
          .from('admin_settings')
          .select('*');

        if (!settingsError && dbSettings && dbSettings.length > 0) {
          const settingsObj = {};
          dbSettings.forEach((item) => {
            if (item.key === 'wallet_terms') {
              try {
                settingsObj.wallet_terms = JSON.parse(item.value);
              } catch (e) {
                console.error("Error parsing wallet_terms from Supabase", e);
              }
            } else if (item.key === 'welcome_voucher_code') {
              settingsObj.welcome_voucher_code = item.value;
            } else if (item.key === 'welcome_voucher_amount') {
              settingsObj.welcome_voucher_amount = Number(item.value);
            } else if (item.key === 'welcome_voucher_min_bill') {
              settingsObj.welcome_voucher_min_bill = Number(item.value);
            } else if (item.key === 'wallet_redeem_limit_pct') {
              settingsObj.wallet_redeem_limit_pct = Number(item.value);
            }
          });
          setSettings((prev) => ({ ...prev, ...settingsObj }));
        }
      } catch (err) {
        console.warn('Supabase initialization warning or offline mode. Using Local Cache.', err);
      }
    }
    syncWithSupabase();
  }, []);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProductId, setBookingProductId] = useState('');
  const [bookingInitialDate, setBookingInitialDate] = useState('');

  // Buy Order Modal State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalProduct, setBuyModalProduct] = useState(null);

  const handleOpenBuyModal = (product) => {
    setBuyModalProduct(product);
    setBuyModalOpen(true);
  };

  const handleCloseBuyModal = () => {
    setBuyModalOpen(false);
    setBuyModalProduct(null);
  };

  // Hash Router setup
  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = window.location.hash.slice(1) || 'home';
      const [r, p] = hashPath.split('/');
      setRoute(r);
      setRouteParam(p || '');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount to set initial route

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenBookingModal = (productId = '', date = '') => {
    let message = '';
    if (productId) {
      const product = products.find((p) => p.id === productId);
      const name = product ? product.name : productId;
      message = `Hi Varsha! I am interested in renting the "${name}" from your Goregaon boutique.`;
    } else {
      message = `Hi Varsha! I would like to book a slot for a jewellery viewing / consultation at your Goregaon West boutique.`;
    }
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/919987600673?text=${encodedMsg}`, '_blank');
  };

  const handleCloseBookingModal = () => {
    setBookingModalOpen(false);
    setBookingProductId('');
    setBookingInitialDate('');
  };

  const handleBookingSuccess = async (prodId, date, bookingDetails) => {
    // 1. Update React Local States
    let updatedDates = [];
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === prodId) {
          updatedDates = p.bookedDates.includes(date)
            ? p.bookedDates
            : [...p.bookedDates, date];
          return { ...p, bookedDates: updatedDates };
        }
        return p;
      })
    );

    setBookings((prevBookings) => [bookingDetails, ...prevBookings]);

    // 2. Sync to Supabase Live Database
    try {
      await supabase.from('bookings').insert({
        name: bookingDetails.name,
        phone: bookingDetails.phone,
        date: bookingDetails.date,
        eventType: bookingDetails.eventType,
        productId: prodId || null,
        productName: bookingDetails.productName,
        depositAmount: bookingDetails.depositAmount,
        paymentMethod: bookingDetails.paymentMethod
      });

      if (prodId && updatedDates.length > 0) {
        await supabase.from('products').update({ bookedDates: updatedDates }).eq('id', prodId);
      }
    } catch (err) {
      console.error('Error syncing booking record to Supabase:', err);
    }
  };

  // Render correct view based on route
  const renderView = () => {
    switch (route) {
      case 'home':
        return <HomeView products={products} onOpenBookingModal={handleOpenBookingModal} settings={settings} />;
      case 'collection':
        return <CollectionView products={products} />;
      case 'occasions':
        return (
          <OccasionsView
            products={products}
            occasionKey={routeParam || 'bridal'}
            onOpenBookingModal={handleOpenBookingModal}
            occasionsMeta={occasionsMeta}
          />
        );
      case 'product':
        return (
          <ProductView
            productId={routeParam}
            products={products}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenBuyModal={handleOpenBuyModal}
          />
        );
      case 'how-it-works':
        return <HowItWorksView />;
      case 'lookbook':
        return <LookbookView />;
      case 'contact':
        return <ContactView />;
      case 'wallet':
        return <WalletView settings={settings} />;
      case 'admin':
        return (
          <AdminView
            products={products}
            setProducts={setProducts}
            occasionsMeta={occasionsMeta}
            setOccasionsMeta={setOccasionsMeta}
            bookings={bookings}
            dbMode={dbMode}
            leads={leads}
            setLeads={setLeads}
            settings={settings}
            setSettings={setSettings}
            orders={orders}
            setOrders={setOrders}
          />
        );
      default:
        // Fallback to Home
        return <HomeView products={products} onOpenBookingModal={handleOpenBookingModal} settings={settings} />;
    }
  };

  const isAdminRoute = route === 'admin';

  return (
    <div className="app-container">
      {!isAdminRoute && (
        <Navbar currentRoute={route} onOpenBookingModal={() => handleOpenBookingModal('')} />
      )}
      
      <main
        id="main-content-area"
        className={!isAdminRoute ? 'bottom-nav-active' : ''}
        style={{ paddingTop: isAdminRoute ? '0' : 'var(--header-height)' }}
      >
        {renderView()}
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && (
        <BottomNav currentRoute={route} onOpenBookingModal={() => handleOpenBookingModal('')} />
      )}

      <BookingModal
        isOpen={bookingModalOpen}
        productId={bookingProductId}
        initialDate={bookingInitialDate}
        onClose={handleCloseBookingModal}
        products={products}
        onBookingSuccess={handleBookingSuccess}
      />

      <BuyOrderModal
        isOpen={buyModalOpen}
        product={buyModalProduct}
        onClose={handleCloseBuyModal}
      />
    </div>
  );
}
