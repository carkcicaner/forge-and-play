import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Gamepad2, Library, FlaskConical, Search, User, Play, Info,
  ChevronRight, Sparkles, Wallet, X, Lock, LogOut, CalendarDays,
  CheckCircle2, ShieldAlert, MessageCircle, Film, HelpCircle,
  Lightbulb, MessageSquarePlus, Send, AlertTriangle, Trophy, Mail,
  Copy, Check, Crown, Zap, HeartHandshake, Star, Share2, Download,
  Smartphone, Maximize, Gift, ShoppingBag, Coins, Truck, CreditCard,
  Clock, Eye, EyeOff, Edit, Trash
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore, collection, onSnapshot, doc, setDoc, updateDoc,
  addDoc, deleteDoc, query, orderBy, serverTimestamp, increment
} from "firebase/firestore";

/* =========================================================================
   FIREBASE CONFIG
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyADpeblSXUI9-DpP1J6rX79TLAJ-A-jEm0",
  authDomain: "forge-and-play.firebaseapp.com",
  projectId: "forge-and-play",
  storageBucket: "forge-and-play.firebasestorage.app",
  messagingSenderId: "728405020113",
  appId: "1:728405020113:web:2fc64f47aa355cb5f7a4f0"
};

const isFirebaseConfigured = firebaseConfig.apiKey !== "BURAYA_GELECEK";

/* =========================================================================
   ADMIN E-POSTALAR — normalize edilmiş, freeze edilmiş (değişmez)
   ========================================================================= */
const ADMIN_EMAILS = Object.freeze([
  "forgeandplay@gmail.com",
  "carkci.caner@gmail.com"
]);

/* =========================================================================
   ÖDEME LİNKLERİ
   ========================================================================= */
const PAYMENT_LINKS = Object.freeze({
  "1A": "https://www.shopier.com/forgeandplay/44689059",
  "6A": "https://www.shopier.com/forgeandplay/44689160",
  "1Y": "https://www.shopier.com/forgeandplay/44689235"
});

const LOGO_URL = "https://i.ibb.co/HppdF5nY/freepik-minimal-futuristic-gaming-logo-forge-hammer-combin-64278.png";

let app, auth, db, googleProvider;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

/* =========================================================================
   OYUN VERİLERİ
   ========================================================================= */
const GAMES = [
  {
    id: "tabu", title: "Tabu", status: "Yayında", type: "live",
    tags: ["Parti", "Kelime Oyunu", "Takım"],
    description: "Yasaklı kelimeleri kullanmadan takım arkadaşlarına gizli kelimeyi anlatmaya çalış. Süre dolmadan en çok kelimeyi bilen takım kazanır!",
    price: "Premium İçerik", basePlayers: 890,
    gradient: "from-orange-900 via-rose-950 to-black", iconKey: "message",
    url: "https://tabu-game-three.vercel.app/",
    image: "https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "isim-sehir-online", title: "İsim Şehir Online", status: "Yayında", type: "live",
    tags: ["Kelime Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Efsanevi İsim Şehir Hayvan oyunu şimdi dijitalde! Rastgele harfini seç, kelimeleri hızlıca bul ve arkadaşlarınla kıyasıya yarışarak en yüksek puanı topla.",
    price: "Premium İçerik", basePlayers: 950,
    gradient: "from-pink-900 via-purple-950 to-black", iconKey: "message",
    url: "https://isim-sehir-online.vercel.app/",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "vampir-koylu", title: "Vampir Köylü", status: "Yayında", type: "live",
    tags: ["Parti", "Çok Oyunculu", "Gizem"],
    description: "Konuş, şüphelen, oyla: Vampirleri bul, kasabayı kurtar.",
    price: "Premium İçerik", basePlayers: 1240,
    gradient: "from-red-900 via-rose-950 to-black", iconKey: "user",
    url: "https://vampir-oyunu.vercel.app/",
    image: "https://i.ibb.co/KxP67Mm1/Ba-l-ks-z-4.png",
    requiresPremium: true,
  },
  {
    id: "forge-play-quiz", title: "Forge&Play Quiz", status: "Yayında", type: "live",
    tags: ["Bilgi", "Yarışma", "Zeka"],
    description: "Genel kültürünü sına, arkadaşlarınla yarış!",
    price: "Premium İçerik", basePlayers: 420,
    gradient: "from-indigo-900 via-blue-950 to-black", iconKey: "help",
    url: "https://forge-and-play-quiz.vercel.app/",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "pis-yedili", title: "Pis 7'li", status: "Yayında", type: "live",
    tags: ["Kart Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Klasik kart oyunu Pis 7'li şimdi dijitalde!",
    price: "Premium İçerik", basePlayers: 1560,
    gradient: "from-fuchsia-900 via-purple-950 to-black", iconKey: "user",
    url: "https://pis7li-oyunu.vercel.app/",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "monopoly-bank", title: "Monopoly Dijital Banka", status: "Yayında", type: "live",
    tags: ["Araç", "Masa Oyunu", "Finans"],
    description: "Kağıt paralarla uğraşmaya son! Dijital Monopoly bankası.",
    price: "Premium İçerik", basePlayers: 345,
    gradient: "from-emerald-900 via-teal-950 to-black", iconKey: "wallet",
    url: "https://siprayt-monopoly.vercel.app/",
    image: "https://i.ibb.co/RGmKfVY8/freepik-3d-cinematic-monopoly-style-board-game-world-comin-87944.png",
    requiresPremium: true,
  },
  {
    id: "sessiz-sinema", title: "Sessiz Sinema", status: "Yakında", type: "upcoming",
    tags: ["Parti", "Eğlence", "Rol Yapma"],
    description: "Hiç konuşmadan, sadece hareketlerinle filmleri takımına anlat.",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-blue-900 via-cyan-950 to-black", iconKey: "film", url: null,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "yuzbir-okey", title: "101 Okey", status: "Yakında", type: "upcoming",
    tags: ["Masa Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Efsanevi 101 Okey deneyimi yakında dijital masalarınızda.",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-red-900 via-red-950 to-black", iconKey: "user", url: null,
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "koz-maca-batak", title: "Koz Maça (Batak)", status: "Yakında", type: "upcoming",
    tags: ["Kart Oyunu", "Klasik", "Strateji"],
    description: "İhaleyi al, kozunu belirle ve masayı domine et.",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-slate-800 via-slate-950 to-black", iconKey: "user", url: null,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  }
];

const LAB_PROJECTS = [
  {
    id: "ai-story", title: "AI Zindan Ustası (D&D)", progress: 45, status: "Geliştiriliyor",
    description: "Yapay zekanın oyun yöneticisi olduğu, sınırsız senaryoya sahip RPG deneyimi.",
    gradient: "from-orange-900 to-slate-900",
  },
  {
    id: "life-path", title: "LifePath Simulator", progress: 80, status: "Beta Yakında",
    description: "Hayatın iplerini eline al. Kendi yolunu çizeceğin yeni nesil yaşam simülasyonu.",
    gradient: "from-amber-900 to-slate-900",
  },
];

// Varsayılan ürün yok — ürünler admin panelinden manuel olarak eklenir.

const focusStyles = "focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950";

/* =========================================================================
   GÜVENLİK — Geliştirilmiş sanitize ve profanity filter
   ========================================================================= */
const BAD_WORDS = [
  "amk", "aq", "sg", "siktir", "yavşak", "oç", "orospu", "piç", "ibne",
  "göt", "sik", "yarrak", "am", "meme", "sikik", "amcık", "orospu çocuğu",
  "ananı", "bacı", "pezevenk", "gerizekalı", "salak", "aptal"
];

/**
 * DÜZELTİLDİ: Daha güçlü sanitize — HTML entity encode eklendi
 * XSS saldırılarına karşı koruma sağlar
 */
function sanitizeText(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/[{}[\]()]/g, '')
    .trim()
    .substring(0, 1000); // max uzunluk sınırı
}

function containsProfanity(text) {
  if (!text) return false;
  const lowerText = String(text).toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

/* =========================================================================
   YARDIMCI FONKSİYONLAR
   ========================================================================= */
function calculateRank(playCount) {
  const count = Math.max(0, Number(playCount) || 0);
  const baseRank = 50000;
  const rank = Math.max(1, baseRank - (count * 142));
  return rank.toLocaleString('tr-TR');
}

/**
 * DÜZELTİLDİ: Admin kontrolü — email normalize edildi, whitespace temizlendi
 * Sadece Firestore'daki `role` alanı veya sabit email listesiyle kontrol
 */
function isUserAdmin(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.email) {
    const mail = String(user.email).toLowerCase().trim();
    return ADMIN_EMAILS.includes(mail);
  }
  return false;
}

function isUserPremium(user) {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  if (!user.premiumEndDate) return false;
  try {
    return new Date(user.premiumEndDate) > new Date();
  } catch (e) {
    return false;
  }
}

function getRemainingDays(dateString) {
  if (!dateString) return null;
  try {
    const diffTime = new Date(dateString) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}

/**
 * DÜZELTİLDİ: Rate limiter — Map memory leak koruması eklendi
 */
function createRateLimiter(maxAttempts = 5, timeWindow = 60000, maxKeys = 1000) {
  const attempts = new Map();
  return function(key) {
    const now = Date.now();
    // Map büyüklük kontrolü — memory leak önleme
    if (attempts.size > maxKeys) {
      const oldestKey = attempts.keys().next().value;
      attempts.delete(oldestKey);
    }
    const userAttempts = attempts.get(key) || [];
    const recent = userAttempts.filter(time => now - time < timeWindow);
    if (recent.length >= maxAttempts) return false;
    recent.push(now);
    attempts.set(key, recent);
    return true;
  };
}

const feedbackRateLimiter = createRateLimiter(3, 60000);
const loginRateLimiter = createRateLimiter(5, 300000);

/* =========================================================================
   ICON MAP
   ========================================================================= */
function GameIcon({ iconKey, className }) {
  const cls = className || "w-10 h-10 md:w-12 md:h-12";
  switch (iconKey) {
    case "wallet": return <Wallet className={`${cls} text-emerald-500`} />;
    case "message": return <MessageCircle className={`${cls} text-orange-500`} />;
    case "film": return <Film className={`${cls} text-blue-500`} />;
    case "help": return <HelpCircle className={`${cls} text-amber-500`} />;
    case "user": default: return <User className={`${cls} text-red-500`} />;
  }
}

/* =========================================================================
   CANLI OYUNCU SAYACI
   ========================================================================= */
function LivePlayerCount({ base }) {
  const [count, setCount] = useState(base);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (base === 0) return;
    const interval = setInterval(() => {
      if (mounted.current) {
        const fluctuation = Math.floor(Math.random() * 9) - 3;
        setCount(prev => Math.max(Math.max(0, base - 50), Math.min(base + 50, prev + fluctuation)));
      }
    }, 4000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [base]);

  if (base === 0) return <span className="text-[10px] md:text-xs text-slate-500 mb-0.5">Yakında</span>;

  return (
    <span className="text-[10px] md:text-xs text-emerald-400 mb-0.5 flex items-center gap-1 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      {count.toLocaleString('tr-TR')} Oynuyor
    </span>
  );
}

/* =========================================================================
   FEEDBACK FORMU
   ========================================================================= */
const FeedbackForm = ({ currentUser, onSubmit }) => {
  const [text, setText] = useState("");
  const [game, setGame] = useState("Tabu");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  // DÜZELTİLDİ: honeypot state adı değiştirildi, bota karşı daha iyi gizleme
  const [hp, setHp] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a + b };
  });

  const handleTextChange = (e) => {
    const newText = String(e.target.value);
    setCharCount(newText.length);
    if (newText.length <= 500) setText(newText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // DÜZELTİLDİ: Honeypot kontrolü + math doğrulaması
    if (hp) { setError("Gönderim başarısız."); return; }
    if (parseInt(mathAnswer, 10) !== mathQuestion.answer) {
      setError("Matematik sorusunu doğru cevaplayın.");
      return;
    }
    if (!currentUser) { setError("Giriş yapmalısınız."); return; }

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 10) {
      setError("Fikir en az 10 karakter olmalıdır.");
      return;
    }
    if (trimmed.length > 500) {
      setError("Fikir en fazla 500 karakter olabilir.");
      return;
    }
    if (containsProfanity(trimmed)) {
      setError("Uygunsuz ifade tespit edildi.");
      return;
    }
    if (!feedbackRateLimiter(currentUser.id)) {
      setError("Çok fazla fikir gönderdiniz, lütfen 1 dakika bekleyin.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        text: sanitizeText(trimmed),
        game: sanitizeText(game)
      });
      setText("");
      setCharCount(0);
      setMathAnswer("");
    } catch (err) {
      setError("Gönderilirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* DÜZELTİLDİ: Honeypot — aria-hidden + tabIndex + autoComplete */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <input
          type="text"
          name="website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {String(error)}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Oyun Seç</label>
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
        >
          {GAMES.filter(g => g.status === "Yayında").map(g => (
            <option key={g.id} value={g.title}>{g.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Fikriniz</label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Oyun hakkındaki fikirlerinizi yazın..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 min-h-[120px]"
          maxLength={500}
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${charCount >= 450 ? 'text-orange-400' : 'text-slate-500'}`}>
            {charCount}/500
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Güvenlik: {mathQuestion.a} + {mathQuestion.b} = ?
        </label>
        <input
          type="number"
          value={mathAnswer}
          onChange={(e) => setMathAnswer(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
          required
          min="0"
          max="99"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className={`w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}
      >
        {isSubmitting ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Gönderiliyor...</>
        ) : (
          <><Send className="w-5 h-5" /> Fikri Gönder</>
        )}
      </button>
    </form>
  );
};

/* =========================================================================
   ANA UYGULAMA
   ========================================================================= */
export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center space-y-4 shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-white">Firebase Kurulumu Bekleniyor</h1>
          <p className="text-slate-400 text-sm">
            <b>App.jsx</b> dosyasındaki <code>firebaseConfig</code> objesine kendi Firebase anahtarlarını yapıştır.
          </p>
        </div>
      </div>
    );
  }

  // --- TEMEL STATE'LER ---
  const [activeTab, setActiveTab] = useState("store");
  const [playingGame, setPlayingGame] = useState(null);
  const [selectedLibraryGame, setSelectedLibraryGame] = useState(GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const [premiumWarningGame, setPremiumWarningGame] = useState(null);
  const [trialPromptGame, setTrialPromptGame] = useState(null);

  // DÜZELTİLDİ: Timer ref'leri daha açık isimlerle
  const playTimerRef = useRef(null);
  const fapCoinIntervalRef = useRef(null);
  // DÜZELTİLDİ: Trial başlangıç zamanını takip et
  const trialStartTimeRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [adminTab, setAdminTab] = useState("users");
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  // DÜZELTİLDİ: storeProducts için loading state eklendi
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);

  const [newProductData, setNewProductData] = useState({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true });
  const [editingProductId, setEditingProductId] = useState(null);

  const [isBotRunning, setIsBotRunning] = useState(false);
  const botIntervalRef = useRef(null);

  const [adminSearch, setAdminSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // DÜZELTİLDİ: Carousel auto-play eklendi
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef(null);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const featuredGames = useMemo(() => GAMES.filter(g => g.status === "Yayında"), []);

  const filteredGames = useMemo(() => {
    const q = String(searchQuery).trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter(g =>
      `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // DÜZELTİLDİ: sortedUsers useMemo dependency düzeltildi
  const sortedUsers = useMemo(() => {
    const list = [...usersList].sort((a, b) => {
      if (a.pendingRequest && !b.pendingRequest) return -1;
      if (!a.pendingRequest && b.pendingRequest) return 1;
      return 0;
    });
    const q = String(adminSearch).trim().toLowerCase();
    if (!q) return list;
    return list.filter(u =>
      String(u.name || "").toLowerCase().includes(q) ||
      String(u.email || "").toLowerCase().includes(q)
    );
  }, [usersList, adminSearch]); // dependency array düzgün

  const isAdmin = useMemo(() => currentUser ? isUserAdmin(currentUser) : false, [currentUser]);

  const handleFirebaseError = useCallback((error) => {
    // Production'da console.error yerine sessiz fail — kullanıcıya gösteri
    if (process.env.NODE_ENV === 'development') {
      console.warn("Firebase Uyarısı:", error?.message || error);
    }
  }, []);

  // DÜZELTİLDİ: Component unmount'ta tüm interval/timeout'lar temizleniyor
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, []);

  // DÜZELTİLDİ: Carousel auto-play — 5 saniyede bir değişiyor
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [featuredGames.length]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isIosDevice && !isStandalone) setIsIOS(true);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // DÜZELTİLDİ: Auth effect — güvenli email normalize + race condition koruması
  useEffect(() => {
    if (!auth) return;
    let unsubscribeUser = null;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
            if (!isMounted) return;

            // DÜZELTİLDİ: Email normalize — boşluk + büyük/küçük harf güvenliği
            const userEmail = String(firebaseUser.email || "").toLowerCase().trim();
            // DÜZELTİLDİ: Admin kontrolü — sabit listeden yapılıyor
            const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

            if (docSnap.exists()) {
              const userData = docSnap.data();
              const updates = {};

              if (isAdminEmail && userData.role !== "admin") {
                updates.role = "admin";
                updates.premiumEndDate = new Date("2099-01-01").toISOString();
              }
              if (!userData.paymentCode) {
                updates.paymentCode = "FP-" + firebaseUser.uid.substring(0, 4).toUpperCase();
              }
              if (userData.fapCoin === undefined) updates.fapCoin = 0;
              if (userData.dailyFap === undefined) updates.dailyFap = 0;
              if (userData.lastFapDate === undefined) updates.lastFapDate = "";

              if (Object.keys(updates).length > 0) {
                await updateDoc(userRef, updates).catch(handleFirebaseError);
              }
              if (isMounted) {
                setCurrentUser({ id: firebaseUser.uid, email: userEmail, ...userData, ...updates });
              }
            } else {
              const paymentCode = "FP-" + firebaseUser.uid.substring(0, 4).toUpperCase();
              // DÜZELTİLDİ: displayName sanitize edildi
              const rawName = firebaseUser.displayName || userEmail.split("@")[0] || "Oyuncu";
              const safeName = sanitizeText(rawName).substring(0, 50);

              const newUser = {
                name: safeName,
                email: userEmail,
                role: isAdminEmail ? "admin" : "user",
                premiumEndDate: isAdminEmail ? new Date("2099-01-01").toISOString() : null,
                pendingRequest: null,
                playCount: 0,
                premiumTrialsUsed: 0,
                gamePlayCounts: {},
                fapCoin: 0,
                dailyFap: 0,
                lastFapDate: "",
                paymentCode,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              };
              await setDoc(userRef, newUser).catch(handleFirebaseError);
              if (isMounted) {
                setCurrentUser({ id: firebaseUser.uid, ...newUser });
              }
            }
            if (isMounted) setAuthLoading(false);
          }, (error) => {
            handleFirebaseError(error);
            if (isMounted) setAuthLoading(false);
          });
        } catch (error) {
          handleFirebaseError(error);
          if (isMounted) setAuthLoading(false);
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [handleFirebaseError]);

  useEffect(() => {
    if (!db) return;

    setStoreLoading(true);
    const unsubscribeProducts = onSnapshot(
      query(collection(db, "store_products"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setStoreProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setStoreLoading(false);
      }, (err) => {
        handleFirebaseError(err);
        setStoreLoading(false);
      }
    );

    const unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "feedbacks"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const fbList = snapshot.docs.map(d => {
          const data = d.data();
          let dateStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              dateStr = data.createdAt.toDate().toISOString();
            } else if (data.createdAt instanceof Date) {
              dateStr = data.createdAt.toISOString();
            }
          }
          return { id: d.id, ...data, createdAt: dateStr };
        });
        setFeedbacks(fbList);
      },
      handleFirebaseError
    );

    let unsubscribeUsers = null;
    let unsubscribeOrders = null;
    if (isAdmin) {
      unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsersList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }, handleFirebaseError);

      unsubscribeOrders = onSnapshot(
        query(collection(db, "orders"), orderBy("createdAt", "desc")),
        (snapshot) => {
          setOrdersList(snapshot.docs.map(d => {
            const data = d.data();
            let dateStr = new Date().toLocaleDateString('tr-TR');
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
              const dt = data.createdAt.toDate();
              dateStr = dt.toLocaleDateString('tr-TR') + ' ' + dt.toLocaleTimeString('tr-TR');
            }
            return { id: d.id, ...data, displayDate: dateStr };
          }));
        },
        handleFirebaseError
      );
    }

    return () => {
      unsubscribeProducts();
      unsubscribeFeedbacks();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [isAdmin, handleFirebaseError]);

  // Varsayılan ürün yükleme kaldırıldı — ürünler admin panelinden manuel eklenir.

  const handleSharePlatform = async () => {
    const shareData = {
      title: 'Forge&Play Eğlence Platformu',
      text: 'Harika parti ve masa oyunlarını arkadaşlarınla oynamak için Forge&Play tam sana göre!',
      url: window.location.origin
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* kullanıcı iptal etti */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Platform bağlantısı kopyalandı!");
      } catch {
        alert("Bağlantı: " + shareData.url);
      }
    }
  };

  const handleShareGame = async (game, e) => {
    e?.stopPropagation();
    const shareData = {
      title: game.title,
      text: `Forge&Play'de ${game.title} oynuyoruz!`,
      url: window.location.origin
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* iptal */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert(`${game.title} bağlantısı kopyalandı!`);
      } catch {
        alert("Bağlantı: " + shareData.url);
      }
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstallable(false);
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleEarnFapCoin = useCallback(async () => {
    if (!currentUser || !isUserPremium(currentUser)) return;

    const todayStr = new Date().toLocaleDateString('tr-TR');
    const currentDailyFap = currentUser.lastFapDate === todayStr
      ? Number(currentUser.dailyFap || 0)
      : 0;

    // Günde maksimum 16 coin (32 adet 10 dk'lık oturum × 0.5)
    if (currentDailyFap >= 16) return;

    try {
      const addedAmount = 0.5;
      const newDailyFap = currentDailyFap + addedAmount;

      await updateDoc(doc(db, "users", currentUser.id), {
        fapCoin: increment(addedAmount),
        dailyFap: newDailyFap,
        lastFapDate: todayStr
      }).catch(handleFirebaseError);

      setCurrentUser(prev => prev ? ({
        ...prev,
        fapCoin: (Number(prev.fapCoin) || 0) + addedAmount,
        dailyFap: newDailyFap,
        lastFapDate: todayStr
      }) : null);
    } catch (error) {
      handleFirebaseError(error);
    }
  }, [currentUser, handleFirebaseError]);

  /**
   * DÜZELTİLDİ: proceedToGame — trial başlangıç zamanı kaydediliyor
   * 1 dakikadan önce çıkılırsa trial sayılmıyor (gerçek uygulamada server-side yapılmalı)
   */
  const proceedToGame = useCallback((game, isTrial = false) => {
    setTrialPromptGame(null);
    setPlayingGame(game);

    if (isTrial) {
      trialStartTimeRef.current = Date.now();
    } else {
      trialStartTimeRef.current = null;
    }

    // Önceki timer'ları temizle
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);

    // 60 saniye sonra oyun sayısını artır
    playTimerRef.current = setTimeout(async () => {
      if (currentUser) {
        try {
          const newGameCounts = { ...(currentUser.gamePlayCounts || {}) };
          newGameCounts[game.id] = (Number(newGameCounts[game.id]) || 0) + 1;

          const updates = {
            playCount: (Number(currentUser.playCount) || 0) + 1,
            lastPlayedGameName: game.title,
            lastPlayed: serverTimestamp(),
            gamePlayCounts: newGameCounts
          };

          // DÜZELTİLDİ: Trial sayacı — sadece 60 saniyeyi geçtiyse artır
          if (isTrial) {
            updates.premiumTrialsUsed = (Number(currentUser.premiumTrialsUsed) || 0) + 1;
          }

          await updateDoc(doc(db, "users", currentUser.id), updates).catch(handleFirebaseError);

          setCurrentUser(prev => prev ? ({
            ...prev,
            playCount: (Number(prev.playCount) || 0) + 1,
            lastPlayedGameName: game.title,
            gamePlayCounts: newGameCounts,
            premiumTrialsUsed: isTrial
              ? (Number(prev.premiumTrialsUsed) || 0) + 1
              : prev.premiumTrialsUsed
          }) : null);
        } catch (error) {
          handleFirebaseError(error);
        }
      }
    }, 60000);

    // FAP Coin kazanım — sadece premium, sadece oyun içinde aktif tab, 10 dk = 0.5 coin
    if (currentUser && isUserPremium(currentUser)) {
      let activeSeconds = 0;
      fapCoinIntervalRef.current = setInterval(() => {
        // Kullanıcı başka sekmeye geçtiyse saymayı durdur
        if (!document.hidden) {
          activeSeconds += 15;
          // 600 saniye = 10 dakika aktif oyun tamamlandı
          if (activeSeconds >= 600) {
            handleEarnFapCoin();
            activeSeconds = 0;
          }
        }
      }, 15000); // 15 saniyede bir kontrol et
    }
  }, [currentUser, handleEarnFapCoin, handleFirebaseError]);

  const openGame = useCallback(async (game) => {
    if (!game) return;
    if (!game.url) {
      alert("Bu oyun henüz yayında değil.");
      return;
    }

    if (game.requiresPremium && !isUserPremium(currentUser)) {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      const trialsUsed = Number(currentUser?.premiumTrialsUsed || 0);
      if (trialsUsed >= 3) {
        setPremiumWarningGame(game);
      } else {
        setTrialPromptGame(game);
      }
      return;
    }

    proceedToGame(game, false);
  }, [currentUser, proceedToGame]);

  /**
   * DÜZELTİLDİ: getSecureGameUrl — userId artık URL'e eklenmez
   * Source parametresi yeterli; userId gizli tutulmalı
   */
  const getSecureGameUrl = useCallback((baseUrl) => {
    if (!baseUrl) return "";
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("source", "forgeandplay");
      // DÜZELTİLDİ: userId URL'e eklenmiyor — privacy koruması
      return url.toString();
    } catch {
      return baseUrl;
    }
  }, []);

  // DÜZELTİLDİ: handleLoginSubmit — güvenli email parse + input sanitization
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const email = String(emailInput).trim().toLowerCase();
    const password = passwordInput;

    // DÜZELTİLDİ: Basit email format kontrolü
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (!password) {
      setAuthError("Şifre boş bırakılamaz.");
      return;
    }

    if (!loginRateLimiter(email)) {
      setAuthError("Çok fazla başarısız deneme. Lütfen 5 dakika bekleyin.");
      return;
    }

    try {
      if (isRegistering) {
        if (password.length < 6) {
          setAuthError("Şifre en az 6 karakter olmalıdır.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLoginModal(false);
      setPasswordInput("");
      setEmailInput("");
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use': setAuthError("Bu e-posta adresi zaten kullanılıyor."); break;
        case 'auth/invalid-email': setAuthError("Geçersiz e-posta adresi."); break;
        case 'auth/user-disabled': setAuthError("Bu hesap devre dışı bırakılmış."); break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          // DÜZELTİLDİ: Hangi bilginin yanlış olduğunu söylemiyoruz (güvenlik)
          setAuthError("Giriş bilgileri hatalı.");
          break;
        case 'auth/too-many-requests': setAuthError("Çok fazla başarısız deneme. Hesabınız geçici olarak kilitlendi."); break;
        default: setAuthError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Giriş penceresi kapatıldı.");
      } else {
        setAuthError("Google ile giriş yapılamadı.");
      }
    }
  };

  const handlePasswordReset = async () => {
    const email = String(emailInput).trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Geçerli bir e-posta adresi girin.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthError("Şifre sıfırlama bağlantısı gönderildi (spam klasörünü kontrol edin).");
      setShowResetPassword(false);
    } catch (error) {
      // DÜZELTİLDİ: Hesabın var olup olmadığını açıklama (güvenlik)
      setAuthError("Şifre sıfırlama e-postası gönderilemedi.");
    }
  };

  const handlePurchaseRequest = async (plan) => {
    if (!currentUser) {
      setPremiumWarningGame(null);
      setActiveTab("premium");
      setShowLoginModal(true);
      return;
    }
    // DÜZELTİLDİ: Plan validasyonu
    if (!PAYMENT_LINKS[plan]) {
      alert("Geçersiz plan seçimi.");
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        pendingRequest: plan,
        lastPurchaseAttempt: serverTimestamp()
      }).catch(handleFirebaseError);

      setPremiumWarningGame(null);
      setShowPricingModal(false);
      setPaymentIntent({ url: PAYMENT_LINKS[plan], plan });
    } catch (error) {
      alert("Satın alma talebi oluşturulurken bir hata oluştu.");
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    if (!currentUser) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        // DÜZELTİLDİ: Tüm string alanlar sanitize edildi
        text: sanitizeText(feedbackData.text),
        game: sanitizeText(feedbackData.game),
        userId: currentUser.id,
        user: sanitizeText(currentUser.name || currentUser.email),
        email: String(currentUser.email),
        status: "beklemede",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('tr-TR')
      }).catch(handleFirebaseError);
      alert("Geri bildiriminiz başarıyla gönderildi! Teşekkürler.");
    } catch (error) {
      handleFirebaseError(error);
      alert("Geri bildirim gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleRewardPurchase = async (e) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;

    // DÜZELTİLDİ: fapCoin kontrolü — kesin sayı karşılaştırması
    const currentBalance = Number(currentUser.fapCoin || 0);
    const productCost = Number(selectedProduct.price || 0);

    if (currentBalance < productCost) {
      alert(`Yetersiz FAP Coin! Gereken: ${productCost}, Bakiye: ${currentBalance.toFixed(1)}`);
      return;
    }

    // DÜZELTİLDİ: Fiziksel ürün için adres zorunluluğu
    if (selectedProduct.type === "Fiziksel" && !orderAddress.trim()) {
      alert("Fiziksel ürünler için teslimat adresi zorunludur.");
      return;
    }

    setIsOrdering(true);
    try {
      const newBalance = currentBalance - productCost;

      await updateDoc(doc(db, "users", currentUser.id), {
        fapCoin: newBalance
      }).catch(handleFirebaseError);

      await addDoc(collection(db, "orders"), {
        userId: currentUser.id,
        userEmail: String(currentUser.email),
        userName: sanitizeText(currentUser.name || "İsimsiz"),
        productId: selectedProduct.id,
        productName: sanitizeText(selectedProduct.name),
        productType: selectedProduct.type,
        fapCost: productCost,
        // DÜZELTİLDİ: Adres sanitize edildi
        addressDetails: sanitizeText(orderAddress || "Belirtilmedi"),
        status: "Onay Bekliyor",
        createdAt: serverTimestamp()
      }).catch(handleFirebaseError);

      setCurrentUser(prev => prev ? { ...prev, fapCoin: newBalance } : null);

      alert("Siparişiniz alındı! Admin onayından sonra e-posta ile bilgilendirileceksiniz.");
      setSelectedProduct(null);
      setOrderAddress("");
    } catch (err) {
      handleFirebaseError(err);
      alert("Sipariş oluşturulurken bir hata oluştu.");
    } finally {
      setIsOrdering(false);
    }
  };

  // BOT SİMÜLASYONU
  // Gerçek coin mantığıyla çalışır: handleEarnFapCoin üzerinden,
  // günlük 16 coin limiti uygulanır.
  // Test hızlandırması: 30 saniye = 10 dakikalık oturumu simüle eder.
  const toggleBotSimulation = async () => {
    if (isBotRunning) {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
      setIsBotRunning(false);
      alert("Simülasyon Botu durduruldu.");
      return;
    }

    if (!currentUser) {
      alert("Bot başlatmak için giriş yapmalısınız.");
      return;
    }

    setIsBotRunning(true);
    alert(
      "Test Botu başlatıldı!\n\n" +
      "• Her 30 saniyede 1 oyun oturumu simüle edilir (gerçekte 10 dk)\n" +
      "• Günlük 16 coin limiti uygulanır\n" +
      "• %25 ihtimalle [BOT TEST] feedback gönderilir\n" +
      "• Coin kazanımı handleEarnFapCoin üzerinden geçer (gerçekçi test)"
    );

    botIntervalRef.current = setInterval(async () => {
      try {
        const randomGame = GAMES.filter(g => g.status === "Yayında")[
          Math.floor(Math.random() * GAMES.filter(g => g.status === "Yayında").length)
        ];

        // playCount artır (oturum sayısı)
        await updateDoc(doc(db, "users", currentUser.id), {
          playCount: increment(1),
          lastPlayedGameName: randomGame.title,
          lastLogin: serverTimestamp(),
          [`gamePlayCounts.${randomGame.id}`]: increment(1)
        }).catch(handleFirebaseError);

        setCurrentUser(prev => prev ? ({
          ...prev,
          playCount: (Number(prev.playCount) || 0) + 1,
          lastPlayedGameName: randomGame.title,
          gamePlayCounts: {
            ...(prev.gamePlayCounts || {}),
            [randomGame.id]: (Number((prev.gamePlayCounts || {})[randomGame.id]) || 0) + 1
          }
        }) : null);

        // Coin kazanımı — gerçek mantıktan geçer, günlük limit uygulanır
        await handleEarnFapCoin();

        // %25 ihtimalle feedback
        if (Math.random() < 0.25) {
          const feedbackTexts = [
            "Oyun akıcı çalışıyor, beğendim.",
            "Yükleme süresi biraz uzun.",
            "Mobilde butonlar daha büyük olabilir.",
            "Skor tablosu harika olurdu!",
            "Sesler eklenirse çok güzel olur.",
            "Arkadaş davet sistemi bekliyorum.",
            "Renkler gözü yormuyor, başarılı."
          ];
          await addDoc(collection(db, "feedbacks"), {
            userId: currentUser.id,
            user: `[BOT TEST] ${currentUser.name || "Admin"}`,
            email: String(currentUser.email),
            game: randomGame.title,
            text: feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)],
            status: "beklemede",
            createdAt: serverTimestamp(),
            date: new Date().toLocaleDateString('tr-TR'),
            isBotTest: true
          }).catch(handleFirebaseError);
        }

      } catch (e) {
        handleFirebaseError(e);
      }
    }, 30000); // Her 30 saniye = 10 dakikalık oturumu simüle eder
  };

  // =========================================================================
  // RENDER FONKSİYONLARI
  // =========================================================================

  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 lg:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10">
          <button className={`flex items-center gap-2.5 cursor-pointer rounded-lg py-1 ${focusStyles} shrink-0`} onClick={() => setActiveTab("store")}>
            <div className="bg-slate-900 border border-slate-800 p-1.5 lg:p-2 rounded-xl shadow-lg shadow-orange-500/10 flex items-center justify-center">
              <img src={LOGO_URL} alt="Forge&Play Logo" className="w-6 h-6 lg:w-7 lg:h-7 object-contain" />
            </div>
            <div className="text-xl lg:text-2xl font-black tracking-tight text-white hidden sm:block">
              Forge<span className="text-orange-500">&</span>Play
            </div>
          </button>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { id: "store", icon: Gamepad2, label: "Oyunlar" },
              { id: "rewards", icon: Gift, label: "Ödül Mağazası" },
              { id: "library", icon: Library, label: "Kütüphanem" },
              { id: "lab", icon: FlaskConical, label: "Laboratuvar" },
              { id: "feedback", icon: MessageSquarePlus, label: "Fikir Kutusu" }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${focusStyles} ${activeTab === tab.id ? "bg-slate-800/80 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}>
                  <TabIcon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
            <div className="pl-2 border-l border-slate-800 ml-2">
              <button onClick={() => setActiveTab("premium")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${focusStyles} ${activeTab === "premium" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105" : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"}`}>
                <Crown className="w-4 h-4" /> Premium Al
              </button>
            </div>
            {isAdmin && (
              <button onClick={() => setActiveTab("admin")} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all ml-2 border border-slate-700 ${focusStyles} ${activeTab === "admin" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-white hover:bg-slate-800"}`}>
                <Lock className="w-4 h-4" /> Admin
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-800 pr-4 mr-2">
            <button onClick={handleSharePlatform} className="text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold">
              <Share2 className="w-4 h-4" /> Davet Et
            </button>
            <button onClick={handleInstallApp} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold">
              <Download className="w-4 h-4" /> Yükle
            </button>
          </div>

          {authLoading ? (
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 pl-2 md:border-l border-slate-800">
              {isUserPremium(currentUser) && (
                <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => setActiveTab("rewards")}>
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-400">{Number(currentUser.fapCoin || 0).toFixed(1)}</span>
                </div>
              )}
              <div className="hidden sm:flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("profile")}>
                <span className="text-sm font-bold text-white leading-tight">{String(currentUser.name || "Kullanıcı")}</span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-400">Yönetici</span>
                ) : currentUser.pendingRequest ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                ) : isUserPremium(currentUser) ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400">Premium ({getRemainingDays(currentUser.premiumEndDate)} Gün)</span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Standart</span>
                )}
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-950 ring-orange-500 transition-all" onClick={() => setActiveTab("profile")}>
                {String(currentUser.name || "U").charAt(0).toUpperCase()}
              </div>
              <button
                onClick={async () => {
                  setActiveTab("store");
                  setPlayingGame(null);
                  if (playTimerRef.current) clearTimeout(playTimerRef.current);
                  if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);
                  try { await signOut(auth); } catch (err) { handleFirebaseError(err); }
                }}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className={`flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 ${focusStyles} shrink-0`}>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Giriş Yap / Kayıt Ol</span>
              <span className="sm:hidden">Giriş</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // DÜZELTİLDİ: Mobile nav — feedback ve library eklendi
  const renderMobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center p-2">
        {[
          { id: "store", icon: Gamepad2, label: "Oyunlar" },
          { id: "rewards", icon: Gift, label: "Ödüller" },
          { id: "premium", icon: Crown, label: "Premium" },
          { id: "feedback", icon: MessageSquarePlus, label: "Fikirler" },
          { id: "profile", icon: User, label: "Profil" },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "profile" && !currentUser) {
                  setShowLoginModal(true);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === tab.id
                ? (tab.id === "premium" ? "text-amber-500" : "text-orange-500")
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <TabIcon className={`w-6 h-6 mb-1 ${tab.id === "premium" && activeTab !== "premium" ? "text-amber-500/70" : ""}`} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <button onClick={() => setActiveTab("admin")} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === "admin" ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}>
            <Lock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Giriş Yap">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto flex flex-col mx-auto">
        <button onClick={() => { setShowLoginModal(false); setAuthError(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-lg shadow-orange-500/20 p-2">
            <img src={LOGO_URL} alt="Forge&Play Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-white">{isRegistering ? "Aramıza Katıl" : "Hesabına Giriş Yap"}</h2>
          <p className="text-slate-400 text-sm mt-2">Tüm Forge&Play kütüphanene erişmek için giriş yap.</p>
        </div>
        {authError && (
          <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center font-bold">
            {String(authError)}
          </div>
        )}
        <form onSubmit={handleLoginSubmit} className="space-y-4 w-full">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="ornek@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              autoComplete="email"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
          </div>
          {!isRegistering && (
            <div className="text-right w-full">
              <button type="button" onClick={() => setShowResetPassword(true)} className="text-xs text-orange-500 hover:text-orange-400 font-medium">
                Şifremi Unuttum
              </button>
            </div>
          )}
          {showResetPassword && (
            <div className="p-3 bg-slate-800 rounded-lg w-full text-center">
              <p className="text-sm text-slate-300 mb-2">E-posta adresinize şifre sıfırlama bağlantısı gönderilecek.</p>
              <button type="button" onClick={handlePasswordReset} className="text-sm font-bold text-orange-500 hover:text-orange-400">
                Bağlantı Gönder
              </button>
            </div>
          )}
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 mt-2">
            {isRegistering ? "Kayıt Ol ve Başla" : "Giriş Yap"}
          </button>
        </form>
        <div className="relative flex py-5 items-center w-full">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-medium">veya</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>
        <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-colors mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google ile {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
        </button>
        <p className="text-center text-sm text-slate-400 w-full">
          {isRegistering ? "Zaten hesabın var mı?" : "Henüz hesabın yok mu?"}{" "}
          <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }} className="text-orange-500 font-bold hover:text-orange-400 transition-colors" type="button">
            {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </button>
        </p>
      </div>
    </div>
  );

  const renderPaymentCodeModal = () => {
    if (!paymentIntent || !currentUser) return null;
    const handleCopyCode = async () => {
      try {
        await navigator.clipboard.writeText(currentUser.paymentCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        // Clipboard API desteklenmiyor — fallback
        const el = document.createElement('textarea');
        el.value = currentUser.paymentCode;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    };

    return (
      <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={() => setPaymentIntent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Çok Önemli Bir Adım!</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Ödemenizin hesabınıza tanımlanabilmesi için Shopier ekranındaki{" "}
            <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">"Sipariş Notu"</strong>{" "}
            kısmına aşağıdaki kodu yazın.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between shadow-inner">
            <span className="text-2xl md:text-3xl font-mono font-black text-orange-400 tracking-wider pl-2">
              {String(currentUser.paymentCode)}
            </span>
            <button onClick={handleCopyCode} className={`p-3 rounded-lg transition-colors flex items-center justify-center border ${isCopied ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700"}`}>
              {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={() => { window.open(paymentIntent.url, "_blank", "noopener,noreferrer"); setPaymentIntent(null); }}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 text-lg"
          >
            Kopyaladım, Ödemeye Geç <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderPricingCards = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col hover:border-orange-500/30 transition-all">
        <h3 className="text-xl font-bold text-white mb-2">Aylık Bilet</h3>
        <p className="text-slate-500 text-sm mb-6 h-10">Kısa süreli deneme için ideal.</p>
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">39₺</span>
          <span className="text-slate-500 text-sm font-medium">/ ay</span>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-300 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="pt-0.5">Tüm Premium oyunlara erişim</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("1A")} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Seç ve Başla</button>
      </div>
      <div className="bg-gradient-to-b from-amber-900/40 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 md:p-8 flex flex-col transform lg:-translate-y-4 shadow-2xl shadow-amber-500/20 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">EN POPÜLER</div>
        <h3 className="text-2xl font-bold text-white mb-2">Sezonluk Kart</h3>
        <p className="text-amber-200/60 text-sm mb-6 h-10">Düzenli oyuncular için tasarruf fırsatı.</p>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">179₺</span>
          <span className="text-slate-400 text-sm line-through">234₺</span>
        </div>
        <div className="text-amber-400 text-sm mb-6 font-bold flex items-center gap-1"><Sparkles className="w-4 h-4" /> %23 İndirim</div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /><span className="pt-0.5">Tüm Premium özellikler</span></li>
          <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /><span className="pt-0.5">Özel rozet</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("6A")} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg">6 Ay İçin Satın Al</button>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col hover:border-amber-500/50 transition-all relative">
        <div className="absolute top-5 right-5 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded text-xs font-black border border-amber-500/20">%36 İNDİRİM</div>
        <h3 className="text-xl font-bold text-white mb-2">1 Yıllık Efsane</h3>
        <p className="text-slate-500 text-sm mb-6 h-10">En yüksek indirim ve statü.</p>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">299₺</span>
          <span className="text-slate-500 text-sm line-through">468₺</span>
        </div>
        <div className="text-amber-500 text-sm mb-6 font-bold flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Aylık 24.9₺</div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-300 items-start"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /><span className="pt-0.5">Tüm Premium özellikler</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("1Y")} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-amber-500/30 hover:border-amber-500">Kalıcı Destekçi Ol</button>
      </div>
    </div>
  );

  const renderPremiumPage = () => (
    <div className="space-y-12 md:space-y-16 max-w-6xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] text-center p-8 md:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 pointer-events-none"></div>
        <div className="relative z-10">
          <Crown className="w-16 h-16 md:w-20 md:h-20 text-amber-500 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Oyun Deneyimini <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Zirveye Taşı</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            En popüler parti oyunlarına ve gelişmiş dijital masa araçlarına kesintisiz erişim.
          </p>
        </div>
      </div>
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Neden Premium?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Lock, title: "Sınırsız Erişim", desc: "Tüm kilitli Premium oyunları anında açın.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Crown, title: "Özel Rozet", desc: "Profilinizde altın rengi Premium rozeti taşıyın.", color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: Zap, title: "Erken Erişim", desc: "Laboratuvardaki yeni oyunları ilk siz deneyin.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: HeartHandshake, title: "Projeye Destek", desc: "Bağımsız geliştiriciye destek olun.", color: "text-rose-400", bg: "bg-rose-500/10" },
          ].map((feature, i) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-colors">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  <FeatureIcon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Nasıl Premium Olurum?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Planınızı Seçin", desc: "Aşağıdaki tablodan uygun abonelik süresini seçin." },
            { step: "2", title: "Kodunuzu Kopyalayın", desc: "Sistemin size verdiği eşsiz güvenlik kodunu kopyalayın." },
            { step: "3", title: "Not Olarak Ekleyin", desc: "Shopier ödeme sayfasındaki 'Sipariş Notu' kısmına kodu yapıştırın." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center text-xl font-black text-amber-500 shadow-lg mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Kodunuzu eklediğinizde ödemeniz sistem tarafından eşleştirilir.
          </p>
        </div>
      </div>
      <div className="pt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Maceraya Başla</h2>
          <p className="text-slate-400">Hemen bir plan seçin ve oyun gecelerini mükemmelleştirin.</p>
        </div>
        {renderPricingCards()}
      </div>
    </div>
  );

  const renderTrialPromptModal = () => {
    if (!trialPromptGame || !currentUser) return null;
    const trialsUsed = Number(currentUser.premiumTrialsUsed || 0);
    const remaining = 3 - trialsUsed;

    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={() => setTrialPromptGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors z-20">
            <X className="w-5 h-5" />
          </button>
          <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Hediye Premium Denemesi!</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Yeni üyelerimize özel olarak tüm Premium oyunları ücretsiz test etme hakkınız var.{" "}
            <b>{trialPromptGame.title}</b> oyununu oynamak için 1 hakkınız kullanılacak.
            <br />
            <em className="text-slate-400">(1 dakikadan az kalırsanız hakkınız eksilmez!)</em>
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
            <span className="text-emerald-400 font-bold text-lg">Kalan Hakkınız: {remaining} / 3</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => proceedToGame(trialPromptGame, true)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg">
              Deneme Hakkımı Kullan ({remaining} Kaldı)
            </button>
            <button onClick={() => setTrialPromptGame(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
              Şimdilik Sakla
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumWarningModal = () => {
    if (!premiumWarningGame) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto py-12" role="dialog" aria-modal="true">
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-5xl p-6 md:p-10 shadow-2xl relative my-auto text-center">
          <button onClick={() => setPremiumWarningGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors z-20">
            <X className="w-5 h-5" />
          </button>
          <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Deneme Haklarınız Bitti</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Ücretsiz deneme haklarınızı tamamladınız. <b>{premiumWarningGame.title}</b> oyununa erişmek için Premium aboneliği inceleyin.
          </p>
          <button onClick={() => { setPremiumWarningGame(null); setActiveTab("premium"); }} className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg text-lg">
            Premium Paketleri İncele
          </button>
          <button onClick={() => setPremiumWarningGame(null)} className="block w-full md:w-auto mx-auto mt-4 px-8 py-3 text-slate-400 hover:text-white transition-colors font-bold">
            Vazgeç
          </button>
        </div>
      </div>
    );
  };

  const renderPlayerOverlay = () => {
    if (!playingGame) return null;
    const secureUrl = getSecureGameUrl(playingGame.url);

    const handleClose = () => {
      setPlayingGame(null);
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

    const toggleFullScreen = () => {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        docEl.requestFullscreen?.()?.catch(() => {});
      } else {
        document.exitFullscreen?.()?.catch(() => {});
      }
    };

    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col" style={{ height: "100dvh" }}>
        <div className="flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950 border-b border-slate-800 shadow-xl z-20">
          <div className="flex items-center gap-2 md:gap-3 text-white font-bold truncate">
            <div className="flex bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <img src={LOGO_URL} alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="hidden sm:inline tracking-tight">Forge<span className="text-orange-500">&</span>Play</span>
            <span className="hidden sm:inline text-slate-600 select-none">|</span>
            <span className="text-xs md:text-sm text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 truncate">
              {playingGame.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleFullScreen} className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors hidden sm:block" title="Tam Ekran">
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className={`flex items-center gap-1.5 md:gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${focusStyles}`}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Oyundan Çık</span>
            </button>
          </div>
        </div>
        <div className="flex-1 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-slate-950">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <div className="text-orange-500 font-bold animate-pulse text-sm">Oyun Yükleniyor...</div>
          </div>
          {/* DÜZELTİLDİ: iframe sandbox — allow-modals kaldırıldı (güvenlik) */}
          <iframe
            src={secureUrl}
            className="absolute inset-0 w-full h-full border-none outline-none z-10 bg-transparent"
            title={playingGame.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  const renderInstallGuideModal = () => {
    if (!showInstallGuide) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <Download className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Ana Ekrana Ekle</h2>
          <p className="text-slate-400 text-sm mb-6">Forge&Play'i telefonunuza kurarak tek tıkla oyunlara erişin!</p>
          <div className="text-left space-y-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white mb-2">🍎 iOS (iPhone/iPad):</h4>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside pl-2">
                <li>Alt menüdeki <b className="text-slate-200">Paylaş</b> ikonuna dokunun.</li>
                <li><b className="text-slate-200">Ana Ekrana Ekle</b> seçeneğini bulun.</li>
                <li><b className="text-slate-200">Ekle</b> butonuna basın.</li>
              </ol>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white mb-2">🤖 Android:</h4>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside pl-2">
                <li>Sağ üst köşedeki <b className="text-slate-200">Üç Nokta</b> menüsüne dokunun.</li>
                <li><b className="text-slate-200">Ana Ekrana Ekle</b> seçeneğini seçin.</li>
                <li><b className="text-slate-200">Ekle</b> butonuna basın.</li>
              </ol>
            </div>
          </div>
          <button onClick={() => setShowInstallGuide(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            Anladım
          </button>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    if (!currentUser) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquarePlus className="w-20 h-20 text-slate-700 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Fikir Kutusu</h2>
          <p className="text-slate-400 max-w-md mb-8">Fikirlerinizi paylaşmak için giriş yapmalısınız.</p>
          <button onClick={() => setShowLoginModal(true)} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
            Giriş Yap
          </button>
        </div>
      );
    }

    const userFeedbacks = feedbacks.filter(fb => fb.userId === currentUser.id);

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-900/30 to-slate-900 border border-orange-500/30 rounded-3xl p-8 text-center relative overflow-hidden">
          <Lightbulb className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Fikir Kutusu</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Oyunlarımız hakkındaki düşüncelerinizi, karşılaştığınız sorunları veya önerilerinizi paylaşın.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
            <MessageCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-300">Toplam {userFeedbacks.length} fikir paylaştınız</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-orange-500" /> Yeni Fikir Gönder
            </h3>
            <FeedbackForm currentUser={currentUser} onSubmit={handleFeedbackSubmit} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Gönderdiğiniz Fikirler
            </h3>
            {userFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Henüz hiç fikir göndermediniz.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {userFeedbacks.map((fb, idx) => (
                  <div key={fb.id || idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {fb.game || "Genel"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('tr-TR') : fb.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{String(fb.text)}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      fb.status === "onaylandi" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      fb.status === "reddedildi" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {fb.status === "onaylandi" ? "Onaylandı ✓" : fb.status === "reddedildi" ? "Reddedildi ✗" : "Beklemede"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRewardsStore = () => {
    const renderPurchaseModal = () => {
      if (!selectedProduct) return null;
      const isPhysical = selectedProduct.type === "Fiziksel";
      return (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 text-center">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-800" />
              <h3 className="text-xl font-bold text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-amber-400 font-bold text-lg flex items-center justify-center gap-1">
                <Coins className="w-5 h-5" /> {Number(selectedProduct.price)} FAP
              </p>
            </div>
            <form onSubmit={handleRewardPurchase} className="space-y-4">
              {isPhysical ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kargo Adresi *</label>
                  <textarea
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Ürünün gönderileceği tam adres..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 min-h-[100px]"
                    maxLength={500}
                  />
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 text-sm">
                    Dijital ürün — onaydan sonra <b>{currentUser?.email}</b> adresine gönderilir.
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={isOrdering}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isOrdering ? "İşleniyor..." : "Siparişi Tamamla"}
              </button>
            </form>
          </div>
        </div>
      );
    };

    // DÜZELTİLDİ: Loading state gösteriliyor
    const visibleProducts = storeProducts.filter(p => p.isVisible !== false);

    return (
      <div className="space-y-8">
        {renderPurchaseModal()}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 flex items-center gap-3">
              <Gift className="w-8 h-8 md:w-12 md:h-12 text-amber-500" /> Ödül Mağazası
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
              Oynadıkça kazan! Premium üyeler her <b className="text-amber-400">10 dakikada 0.5 FAP Coin</b> kazanır (Günde maks 8 FAP).
            </p>
            {!currentUser ? (
              <button onClick={() => setShowLoginModal(true)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors">
                Kazanmaya Başlamak İçin Giriş Yap
              </button>
            ) : !isUserPremium(currentUser) ? (
              <button onClick={() => setActiveTab("premium")} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-2">
                <Crown className="w-5 h-5" /> Premium Ol ve FAP Kazan
              </button>
            ) : (
              <div className="inline-flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 px-5 shadow-inner">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Bakiye</div>
                  <div className="text-xl font-black text-amber-400">{Number(currentUser.fapCoin || 0).toFixed(1)} FAP</div>
                </div>
              </div>
            )}
          </div>
          <div className="relative z-10 hidden md:flex w-48 h-48 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center shadow-2xl shadow-amber-500/20 transform rotate-12">
            <ShoppingBag className="w-24 h-24 text-white opacity-90" />
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Tüm Ödüller</h2>
          {storeLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500 flex flex-col items-center">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                  <p>Şu an mağazada ürün bulunmuyor.</p>
                </div>
              ) : visibleProducts.map(product => {
                const canAfford = currentUser && isUserPremium(currentUser) && Number(currentUser.fapCoin || 0) >= product.price;
                const needsPremium = currentUser && !isUserPremium(currentUser);

                return (
                  <div key={product.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all group flex flex-col h-full hover:-translate-y-1 hover:shadow-xl shadow-amber-500/10">
                    <div className="relative h-48 md:h-52 overflow-hidden bg-slate-950 shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" loading="lazy" />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5 text-xs font-bold text-slate-300">
                        {product.type === "Fiziksel" ? <Truck className="w-3.5 h-3.5 text-emerald-400" /> : <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                        {product.type}
                      </div>
                    </div>
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                      <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-slate-400 mb-4 flex-grow line-clamp-4">{product.desc}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl">
                          <Coins className="w-5 h-5" /> {Number(product.price)}
                        </div>
                        <button
                          onClick={() => {
                            if (!currentUser) { setShowLoginModal(true); return; }
                            if (needsPremium) { setActiveTab("premium"); return; }
                            if (!canAfford) return;
                            setSelectedProduct(product);
                          }}
                          disabled={currentUser && isUserPremium(currentUser) && !canAfford}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg ${
                            !currentUser ? "bg-slate-800 text-white hover:bg-slate-700" :
                            needsPremium ? "bg-slate-800 border border-amber-500/30 text-amber-500 hover:bg-slate-700" :
                            canAfford ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20" :
                            "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {!currentUser ? "Giriş Yap" : needsPremium ? "Premium Şart" : canAfford ? "Hemen Al" : "Yetersiz"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStore = () => {
    const slideList = featuredGames;
    return (
      <div className="space-y-8 md:space-y-12">
        {/* Hero Carousel */}
        <section
          className={`relative group cursor-pointer rounded-3xl ${focusStyles} overflow-hidden h-[450px] md:h-[500px] lg:h-[550px] shadow-2xl shrink-0`}
          tabIndex={0}
          onClick={() => slideList.length && openGame(slideList[currentSlide])}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); slideList.length && openGame(slideList[currentSlide]); } }}
        >
          {!slideList.length ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="text-center space-y-3 p-6">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="text-white font-black text-2xl">Oyun yükleniyor...</div>
              </div>
            </div>
          ) : (
            <>
              {slideList.map((game, idx) => {
                const locked = game.requiresPremium && !isUserPremium(currentUser);
                const trialsUsed = currentUser ? Number(currentUser.premiumTrialsUsed || 0) : 0;
                const hasTrials = trialsUsed < 3;

                return (
                  <div
                    key={game.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-95 z-0`} />
                    {game.image && (
                      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <img src={game.image} alt={game.title} className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent opacity-80"></div>
                      </div>
                    )}
                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-center lg:justify-between p-6 md:p-10 lg:p-14 h-full z-10">
                      <div className="w-full lg:max-w-2xl space-y-4 md:space-y-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs md:text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">Öne Çıkan</span>
                          {game.requiresPremium && <span className="bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight leading-tight line-clamp-2">{game.title}</h1>
                        <p className="text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl line-clamp-3">{game.description}</p>
                        <div className="pt-2"><LivePlayerCount base={game.basePlayers} /></div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2 md:pt-4">
                          <button
                            tabIndex={-1}
                            className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shrink-0 ${locked && !hasTrials ? "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}`}
                            onClick={(e) => { e.stopPropagation(); openGame(game); }}
                          >
                            <Play className="w-5 h-5 fill-current" />
                            {locked ? (hasTrials ? `Ücretsiz Dene (${3 - trialsUsed} Hak)` : "Premium Abone Ol") : "Hemen Oyna"}
                          </button>
                        </div>
                      </div>
                      <div className="hidden lg:flex items-center justify-center w-[220px] h-[220px] xl:w-[260px] xl:h-[260px] shrink-0 bg-slate-950/80 rounded-full border-4 border-slate-800/50 backdrop-blur-md shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                        <GameIcon iconKey={game.iconKey} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* DÜZELTİLDİ: Auto-play duraklatma butonu eklendi */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slideList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                      // Auto-play sıfırla
                      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
                      slideIntervalRef.current = setInterval(() => {
                        setCurrentSlide(prev => (prev + 1) % featuredGames.length);
                      }, 5000);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" : "w-2 bg-slate-500/50 hover:bg-slate-400"}`}
                    aria-label={`Slayt ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Oyun Listesi */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-500" /> Platform Projeleri
            </h2>
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="bg-transparent outline-none border-none text-sm text-white ml-2 w-40"
                aria-label="Oyun ara"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGames.map((game) => {
              const locked = game.requiresPremium && !isUserPremium(currentUser);
              const trialsUsed = currentUser ? Number(currentUser.premiumTrialsUsed || 0) : 0;
              const hasTrials = trialsUsed < 3;

              let btnText = "İncele";
              let btnClass = "bg-slate-800 text-slate-300 hover:bg-slate-700";

              if (game.url) {
                if (locked) {
                  if (hasTrials) {
                    btnText = `Dene (${3 - trialsUsed} Kaldı)`;
                    btnClass = "bg-emerald-600 hover:bg-emerald-500 text-white";
                  } else {
                    btnText = "Abone Ol";
                    btnClass = "bg-orange-600 hover:bg-orange-500 text-white";
                  }
                } else {
                  btnText = "Oyna";
                  btnClass = "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold";
                }
              }

              return (
                <div
                  key={game.id}
                  tabIndex={0}
                  onClick={() => openGame(game)}
                  onKeyDown={(e) => { if (e.key === "Enter") openGame(game); }}
                  className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] cursor-pointer flex flex-col ${focusStyles}`}
                >
                  <div className={`h-32 md:h-40 bg-gradient-to-br ${game.gradient} p-4 md:p-6 flex flex-col justify-between relative overflow-hidden`}>
                    {game.image && <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-60 transition-all transform group-hover:scale-110 duration-500 z-0 pointer-events-none" loading="lazy" />}
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity z-10"><GameIcon iconKey={game.iconKey} className="w-12 h-12" /></div>
                    <div className="flex justify-between items-start z-10 relative">
                      <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full ${game.type === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm" : "bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm"}`}>
                        {game.status}
                      </span>
                      {game.requiresPremium && <span className="bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white z-10 drop-shadow-md relative">{game.title}</h3>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col z-10 bg-slate-900">
                    <p className="text-slate-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 flex-1">{game.description}</p>
                    <LivePlayerCount base={game.basePlayers} />
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                      <span className="text-sm md:text-base font-semibold text-white">{game.price}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => handleShareGame(game, e)} className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors" title="Oyunu Paylaş">
                          <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button tabIndex={-1} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${btnClass}`}>
                          {btnText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  const renderLibrary = () => (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="w-full lg:w-1/3 xl:w-1/4 space-y-4">
        <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl px-2">
          <Library className="w-6 h-6 text-orange-500" /> Kütüphanem
        </div>
        <div className="space-y-2">
          {GAMES.filter(g => g.status === "Yayında").map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedLibraryGame(game)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedLibraryGame?.id === game.id ? "bg-orange-600/20 border border-orange-500/50 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${game.gradient}`}>
                <GameIcon iconKey={game.iconKey} className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm truncate">{game.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[400px]">
        {selectedLibraryGame ? (
          <>
            <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-br ${selectedLibraryGame.gradient} opacity-20`} />
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{selectedLibraryGame.title}</h2>
                  <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed mb-4">{selectedLibraryGame.description}</p>
                  <LivePlayerCount base={selectedLibraryGame.basePlayers} />
                </div>
                <div className={`hidden md:flex w-20 h-20 rounded-2xl items-center justify-center shrink-0 bg-gradient-to-br ${selectedLibraryGame.gradient} shadow-xl`}>
                  <GameIcon iconKey={selectedLibraryGame.iconKey} className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="mt-auto pt-8 border-t border-slate-800 flex items-center gap-3">
                {(() => {
                  const locked = selectedLibraryGame.requiresPremium && !isUserPremium(currentUser);
                  const trialsUsed = currentUser ? Number(currentUser.premiumTrialsUsed || 0) : 0;
                  const hasTrials = trialsUsed < 3;
                  let btnText = "Hemen Oyna";
                  if (locked) btnText = hasTrials ? `Ücretsiz Dene (${3 - trialsUsed} Kaldı)` : "Premium Abone Ol";
                  return (
                    <button onClick={() => openGame(selectedLibraryGame)} className="flex-1 sm:flex-none px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" /> {btnText}
                    </button>
                  );
                })()}
                <button onClick={(e) => handleShareGame(selectedLibraryGame, e)} className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full flex-1">
            <Library className="w-12 h-12 mb-4 opacity-50" />
            <p>Sol taraftan bir oyun seçin</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden">
        <FlaskConical className="w-16 h-16 text-orange-500 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Geliştirme Laboratuvarı</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Geleceğin oyunlarını ve AI deneyimlerini burada tasarlıyoruz. Geliştirme aşamasındaki projelerimize göz at.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LAB_PROJECTS.map(proj => (
          <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${proj.gradient}`}>
                <FlaskConical className="w-6 h-6 text-white opacity-80" />
              </div>
              <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">{proj.status}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{proj.title}</h3>
            <p className="text-slate-400 text-sm mb-8 flex-1">{proj.description}</p>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Tamamlanma</span><span>%{proj.progress}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${proj.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!currentUser) return null;
    const isPremium = isUserPremium(currentUser);
    const remDays = getRemainingDays(currentUser.premiumEndDate);
    const userFeedbacks = feedbacks.filter(fb => fb.userId === currentUser.id);

    const userBadges = [];
    if (isAdmin) userBadges.push({ id: 'admin', title: 'Platform Yöneticisi', desc: 'Sistemin koruyucusu.', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' });
    if (isPremium) userBadges.push({ id: 'premium', title: 'Premium Üye', desc: 'Platformun ayrıcalıklı destekçisi.', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' });
    if ((currentUser.playCount || 0) >= 50) {
      userBadges.push({ id: 'gamer_pro', title: 'Efsanevi Oyuncu', desc: '50+ oyun oynadı.', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' });
    } else if ((currentUser.playCount || 0) >= 10) {
      userBadges.push({ id: 'gamer_mid', title: 'Sıkı Oyuncu', desc: '10+ oyun oynadı.', icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' });
    }
    const approvedFeedbacks = userFeedbacks.filter(fb => fb.status === "onaylandi").length;
    if (approvedFeedbacks > 0) userBadges.push({ id: 'idea', title: 'Fikir Öncüsü', desc: 'Onaylanan fikirler kattı.', icon: Star, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' });
    if (userBadges.length === 0) userBadges.push({ id: 'newbie', title: 'Yeni Maceracı', desc: 'Platforma yeni katıldı.', icon: User, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' });

    return (
      <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center font-black text-white text-4xl md:text-5xl shadow-xl shadow-orange-500/20">
              {String(currentUser.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{currentUser.name || "Kullanıcı"}</h2>
              <div className="text-slate-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" /> {currentUser.email || "E-posta Yok"}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isPremium ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4 mr-2" /> Premium Aktif ({remDays} Gün)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700">Standart Üye</span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Lock className="w-4 h-4 mr-2" /> Yönetici
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* FAP Coin Bölümü */}
          {(() => {
            const todayStr = new Date().toLocaleDateString('tr-TR');
            const dailyEarned = currentUser.lastFapDate === todayStr ? Number(currentUser.dailyFap || 0) : 0;
            const dailyMax = 16;
            const dailyPct = Math.min(100, (dailyEarned / dailyMax) * 100);
            const remainingToday = Math.max(0, dailyMax - dailyEarned);
            const isPremium = isUserPremium(currentUser);
            return (
              <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-col items-center text-center md:items-start md:text-left flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-6 h-6 text-amber-400" />
                      <span className="text-sm font-bold text-amber-500 uppercase tracking-widest">FAP Coin Bakiyesi</span>
                    </div>
                    <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-2">
                      {Number(currentUser.fapCoin || 0).toFixed(1)}
                    </div>
                    <p className="text-slate-400 text-sm max-w-sm">
                      {isPremium
                        ? "Oynadıkça biriktir, mağazadan gerçek ödüller al!"
                        : "FAP Coin kazanmak için Premium üye olman gerekiyor."}
                    </p>
                  </div>
                  {isPremium && (
                    <div className="w-full md:w-64 bg-slate-950/60 rounded-2xl p-5 border border-amber-500/20 shrink-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Bugünkü Kazanım</span>
                        <span className="text-xs font-black text-amber-400">{dailyEarned.toFixed(1)} / {dailyMax} FAP</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${dailyPct}%`,
                            background: dailyPct >= 100
                              ? 'linear-gradient(90deg, #10b981, #34d399)'
                              : 'linear-gradient(90deg, #f59e0b, #f97316)'
                          }}
                        />
                      </div>
                      {dailyPct >= 100 ? (
                        <p className="text-[10px] text-emerald-400 font-bold text-center">✓ Günlük limit doldu, yarın devam!</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 text-center">
                          Bugün {remainingToday.toFixed(1)} FAP daha kazanabilirsin
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                          Her <b className="text-slate-400">10 dk</b> aktif oyun → <b className="text-amber-400">+0.5 FAP</b><br />
                          Günde maks <b className="text-amber-400">16 FAP</b> (32 oturum)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button onClick={() => setActiveTab("rewards")} className="flex-1 sm:flex-none px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg hover:scale-105">
                    Mağazaya Git
                  </button>
                  {!isPremium && (
                    <button onClick={() => setActiveTab("premium")} className="flex-1 sm:flex-none px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-400 font-bold rounded-xl transition-all">
                      <Crown className="w-4 h-4 inline mr-2" />Premium Ol, Kazan
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Toplam Oynama</div>
              <div className="text-2xl font-black text-white">{Number(currentUser.playCount || 0)}</div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Global Sıra</div>
              <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5" /> #{calculateRank(currentUser.playCount || 0)}
              </div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Fikir Önerisi</div>
              <div className="text-2xl font-black text-white">{userFeedbacks.length}</div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center flex flex-col justify-center items-center">
              {!isPremium && <button onClick={() => setActiveTab("premium")} className="text-orange-500 hover:text-orange-400 font-bold text-sm">Premium Al</button>}
              {isPremium && <span className="text-emerald-500 font-bold text-sm">Ayrıcalıklısın!</span>}
            </div>
          </div>

          {currentUser.lastPlayedGameName && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-center gap-3">
              <Gamepad2 className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-slate-300">Son Oynanan: <b className="text-white">{currentUser.lastPlayedGameName}</b></span>
            </div>
          )}

          {/* Oyun İstatistikleri */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-orange-500" /> Oyun İstatistikleri
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GAMES.map(g => {
                const count = currentUser.gamePlayCounts?.[g.id] || 0;
                if (count === 0) return null;
                return (
                  <div key={g.id} className="bg-slate-950 border border-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1 truncate">{g.title}</div>
                    <div className="text-xl font-black text-white">{count} <span className="text-[10px] text-slate-500 font-normal">kez</span></div>
                  </div>
                );
              })}
              {(!currentUser.gamePlayCounts || Object.keys(currentUser.gamePlayCounts).length === 0) && (
                <div className="col-span-full text-sm text-slate-500">Henüz oyun istatistiği yok.</div>
              )}
            </div>
          </div>

          {/* Paylaşım */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="bg-gradient-to-r from-orange-900/20 to-slate-900 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Share2 className="w-5 h-5 text-orange-500" /> Platformu Büyütelim!</h3>
                <p className="text-sm text-slate-400 max-w-md">Forge&Play oyunlarını arkadaşlarına gönder.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={handleSharePlatform} className="flex-1 sm:flex-none px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Davet Et
                </button>
                {(isInstallable || isIOS) && (
                  <button onClick={handleInstallApp} className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Ana Ekrana Ekle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rozetler */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" /> Kazanılan Rozetler
            </h3>
            <div className="flex flex-wrap gap-4">
              {userBadges.map(badge => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.id} className={`flex items-center gap-3 p-3 pr-5 rounded-2xl border ${badge.border} ${badge.bg} transition-all hover:scale-105 cursor-default`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800/50">
                      <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${badge.color}`}>{badge.title}</div>
                      <div className="text-[10px] text-slate-400">{badge.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const approvePremiumTime = async (userId, planCode) => {
      let monthsToAdd = 1;
      if (planCode === "6A") monthsToAdd = 6;
      if (planCode === "1Y") monthsToAdd = 12;
      const u = usersList.find(user => user.id === userId);
      if (!u) return;
      const base = u.premiumEndDate && new Date(u.premiumEndDate) > new Date()
        ? new Date(u.premiumEndDate) : new Date();
      base.setMonth(base.getMonth() + monthsToAdd);
      await updateDoc(doc(db, "users", userId), {
        premiumEndDate: base.toISOString(),
        pendingRequest: null
      }).catch(handleFirebaseError);
    };

    const revokePremium = async (userId) => {
      await updateDoc(doc(db, "users", userId), {
        premiumEndDate: null,
        pendingRequest: null
      }).catch(handleFirebaseError);
    };

    const handleOrderStatus = async (orderId, newStatus, userId, fapCost) => {
      try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        if (newStatus === "İptal/İade Edildi") {
          await updateDoc(doc(db, "users", userId), { fapCoin: increment(fapCost) });
          alert("Sipariş iptal edildi ve coinler iade edildi.");
        } else {
          alert(`Sipariş durumu güncellendi: ${newStatus}`);
        }
      } catch (err) {
        handleFirebaseError(err);
      }
    };

    const handleAddProduct = async (e) => {
      e.preventDefault();

      if (!newProductData.name?.trim() || !newProductData.image?.trim() || !newProductData.desc?.trim()) {
        alert("Lütfen tüm alanları doldurun!");
        return;
      }
      const price = Number(newProductData.price);
      if (isNaN(price) || price <= 0 || price > 100000) {
        alert("Geçerli bir fiyat girin (1 ile 100.000 arasında).");
        return;
      }
      // Görsel URL kontrolü — http/https ile başlamıyorsa da kabul et (CDN vb.)
      const imgUrl = String(newProductData.image).trim();
      if (!imgUrl.startsWith('http')) {
        alert("Görsel URL'i http:// veya https:// ile başlamalıdır.");
        return;
      }

      const productToSave = {
        name: sanitizeText(newProductData.name).substring(0, 150),
        price: price,
        image: imgUrl,
        desc: sanitizeText(newProductData.desc).substring(0, 500),
        type: ["Dijital", "Fiziksel"].includes(newProductData.type) ? newProductData.type : "Dijital",
        isVisible: newProductData.isVisible !== false
      };

      try {
        if (editingProductId) {
          // Update: mevcut dokümanı güncelle, createdAt'e dokunma
          await updateDoc(doc(db, "store_products", editingProductId), productToSave);
          alert(`"${productToSave.name}" başarıyla güncellendi!`);
        } else {
          // Create: createdAt ekle, en üste çıksın (desc sıralama ile)
          await addDoc(collection(db, "store_products"), {
            ...productToSave,
            createdAt: serverTimestamp()
          });
          alert(`"${productToSave.name}" mağazaya eklendi!`);
        }
        // Formu sıfırla
        setNewProductData({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true });
        setEditingProductId(null);
      } catch (err) {
        handleFirebaseError(err);
        console.error("Ürün kayıt hatası:", err?.code, err?.message);
        alert(
          "Ürün kaydedilirken hata oluştu.\n" +
          "Firestore rules 'isAdmin()' kontrolünü geçtiğinizden emin olun.\n" +
          "Hata: " + (err?.code || err?.message || "Bilinmiyor")
        );
      }
    };

    const handleEditProduct = (prod) => {
      setEditingProductId(prod.id);
      setNewProductData({
        name: prod.name || '',
        price: String(prod.price || ''),  // input için string
        image: prod.image || '',
        desc: prod.desc || '',
        type: prod.type || 'Dijital',
        isVisible: prod.isVisible !== false
      });
      // Forma kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Tüm mağaza ürünlerini tek seferde sil
    const handleClearAllProducts = async () => {
      if (storeProducts.length === 0) { alert("Mağazada zaten ürün yok."); return; }
      const confirmed = window.confirm(
        `⚠️ DİKKAT!\n\nMağazadaki ${storeProducts.length} ürünün TAMAMI silinecek.\nBu işlem geri alınamaz!\n\nDevam etmek istiyor musunuz?`
      );
      if (!confirmed) return;
      try {
        // Batch ile hepsini sil
        const { writeBatch } = await import("firebase/firestore");
        const batch = writeBatch(db);
        storeProducts.forEach(prod => batch.delete(doc(db, "store_products", prod.id)));
        await batch.commit();
        alert("Tüm ürünler silindi. Artık admin panelinden yeni ürünler ekleyebilirsiniz.");
      } catch (err) {
        handleFirebaseError(err);
        // Batch import çalışmazsa tek tek sil
        try {
          for (const prod of storeProducts) {
            await deleteDoc(doc(db, "store_products", prod.id));
          }
          alert("Tüm ürünler silindi.");
        } catch (e2) {
          handleFirebaseError(e2);
          alert("Silme işlemi sırasında hata oluştu.");
        }
      }
    };

    const toggleProductVisibility = async (id, currentVisibility) => {
      try {
        await updateDoc(doc(db, "store_products", id), { isVisible: !currentVisibility });
      } catch (err) {
        handleFirebaseError(err);
      }
    };

    const handleDeleteProduct = async (id) => {
      if (window.confirm("Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?")) {
        try {
          await deleteDoc(doc(db, "store_products", id));
        } catch (err) {
          handleFirebaseError(err);
          alert("Ürün silinirken hata oluştu.");
        }
      }
    };

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Yönetici Paneli</h2>
            </div>
            <p className="text-amber-200/60 text-sm">Sadece Kuruculara Özel</p>
          </div>
          <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            {["users", "orders", "products", "test"].map(tab => (
              <button key={tab} onClick={() => setAdminTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === tab ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>
                {{ users: "Kullanıcılar", orders: "Siparişler", products: "Mağaza", test: "Test & Bot" }[tab]}
              </button>
            ))}
          </div>
        </div>

        {adminTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 gap-3">
              <h3 className="font-bold text-white">Kayıtlı Kullanıcılar ({usersList.length})</h3>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  type="text"
                  placeholder="İsim/E-posta..."
                  className="bg-transparent border-none outline-none text-xs text-white ml-2 w-36 md:w-52"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <th className="px-6 py-4 font-semibold">Kullanıcı (Kod)</th>
                    <th className="px-6 py-4 font-semibold text-center">Coin / Oyun</th>
                    <th className="px-6 py-4 font-semibold text-center">Durum</th>
                    <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedUsers.map((user) => {
                    const uPremium = isUserPremium(user);
                    const uRemDays = getRemainingDays(user.premiumEndDate);
                    const isPending = !!user.pendingRequest;
                    return (
                      <tr key={user.id} className={`hover:bg-slate-800/30 transition-colors ${isPending ? "bg-amber-900/10" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{user.name || "Kullanıcı"}</div>
                          <div className="text-[10px] text-slate-400">{user.email || "E-posta yok"}</div>
                          <div className="text-[10px] text-orange-400 font-mono mt-0.5">Kod: {user.paymentCode || "YOK"}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1"><Coins className="w-3.5 h-3.5" /> {Number(user.fapCoin || 0).toFixed(1)}</div>
                          <div className="text-[10px] text-slate-500">{Number(user.playCount || 0)} Oyun</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isPending ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">ÖDEME BEKLİYOR ({user.pendingRequest})</span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${uPremium ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : uRemDays !== null && uRemDays <= 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                {uPremium ? "AKTİF" : uRemDays !== null && uRemDays <= 0 ? "SÜRESİ DOLDU" : "STANDART"}
                              </span>
                            )}
                            {uPremium && !isPending && <span className="text-[10px] text-slate-500">{uRemDays !== null ? uRemDays : 0} gün</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <button onClick={() => approvePremiumTime(user.id, user.pendingRequest)} className="text-[10px] md:text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">Onayla</button>
                                <button onClick={() => revokePremium(user.id)} className="text-[10px] md:text-xs font-bold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">Reddet</button>
                              </>
                            ) : (
                              <>
                                {uPremium && <button onClick={() => revokePremium(user.id)} className="text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Aboneliği İptal"><ShieldAlert className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                <button onClick={() => approvePremiumTime(user.id, "1A")} className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors">+1A</button>
                                <button onClick={() => approvePremiumTime(user.id, "6A")} className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-orange-900/50 hover:bg-orange-800/50 text-orange-300 transition-colors">+6A</button>
                                <button onClick={() => approvePremiumTime(user.id, "1Y")} className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-300 transition-colors">+1Y</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ordersList.map(order => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${order.status === "Onay Bekliyor" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : order.status === "Kargolandı / İletildi" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {order.status}
                    </span>
                    <div className="text-lg font-bold text-white mt-2">{order.productName}</div>
                    <div className="text-xs text-amber-500 font-bold">{Number(order.fapCost)} FAP Harcandı</div>
                  </div>
                  <div className="text-[10px] text-slate-500">{order.displayDate}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm mb-4 space-y-2">
                  <p><span className="text-slate-500">Kullanıcı:</span> <span className="text-white">{order.userName}</span></p>
                  <p><span className="text-slate-500">E-posta:</span> <a href={`mailto:${order.userEmail}`} className="text-blue-400 hover:underline">{order.userEmail}</a></p>
                  {order.productType === "Fiziksel" && (
                    <p className="border-t border-slate-800 pt-2"><span className="text-slate-500 block mb-1">Adres:</span> <span className="text-slate-300">{order.addressDetails}</span></p>
                  )}
                </div>
                {order.status === "Onay Bekliyor" && (
                  <div className="flex gap-3">
                    <button onClick={() => handleOrderStatus(order.id, "Kargolandı / İletildi", order.userId, order.fapCost)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm">Onayla & İlet</button>
                    <button onClick={() => handleOrderStatus(order.id, "İptal/İade Edildi", order.userId, order.fapCost)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-lg transition-colors border border-slate-700 text-sm">Reddet (İade)</button>
                  </div>
                )}
              </div>
            ))}
            {ordersList.length === 0 && (
              <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">Henüz sipariş yok.</div>
            )}
          </div>
        )}

        {adminTab === "products" && (
          <div className="space-y-6">
            <div className={`bg-slate-900 border ${editingProductId ? "border-amber-500" : "border-slate-800"} rounded-2xl p-6 transition-colors`}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {editingProductId ? <Edit className="w-5 h-5 text-amber-500" /> : <Gift className="w-5 h-5 text-emerald-500" />}
                {editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Ürün Adı" value={newProductData.name} onChange={e => setNewProductData({ ...newProductData, name: e.target.value })} maxLength={100} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input required type="number" placeholder="FAP Coin Fiyatı" value={newProductData.price} onChange={e => setNewProductData({ ...newProductData, price: e.target.value })} min="1" max="100000" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input required type="url" placeholder="Görsel URL (https://...)" value={newProductData.image} onChange={e => setNewProductData({ ...newProductData, image: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <select value={newProductData.type} onChange={e => setNewProductData({ ...newProductData, type: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                  <option value="Dijital">Dijital Ürün</option>
                  <option value="Fiziksel">Fiziksel Ürün (Kargo)</option>
                </select>
                <textarea required placeholder="Ürün Açıklaması..." value={newProductData.desc} onChange={e => setNewProductData({ ...newProductData, desc: e.target.value })} maxLength={500} className="col-span-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none min-h-[100px]" />
                <div className="col-span-full flex flex-col sm:flex-row gap-3">
                  <button type="submit" className={`flex-1 py-3 ${editingProductId ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"} text-white font-bold rounded-xl transition-colors`}>
                    {editingProductId ? "Değişiklikleri Kaydet" : "Ürünü Mağazaya Ekle"}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={() => { setEditingProductId(null); setNewProductData({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true }); }} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">İptal</button>
                  )}

                </div>
              </form>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-400">
                Mağazadaki Ürünler{" "}
                <span className="text-white">({storeProducts.length})</span>
                {storeProducts.length > 0 && (
                  <span className="ml-2 text-[10px] text-emerald-400 font-normal">En yeni üste gösterilir</span>
                )}
              </h3>
              {storeProducts.length > 0 && (
                <button
                  onClick={handleClearAllProducts}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl transition-colors text-xs"
                >
                  <Trash className="w-3.5 h-3.5" /> Tüm Mağazayı Temizle
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {storeProducts.length === 0 ? (
                <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">Henüz ürün yok.</div>
              ) : storeProducts.map(prod => {
                const isVis = prod.isVisible !== false;
                return (
                  <div key={prod.id} className={`bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col ${!isVis ? "opacity-50 grayscale" : ""}`}>
                    <div className="relative h-32 overflow-hidden rounded-lg mb-3 shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" loading="lazy" />
                      {!isVis && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-white text-xs tracking-widest">GİZLİ</div>}
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">{prod.desc}</p>
                    <div className="text-amber-500 font-bold text-sm mb-3 flex items-center gap-1"><Coins className="w-4 h-4" /> {Number(prod.price)} FAP</div>
                    <div className="mt-auto grid grid-cols-3 gap-2">
                      <button onClick={() => toggleProductVisibility(prod.id, isVis)} className={`py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center border ${isVis ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"}`}>
                        {isVis ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleEditProduct(prod)} className="py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-blue-500/20 flex items-center justify-center">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-red-500/20 flex items-center justify-center">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {adminTab === "test" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Test Araçları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500" /> Bakiye Test</h4>
                <p className="text-xs text-slate-400 mb-4">Admin hesabına 10.000 FAP Coin yükler (mağaza testi için).</p>
                <button onClick={async () => {
                  if (currentUser) {
                    await updateDoc(doc(db, "users", currentUser.id), { fapCoin: 10000 }).catch(handleFirebaseError);
                    alert("10.000 FAP Coin yüklendi!");
                  }
                }} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors">10.000 Coin Yükle</button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-500" /> Simülasyon Botu</h4>
                <p className="text-xs text-slate-400 mb-4">Arka planda oyun oynayan, coin kazanan ve feedback gönderen test botu.</p>
                <button onClick={toggleBotSimulation} className={`w-full py-3 font-bold rounded-xl transition-colors ${isBotRunning ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                  {isBotRunning ? "Botu Durdur" : "Test Botunu Başlat"}
                </button>
                {isBotRunning && <p className="text-[10px] text-emerald-400 mt-2 text-center animate-pulse">Bot aktif çalışıyor...</p>}
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm"><Info className="w-4 h-4 text-amber-500" /> Bot Hakkında</h4>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li><b className="text-white">Her 30 saniye</b> = 10 dakikalık oyun oturumunu simüle eder</li>
                <li>Coin kazanımı <b className="text-white">handleEarnFapCoin</b> üzerinden geçer — günlük 16 coin limiti uygulanır</li>
                <li>%25 ihtimalle [BOT TEST] feedback gönderir (fikir kutusu testi için)</li>
                <li>Sadece aktif oyun olan oyunlar seçilir</li>
                <li>Admin hesabı üzerinden çalışır — Firestore kurallarıyla uyumlu</li>
                <li>Durdurunca veriler kalır (gerçekçi test verileri)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // ANA RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 flex flex-col overflow-x-hidden w-full">
      {renderInstallGuideModal()}
      {renderTrialPromptModal()}
      {renderPremiumWarningModal()}
      {playingGame && renderPlayerOverlay()}
      {renderNavbar()}
      {showLoginModal && renderLoginModal()}
      {paymentIntent && renderPaymentCodeModal()}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12">
        {activeTab === "store" && renderStore()}
        {activeTab === "rewards" && renderRewardsStore()}
        {activeTab === "library" && renderLibrary()}
        {activeTab === "premium" && renderPremiumPage()}
        {activeTab === "lab" && renderLab()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "feedback" && renderFeedback()}
        {/* DÜZELTİLDİ: Admin sayfası — çift kontrol: state + fonksiyon */}
        {activeTab === "admin" && isAdmin && renderAdminDashboard()}
      </main>

      <footer className="hidden md:block border-t border-slate-800 bg-slate-950 py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0 font-bold">
            <img src={LOGO_URL} alt="Forge&Play" className="w-6 h-6 object-contain" />
            <span>© 2026 Forge&Play. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="mailto:forgeandplay@gmail.com" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Mail className="w-3.5 h-3.5" /> İletişim / Destek
            </a>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><Smartphone className="w-3.5 h-3.5" /> App Store'da Yakında</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><Play className="w-3.5 h-3.5" /> Play Store'da Yakında</span>
          </div>
        </div>
      </footer>

      {renderMobileBottomNav()}

      <style dangerouslySetInnerHTML={{
        __html: `
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #020617; }
          ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #f97316; }
          html, body, #root {
            max-width: 100vw;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
            background-color: #020617;
          }
          .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        `
      }} />
    </div>
  );
}
