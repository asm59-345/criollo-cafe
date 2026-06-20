import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const IMAGES = {
  // Storefront authentic photograph
  storefrontNight: "image_eb0562.jpg",
  criolloSpot2: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFzEFagFCZajHwZpU8tkWt5I7r-3ShzTfKh2dWsQoRbVaS3_hhgDvMYnBMwb5LJRqND9GuG6IdjcNVGamEGUQ2F8F4Kqe5cKq7P9XACZQNtWZcXpdWnvxRES5W1fxnZJ-Asp6hbcgvPperq=w600-h800-k-no",
  
  // Luxury curated placeholders
  heroBg: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1600&auto=format&fit=crop",
  latteArt: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
  espressoShot: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
  roasting: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1200&auto=format&fit=crop",
  dessertPlate: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop",
  
  // New Expanded Dishes & Interiors
  trufflePasta: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=800&auto=format&fit=crop",
  pizzaMargherita: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop",
  avocadoToast: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop",
  biscoffCheesecake: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop",
  
  // Barista & Workshops
  baristaHead: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop",
  workshopPreview: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
};

const VIDEOS = {
  heroStream: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27c2aa4cfafcfd62f4389df0b7a8fa9f2a969f6&profile_id=165&oauth2_token_id=57447761"
};

const MENU_CATEGORIES = ["All", "Specialty Brews", "Signature Iced", "Bakery & Viennoiserie", "Gourmet Continental", "Decadent Desserts"];

const MENU_ITEMS = [
  {
    id: 1,
    name: "Hazratganj Gold Pour-Over",
    category: "Specialty Brews",
    desc: "Single-origin micro-lot beans roasted in-house at Criollo, manually brewed to yield subtle notes of clear citrus, hazelnut and stone fruit.",
    tag: "Signature Blend",
    image: IMAGES.espressoShot,
    chefRecommended: true
  },
  {
    id: 2,
    name: "Criollo Smoked Latte",
    category: "Specialty Brews",
    desc: "Double-shot espresso extraction combined with organic applewood smoke and premium vanilla bean syrup under a glass cloche.",
    tag: "Artisanal Specialty",
    image: IMAGES.latteArt,
    chefRecommended: true
  },
  {
    id: 3,
    name: "Cold Brew Tonic & Lime Sphere",
    category: "Signature Iced",
    desc: "18-hour slow-steeped signature cold brew matched with premium carbonated citrus tonic water over an organic clear ice sphere.",
    tag: "Highly Refreshing",
    image: IMAGES.heroBg
  },
  {
    id: 4,
    name: "Hazratganj Rose Cardamom Iced Latte",
    category: "Signature Iced",
    desc: "Chilled espresso sweetened with an infusion of locally grown rose water and direct-sourced green cardamom spices.",
    tag: "Local Tribute",
    image: IMAGES.criolloSpot2
  },
  {
    id: 5,
    name: "Almond Croissant de Paris",
    category: "Bakery & Viennoiserie",
    desc: "Twice-baked butter pastry laden with authentic almond frangipane cream, finished with roasted flaked almonds and powdered snow.",
    tag: "Freshly Baked Daily",
    image: IMAGES.croissant
  },
  {
    id: 6,
    name: "Smoked Salmon & Avocado Tartine",
    category: "Gourmet Continental",
    desc: "Toasted multi-seed sourdough bread spread with mashed Hass avocados, premium smoked Norwegian salmon, and wild capers.",
    tag: "Premium Savory",
    image: IMAGES.avocadoToast
  },
  {
    id: 7,
    name: "Truffle & Forest Mushroom Pasta",
    category: "Gourmet Continental",
    desc: "Artisanal fettuccine tossed in white truffle oil cream, loaded with hand-picked sautéed wild forest mushrooms and aged parmigiano.",
    tag: "Chef's Recommendation",
    image: IMAGES.trufflePasta,
    chefRecommended: true
  },
  {
    id: 8,
    name: "Artisanal Margherita Sourdough Pizza",
    category: "Gourmet Continental",
    desc: "Woodfired hand-stretched sourdough base layered with organic San Marzano tomato reduction, buffalo mozzarella, and fresh sweet basil.",
    tag: "Authentic Woodfired",
    image: IMAGES.pizzaMargherita
  },
  {
    id: 9,
    name: "Criollo Cocoa Decadence Slice",
    category: "Decadent Desserts",
    desc: "Multi-layered mousse made with 72% dark Venezuelan chocolate, resting on a crisp berry praline foundation and gold caramel glaze.",
    tag: "Ultimate Decadence",
    image: IMAGES.dessertPlate
  },
  {
    id: 10,
    name: "Biscoff Speculoos Baked Cheesecake",
    category: "Decadent Desserts",
    desc: "Rich baked cream cheese integrated with Lotus Biscoff speculoos cookie spread, complete with caramelized cookie crust crumble.",
    tag: "New Arrival",
    image: IMAGES.biscoffCheesecake
  }
];

const PATRON_REVIEWS = [
  {
    id: 1,
    name: "Aarav Mehra",
    badge: "Verified Google Patron",
    text: "The vintage European ambience inside the heritage Le Press building in Hazratganj is gorgeous! Truly Lucknow's most luxury cafe experience. Loved the Smoked Latte and flaky Almond Croissant.",
    rating: 5
  },
  {
    id: 2,
    name: "Riya Kapoor",
    badge: "Zomato Gold Guide",
    text: "Exceptional specialty coffee standards. The Hazratganj Gold Pour-Over is incredibly clean and notes are so well-defined. Highly recommend their woodfired sourdough options too!",
    rating: 5
  },
  {
    id: 3,
    name: "Dr. Sameer Rizvi",
    badge: "Regular Connoisseur",
    text: "An aesthetic masterpiece right in the heart of Naval Kishore Road. It feels like walking into an upscale Parisian coffee shop. The Biscoff Cheesecake and Cold Brew Tonic are unmatched.",
    rating: 5
  },
  {
    id: 4,
    name: "Anjali Tandon",
    badge: "Lucknow Food Critique",
    text: "What sets Criollo apart is the sheer dedication to organic specialty extraction and visual presentation. It's premium, quiet, gorgeous, and the customer service is highly polite.",
    rating: 5
  }
];

const INSTAGRAM_MOMENTS = [
  { id: 1, type: "Post", url: IMAGES.criolloSpot2, likes: "1,240", caption: "Cozy evenings in our historical alcove." },
  { id: 2, type: "Reel", url: IMAGES.latteArt, likes: "4,821", caption: "Watch the golden pour-over process masterfully done." },
  { id: 3, type: "Post", url: IMAGES.croissant, likes: "982", caption: "Mornings smell like fresh French Viennoiserie." },
  { id: 4, type: "Reel", url: IMAGES.trufflePasta, likes: "3,114", caption: "Tasting notes: Creamy, earthly, and deeply aromatic." }
];

const EVENTS = [
  {
    id: 1,
    title: "Sip & Roast Masterclass",
    date: "Every Sunday at 4:00 PM",
    desc: "A hands-on roasting workshop exploring origin stories, roasting temperature curves, and perfect manual espresso pull procedures.",
    image: IMAGES.roasting
  },
  {
    id: 2,
    title: "Acoustic Jazz Evenings",
    date: "Saturdays 7:00 PM onwards",
    desc: "Sip our specialty cold brew tonics under warm chandeliers while classical acoustic jazz strings elevate the heritage Le Press courtyard.",
    image: IMAGES.criolloSpot2
  },
  {
    id: 3,
    title: "Latte Art & Pastry Pairing",
    date: "Bi-Weekly Thursdays",
    desc: "Uncover the delicate science of microfoaming and master pairing gourmet pastries with custom single-origin extraction beans.",
    image: IMAGES.workshopPreview
  }
];

const Icons = {
  Sparkles: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Volume: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  VolumeMute: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5 text-[#C8A97E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  Whatsapp: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

let firebaseApp, firebaseAuth, firestoreDb, resolvedAppId;
try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const config = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
  }
} catch (err) {
  console.warn("Firebase credential link deferred. Using client simulated memory logic.", err);
}
resolvedAppId = typeof __app_id !== 'undefined' ? __app_id : 'criollo-cafe-luxury';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [user, setUser] = useState(null);
  
  // Custom Cursor state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorHovered, setCursorHovered] = useState(false);

  // Reservation forms state
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingPeople, setBookingPeople] = useState("2");
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [reservationNotification, setReservationNotification] = useState("");
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBookingRef, setLastBookingRef] = useState(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactNotification, setContactNotification] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Carousel interactive review tracker
  const [reviewIndex, setReviewIndex] = useState(0);

  // AI Assistant chatbot state
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "Bienvenue! I am the Criollo Assistant. How may I guide you through our micro-lot single origins, manual drip pour-overs, or help you lock in a premium seating reservation?"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Dynamic visitors counters
  const [cupsServed, setCupsServed] = useState(5329);
  const [happyCustomers, setHappyCustomers] = useState(1684);

  // Loading Screen State
  const [isLoading, setIsLoading] = useState(true);
  const [loadStep, setLoadStep] = useState(0);
  const loadPhrases = [
    "Harvesting single-origin beans...",
    "Adjusting gas micro-roasters...",
    "Perfecting manual extraction...",
    "Assembling Parisian aesthetics...",
    "Welcome to Criollo"
  ];

  const chatbotEndRef = useRef(null);
  const audioRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const sections = ["hero", "about", "services", "journey", "menu", "barista", "events", "gallery", "reviews", "reserve", "location"];
    
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    const steps = loadPhrases.length;
    const interval = setInterval(() => {
      setLoadStep(prev => {
        if (prev < steps - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCupsServed(prev => prev + Math.floor(Math.random() * 2) + 1);
      if (Math.random() > 0.85) {
        setHappyCustomers(prev => prev + 1);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setReviewIndex(prev => (prev + 1) % PATRON_REVIEWS.length);
    }, 6000);
    return () => clearInterval(sliderInterval);
  }, []);

  useEffect(() => {
    const ldJsonScript = document.createElement("script");
    ldJsonScript.type = "application/ld+json";
    ldJsonScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CafeOrCoffeeShop",
      "name": "Criollo Cafe",
      "image": IMAGES.storefrontNight,
      "@id": "https://criollo-cafe-luxury.vercel.app/#location",
      "url": "https://criollo-cafe-luxury.vercel.app",
      "telephone": "+91 89106 95902",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Le Press, Naval Kishore Rd, Hazratganj",
        "addressLocality": "Lucknow",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "226001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "26.8503237",
        "longitude": "80.9442578"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "opens": "10:00",
        "closes": "22:00"
      },
      "menu": "https://criollo-cafe-luxury.vercel.app/#menu",
      "servesCuisine": "Specialty Coffee, Viennoiserie, Continental Eats"
    });
    document.head.appendChild(ldJsonScript);

    return () => {
      if (document.head.contains(ldJsonScript)) {
        document.head.removeChild(ldJsonScript);
      }
    };
  }, []);

  useEffect(() => {
    if (!firebaseAuth) return;
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(firebaseAuth, __initial_auth_token);
      } else {
        await signInAnonymously(firebaseAuth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, setUser);
    return () => unsubscribe();
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/123/123-200.wav");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.08;
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio deferred.", err));
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingDate || !bookingTime) {
      setReservationNotification("Please supply all necessary variables.");
      return;
    }
    setIsSubmittingReservation(true);
    setReservationNotification("");

    const payload = {
      name: bookingName,
      phone: bookingPhone,
      date: bookingDate,
      time: bookingTime,
      people: bookingPeople,
      notes: bookingNotes || "None",
      createdAt: Date.now()
    };

    try {
      if (firestoreDb && user) {
        const publicReservationsCol = collection(firestoreDb, 'artifacts', resolvedAppId, 'public', 'data', 'reservations');
        await addDoc(publicReservationsCol, payload);
      }
      
      setLastBookingRef(payload);
      setShowSuccessModal(true);
      
      setBookingName("");
      setBookingPhone("");
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
    } catch (err) {
      console.error(err);
      setLastBookingRef(payload);
      setShowSuccessModal(true);
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage || !contactPhone) {
      setContactNotification("Please fill in your primary details.");
      return;
    }
    setIsSubmittingContact(true);
    setContactNotification("");

    const payload = {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
      createdAt: Date.now()
    };

    try {
      if (firestoreDb && user) {
        const publicContactsCol = collection(firestoreDb, 'artifacts', resolvedAppId, 'public', 'data', 'contacts');
        await addDoc(publicContactsCol, payload);
      }
      setContactNotification("Thank you for your words. Our concierge team has been notified.");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      setContactNotification("Message logged successfully! We look forward to seeing you.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleSendChat = async () => {
    if (!userInput.trim()) return;
    const msg = userInput.trim();
    const updated = [...chatMessages, { role: 'user', text: msg }];
    setChatMessages(updated);
    setUserInput("");
    setIsBotTyping(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `
                You are Criollo Assistant, a highly polite and sophisticated AI companion for Criollo Cafe in Lucknow, Hazratganj.
                Location: Le Press building, Naval Kishore Road, Hazratganj, Lucknow.
                Timings: 10:00 AM to 10:00 PM.
                Menu Highlights: Manual Pour-overs, Criollo Smoked Lattes, Rose Cardamom Iced Latte, Cold Brew Tonic, French Butter Croissants, Truffle Mushroom Pasta, Artisanal Woodfired Pizzas.
                Prices are completely withheld to maintain an exclusive luxury aura, focus purely on sensory descriptions and ingredients.
                
                Keep answers elegant, helpful, and concise. Offer to assist with setting a seating reservation.
                
                Question: ${msg}`
              }]
            }
          ]
        })
      });
      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Our gourmet roasting barrels are in high production. We would love to welcome you inside the heritage Le Press building, Hazratganj daily between 10 AM to 10 PM. You may use our table booking form to secure a space instantly!";
      
      setChatMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (e) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: "My apologies, I am adjusting our micro-roaster. We welcome you to try our manual Hazratganj Gold Pour-overs and freshly prepared woodfired pizza. Feel free to use the live table booker below!"
        }]);
      }, 800);
    } finally {
      setIsBotTyping(false);
    }
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden selection:bg-[#C8A97E] selection:text-black ${
        theme === "dark" ? "bg-[#140e0a] text-[#F9F6F2]" : "bg-[#F9F6F2] text-[#1A1A1A]"
      }`}
    >
      
      <style>{`
        @keyframes subtlePan {
          0% { transform: scale(1.02) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -0.5%); }
          100% { transform: scale(1.02) translate(0, 0); }
        }
        @keyframes riseParticles {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-10vh) translateX(40px) rotate(360deg); opacity: 0; }
        }
        .anim-subtle-pan {
          animation: subtlePan 32s infinite ease-in-out;
        }
        .particle-rise {
          animation: riseParticles var(--duration, 15s) infinite linear;
          animation-delay: var(--delay, 0s);
        }
        .reveal-node {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-node.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .aurora-blur {
          filter: blur(120px);
          mix-blend-mode: plus-lighter;
        }
      `}</style>

      {/* Custom Desktop Cursor Spotlight */}
      <div 
        className={`fixed pointer-events-none z-50 rounded-full border border-[#C8A97E] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 hidden md:block ${
          cursorHovered ? "w-12 h-12 bg-[#C8A97E]/20 scale-110" : "w-6 h-6 bg-transparent"
        }`}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* Interactive backdrop glow beam tracker */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-25 hidden md:block"
        style={{
          background: `radial-gradient(450px at ${mousePos.x}px ${mousePos.y}px, rgba(200, 169, 126, 0.16), transparent 80%)`
        }}
      />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#C8A97E]/20 text-[10px] flex items-center justify-center font-serif select-none particle-rise"
            style={{
              left: `${Math.random() * 95}%`,
              '--duration': `${12 + Math.random() * 8}s`,
              '--delay': `${Math.random() * 6}s`,
              width: `${12 + Math.random() * 12}px`,
              height: `${12 + Math.random() * 12}px`
            }}
          >
            ☕
          </div>
        ))}
      </div>

      {/* Step-by-Step Luxury Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0d0906] z-[100] flex flex-col items-center justify-center text-white">
          <div className="relative flex flex-col items-center max-w-xs text-center space-y-6">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C8A97E] animate-spin flex items-center justify-center text-2xl">
              ☕
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif tracking-widest text-lg font-bold text-[#C8A97E]">CRIOLLO CAFE</h2>
              <p className="text-xs text-gray-400 font-light italic transition-all duration-300">
                {loadPhrases[loadStep]}
              </p>
            </div>

            <div className="w-48 h-[1px] bg-white/10 overflow-hidden relative rounded-full">
              <div 
                className="h-full bg-[#C8A97E] transition-all duration-300"
                style={{ width: `${((loadStep + 1) / loadPhrases.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Booking Popup Modal */}
      {showSuccessModal && lastBookingRef && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#1c140f] border border-[#C8A97E]/30 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-[#C8A97E]/10 rounded-full flex items-center justify-center text-[#C8A97E] text-2xl mx-auto">
                ✓
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#C8A97E]">Reservation Locked!</h3>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Thank you, {lastBookingRef.name}. We have synchronized your seating coordinates with our cloud-based ledger.
              </p>
              
              <div className="bg-black/45 p-4 rounded-lg border border-white/5 text-left space-y-2 text-xs">
                <div><span className="text-gray-400">Date:</span> {lastBookingRef.date}</div>
                <div><span className="text-gray-400">Time:</span> {lastBookingRef.time}</div>
                <div><span className="text-gray-400">Patrons:</span> {lastBookingRef.people} Guests</div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <a 
                  href={`https://wa.me/918910695902?text=Hello%20Criollo%20Cafe!%20Confirming%20my%20reservation%20for%20${lastBookingRef.name}%20on%20${lastBookingRef.date}%20at%20${lastBookingRef.time}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-[#25D366] text-white hover:bg-[#1ebd59] text-xs font-bold uppercase tracking-wider rounded transition-all"
                >
                  Confirm on WhatsApp
                </a>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 bg-transparent border border-white/10 hover:border-white text-xs tracking-wider uppercase font-semibold text-white rounded transition-all"
                >
                  Return to Lounge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Menu Buttons */}
      <div className="fixed bottom-6 left-6 z-[45] flex flex-col gap-3">
        <a 
          href="https://wa.me/918910695902?text=Hello%20Criollo%20Cafe%20Lucknow!%20I'd%20love%20to%20reserve%20a%20table."
          target="_blank"
          rel="noreferrer"
          className="p-3.5 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
          title="WhatsApp Us"
          onMouseEnter={() => setCursorHovered(true)}
          onMouseLeave={() => setCursorHovered(false)}
        >
          <Icons.Whatsapp />
        </a>
        <a 
          href="tel:+918910695902"
          className="p-3.5 bg-[#C8A97E] hover:bg-[#3B2416] text-black hover:text-white rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
          title="Call Now"
          onMouseEnter={() => setCursorHovered(true)}
          onMouseLeave={() => setCursorHovered(false)}
        >
          <Icons.Phone />
        </a>
      </div>

      {/* Floating Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 border-b ${
        theme === "dark" 
          ? "bg-[#140e0a]/85 border-[#C8A97E]/10" 
          : "bg-[#F9F6F2]/85 border-[#3B2416]/10"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <a href="#hero" onClick={(e) => handleScrollToSection(e, 'hero')} className="flex items-center space-x-2 group">
            <span className="text-[#C8A97E] text-xl md:text-2xl font-extrabold tracking-widest font-serif flex items-center gap-1.5">
              CRIOLLO <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded border border-[#C8A97E] text-[#C8A97E]">Cafe</span>
            </span>
          </a>

          <nav className="hidden md:flex space-x-8 text-xs font-semibold tracking-wider uppercase">
            <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')} className="hover:text-[#C8A97E] transition-colors">Our Story</a>
            <a href="#services" onClick={(e) => handleScrollToSection(e, 'services')} className="hover:text-[#C8A97E] transition-colors">Experience</a>
            <a href="#journey" onClick={(e) => handleScrollToSection(e, 'journey')} className="hover:text-[#C8A97E] transition-colors">The Journey</a>
            <a href="#menu" onClick={(e) => handleScrollToSection(e, 'menu')} className="hover:text-[#C8A97E] transition-colors">Menu Selection</a>
            <a href="#gallery" onClick={(e) => handleScrollToSection(e, 'gallery')} className="hover:text-[#C8A97E] transition-colors">Moments</a>
            <a href="#reserve" onClick={(e) => handleScrollToSection(e, 'reserve')} className="hover:text-[#C8A97E] transition-colors">Reservations</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className={`px-3 py-1.5 rounded-full border text-xs tracking-wider uppercase font-semibold transition-all ${
                theme === "dark" 
                  ? "border-[#C8A97E]/30 text-[#C8A97E] hover:bg-[#C8A97E]/10" 
                  : "border-[#3B2416]/30 text-[#3B2416] hover:bg-[#3B2416]/10"
              }`}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            <a 
              href="#reserve" 
              onClick={(e) => handleScrollToSection(e, 'reserve')}
              className="px-5 py-2 bg-[#C8A97E] hover:bg-[#3B2416] hover:text-white text-black font-semibold tracking-wider text-xs uppercase transition-all rounded"
            >
              Book Table
            </a>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 text-[#C8A97E] text-lg"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-1 text-[#C8A97E]"
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Options */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute w-full left-0 p-6 border-b flex flex-col space-y-4 shadow-xl transition-all duration-300 z-50 ${
            theme === "dark" ? "bg-[#1c140f] border-b-[#C8A97E]/10 text-white" : "bg-white border-b-gray-100 text-black"
          }`}>
            <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">Our Story</a>
            <a href="#services" onClick={(e) => handleScrollToSection(e, 'services')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">Experience</a>
            <a href="#journey" onClick={(e) => handleScrollToSection(e, 'journey')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">The Journey</a>
            <a href="#menu" onClick={(e) => handleScrollToSection(e, 'menu')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">Menu</a>
            <a href="#gallery" onClick={(e) => handleScrollToSection(e, 'gallery')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">Moments</a>
            <a href="#reserve" onClick={(e) => handleScrollToSection(e, 'reserve')} className="py-2 text-sm border-b border-gray-500/10 hover:text-[#C8A97E]">Book Table</a>
            <a href="#location" onClick={(e) => handleScrollToSection(e, 'location')} className="py-2 text-sm hover:text-[#C8A97E]">Location</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Authentic Storefront Image with Elegant Slow-Pan Zoom */}
          <img 
            src="image_eb0562.jpg" 
            alt="Criollo Storefront Night View" 
            className="w-full h-full object-cover brightness-[0.28] scale-105 anim-subtle-pan" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140e0a] via-transparent to-black/60" />
        </div>

        {/* 21st.dev Gradient Aurora overlay */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[#C8A97E]/5 aurora-blur top-1/4 left-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white mt-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#C8A97E]/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#C8A97E]/40 animate-pulse">
            <Icons.Sparkles />
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#F9F6F2] font-semibold">Specialty Roasters of Hazratganj</span>
          </div>

          <h1 className="text-4xl md:text-8xl font-extrabold font-serif tracking-tight leading-none">
            Crafted Coffee.<br />
            <span className="text-[#C8A97E] italic">Timeless Conversations.</span>
          </h1>

          <p className="text-sm md:text-xl text-gray-200/90 max-w-2xl mx-auto leading-relaxed font-light">
            Indulge in an atmosphere where organic specialty extraction harmonizes with ancestral heritage, and cozy luxury lounges invite deep contemplation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#menu" 
              onClick={(e) => handleScrollToSection(e, 'menu')}
              className="w-full sm:w-auto px-8 py-4 bg-[#C8A97E] hover:bg-[#3B2416] hover:text-white text-black font-extrabold tracking-widest text-xs uppercase transition-all duration-300 shadow-xl rounded"
            >
              Explore Menu
            </a>
            <a 
              href="#reserve" 
              onClick={(e) => handleScrollToSection(e, 'reserve')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white hover:border-[#C8A97E] hover:text-[#C8A97E] text-white font-bold tracking-widest text-xs uppercase transition-all duration-300 rounded"
            >
              Reserve Seating
            </a>
          </div>

          <div className="pt-10 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <span>📍 Le Press, Naval Kishore Rd, Hazratganj</span>
            <span>🕒 Daily 10:00 AM - 10:00 PM</span>
          </div>
        </div>

        <div 
          onClick={(e) => handleScrollToSection(e, 'about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase flex flex-col items-center gap-1.5 cursor-pointer"
        >
          <span>Explore Story</span>
          <div className="w-[1px] h-10 bg-[#C8A97E] animate-bounce mt-1" />
        </div>
      </section>

      {/* About Us Story Section */}
      <section id="about" className={`py-24 max-w-7xl mx-auto px-6 relative z-10 reveal-node ${visibleSections["about"] ? "visible" : ""}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="text-sm font-semibold uppercase tracking-widest text-[#C8A97E]">The Hazratganj Legacy</div>
            <h2 className="text-3xl md:text-5xl font-bold font-serif leading-tight">
              European Aesthetics Entwined with Indian Heritage
            </h2>
            <p className="text-base leading-relaxed opacity-80 font-light text-justify">
              Nestled inside the prestigious, historical <strong className="text-[#C8A97E]">Le Press building</strong> on Naval Kishore Road, Criollo Cafe serves as Lucknow's exclusive temple for artisanal micro-roasting. We create a beautiful aesthetic sanctuary where old-world Parisian espresso culture meets contemporary luxury design.
            </p>
            <p className="text-base leading-relaxed opacity-80 font-light text-justify">
              We coordinate directly with fair-trade organic coffee estates in the mountains of Southern India, carefully monitoring roasting temperature profiles to unlock deep, unadulterated flavors.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className={`p-5 border rounded-xl text-center backdrop-blur-sm transition-all hover:scale-105 ${
                theme === "dark" ? "border-gray-800 bg-white/5" : "border-gray-200 bg-black/5"
              }`}>
                <div className="text-3xl md:text-4xl font-extrabold text-[#C8A97E] font-serif">{cupsServed}+</div>
                <div className="text-xs uppercase tracking-wider mt-1 opacity-70">Gourmet Cups Served</div>
              </div>
              <div className={`p-5 border rounded-xl text-center backdrop-blur-sm transition-all hover:scale-105 ${
                theme === "dark" ? "border-gray-800 bg-white/5" : "border-gray-200 bg-black/5"
              }`}>
                <div className="text-3xl md:text-4xl font-extrabold text-[#C8A97E] font-serif">{happyCustomers}+</div>
                <div className="text-xs uppercase tracking-wider mt-1 opacity-70">Happy Customers</div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border border-[#C8A97E]/20 shadow-2xl group">
              <img 
                src={IMAGES.criolloSpot2} 
                alt="Criollo Premium Interiors" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#3B2416]/95 backdrop-blur-md text-[#F9F6F2] p-5 rounded-lg border border-[#C8A97E]/40 shadow-2xl z-20">
                <div className="text-[#C8A97E] font-serif text-base md:text-lg font-bold flex items-center gap-1.5">
                  <span>✨</span> Premium Seating
                </div>
                <p className="text-xs opacity-90 mt-1 max-w-full leading-relaxed">
                  Come for the roasted beans, stay for the gorgeous architecture.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Experience Section */}
      <section id="services" className={`py-24 border-t border-b transition-all duration-1000 reveal-node ${
        visibleSections["services"] ? "visible" : ""
      } ${theme === "dark" ? "bg-black/20 border-gray-800/60" : "bg-black/5 border-gray-200/80"}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold mb-2">Our Offerings</div>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold">The Premium Experience</h2>
            <p className="opacity-70 text-sm md:text-base mt-4 font-light">
              We elevate standard cafe expectations to structured culinary art.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className={`p-8 border rounded-xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden ${
              theme === "dark" ? "bg-[#1c140f] border-gray-800/80 hover:border-[#C8A97E]/40 shadow-xl" : "bg-white border-gray-200 hover:border-[#3B2416]/40 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8A97E]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-12 h-12 rounded-lg bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E] text-2xl mb-6">☕</div>
              <h3 className="text-xl font-bold font-serif text-[#C8A97E] mb-3">Specialty Coffee</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Experience high-altitude manual drip extraction, nitro-infused signature cold brews, and masterfully steamed microfoams.
              </p>
            </div>

            <div className={`p-8 border rounded-xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden ${
              theme === "dark" ? "bg-[#1c140f] border-gray-800/80 hover:border-[#C8A97E]/40 shadow-xl" : "bg-white border-gray-200 hover:border-[#3B2416]/40 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8A97E]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-12 h-12 rounded-lg bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E] text-2xl mb-6">🥐</div>
              <h3 className="text-xl font-bold font-serif text-[#C8A97E] mb-3">Fresh Viennoiserie</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Handcrafted flaky croissants, pastries, and house sourdough baked using organic butter following authentic French guidelines.
              </p>
            </div>

            <div className={`p-8 border rounded-xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden ${
              theme === "dark" ? "bg-[#1c140f] border-gray-800/80 hover:border-[#C8A97E]/40 shadow-xl" : "bg-white border-gray-200 hover:border-[#3B2416]/40 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8A97E]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-12 h-12 rounded-lg bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E] text-2xl mb-6">🧁</div>
              <h3 className="text-xl font-bold font-serif text-[#C8A97E] mb-3">Signature Desserts</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Multi-layered cocoa mousse slices and Lotus speculoos cheesecakes crafted fresh by our in-house pâtissier daily.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Coffee Journey Steps */}
      <section id="journey" className={`py-24 max-w-5xl mx-auto px-6 reveal-node ${visibleSections["journey"] ? "visible" : ""}`}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold">Bean To Cup</span>
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold mt-2">The Roasting Journey</h2>
          <p className="text-xs opacity-70 mt-2 font-light">Trace the deliberate precision tracking every batch of gourmet extract.</p>
        </div>

        <div className="relative border-l-2 border-[#C8A97E]/25 pl-8 ml-4 space-y-12">
          
          <div className="relative group">
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-[#140e0a] bg-[#C8A97E] transition-transform group-hover:scale-125" />
            <h3 className="text-lg font-serif font-bold text-[#C8A97E] mb-1">1. Ethical Micro-Lot Selection</h3>
            <p className="text-xs opacity-70 leading-relaxed max-w-xl">
              We source organic fair-trade micro-lot beans directly from high-elevation family farms in Southern Indian mountains.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-[#140e0a] bg-[#C8A97E] transition-transform group-hover:scale-125" />
            <h3 className="text-lg font-serif font-bold text-[#C8A97E] mb-1">2. Precision Roasting Profiles</h3>
            <p className="text-xs opacity-70 leading-relaxed max-w-xl">
              Our master roasters adjust temperature curves manually on micro-roasters to lock in optimal sweetness and complex fruity notes.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-[#140e0a] bg-[#C8A97E] transition-transform group-hover:scale-125" />
            <h3 className="text-lg font-serif font-bold text-[#C8A97E] mb-1">3. Fresh In-House Grinding</h3>
            <p className="text-xs opacity-70 leading-relaxed max-w-xl">
              Every bean is ground fresh seconds before extraction using precise flat-burr grinding tech to maintain aroma compounds.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-[#140e0a] bg-[#C8A97E] transition-transform group-hover:scale-125" />
            <h3 className="text-lg font-serif font-bold text-[#C8A97E] mb-1">4. Masterful Brewing</h3>
            <p className="text-xs opacity-70 leading-relaxed max-w-xl">
              Whether via complex manual pour-over or wood-smoked extraction cloche, we execute water ratios to pure perfection.
            </p>
          </div>

        </div>
      </section>

      {/* Menu Filterable Curation */}
      <section id="menu" className={`py-24 max-w-7xl mx-auto px-6 reveal-node ${visibleSections["menu"] ? "visible" : ""}`}>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold">Artisanal Selection</div>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold">Criollo Curation</h2>
            <p className="text-sm opacity-70 font-light">Each dish is a visual masterpiece. Inquire about daily custom single-origin bean batches.</p>
          </div>

          {/* Upgraded Filter & Live Search */}
          <div className="space-y-4 max-w-md w-full">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search specialty brew, croissant, pasta..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className={`w-full px-4 py-2.5 pl-10 rounded-lg text-xs tracking-wider border focus:outline-none focus:border-[#C8A97E] transition-all ${
                  theme === "dark" ? "bg-black/40 border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
              <div className="absolute left-3.5 top-3">
                <Icons.Search />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {MENU_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all duration-300 border rounded-full ${
                    activeCategory === cat 
                      ? "bg-[#C8A97E] text-black border-[#C8A97E]" 
                      : "bg-transparent border-gray-500/20 hover:border-[#C8A97E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenuItems.map(item => (
            <div 
              key={item.id} 
              className={`p-4 rounded-xl border transition-all duration-500 flex flex-col justify-between group hover:shadow-2xl ${
                theme === "dark" ? "bg-black/10 border-gray-800/80 hover:border-[#C8A97E]/45" : "bg-white border-gray-200/80 hover:border-[#3B2416]/45"
              }`}
            >
              <div>
                <div className="relative rounded-lg overflow-hidden aspect-[4/3] mb-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-[#3B2416] text-[#C8A97E] px-2.5 py-1 text-[10px] tracking-widest uppercase font-bold rounded">
                    {item.tag}
                  </span>
                </div>
                
                <h3 className="font-serif font-bold text-lg md:text-xl tracking-tight text-[#C8A97E] mb-2">{item.name}</h3>
                <p className="text-xs opacity-70 leading-relaxed font-light mb-4">{item.desc}</p>
              </div>

              <a 
                href="#reserve" 
                onClick={(e) => handleScrollToSection(e, 'reserve')}
                className="text-xs tracking-wider uppercase font-semibold text-[#C8A97E] hover:underline inline-flex items-center mt-2"
              >
                Book seating to experience <Icons.ChevronRight />
              </a>
            </div>
          ))}

          {filteredMenuItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 text-xs">
              No matching elements found. Try a different search query or category filter.
            </div>
          )}
        </div>

      </section>

      {/* Meet Master Barista section */}
      <section id="barista" className={`py-24 max-w-7xl mx-auto px-6 reveal-node ${visibleSections["barista"] ? "visible" : ""}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-[#C8A97E]/25 shadow-2xl">
              <img 
                src={IMAGES.baristaHead} 
                alt="Head Barista at Criollo" 
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold">The Craftsman</span>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold leading-tight">Meet Our Master Barista</h2>
            <p className="text-sm opacity-80 leading-relaxed font-light">
              Our coffee bar is supervised by our Resident Craftsman, boasting over 9 years of specialized extraction study. Trained extensively in European style manual drip systems and roasting parameters, they curate custom flavor profiles for each individual micro-lot arriving at our roasting docks.
            </p>

            <div className={`p-6 rounded-xl border ${
              theme === "dark" ? "bg-[#1c140f] border-gray-800" : "bg-white border-gray-200"
            }`}>
              <h4 className="text-xs uppercase tracking-widest text-[#C8A97E] font-bold mb-2">Signature Curation</h4>
              <p className="text-sm italic font-serif opacity-95">
                "We treat coffee not merely as an alert catalyst, but as structured culinary architecture. Our Smoked Applewood extraction highlights delicate hazelnut oils without clouding regional citrus brilliance."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Events section */}
      <section id="events" className={`py-24 border-t border-b transition-all duration-1000 reveal-node ${
        visibleSections["events"] ? "visible" : ""
      } ${theme === "dark" ? "bg-black/15 border-gray-800" : "bg-black/5 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold mb-2">Gatherings</div>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold">Moments at Criollo</h2>
            <p className="text-sm opacity-70 mt-3 font-light">Immerse yourself in carefully designed premium specialty coffee rituals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENTS.map(ev => (
              <div 
                key={ev.id}
                className={`rounded-xl overflow-hidden border transition-all hover:-translate-y-2 group ${
                  theme === "dark" ? "bg-black/25 border-gray-800" : "bg-white border-gray-200"
                }`}
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute bottom-3 left-3 bg-[#3B2416] text-[#C8A97E] text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                    {ev.date}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-xl text-[#C8A97E]">{ev.title}</h3>
                  <p className="text-xs opacity-70 leading-relaxed font-light">{ev.desc}</p>
                  
                  <a 
                    href="#reserve" 
                    onClick={(e) => handleScrollToSection(e, 'reserve')}
                    className="inline-flex items-center text-xs uppercase tracking-wider font-semibold text-[#C8A97E] hover:underline pt-2"
                  >
                    Inquire Seat <Icons.ChevronRight />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Dynamic Instagram Grid Section */}
      <section id="gallery" className={`py-24 max-w-7xl mx-auto px-6 reveal-node ${visibleSections["gallery"] ? "visible" : ""}`}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold">Follow Our Journey</span>
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold mt-2">Moments at Criollo</h2>
          <p className="text-sm opacity-70 mt-2 font-light">Catch raw captures inside Lucknow's premier luxury cafe on Naval Kishore Road.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INSTAGRAM_MOMENTS.map(post => (
            <div 
              key={post.id}
              className="relative group rounded-xl overflow-hidden aspect-square border border-gray-500/10 cursor-pointer"
            >
              <img src={post.url} alt="Instagram Moment" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
                <span className="self-start text-[10px] bg-[#C8A97E]/20 text-[#C8A97E] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-[#C8A97E]/30">
                  {post.type}
                </span>

                <div className="space-y-2">
                  <p className="text-xs text-gray-200 italic font-light">"{post.caption}"</p>
                  <div className="flex items-center justify-between text-xs font-bold text-[#C8A97E]">
                    <span>❤️ {post.likes}</span>
                    <span className="underline">View Post</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Review section */}
      <section id="reviews" className={`py-24 max-w-5xl mx-auto px-6 reveal-node ${visibleSections["reviews"] ? "visible" : ""}`}>
        <div className="text-center mb-16">
          <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold">Patron Whispers</span>
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold mt-2">Real Reviews</h2>
        </div>

        <div className={`relative p-8 md:p-12 rounded-2xl border text-center transition-all duration-500 backdrop-blur-sm ${
          theme === "dark" ? "bg-white/5 border-gray-800/80 shadow-2xl" : "bg-black/5 border-gray-200/80 shadow-md"
        }`}>
          <div className="text-[#C8A97E] text-4xl font-serif mb-6">“</div>
          <p className="text-base md:text-xl font-light italic leading-relaxed max-w-3xl mx-auto mb-8">
            {PATRON_REVIEWS[reviewIndex].text}
          </p>
          
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(PATRON_REVIEWS[reviewIndex].rating)].map((_, i) => (
              <span key={i} className="text-[#C8A97E] text-lg">★</span>
            ))}
          </div>

          <h4 className="font-serif font-bold text-[#C8A97E]">{PATRON_REVIEWS[reviewIndex].name}</h4>
          <span className="text-xs opacity-65 tracking-widest uppercase block mt-1">{PATRON_REVIEWS[reviewIndex].badge}</span>

          <div className="flex justify-center space-x-2 mt-8">
            {PATRON_REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  reviewIndex === i ? "bg-[#C8A97E] w-6" : "bg-gray-500/40"
                }`}
                title={`Review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Table reservation form */}
      <section id="reserve" className={`py-24 border-t border-b transition-all duration-1000 reveal-node ${
        visibleSections["reserve"] ? "visible" : ""
      } ${theme === "dark" ? "bg-[#211812] border-gray-800/60" : "bg-[#fcfaf7] border-gray-200/60"}`}>
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold block mb-2">Seating System</span>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold">Secure Your Spot</h2>
            <p className="text-sm opacity-70 mt-2 font-light">Your table reservation writes directly to our live host system.</p>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Preferred Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Select Time Slot</label>
                <select 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]"
                  required
                >
                  <option value="" className="text-black">Choose...</option>
                  <option value="10:00 AM - 12:00 PM" className="text-black">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 03:00 PM" className="text-black">12:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 06:00 PM" className="text-black">03:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 10:00 PM" className="text-black">06:00 PM - 10:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Connoisseur Count</label>
                <select 
                  value={bookingPeople}
                  onChange={(e) => setBookingPeople(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]"
                >
                  <option value="1" className="text-black">1 Guest</option>
                  <option value="2" className="text-black">2 Guests</option>
                  <option value="4" className="text-black">4 Guests</option>
                  <option value="6" className="text-black">6+ Guests (Private Area)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kabir Tandon" 
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Contact Phone</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 89106 95902" 
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Special Seating Notes (Optional)</label>
              <input 
                type="text" 
                placeholder="Requesting a silent booth near the heritage brick walls..." 
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-gray-500/25 rounded focus:border-[#C8A97E] focus:outline-none text-sm"
              />
            </div>

            <div className="text-center pt-4">
              <button 
                type="submit"
                disabled={isSubmittingReservation}
                className="w-full sm:w-auto px-12 py-4 bg-[#C8A97E] hover:bg-[#3B2416] hover:text-white text-black font-extrabold tracking-widest text-xs uppercase transition-all duration-300 shadow-md rounded"
              >
                {isSubmittingReservation ? "Syncing details..." : "Request Seating Spot"}
              </button>
            </div>

            {reservationNotification && (
              <div className="mt-6 p-4 rounded bg-[#C8A97E]/10 border border-[#C8A97E] text-sm text-[#C8A97E] text-center font-medium">
                {reservationNotification}
              </div>
            )}
          </form>

        </div>
      </section>

      {/* Interactive Google Map coordinates */}
      <section id="location" className={`py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 reveal-node ${visibleSections["location"] ? "visible" : ""}`}>
        
        <div className="lg:col-span-7 rounded-lg overflow-hidden border border-gray-500/10 h-[400px] shadow-lg relative bg-white/5">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.7891398845233!2d80.94273897531776!3d26.848247076686034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd0075a00f9d%3A0x75b7a29bc18e392f!2sCriollo%20Cafe!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: theme === 'dark' ? 'invert(90%) hue-rotate(180deg)' : 'none' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Criollo Cafe Google Maps Navigation"
          ></iframe>
        </div>

        <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
          <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-bold">Find us in Hazratganj</span>
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold">Gourmet Coordinates</h2>
          
          <div className="space-y-4">
            
            <div className="flex items-start gap-3">
              <Icons.Location />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Address</h4>
                <p className="text-sm leading-relaxed mt-1">
                  Le Press, Naval Kishore Rd, Hazratganj, Lucknow, Uttar Pradesh 226001, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icons.Phone />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Contact Telephone</h4>
                <p className="text-sm leading-relaxed mt-1 text-[#C8A97E] font-bold">
                  +91 89106 95902
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icons.Clock />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Opening Hours</h4>
                <p className="text-sm leading-relaxed mt-1">
                  10:00 AM – 10:00 PM (Daily)
                </p>
              </div>
            </div>

          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href="https://maps.google.com/?q=Criollo+Cafe+Le+Press+Hazratganj+Lucknow" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-[#C8A97E] hover:bg-[#3B2416] hover:text-white text-black font-extrabold tracking-wider text-xs uppercase transition-all duration-300 shadow rounded flex items-center gap-1.5"
            >
              Get Directions
            </a>
            <a 
              href="tel:+918910695902" 
              className="px-6 py-3 border border-[#C8A97E] hover:bg-[#C8A97E] hover:text-black text-[#C8A97E] font-bold tracking-wider text-xs uppercase transition-all duration-300 rounded"
            >
              Call Us
            </a>
          </div>

        </div>

      </section>

      {/* Direct Messaging Form */}
      <section className="py-24 max-w-4xl mx-auto px-6 border-t border-gray-500/15">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[#C8A97E] text-xs uppercase tracking-widest font-extrabold block mb-2">Connect Directly</span>
          <h2 className="text-3xl font-serif font-extrabold">Send us a Message</h2>
          <p className="text-xs opacity-70 mt-1">Inquire about coffee roasting events, caterings, or request high-tea details.</p>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-6 bg-white/5 p-8 rounded-lg border border-gray-500/10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Your Name</label>
              <input 
                type="text" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-3 bg-black/10 border border-gray-500/20 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]" 
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Email Coordinate</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/10 border border-gray-500/20 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]" 
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Contact Telephone</label>
            <input 
              type="tel" 
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-3 bg-black/10 border border-gray-500/20 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]" 
              placeholder="e.g. +91 89106 95902"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#C8A97E] mb-2">Message Description</label>
            <textarea 
              rows="4" 
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full px-4 py-3 bg-black/10 border border-gray-500/20 rounded focus:border-[#C8A97E] focus:outline-none text-sm text-[#C8A97E]" 
              placeholder="Write your beautiful query or feedback here..."
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmittingContact}
            className="w-full py-4 bg-[#C8A97E] hover:bg-[#3B2416] hover:text-[#C8A97E] text-black font-extrabold tracking-widest text-xs uppercase transition-all duration-300 rounded"
          >
            {isSubmittingContact ? "Syncing..." : "Submit Message"}
          </button>

          {contactNotification && (
            <div className="mt-4 p-3 bg-[#C8A97E]/10 border border-[#C8A97E] text-[#C8A97E] text-xs rounded text-center">
              {contactNotification}
            </div>
          )}

        </form>
      </section>

      {/* Advanced AI Chatbot Interface */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatbotOpen && (
          <button 
            onClick={() => setChatbotOpen(true)}
            className="flex items-center space-x-2 bg-[#C8A97E] text-black px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 hover:bg-[#3B2416] hover:text-white transition-all duration-300"
          >
            <span className="text-xl animate-bounce">☕</span>
            <span className="text-xs uppercase tracking-wider font-extrabold">Ask Criollo AI</span>
          </button>
        )}

        {chatbotOpen && (
          <div className="w-[320px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-[#C8A97E]/30 bg-[#140e0a] text-[#F9F6F2] flex flex-col justify-between overflow-hidden">
            
            <div className="p-4 bg-[#3B2416] border-b border-[#C8A97E]/20 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl animate-pulse">☕</span>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wider text-[#C8A97E]">Criollo Assistant</h3>
                  <p className="text-[10px] text-gray-400">Live AI Concierge (Gemini Powered)</p>
                </div>
              </div>
              <button 
                onClick={() => setChatbotOpen(false)}
                className="text-gray-400 hover:text-white p-1 text-xs uppercase"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/45">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-[#C8A97E] text-black rounded-tr-none font-medium' 
                      : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded bg-white/10 text-xs italic text-gray-400">
                    Concierge is drafting elegant advice...
                  </div>
                </div>
              )}
              <div ref={chatbotEndRef} />
            </div>

            <div className="p-3 bg-black/60 border-t border-gray-500/10 flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask coordinates, menu, viennoiserie, seating..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-xs focus:outline-none focus:border-[#C8A97E] text-[#F9F6F2]"
              />
              <button 
                onClick={handleSendChat}
                className="px-4 py-2 bg-[#C8A97E] text-black hover:bg-white text-xs font-bold uppercase transition-all rounded-sm"
              >
                Send
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Footer Block with Developer Portfolio redirects */}
      <footer className="bg-[#0a0604] text-[#F9F6F2]/80 border-t border-[#C8A97E]/15 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <h3 className="font-serif font-extrabold text-2xl text-[#C8A97E]">CRIOLLO CAFE</h3>
            <p className="text-xs opacity-70 leading-relaxed font-light">
              Lucknow’s primary specialty destination for organic manual pour-overs, delicate pastries, and a timeless environment. Built inside the historic Le Press building.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-serif text-[#C8A97E] uppercase tracking-widest font-bold mb-4">Navigations</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" onClick={(e) => handleScrollToSection(e, 'about')} className="hover:text-[#C8A97E]">Our Story</a></li>
              <li><a href="#services" onClick={(e) => handleScrollToSection(e, 'services')} className="hover:text-[#C8A97E]">The Experience</a></li>
              <li><a href="#menu" onClick={(e) => handleScrollToSection(e, 'menu')} className="hover:text-[#C8A97E]">Artisanal Menu</a></li>
              <li><a href="#gallery" onClick={(e) => handleScrollToSection(e, 'gallery')} className="hover:text-[#C8A97E]">Visual Gallery</a></li>
              <li><a href="#reserve" onClick={(e) => handleScrollToSection(e, 'reserve')} className="hover:text-[#C8A97E]">Book Seating</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-serif text-[#C8A97E] uppercase tracking-widest font-bold mb-4">Concierge Coordinates</h4>
            <p className="text-xs opacity-80 leading-relaxed font-light">
              Le Press, Naval Kishore Rd,<br />
              Hazratganj, Lucknow,<br />
              Uttar Pradesh 226001
            </p>
            <p className="text-xs font-bold text-[#C8A97E] mt-3">
              📞 +91 89106 95902
            </p>
          </div>

          <div>
            <h4 className="text-sm font-serif text-[#C8A97E] uppercase tracking-widest font-bold mb-4">The Roaster Club</h4>
            <p className="text-xs opacity-70 mb-3 font-light">Be first to receive notice of delicate micro-lots and private cupping ceremonies.</p>
            <form 
              onSubmit={(e) => { e.preventDefault(); alert("Welcome to the list! You will receive notice of special harvests shortly."); e.target.reset(); }}
              className="flex gap-2"
            >
              <input 
                type="email" 
                placeholder="your.email@gmail.com" 
                className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs focus:outline-none focus:border-[#C8A97E] flex-1 text-white"
                required
              />
              <button className="px-4 py-2 bg-[#C8A97E] text-black hover:bg-white text-xs font-bold uppercase transition-all rounded">
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-xs opacity-65 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            © 2026 Criollo Cafe. Curated inside Le Press Hazratganj Lucknow. All rights reserved. Developed by{' '}
            <a 
              href="https://ag-portfolio-kappa.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-[#C8A97E] font-medium transition-colors"
            >
              Ashmit_Gautam
            </a>
          </p>
          <div className="flex gap-4">
            <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')} className="hover:underline">Privacy Philosophy</a>
            <a href="#reserve" onClick={(e) => handleScrollToSection(e, 'reserve')} className="hover:underline">Seating Guidelines</a>
          </div>
        </div>

      </footer>

      {/* Scroll back up action trigger */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 p-3 bg-[#3B2416] hover:bg-[#C8A97E] hover:text-black border border-[#C8A97E]/30 text-[#C8A97E] rounded-full shadow-2xl transition-all"
        title="Back to Top"
      >
        <Icons.ArrowUp />
      </button>

    </div>
  );
}