import { useState, useEffect, useRef, type FormEvent } from 'react';
import './App.css';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile, type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import DragonImage from './Jacob and Co Astronomia Dragon.jpg';
import astronomiaImage from './jacob and co astronomia solar baguette Diamonds.jpg';
import GrandmasterImage from './Patek Philippe Grandmaster Chime Haute Joaillerie.jpg';
import NautilusImage from './Patek Philippe Nautilus 5724.jpg';
import RM052Image from './Richard Mille RM 052.png';
import RM53Image from './Richard Mille RM 53-01 Tourbillon.jpg';
import RM65Image from './Richard Mille RM 65-01.jpg';
import CosmographImage from './Rolex Cosmograph Daytona.png';
import RainbowImage from './Rolex Daytona Rainbow.png';
import GMTMasterImage from './Rolex GMT-Master II.png';
import BugattiImage from './jacob and co bugatti.jpg';

interface Watch {
  id: number;
  name: string;
  brand: string;
  price: string;
  img: string;
  description?: string;
}

interface UserProfileData {
  fullName: string;
  email: string;
  gender: string;
  birthMonth: string;
  cart?: Watch[];
}

/* ─── Ticker content ─────────────────────── */
const TICKER_ITEMS = [
  'Verified Authentic Timepieces',
  '✦',
  'Global Secure Transit',
  '✦',
  'Bespoke Concierge Sourcing',
  '✦',
  'Private Acquisitions Welcome',
  '✦',
  'All Pieces Fully Insured',
  '✦',
  'By Appointment Available',
  '✦',
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart, setCart] = useState<Watch[]>(() => {
    const saved = localStorage.getItem('ahir_watches_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [birthMonth, setBirthMonth] = useState('');

  /* Custom cursor */
  const cursorDotRef  = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorDotRef.current)  { cursorDotRef.current.style.left  = `${e.clientX}px`; cursorDotRef.current.style.top  = `${e.clientY}px`; }
      if (cursorRingRef.current) { cursorRingRef.current.style.left = `${e.clientX}px`; cursorRingRef.current.style.top = `${e.clientY}px`; }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  /* Navbar scroll */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Intersection observer for fade-in-up cards */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selectedWatch]);

  /* Pop-state */
  useEffect(() => {
    const onPop = () => { if (!window.location.hash.includes('watch-')) setSelectedWatch(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* Auth listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref  = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as UserProfileData;
          setUserData(data);
          const localStr  = localStorage.getItem('ahir_watches_cart');
          const localCart = localStr ? JSON.parse(localStr) : [];
          if (localCart.length > 0 && (!data.cart || data.cart.length === 0)) {
            await updateDoc(ref, { cart: localCart });
            setCart(localCart);
          } else if (data.cart) {
            setCart(data.cart);
            localStorage.setItem('ahir_watches_cart', JSON.stringify(data.cart));
          }
        }
      } else {
        setUserData(null);
        setCart([]);
        localStorage.removeItem('ahir_watches_cart');
      }
    });
    return () => unsub();
  }, []);

  const watchData: Watch[] = [
    { id: 3,  name: 'Jacob & Co. Astronomia Dragon',       brand: 'Jacob & Co.',   price: '₹8,90,00,000',     description: 'A breathtaking 3D dragon sculpture intricately coiled around the Astronomia four-arm movement.', img: DragonImage },
    { id: 2,  name: 'Jacob & Co. Bugatti Chiron',          brand: 'Jacob & Co.',   price: '₹12,50,00,000',    description: 'Features a fully functional miniature W16 engine block that animates at the push of a button.', img: BugattiImage },
    { id: 6,  name: 'Astronomia Solar Baguette Diamonds',  brand: 'Jacob & Co.',   price: '₹9,41,00,000',     description: 'A celestial landscape on your wrist, entirely paved with spectacular baguette-cut diamonds.', img: astronomiaImage },
    { id: 1,  name: 'Rolex Daytona Rainbow',               brand: 'Rolex',         price: '₹3,50,00,000',     description: 'An exclusive masterpiece adorned with a gradient of sapphires on the bezel and diamonds on the lugs.', img: RainbowImage },
    { id: 7,  name: 'Rolex Cosmograph Daytona',            brand: 'Rolex',         price: '₹95,08,740',       description: 'Forged in 18ct yellow gold, featuring a meteorite dial and a black Cerachrom bezel with tachymetric scale.', img: CosmographImage },
    { id: 8,  name: 'Rolex GMT-Master II',                 brand: 'Rolex',         price: '₹31,25,740',       description: 'Designed to show the time in two different time zones simultaneously, perfect for the global traveler.', img: GMTMasterImage },
    { id: 4,  name: 'Richard Mille RM 65-01',              brand: 'Richard Mille', price: '₹2,75,00,000',     description: 'A highly complex sports chronograph engineered for extreme daily wear and precision.', img: RM65Image },
    { id: 9,  name: 'Richard Mille RM 052',                brand: 'Richard Mille', price: '₹13,83,35,740',    description: 'The iconic Skull Tourbillon. A symbol of nonconformity built with grade 5 titanium.', img: RM052Image },
    { id: 10, name: 'Richard Mille RM 53-01 Tourbillon',  brand: 'Richard Mille', price: '₹26,82,05,598',    description: 'Created with Pablo Mac Donough, featuring a suspended tourbillon caliber and laminated sapphire glass.', img: RM53Image },
    { id: 5,  name: 'Patek Philippe Nautilus 5724',        brand: 'Patek Philippe', price: '₹2,37,41,162',    description: 'The epitome of elegant sports watches, enhanced with baguette diamonds and a moon-phase display.', img: NautilusImage },
    { id: 11, name: 'Grandmaster Chime Haute Joaillerie',  brand: 'Patek Philippe', price: '₹116,20,00,000',  description: 'The most complicated Patek Philippe wristwatch ever made, boasting 20 complications.', img: GrandmasterImage },
  ];

  const brandCategories = ['Jacob & Co.', 'Rolex', 'Richard Mille', 'Patek Philippe'];

  const syncCart = async (newCart: Watch[]) => {
    setCart(newCart);
    localStorage.setItem('ahir_watches_cart', JSON.stringify(newCart));
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { cart: newCart });
    }
  };

  const handleAddToCart = (watch: Watch) => {
    syncCart([...cart, watch]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (i: number) => syncCart(cart.filter((_, idx) => idx !== i));

  const calculateCartTotal = () => {
    const total = cart.reduce((sum, w) => sum + parseInt(w.price.replace(/[^0-9]/g, '')), 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total);
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });
        await setDoc(doc(db, 'users', cred.user.uid), { fullName, email, gender, birthMonth, cart });
        alert('Account created. Welcome to Ahir Watches.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Welcome back.');
      }
      setShowPopup(false);
      setEmail(''); setPassword(''); setFullName(''); setGender(''); setBirthMonth('');
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); setShowProfile(false); }
    catch { alert('Error logging out.'); }
  };

  const scrollToCollections = () => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });

  const handleSelectWatch = (watch: Watch) => {
    setSelectedWatch(watch);
    window.history.pushState({ view: 'product' }, '', `#watch-${watch.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToStore = () => {
    setSelectedWatch(null);
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Carousel */
  const nextSlide = () => setActiveIndex(prev => (prev + 1) % watchData.length);
  const prevSlide = () => setActiveIndex(prev => (prev - 1 + watchData.length) % watchData.length);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchStart(x);
  };
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = touchStart - x;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    setTouchStart(null);
  };

  const getCarouselClass = (index: number) => {
    const len = watchData.length;
    if (index === activeIndex) return 'center';
    if (index === (activeIndex - 1 + len) % len) return 'left-1';
    if (index === (activeIndex + 1) % len) return 'right-1';
    if (index === (activeIndex - 2 + len) % len) return 'left-2';
    if (index === (activeIndex + 2) % len) return 'right-2';
    return 'hidden';
  };

  return (
    <div className="app-container">
      {/* Custom Cursor */}
      <div className="cursor-dot"  ref={cursorDotRef}  />
      <div className="cursor-ring" ref={cursorRingRef} />

      {/* ─── TICKER ─────────────────────────────── */}
      <div className="ticker-strip">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className={item === '✦' ? 'ticker-dot' : 'ticker-item'}>
              {item === '✦' ? ' ✦ ' : item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── NAVBAR ─────────────────────────────── */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''} fade-in-down`} style={{ top: '30px' }}>
        <div className="navbar-left">
          <h1 className="logo" onClick={handleReturnToStore}>Ahir Watches</h1>
          {user && (
            <div className="profile-trigger fade-in-up" onClick={() => setShowProfile(true)}>
              <div className="profile-avatar">
                <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}</span>
              </div>
            </div>
          )}
        </div>
        <ul className="nav-links">
          <li onClick={handleReturnToStore}>Home</li>
          {!selectedWatch && <li onClick={scrollToCollections}>Collections</li>}
          <li>About</li>
          <li>
            <button className="cart-nav-btn" onClick={() => setIsCartOpen(true)}>
              Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </li>
          {!user ? (
            <li><button className="nav-login-btn" onClick={() => setShowPopup(true)}>Sign In</button></li>
          ) : (
            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Sign Out</li>
          )}
        </ul>
      </nav>

      {/* ─── PRODUCT DETAIL PAGE ────────────────── */}
      {selectedWatch ? (
        <div className="product-page-container fade-in-up">
          <button className="back-btn" onClick={handleReturnToStore}>← Return to Boutique</button>

          <div className="product-showcase">
            <div className="product-image-large">
              <img src={selectedWatch.img} alt={selectedWatch.name} />
            </div>
            <div className="product-details-panel">
              <h4 className="gold-gradient-text">{selectedWatch.brand}</h4>
              <h1 className="product-title">{selectedWatch.name}</h1>
              <p className="product-price-large">{selectedWatch.price}</p>
              <div className="divider-line" />
              <p className="product-long-description">{selectedWatch.description}</p>
              <ul className="product-specs">
                <li><span>Reference</span>AW-{selectedWatch.id}X9</li>
                <li><span>Availability</span>Highly Limited Allocation</li>
                <li><span>Delivery</span>Secure Armored Transit</li>
                <li><span>Warranty</span>Full Manufacturer Warranty</li>
              </ul>
              <div className="action-buttons">
                <button className="add-cart-btn-large" onClick={() => handleAddToCart(selectedWatch)}>Add to Cart</button>
                <button className="buy-now-btn">Acquire Now</button>
              </div>
            </div>
          </div>

          <div className="suggested-section">
            <h3 className="gold-gradient-text">Complementary Timepieces</h3>
            <div className="products-grid">
              {watchData
                .filter(w => w.brand === selectedWatch.brand && w.id !== selectedWatch.id)
                .slice(0, 3)
                .map(watch => (
                  <div className="product-card fade-in-up" key={watch.id}>
                    <div className="img-container">
                      <img src={watch.img} alt={watch.name} className="product-img" />
                    </div>
                    <div className="product-info">
                      <h3>{watch.name}</h3>
                      <p className="price">{watch.price}</p>
                      <button className="add-cart-btn" onClick={() => handleSelectWatch(watch)}>Inspect</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      ) : (
        <>
          {/* ─── HERO ───────────────────────────────── */}
          <header className="hero">
            <div
              className="carousel-container"
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {watchData.map((watch, index) => {
                const pos = getCarouselClass(index);
                return (
                  <div
                    key={watch.id}
                    className={`carousel-item ${pos}`}
                    onClick={() => {
                      if (pos === 'center') handleSelectWatch(watch);
                      if (pos === 'left-1' || pos === 'left-2') prevSlide();
                      if (pos === 'right-1' || pos === 'right-2') nextSlide();
                    }}
                  >
                    <div className="carousel-tag">{watch.brand.toUpperCase()}</div>
                    <img src={watch.img} alt={watch.name} draggable="false" />
                  </div>
                );
              })}
            </div>

            {/* Carousel arrows */}
            <button className="carousel-arrow left" onClick={prevSlide} aria-label="Previous">&#8592;</button>
            <button className="carousel-arrow right" onClick={nextSlide} aria-label="Next">&#8594;</button>

            {/* Dots */}
            <div className="carousel-dots">
              {watchData.map((_, i) => (
                <div
                  key={i}
                  className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>

            {/* Hero text */}
            <div className="hero-text-overlay">
              <span className="hero-eyebrow">Maison Ahir — Est. 2026</span>
              <h2 className="gold-gradient-text">Timeless Elegance</h2>
              <p>Exclusive Premium Timepieces</p>
              <button className="shop-btn" onClick={scrollToCollections}>Enter Boutique</button>
            </div>
          </header>

          {/* ─── COLLECTIONS ────────────────────────── */}
          <div id="collections" className="collections-wrapper">
            {brandCategories.map((brandName, bIdx) => (
              <section className="brand-section" key={brandName} data-brand-index={String(bIdx + 1).padStart(2, '0')}>
                <div className="brand-separator" />
                <div className="brand-header fade-in-up" style={{ paddingTop: '4rem' }}>
                  <div className="gold-line" />
                  <h2 className="brand-title">{brandName}</h2>
                  <div className="gold-line" />
                </div>
                <div className="products-grid">
                  {watchData
                    .filter(w => w.brand === brandName)
                    .map((watch, wIdx) => (
                      <div
                        className="product-card fade-in-up"
                        key={watch.id}
                        style={{ animationDelay: `${wIdx * 0.12}s` }}
                      >
                        <div className="img-container">
                          <img src={watch.img} alt={watch.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <h3>{watch.name}</h3>
                          {watch.description && (
                            <p className="description">{watch.description}</p>
                          )}
                          <p className="price">{watch.price}</p>
                          <button className="add-cart-btn" onClick={() => handleSelectWatch(watch)}>
                            Acquire
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>

          {/* ─── SERVICES ───────────────────────────── */}
          <section className="services-section fade-in-up">
            <h2 className="gold-gradient-text">The Ahir Promise</h2>
            <span className="services-subtitle">Our Commitment to Excellence</span>
            <div className="services-grid">
              {[
                { icon: '◈', title: 'Authenticity Guaranteed', desc: 'Every timepiece is rigorously verified by our master horologists with full provenance documentation.' },
                { icon: '◇', title: 'Global Secure Transit', desc: 'Fully insured, armored delivery to anywhere in the world, with real-time tracking.' },
                { icon: '◆', title: 'Bespoke Sourcing', desc: 'Looking for a rare piece? Our white-glove concierge will locate and acquire it for you.' },
              ].map(s => (
                <div className="service-card fade-in-up" key={s.title}>
                  <span className="service-icon">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── NEWSLETTER ─────────────────────────── */}
          <section className="newsletter-section fade-in-up">
            <div className="newsletter-content">
              <h2>Join the Inner Circle</h2>
              <p>Gain private access to highly limited drops, off-market allocations, and first previews of new arrivals.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button className="shop-btn" style={{ borderLeft: 'none' }}>Subscribe</button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h1 className="logo">Ahir Watches</h1>
            <span className="footer-tagline">Defining Time Since 2026</span>
            <p style={{ marginTop: '1.5rem' }}>
              A curated sanctuary for the world's most exceptional timepieces. Every watch tells a story — we help you find yours.
            </p>
          </div>
          <div className="footer-col">
            <h4>Collections</h4>
            <ul>
              {brandCategories.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li>Authenticity Verification</li>
              <li>Bespoke Sourcing</li>
              <li>Secure Delivery</li>
              <li>Private Appointments</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ahir Watches. All rights reserved. Crafted with precision.</p>
        </div>
      </footer>

      {/* ─── CART DRAWER ────────────────────────── */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Collection</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <p className="empty-cart-text">Your portfolio is currently empty.</p>
          ) : (
            cart.map((item, i) => (
              <div className="cart-item" key={i}>
                <img src={item.img} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="gold-gradient-text" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem' }}>{item.price}</p>
                  <button className="remove-item-btn" onClick={() => handleRemoveFromCart(i)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span style={{ fontSize: '0.75rem', fontFamily: 'Josefin Sans', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 200 }}>Total Allocation</span>
              <span className="gold-gradient-text">{calculateCartTotal()}</span>
            </div>
            <button className="buy-now-btn" style={{ width: '100%' }}>Proceed to Secure Checkout</button>
          </div>
        )}
      </div>

      {/* ─── LOGIN / SIGNUP MODAL ───────────────── */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="login-box fade-in-up">
            <button className="close-btn" onClick={() => setShowPopup(false)}>✕</button>
            <h2 className="gold-gradient-text">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              {isSignUp && (
                <>
                  <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} />
                  <select required value={gender} onChange={e => setGender(e.target.value)} className="form-select">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="month" required value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className="form-select" />
                </>
              )}
              <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password (Min 6 characters)" required value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="submit-btn">{isSignUp ? 'Create Account' : 'Sign In'}</button>
            </form>
            <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already a member? Sign in' : "New to Ahir Watches? Create account"}
            </p>
          </div>
        </div>
      )}

      {/* ─── PROFILE MODAL ──────────────────────── */}
      {showProfile && user && userData && (
        <div className="modal-overlay">
          <div className="login-box fade-in-up">
            <button className="close-btn" onClick={() => setShowProfile(false)}>✕</button>
            <h2 className="gold-gradient-text">Client Dossier</h2>
            <div className="profile-details">
              <div className="profile-row"><span className="profile-label">Name</span><span className="profile-value">{userData.fullName}</span></div>
              <div className="profile-row"><span className="profile-label">Email</span><span className="profile-value">{userData.email}</span></div>
              <div className="profile-row"><span className="profile-label">Gender</span><span className="profile-value">{userData.gender}</span></div>
              <div className="profile-row"><span className="profile-label">Birth Month</span><span className="profile-value">{userData.birthMonth}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
              <button className="submit-btn" style={{ flex: 1, background: 'transparent', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.35)' }} onClick={() => setShowProfile(false)}>Close</button>
              <button className="submit-btn" style={{ flex: 1 }} onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
