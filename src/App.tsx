import { useState, useEffect, type FormEvent } from 'react'; 
import './App.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, type User } from 'firebase/auth';
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showProfile, setShowProfile] = useState(false); 
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  
  // ✦ FIX: Active index set to 1 so the Bugatti spawns dead center!
  const [activeIndex, setActiveIndex] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const [cart, setCart] = useState<Watch[]>(() => {
    const savedCart = localStorage.getItem('ahir_watches_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [birthMonth, setBirthMonth] = useState('');

  const watchData: Watch[] = [
    // Jacob & Co. (Bugatti is in the exact middle)
    { id: 3, name: 'Jacob & Co. Astronomia Dragon', brand: 'Jacob & Co.', price: '₹8,90,00,000', description: 'A breathtaking 3D dragon sculpture intricately coiled around the Astronomia four-arm movement.', img: DragonImage },
    { id: 2, name: 'Jacob & Co. Bugatti Chiron', brand: 'Jacob & Co.', price: '₹12,50,00,000', description: 'Features a fully functional miniature W16 engine block that animates at the push of a button.', img: BugattiImage },
    { id: 6, name: 'Astronomia Solar Baguette Diamonds', brand: 'Jacob & Co.', price: '₹9,41,00,000', description: 'A celestial landscape on your wrist, entirely paved with spectacular baguette-cut diamonds.', img: astronomiaImage },
    // Rolex
    { id: 1, name: 'Rolex Daytona Rainbow', brand: 'Rolex', price: '₹3,50,00,000', description: 'An exclusive masterpiece adorned with a gradient of sapphires on the bezel and diamonds paving the lugs.', img: RainbowImage },
    { id: 7, name: 'Rolex Cosmograph Daytona', brand: 'Rolex', price: '₹95,08,740', description: 'Forged in 18 ct yellow gold, featuring a meteorite dial and a black Cerachrom bezel with tachymetric scale.', img: CosmographImage },
    { id: 8, name: 'Rolex GMT-Master II', brand: 'Rolex', price: '₹31,25,740', description: 'Designed to show the time in two different time zones simultaneously, perfect for the global traveler.', img: GMTMasterImage },
    // Richard Mille
    { id: 4, name: 'Richard Mille RM 65-01', brand: 'Richard Mille', price: '₹2,75,00,000', description: 'A highly complex sports chronograph engineered for extreme daily wear and precision.', img: RM65Image },
    { id: 9, name: 'Richard Mille RM 052', brand: 'Richard Mille', price: '₹13,83,35,740', description: 'The iconic Skull Tourbillon. A symbol of nonconformity built with grade 5 titanium.', img: RM052Image },
    { id: 10, name: 'Richard Mille RM 53-01 Tourbillon', brand: 'Richard Mille', price: '₹26,82,05,598', description: 'Created with Pablo Mac Donough, featuring a suspended tourbillon caliber and laminated sapphire glass.', img: RM53Image  },
    // Patek Philippe
    { id: 5, name: 'Patek Philippe Nautilus 5724', brand: 'Patek Philippe', price: '₹2,37,41,162', description: 'The epitome of elegant sports watches, enhanced with baguette diamonds and a moon-phase display.', img: NautilusImage },
    { id: 11, name: 'Grandmaster Chime Haute Joaillerie', brand: 'Patek Philippe', price: '₹116,20,00,000', description: 'The most complicated Patek Philippe wristwatch ever made, boasting 20 complications.', img: GrandmasterImage }
  ];

  const brandCategories = ['Jacob & Co.', 'Rolex', 'Richard Mille', 'Patek Philippe'];

  const syncCart = async (newCart: Watch[]) => {
    setCart(newCart);
    localStorage.setItem('ahir_watches_cart', JSON.stringify(newCart));
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { cart: newCart });
    }
  };

  const handleAddToCart = (watch: Watch) => {
    syncCart([...cart, watch]);
    setIsCartOpen(true); 
  };

  const handleRemoveFromCart = (indexToRemove: number) => {
    syncCart(cart.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.includes('watch-')) {
        setSelectedWatch(null); 
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileData;
          setUserData(data);
          
          const localCartString = localStorage.getItem('ahir_watches_cart');
          const localCart = localCartString ? JSON.parse(localCartString) : [];

          if (localCart.length > 0 && (!data.cart || data.cart.length === 0)) {
            await updateDoc(userDocRef, { cart: localCart });
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
    return () => unsubscribe(); 
  }, []);

  const calculateCartTotal = () => {
    const total = cart.reduce((sum, watch) => {
      const numericPrice = parseInt(watch.price.replace(/[^0-9]/g, ''));
      return sum + numericPrice;
    }, 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total);
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault(); 
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: fullName, email: email, gender: gender, birthMonth: birthMonth, cart: cart
        });
        alert("Account created successfully! Welcome to Ahir Watches.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully! Welcome back.");
      }
      setShowPopup(false);
      setEmail(''); setPassword(''); setFullName(''); setGender(''); setBirthMonth('');
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfile(false); 
      alert("You have been securely logged out.");
    } catch {
      alert("Error logging out.");
    }
  };

  const scrollToCollections = () => {
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Carousel Navigation Functions
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % watchData.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + watchData.length) % watchData.length);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchStart(clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = touchStart - clientX;
    
    // Swipe left/right detection
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    setTouchStart(null);
  };

  // 3D Math for 5 active slots across ALL watches
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
      <nav className="navbar fade-in-down">
        <div className="navbar-left">
          <h1 className="logo" onClick={handleReturnToStore} style={{cursor: 'pointer'}}>Ahir Watches</h1>
          {user && (
            <div className="profile-trigger fade-in-up" onClick={() => setShowProfile(true)}>
              <div className="profile-avatar">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            </div>
          )}
        </div>

        <ul className="nav-links">
          <li onClick={handleReturnToStore}>HOME</li>
          {!selectedWatch && <li onClick={scrollToCollections}>COLLECTIONS</li>}
          <li>ABOUT</li>
          <li>
            <button className="cart-nav-btn" onClick={() => setIsCartOpen(true)}>
              CART 
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </li>
          {!user && (
            <li>
              <button className="nav-login-btn" onClick={() => setShowPopup(true)}>SIGN IN</button>
            </li>
          )}
        </ul>
      </nav>

      {selectedWatch ? (
        <div className="product-page-container fade-in-up">
          <button className="back-btn" onClick={handleReturnToStore}>
            &#8592; Return to Boutique
          </button>
          
          <div className="product-showcase">
            <div className="product-image-large glass-panel">
              <img src={selectedWatch.img} alt={selectedWatch.name} />
            </div>
            
            <div className="product-details-panel">
              <h4 className="gold-gradient-text">{selectedWatch.brand}</h4>
              <h1 className="product-title">{selectedWatch.name}</h1>
              <p className="product-price-large">{selectedWatch.price}</p>
              <div className="divider-line"></div>
              <p className="product-long-description">{selectedWatch.description}</p>
              <ul className="product-specs">
                <li><span>Reference:</span> AW-{selectedWatch.id}X9</li>
                <li><span>Availability:</span> Highly Limited Allocation</li>
                <li><span>Delivery:</span> Secure Armored Transit</li>
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
                .filter((w) => w.brand === selectedWatch.brand && w.id !== selectedWatch.id)
                .slice(0, 3) 
                .map((watch) => (
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
          <header className="hero fade-in-up">
            <div 
              className="carousel-container"
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* ✦ FIX: Maps over ALL watches, allowing infinite rotation */}
              {watchData.map((watch, index) => {
                const positionClass = getCarouselClass(index);
                return (
                  <div 
                    key={watch.id} 
                    className={`carousel-item ${positionClass}`}
                    onClick={() => {
                      if (positionClass === 'left-1' || positionClass === 'left-2') prevSlide();
                      if (positionClass === 'right-1' || positionClass === 'right-2') nextSlide();
                    }}
                  >
                    <div className="carousel-tag">{watch.brand.toUpperCase()} ⌄</div>
                    {/* ✦ FIX: draggable="false" stops annoying browser image dragging! */}
                    <img src={watch.img} alt={watch.name} draggable="false" />
                  </div>
                );
              })}
            </div>

            {/* ✦ FIX: Shortened Text, pinned to absolute bottom */}
            <div className="hero-text-overlay">
              <h2 className="gold-gradient-text">Timeless Elegance</h2>
              <p>EXCLUSIVE PREMIUM TIMEPIECES</p>
              <button className="shop-btn" onClick={scrollToCollections}>ENTER BOUTIQUE</button>
            </div>
          </header>

          <div id="collections" className="collections-wrapper">
            {brandCategories.map((brandName) => (
              <section className="brand-section" key={brandName}>
                <div className="brand-header fade-in-up">
                  <div className="gold-line"></div>
                  <h2 className="brand-title">{brandName}</h2>
                  <div className="gold-line"></div>
                </div>
                <div className="products-grid">
                  {watchData
                    .filter((watch) => watch.brand === brandName)
                    .map((watch) => (
                      <div className="product-card fade-in-up" key={watch.id}>
                        <div className="img-container">
                          <img src={watch.img} alt={watch.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <h3>{watch.name}</h3>
                          {watch.description && <p className="description" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{watch.description}</p>}
                          <p className="price">{watch.price}</p>
                          <button className="add-cart-btn" onClick={() => handleSelectWatch(watch)}>Acquire</button>
                        </div>
                      </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="services-section fade-in-up">
            <h2 className="gold-gradient-text">The Ahir Promise</h2>
            <div className="services-grid">
              <div className="service-card">
                <h3>✦ Authenticity Guaranteed</h3>
                <p>Every timepiece is rigorously verified by our master horologists.</p>
              </div>
              <div className="service-card">
                <h3>✦ Global Secure Transit</h3>
                <p>Fully insured, armored delivery to anywhere in the world.</p>
              </div>
              <div className="service-card">
                <h3>✦ Bespoke Sourcing</h3>
                <p>Looking for a rare piece? Our concierge will find it for you.</p>
              </div>
            </div>
          </section>

          <section className="newsletter-section fade-in-up">
            <div className="newsletter-content glass-panel">
              <h2>Join the Inner Circle</h2>
              <p>Gain private access to highly limited drops and off-market allocations.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email address" />
                <button className="shop-btn">Subscribe</button>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <div className="footer-content">
          <h1 className="logo">Ahir Watches</h1>
          <p className="footer-tagline">Defining Time Since 2026</p>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ahir Watches. All rights reserved.</p>
        </div>
      </footer>

      {/* Popups & Drawer */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Collection</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✖</button>
        </div>
        
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <p className="empty-cart-text">Your portfolio is currently empty.</p>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item fade-in-up" key={index}>
                <img src={item.img} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="gold-gradient-text">{item.price}</p>
                  <button className="remove-item-btn" onClick={() => handleRemoveFromCart(index)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Allocation:</span>
              <span className="gold-gradient-text">{calculateCartTotal()}</span>
            </div>
            <button className="buy-now-btn" style={{width: '100%'}}>Proceed to Secure Checkout</button>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="login-box fade-in-up glass-panel">
            <button className="close-btn" onClick={() => setShowPopup(false)}>✖</button>
            <h2 className="gold-gradient-text">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            
            <form className="login-form" onSubmit={handleLoginSubmit}>
              {isSignUp && (
                <>
                  <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <select required value={gender} onChange={(e) => setGender(e.target.value)} className="form-select">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="month" placeholder="Birth Month" required value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="form-select" />
                </>
              )}
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password (Min 6 characters)" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" className="submit-btn">{isSignUp ? 'Sign Up' : 'Log In'}</button>
            </form>
            <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </p>
          </div>
        </div>
      )}

      {showProfile && user && userData && (
        <div className="modal-overlay">
          <div className="login-box fade-in-up glass-panel">
            <button className="close-btn" onClick={() => setShowProfile(false)}>✖</button>
            <h2 className="gold-gradient-text">Client Dossier</h2>
            <div className="profile-details">
              <div className="profile-row"><span className="profile-label">Name:</span><span className="profile-value">{userData.fullName}</span></div>
              <div className="profile-row"><span className="profile-label">Email:</span><span className="profile-value">{userData.email}</span></div>
              <div className="profile-row"><span className="profile-label">Gender:</span><span className="profile-value">{userData.gender}</span></div>
              <div className="profile-row"><span className="profile-label">Birth Month:</span><span className="profile-value">{userData.birthMonth}</span></div>
            </div>
            
            <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
              <button className="submit-btn" style={{flex: 1, backgroundColor: 'transparent', color: '#d4af37', border: '1px solid #d4af37'}} onClick={() => setShowProfile(false)}>Close</button>
              <button className="submit-btn" style={{flex: 1}} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;