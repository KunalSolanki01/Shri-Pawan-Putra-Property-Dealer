import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyD6ek42LyUtxqZG6XCSytvI7oNIXcqByzI",
  authDomain: "pawanputra-8b603.firebaseapp.com",
  projectId: "pawanputra-8b603",
  storageBucket: "pawanputra-8b603.appspot.com",
  messagingSenderId: "1043438854359",
  appId: "1:1043438854359:web:a1b2c3d4e5f6g7h8i9j0k1l2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [recentlyVisited, setRecentlyVisited] = useState([]);

  const isAdmin = (user) => {
    return user && user.email === 'kunalsol2005@gmail.com';
  };

  const addToRecentlyVisited = (property) => {
    if (user) {
      setRecentlyVisited(prev => {
        const filtered = prev.filter(p => p.title !== property.title);
        return [property, ...filtered].slice(0, 10);
      });
    }
  };

  useEffect(() => {
    // Load sample properties immediately
    setProperties(getSampleProperties());
    
    // Then try to load Firebase properties
    loadProperties();
    
    // Try to set up Firebase auth, but don't fail if it doesn't work
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    } catch (error) {
      console.log('Firebase auth not available:', error);
      // Don't auto-login, let users browse without login
      setUser(null);
    }
  }, []);

  const getSampleProperties = () => {
    return [
      {
        id: "sample_premium_house_30x50",
        title: "Premium House - 30×50",
        price: "2.10 Cr",
        location: "Opposite BR Birla School, Jodhpur",
        type: "House",
        description: "Spacious 30×50 house in prime location opposite BR Birla School. Excellent connectivity and amenities.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=350&fit=crop",
        size: "30×50"
      },
      {
        id: "sample_elegant_house_25x45",
        title: "Elegant House - 25×45",
        price: "1.45 Cr",
        location: "Vaishnav Nagar, Jodhpur",
        type: "House",
        description: "Beautiful 25×45 house in well-developed Vaishnav Nagar with modern facilities and good neighborhood.",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=350&fit=crop",
        size: "25×45"
      },
      {
        id: "sample_modern_house_20x60",
        title: "Modern House - 20×60",
        price: "1.70 Cr",
        location: "Kuldeep Vihar, Jodhpur",
        type: "House",
        description: "Contemporary 20×60 house in Kuldeep Vihar with excellent design and prime location benefits.",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500&h=350&fit=crop",
        size: "20×60"
      },
      {
        id: "sample_luxury_house_30x60",
        title: "Luxury House - 30×60",
        price: "3.25 Cr",
        location: "Shankar Nagar, Jodhpur",
        type: "House",
        description: "Premium 30×60 house in prestigious Shankar Nagar area with top-class amenities and infrastructure.",
        image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=500&h=350&fit=crop",
        size: "30×60"
      },
      {
        id: "sample_house_25x50",
        title: "House - 25×50",
        price: "Price on Request",
        location: "Kamla Nehru Nagar, Jodhpur",
        type: "House",
        description: "Well-planned 25×50 house in Kamla Nehru Nagar. Contact for current pricing and availability.",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=350&fit=crop",
        size: "25×50"
      },
      {
        id: "sample_premium_plot_40x60",
        title: "Premium Plot - 40×60",
        price: "₹80,000/Gaj",
        location: "Megh Nagar, Jodhpur",
        type: "Plot",
        description: "Excellent 40×60 plot in developing Megh Nagar area. Great investment opportunity with future growth potential.",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=350&fit=crop",
        size: "40×60"
      },
      {
        id: "sample_large_plot_3500_gaj",
        title: "Large Plot - 3500 Gaj",
        price: "₹6,000/Gaj",
        location: "Balotara Road, Jodhpur",
        type: "Plot",
        description: "Massive 3500 gaj plot on Balotara Road. Perfect for large-scale development or commercial projects.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=350&fit=crop",
        size: "3500 Gaj"
      },
      {
        id: "sample_agricultural_land_8_biga",
        title: "Agricultural Land - 8 Biga",
        price: "₹60L/Biga",
        location: "Barmer Road, Jodhpur",
        type: "Agriculture Land",
        description: "Fertile 8 biga agricultural land on Barmer Road. Excellent soil quality and water availability.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=350&fit=crop",
        size: "8 Biga"
      },
      {
        id: "sample_agricultural_land_50_biga",
        title: "Agricultural Land - 50 Biga",
        price: "₹50L/Biga",
        location: "Jhawar, Jodhpur",
        type: "Agriculture Land",
        description: "Large 50 biga agricultural land in Jhawar area. Ideal for extensive farming operations.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=350&fit=crop",
        size: "50 Biga"
      },
      {
        id: "sample_agricultural_land_10_biga",
        title: "Agricultural Land - 10 Biga",
        price: "₹20L/Biga",
        location: "Jodhpur Rural Area",
        type: "Agriculture Land",
        description: "Affordable 10 biga agricultural land perfect for small to medium farming ventures.",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=350&fit=crop",
        size: "10 Biga"
      }
    ];
  };

  const loadProperties = async () => {
    try {
      const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const firebaseProperties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get sample properties
      const sampleProperties = getSampleProperties();
      
      // Combine Firebase properties with sample properties
      const allProperties = [...firebaseProperties, ...sampleProperties];
      setProperties(allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      // If Firebase fails, just show sample properties
      setProperties(getSampleProperties());
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        alert('Email/Password authentication is not enabled. Please contact the administrator or use the demo account.');
        // Auto-login as demo user
        setUser({ email: 'demo@pawanputra.com', uid: 'demo-user' });
        setShowAuth(false);
      } else if (error.code === 'auth/user-not-found') {
        alert('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        alert('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        alert('An account with this email already exists. Please login instead.');
      } else {
        alert('Authentication error: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const addProperty = async (propertyData) => {
    // Add to UI immediately
    const newProperty = {
      id: 'temp_' + Date.now(),
      ...propertyData,
      createdAt: new Date()
    };
    setProperties(prev => [newProperty, ...prev]);
    
    // Try Firebase in background
    try {
      const docRef = await addDoc(collection(db, 'properties'), {
        ...propertyData,
        createdAt: new Date()
      });
      
      // Update with Firebase ID
      setProperties(prev => prev.map(p => 
        p.id === newProperty.id ? { ...p, id: docRef.id } : p
      ));
    } catch (error) {
      // Keep local ID if Firebase fails
      setProperties(prev => prev.map(p => 
        p.id === newProperty.id ? { ...p, id: 'local_' + Date.now() } : p
      ));
    }
  };

  const updateProperty = async (propertyId, updatedData) => {
    // Update UI immediately
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, ...updatedData } : p
    ));
    
    // Try Firebase in background
    if (propertyId && !propertyId.startsWith('local_') && !propertyId.startsWith('sample_') && !propertyId.startsWith('temp_')) {
      try {
        await updateDoc(doc(db, 'properties', propertyId), updatedData);
      } catch (error) {
        console.error('Firebase update failed:', error);
      }
    }
  };

  const deleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      // Remove from UI immediately
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      
      // Try Firebase in background
      if (propertyId && !propertyId.startsWith('local_') && !propertyId.startsWith('sample_') && !propertyId.startsWith('temp_')) {
        try {
          await deleteDoc(doc(db, 'properties', propertyId));
        } catch (error) {
          console.error('Firebase delete failed:', error);
        }
      }
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'property-details':
        return <PropertyDetails property={selectedProperty} setCurrentPage={setCurrentPage} />;
      case 'contact-page':
        return <ContactPage property={selectedProperty} setCurrentPage={setCurrentPage} />;
      case 'recently-visited':
        return <RecentlyVisited recentlyVisited={recentlyVisited} setCurrentPage={setCurrentPage} setSelectedProperty={setSelectedProperty} addToRecentlyVisited={addToRecentlyVisited} />;
      case 'admin-panel':
        return <AdminPanel properties={properties} updateProperty={updateProperty} deleteProperty={deleteProperty} setCurrentPage={setCurrentPage} />;
      default:
        return (
          <>
            <Hero />
            <About />
            <Properties 
              properties={properties} 
              user={user} 
              addProperty={addProperty}
              setCurrentPage={setCurrentPage}
              setSelectedProperty={setSelectedProperty}
              addToRecentlyVisited={addToRecentlyVisited}
              isAdmin={isAdmin}
            />
            <Contact />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="app light">
      <Header 
        user={user}
        setShowAuth={setShowAuth}
        handleLogout={handleLogout}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
      />
      
      {showAuth && (
        <AuthModal 
          authMode={authMode}
          setAuthMode={setAuthMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleAuth={handleAuth}
          setShowAuth={setShowAuth}
        />
      )}

      {renderPage()}
    </div>
  );
}

const Header = ({ user, setShowAuth, handleLogout, setCurrentPage, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src="/logo.png" alt="Shri Pawan Putra Property Dealer" className="logo-img" />
          <h2>Shri Pawan Putra Property Dealer</h2>
        </div>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <button onClick={() => {
            setCurrentPage('home');
            setTimeout(() => document.getElementById('home')?.scrollIntoView({behavior: 'smooth'}), 100);
            setMobileMenuOpen(false);
          }} className="nav-btn">Home</button>
          <button onClick={() => {
            setCurrentPage('home');
            setTimeout(() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}), 100);
            setMobileMenuOpen(false);
          }} className="nav-btn">About</button>
          <button onClick={() => {
            setCurrentPage('home');
            setTimeout(() => document.getElementById('properties')?.scrollIntoView({behavior: 'smooth'}), 100);
            setMobileMenuOpen(false);
          }} className="nav-btn">Properties</button>
          <button onClick={() => {
            setCurrentPage('home');
            setTimeout(() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}), 100);
            setMobileMenuOpen(false);
          }} className="nav-btn">Contact</button>
          {user && (
            <button onClick={() => {
              setCurrentPage('recently-visited');
              setMobileMenuOpen(false);
            }} className="nav-btn">Recently Visited</button>
          )}
          {isAdmin(user) && (
            <>
              <button onClick={() => {
                setCurrentPage('admin-panel');
                setMobileMenuOpen(false);
              }} className="nav-btn">Admin Panel</button>
              <span className="admin-badge">Admin</span>
            </>
          )}
          {user ? (
            <button onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }} className="auth-btn">Logout</button>
          ) : (
            <button onClick={() => {
              setShowAuth(true);
              setMobileMenuOpen(false);
            }} className="auth-btn">Login</button>
          )}
        </nav>
      </div>
    </header>
  );
};

const AuthModal = ({ authMode, setAuthMode, email, setEmail, password, setPassword, handleAuth, setShowAuth }) => (
  <div className="modal-overlay">
    <div className="modal">
      <button className="close-btn" onClick={() => setShowAuth(false)}>×</button>
      <div className="auth-icon">
        {authMode === 'login' ? '🔐' : '👤'}
      </div>
      <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="📧 Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="🔒 Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{authMode === 'login' ? 'Sign In' : 'Create Account'}</button>
      </form>
      <div className="auth-switch">
        <p>
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="link-btn"
          >
            {authMode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  </div>
);

const Hero = () => {
  const [counters, setCounters] = useState({ properties: 0, clients: 0, years: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCounters(prev => {
          const newCounters = {
            properties: prev.properties < 1100 ? prev.properties + 10 : 1100,
            clients: prev.clients < 800 ? prev.clients + 5 : 800,
            years: prev.years < 20 ? prev.years + 1 : 20
          };
          
          // Stop interval when all counters reach their target
          if (newCounters.properties === 1100 && newCounters.clients === 800 && newCounters.years === 20) {
            clearInterval(interval);
          }
          
          return newCounters;
        });
      }, 100);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="home" className="hero">
      <div className="container">
        <h1>Find Your Dream Property in Jodhpur</h1>
        <p>Trusted real estate services by Hari Solanki</p>
        <div className="stats-container">
          <div className="stat-item">
            <h3>{counters.properties}+</h3>
            <p>Properties Sold</p>
          </div>
          <div className="stat-item">
            <h3>{counters.clients}+</h3>
            <p>Happy Clients</p>
          </div>
          <div className="stat-item">
            <h3>{counters.years}+</h3>
            <p>Years Experience</p>
          </div>
        </div>
        <button className="cta-btn" onClick={() => {
          const propertiesSection = document.getElementById('properties');
          if (propertiesSection) {
            propertiesSection.scrollIntoView({behavior: 'smooth', block: 'start'});
          }
        }}>Explore Properties</button>
      </div>
    </section>
  );
};

const About = () => (
  <section id="about" className="about">
    <div className="container">
      <h2>About Us</h2>
      <div className="about-content">
        <div className="about-text">
          <h3>Hari Solanki - Your Trusted Property Dealer</h3>
          <p>With years of experience in Jodhpur's real estate market, we provide comprehensive property solutions for buying, selling, and renting properties.</p>
          <div className="contact-info">
            <p><strong>Address:</strong> A-72, 80 Foot Road, Shankar Nagar, PF Office, Jodhpur</p>
            <p><strong>Phone:</strong> 9982351222, 8209953768</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Properties = ({ properties, user, addProperty, setCurrentPage, setSelectedProperty, addToRecentlyVisited, isAdmin }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '',
    price: '',
    location: '',
    type: '',
    description: '',
    image: '',
    size: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setImagePreview(imageDataUrl);
        setNewProperty({...newProperty, image: imageDataUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProperty = (e) => {
    e.preventDefault();
    addProperty(newProperty);
    setNewProperty({ title: '', price: '', location: '', type: '', description: '', image: '', size: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowAddForm(false);
  };

  return (
    <section id="properties" className="properties">
      <div className="container">
        <h2>Our Premium Properties</h2>
        <p className="properties-subtitle">Discover the best real estate opportunities in Jodhpur</p>
        {isAdmin(user) && (
          <button 
            onClick={() => setShowAddForm(true)} 
            className="add-property-btn"
          >
            Add Property
          </button>
        )}
        
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
              <h3>Add New Property</h3>
              <form onSubmit={handleAddProperty}>
                <input
                  type="text"
                  placeholder="Property Title"
                  value={newProperty.title}
                  onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={newProperty.price}
                  onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newProperty.location}
                  onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                  required
                />
                <select
                  value={newProperty.type}
                  onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot</option>
                  <option value="Agriculture Land">Agriculture Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Size (e.g., 30×50, 40×60, 10 Biga)"
                  value={newProperty.size}
                  onChange={(e) => setNewProperty({...newProperty, size: e.target.value})}
                />
                <div className={`file-upload ${imageFile ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="property-image"
                  />
                  <label htmlFor="property-image" className="file-upload-label">
                    {imageFile ? `📷 ${imageFile.name}` : '📷 Upload Property Image (Optional)'}
                  </label>
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Property preview" />
                  </div>
                )}
                <button type="submit">Add Property</button>
              </form>
            </div>
          </div>
        )}

        <div className="properties-grid">
          {properties.map((property, index) => (
            <div key={property.id || index} className="property-card">
              {property.image && (
                <div className="property-image">
                  <img src={property.image} alt={property.title} />
                </div>
              )}
              <div className="property-content">
                <div className="property-header">
                  <h3>{property.title}</h3>
                  {property.size && <span className="property-size">{property.size}</span>}
                </div>
                <p className="price">{property.price}</p>
                <div className="property-meta">
                  <p className="location">📍 {property.location}</p>
                  <p className="type">🏠 {property.type}</p>
                </div>
                <p className="description">{property.description}</p>
                <div className="property-actions">
                  <button className="view-details-btn" onClick={() => {
                    addToRecentlyVisited(property);
                    setSelectedProperty(property);
                    setCurrentPage('property-details');
                  }}>View Details</button>
                  <button className="contact-btn" onClick={() => {
                    addToRecentlyVisited(property);
                    setSelectedProperty(property);
                    setCurrentPage('contact-page');
                  }}>Contact</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create email content
    const subject = `Property Inquiry from ${formData.name}`;
    const emailBody = `Hi Hari Solanki,\n\nNew property inquiry:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}\n\nBest regards,\n${formData.name}`;
    
    // Open email client
    const mailtoLink = `mailto:rajahari435@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Store in Firebase (optional)
    try {
      addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        timestamp: new Date(),
        type: 'general'
      });
    } catch (error) {
      console.log('Firebase storage failed:', error);
    }
    
    // Clear form and show success message
    setFormData({ name: '', email: '', phone: '', message: '' });
    alert('Thank you! Your email client will open. Please send the email to complete your inquiry.');
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>Contact Us</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="contact-card">
              <p><strong>Hari Solanki</strong></p>
              <p>📍 A-72, 80 Foot Road, Shankar Nagar, PF Office, Jodhpur</p>
              <p>📞 <a href="tel:+918209953768">8209953768</a></p>
              <p>📞 <a href="tel:+919982351222">9982351222</a></p>
              <p>✉️ <a href="mailto:rajahari435@gmail.com">rajahari435@gmail.com</a></p>
              <p>📷 <a href="https://www.instagram.com/shripawanputra?igsh=MXU5Nms3M3c4Y3Rnag==" target="_blank" rel="noopener noreferrer">@shripawanputra</a></p>
              <p>📱 <a href="https://whatsapp.com/channel/0029VbBUVG0CcW4lCjx78x3w" target="_blank" rel="noopener noreferrer">WhatsApp Channel</a></p>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
            <input 
              type="tel" 
              placeholder="Your Phone" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
            <textarea 
              placeholder="Your Message" 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            ></textarea>
            <button type="submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const PropertyDetails = ({ property, setCurrentPage }) => {
  if (!property) return null;
  
  return (
    <div className="property-details-page">
      <div className="container">
        <button className="back-btn" onClick={() => setCurrentPage('home')}>← Back to Properties</button>
        <div className="property-details-content">
          <div className="property-image-large">
            <img src={property.image} alt={property.title} />
          </div>
          <div className="property-info">
            <h1>{property.title}</h1>
            <div className="property-price-large">{property.price}</div>
            <div className="property-meta-large">
              <p><strong>📍 Location:</strong> {property.location}</p>
              <p><strong>📐 Size:</strong> {property.size}</p>
              <p><strong>🏠 Type:</strong> {property.type}</p>
            </div>
            <div className="property-description-large">
              <h3>Description</h3>
              <p>{property.description}</p>
            </div>
            <div className="property-contact-info">
              <h3>Contact Information</h3>
              <p><strong>Hari Solanki</strong></p>
              <p>📞 <a href="tel:+918209953768">8209953768</a></p>
              <p>📞 <a href="tel:+919982351222">9982351222</a></p>
              <p>✉️ <a href="mailto:rajahari435@gmail.com">rajahari435@gmail.com</a></p>
            </div>
            <button className="contact-now-btn" onClick={() => setCurrentPage('contact-page')}>Contact Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = ({ property, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: property ? `I'm interested in ${property.title} (${property.size}) at ${property.location} - ${property.price}` : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store in Firebase
    try {
      addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        property: property ? property.title : '',
        propertyLocation: property ? property.location : '',
        propertyPrice: property ? property.price : '',
        timestamp: new Date(),
        type: 'property'
      });
    } catch (error) {
      console.log('Firebase storage failed:', error);
    }
    
    // Send email via mailto
    const subject = property ? `Property Inquiry - ${property.title}` : 'General Inquiry';
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nMessage: ${formData.message}${property ? `\n\nProperty: ${property.title}\nLocation: ${property.location}\nPrice: ${property.price}` : ''}`;
    const mailtoLink = `mailto:rajahari435@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_blank');
    
    alert('Thank you! Your inquiry has been sent to kunalsol2005@gmail.com');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setCurrentPage('home');
  };

  return (
    <div className="contact-page">
      <div className="container">
        <button className="back-btn" onClick={() => setCurrentPage('home')}>← Back to Home</button>
        <div className="contact-page-content">
          <h1>Contact Us</h1>
          {property && (
            <div className="property-inquiry-info">
              <h3>Property Inquiry: {property.title}</h3>
              <p>{property.location} - {property.price}</p>
            </div>
          )}
          <form className="contact-page-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
            <input 
              type="tel" 
              placeholder="Your Phone" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
            <textarea 
              placeholder="Your Message" 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              rows="6"
            ></textarea>
            <button type="submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const RecentlyVisited = ({ recentlyVisited, setCurrentPage, setSelectedProperty, addToRecentlyVisited }) => {
  return (
    <div className="recently-visited-page">
      <div className="container">
        <button className="back-btn" onClick={() => setCurrentPage('home')}>← Back to Home</button>
        <h1>Recently Visited Properties</h1>
        {recentlyVisited.length === 0 ? (
          <div className="no-properties">
            <p>No recently visited properties yet.</p>
            <button onClick={() => setCurrentPage('home')} className="cta-btn">Browse Properties</button>
          </div>
        ) : (
          <div className="properties-grid">
            {recentlyVisited.map((property, index) => (
              <div key={index} className="property-card">
                {property.image && (
                  <div className="property-image">
                    <img src={property.image} alt={property.title} />
                  </div>
                )}
                <div className="property-content">
                  <div className="property-header">
                    <h3>{property.title}</h3>
                    {property.size && <span className="property-size">{property.size}</span>}
                  </div>
                  <p className="price">{property.price}</p>
                  <div className="property-meta">
                    <p className="location">📍 {property.location}</p>
                    <p className="type">🏠 {property.type}</p>
                  </div>
                  <p className="description">{property.description}</p>
                  <div className="property-actions">
                    <button className="view-details-btn" onClick={() => {
                      addToRecentlyVisited(property);
                      setSelectedProperty(property);
                      setCurrentPage('property-details');
                    }}>View Details</button>
                    <button className="contact-btn" onClick={() => {
                      addToRecentlyVisited(property);
                      setSelectedProperty(property);
                      setCurrentPage('contact-page');
                    }}>Contact</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel = ({ properties, updateProperty, deleteProperty, setCurrentPage }) => {
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const handleEdit = (property) => {
    setEditingProperty(property.id);
    setEditForm({...property});
    setEditImageFile(null);
    setEditImagePreview(property.image || null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setEditImagePreview(imageDataUrl);
        setEditForm({...editForm, image: imageDataUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProperty(editingProperty, editForm);
    setEditingProperty(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <button className="back-btn" onClick={() => setCurrentPage('home')}>← Back to Home</button>
        <h1>Admin Panel - Manage Properties</h1>
        <div className="admin-properties-grid">
          {properties.map((property, index) => (
            <div key={property.id} className="admin-property-card">
              {editingProperty === property.id ? (
                <form onSubmit={handleUpdate} className="edit-form">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    required
                  />
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                    required
                  >
                    <option value="House">House</option>
                    <option value="Plot">Plot</option>
                    <option value="Agriculture Land">Agriculture Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    value={editForm.size || ''}
                    onChange={(e) => setEditForm({...editForm, size: e.target.value})}
                  />
                  <div className={`file-upload ${editImageFile ? 'has-file' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      id={`edit-image-${editingProperty}`}
                    />
                    <label htmlFor={`edit-image-${editingProperty}`} className="file-upload-label">
                      {editImageFile ? `📷 ${editImageFile.name}` : '📷 Change Property Image'}
                    </label>
                  </div>
                  {editImagePreview && (
                    <div className="image-preview">
                      <img src={editImagePreview} alt="Property preview" />
                    </div>
                  )}
                  <div className="edit-actions">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" onClick={() => {
                      setEditingProperty(null);
                      setEditImageFile(null);
                      setEditImagePreview(null);
                    }} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="admin-property-info">
                    <h3>{property.title}</h3>
                    <p className="price">{property.price}</p>
                    <p>{property.location}</p>
                    <p>{property.type} - {property.size}</p>
                  </div>
                  <div className="admin-actions">
                    <button onClick={() => handleEdit(property)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteProperty(property.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <p>2025 Shri Pawan Putra Property Dealer. Made By Son Of Hari Solanki</p>
    </div>
  </footer>
);

export default App;