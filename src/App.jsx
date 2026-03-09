import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Gamepad2,
  Library,
  FlaskConical,
  Search,
  User,
  Play,
  Info,
  ChevronRight,
  Sparkles,
  Wallet,
  X,
  Lock,
  LogOut,
  CalendarDays,
  CheckCircle2,
  ShieldAlert,
  MessageCircle,
  Film,
  HelpCircle,
  Lightbulb,
  MessageSquarePlus,
  Send,
  AlertTriangle,
  Trophy,
  Mail,
  Copy,
  Check,
  Crown,
  Zap,
  HeartHandshake,
  Star
} from "lucide-react";

// --- FIREBASE IMPORTLARI ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

/* =========================================================================
   ⚠️ DİKKAT: AŞAĞIDAKİ ALANA KENDİ FIREBASE BİLGİLERİNİ YAPIŞTIRMALISIN
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyADpeblSXUI9-DpP1J6rX79TLAJ-A-jEm0",
  authDomain: "forge-and-play.firebaseapp.com",
  projectId: "forge-and-play",
  storageBucket: "forge-and-play.firebasestorage.app",
  messagingSenderId: "728405020113",
  appId: "1:728405020113:web:2fc64f47aa355cb5f7a4f0"
};

// Config kontrolü
const isFirebaseConfigured = firebaseConfig.apiKey !== "BURAYA_GELECEK";

/* =========================================================================
   👑 ADMİN E-POSTA TANIMLAMALARI (Güvenlik: Sabit kodlanmış admin listesi)
   ========================================================================= */
const ADMIN_EMAILS = [
  "forgeandplay@gmail.com",
  "carkci.caner@gmail.com"
].map(email => email.toLowerCase().trim());

/* =========================================================================
   💳 ÖDEME LİNKLERİ
   ========================================================================= */
const PAYMENT_LINKS = {
  "1A": "https://www.shopier.com/forgeandplay/44689059",
  "6A": "https://www.shopier.com/forgeandplay/44689160",
  "1Y": "https://www.shopier.com/forgeandplay/44689235"
};

const LOGO_URL = "https://i.ibb.co/HppdF5nY/freepik-minimal-futuristic-gaming-logo-forge-hammer-combin-64278.png";

let app, auth, db, googleProvider;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

/* ---------------------------------------------
    OYUN VERİLERİ (MOCK DATA)
---------------------------------------------- */
const GAMES = [
  {
    id: "vampir-koylu",
    title: "Vampir Köylü",
    status: "Yayında",
    type: "live",
    tags: ["Parti", "Çok Oyunculu", "Gizem"],
    description: "Konuş, şüphelen, oyla: Vampirleri bul, kasabayı kurtar. Yönetici kasabayı kurar, vampir sayısını belirler ve kaderleri dağıtır; oyun gece–gündüz döngüsü ile ilerler.",
    price: "Ücretsiz Oyna",
    basePlayers: 1240,
    gradient: "from-red-900 via-rose-950 to-black",
    iconKey: "user",
    url: "https://vampir-oyunu.vercel.app/",
    image: "https://i.ibb.co/KxP67Mm1/Ba-l-ks-z-4.png",
    requiresPremium: false,
  },
  {
    id: "monopoly-bank",
    title: "Monopoly Dijital Banka",
    status: "Yayında",
    type: "live",
    tags: ["Araç", "Masa Oyunu", "Finans"],
    description: "Odanı kur, arkadaşlarını davet et, dijital Monopoly rekabetini başlat. Kağıt paralarla uğraşmaya son! Arkadaşlarınızla Monopoly oynarken kasanızı dijital olarak yönetin.",
    price: "Premium İçerik",
    basePlayers: 345,
    gradient: "from-emerald-900 via-teal-950 to-black",
    iconKey: "wallet",
    url: "https://siprayt-monopoly.vercel.app/",
    image: "https://i.ibb.co/RGmKfVY8/freepik-3d-cinematic-monopoly-style-board-game-world-comin-87944.png",
    requiresPremium: true,
  },
  {
    id: "tabu",
    title: "Tabu",
    status: "Yayında",
    type: "live",
    tags: ["Parti", "Kelime Oyunu", "Takım"],
    description: "Yasaklı kelimeleri kullanmadan takım arkadaşlarına gizli kelimeyi anlatmaya çalış. Süre dolmadan en çok kelimeyi bilen takım kazanır!",
    price: "Premium İçerik",
    basePlayers: 890,
    gradient: "from-orange-900 via-rose-950 to-black",
    iconKey: "message",
    url: "https://tabu-game-three.vercel.app/",
    image: "https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "pis-yedili",
    title: "Pis 7'li",
    status: "Yayında",
    type: "live",
    tags: ["Kart Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Klasik kart oyunu Pis 7'li şimdi dijitalde! Arkadaşlarınla toplan ve Forge&Play tarafından sunulan bu rekabetçi kart oyununda hünerlerini sergile.",
    price: "Ücretsiz Oyna",
    basePlayers: 1560,
    gradient: "from-fuchsia-900 via-purple-950 to-black",
    iconKey: "user",
    url: "https://pis7li-oyunu.vercel.app/",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "forge-play-quiz",
    title: "Forge&Play Quiz",
    status: "Yayında",
    type: "live",
    tags: ["Bilgi", "Yarışma", "Zeka"],
    description: "Genel kültürünü sına, arkadaşlarınla yarış! Forge&Play'e özel hazırlanan bu bilgi yarışmasıyla liderlik tablosuna adını yazdır.",
    price: "Premium İçerik",
    basePlayers: 420,
    gradient: "from-indigo-900 via-blue-950 to-black",
    iconKey: "help",
    url: "https://forge-and-play-quiz.vercel.app/",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "sessiz-sinema",
    title: "Sessiz Sinema",
    status: "Yakında",
    type: "upcoming",
    tags: ["Parti", "Eğlence", "Rol Yapma"],
    description: "Hiç konuşmadan, sadece hareketlerinle en zorlu filmleri takımına anlat. Klasik sessiz sinema eğlencesi şimdi dijital ortamda.",
    price: "Geliştiriliyor",
    basePlayers: 0,
    gradient: "from-blue-900 via-cyan-950 to-black",
    iconKey: "film",
    url: null,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
];

const LAB_PROJECTS = [
  {
    id: "ai-story",
    title: "AI Zindan Ustası (D&D)",
    progress: 45,
    status: "Geliştiriliyor",
    description: "Yapay zekanın oyun yöneticisi olduğu, sınırsız senaryoya sahip RPG deneyimi.",
    gradient: "from-orange-900 to-slate-900",
  },
  {
    id: "life-path",
    title: "LifePath Simulator",
    progress: 80,
    status: "Beta Yakında",
    description: "Hayatın iplerini eline al. Kendi yolunu çizeceğin yeni nesil yaşam simülasyonu.",
    gradient: "from-amber-900 to-slate-900",
  },
];

const focusStyles = "focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950";

/* ---------------------------------------------
    KÜFÜR FİLTRESİ SÖZLÜĞÜ - Genişletildi
---------------------------------------------- */
const BAD_WORDS = [
  "amk", "aq", "sg", "siktir", "yavşak", "oç", "orospu", "piç", "ibne",
  "göt", "sik", "yarrak", "am", "meme", "sikik", "amcık", "orospu çocuğu",
  "ananı", "bacı", "pezevenk", "gerizekalı", "salak", "aptal"
];

// Güvenlik: Metin temizleme (XSS koruması)
const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // HTML taglarını kaldır
    .replace(/[{}[\]()]/g, '') // JSON benzeri yapıları temizle
    .trim();
};

// Küfür kontrolü
const containsProfanity = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

/* ---------------------------------------------
    YARDIMCI (HELPER) FONKSİYONLAR
---------------------------------------------- */

// Güvenli admin kontrolü
const isUserAdmin = (user) => {
  if (!user || !user.email) return false;
  if (user.role === "admin") return true;
  const userEmail = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(userEmail);
};

// Güvenli premium kontrolü
const isUserPremium = (user) => {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  if (!user.premiumEndDate) return false;
  try {
    return new Date(user.premiumEndDate) > new Date();
  } catch {
    return false;
  }
};

const getRemainingDays = (dateString) => {
  if (!dateString) return null;
  try {
    const diffTime = new Date(dateString) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

// Rate limiter (bot koruması)
const createRateLimiter = (maxAttempts = 5, timeWindow = 60000) => {
  const attempts = new Map();
  return (key) => {
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];
    const recent = userAttempts.filter(time => now - time < timeWindow);
    if (recent.length >= maxAttempts) return false;
    recent.push(now);
    attempts.set(key, recent);
    return true;
  };
};

const feedbackRateLimiter = createRateLimiter(3, 60000); // 1 dk'da 3 feedback
const loginRateLimiter = createRateLimiter(5, 300000);  // 5 dk'da 5 login

/* ---------------------------------------------
    ICON MAP
---------------------------------------------- */
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

/* ---------------------------------------------
    CANLI OYUNCU SAYACI
---------------------------------------------- */
function LivePlayerCount({ base }) {
  const [count, setCount] = useState(base);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (base === 0) return;
    const interval = setInterval(() => {
      if (mounted.current) {
        const fluctuation = Math.floor(Math.random() * 9) - 3;
        setCount(prev => Math.max(base - 50, Math.min(base + 50, prev + fluctuation)));
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

/* ---------------------------------------------
    FEEDBACK FORMU BİLEŞENİ (Bot korumalı)
---------------------------------------------- */
const FeedbackForm = ({ currentUser, onSubmit }) => {
  const [text, setText] = useState("");
  const [game, setGame] = useState("Vampir Köylü");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  // Honeypot alanı (botlar doldurur)
  const [honeypot, setHoneypot] = useState("");
  // Basit matematik sorusu
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    return { a, b, answer: a + b };
  });

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setCharCount(newText.length);
    if (newText.length <= 500) setText(newText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Honeypot kontrolü
    if (honeypot) {
      setError("Bot tespit edildi.");
      return;
    }

    // Matematik kontrolü
    if (parseInt(mathAnswer) !== mathQuestion.answer) {
      setError("Matematik sorusunu doğru cevaplayın.");
      return;
    }

    if (!currentUser) {
      setError("Giriş yapmalısınız.");
      return;
    }

    if (!text.trim() || text.length < 10) {
      setError("Fikir en az 10 karakter olmalıdır.");
      return;
    }

    if (containsProfanity(text)) {
      setError("Uygunsuz kelime tespit edildi.");
      return;
    }

    if (!feedbackRateLimiter(currentUser.id)) {
      setError("Çok fazla fikir gönderdiniz, lütfen bekleyin.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        text: sanitizeText(text),
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
      {/* Honeypot - gizli alan */}
      <div className="hidden">
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Oyun Seç
        </label>
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
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Fikriniz
        </label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Oyun hakkındaki fikirlerinizi, önerilerinizi veya karşılaştığınız sorunları yazın..."
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

      {/* Basit matematik sorusu (bot koruması) */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Bot değilseniz, lütfen şu işlemin sonucunu yazın: {mathQuestion.a} + {mathQuestion.b} = ?
        </label>
        <input
          type="number"
          value={mathAnswer}
          onChange={(e) => setMathAnswer(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className={`w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Fikri Gönder
          </>
        )}
      </button>
    </form>
  );
};

/* ---------------------------------------------
    ANA UYGULAMA BİLEŞENİ
---------------------------------------------- */
export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center space-y-4 shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-white">Firebase Kurulumu Bekleniyor</h1>
          <p className="text-slate-400 text-sm">
            Platformu görüntüleyebilmek için <b>App.jsx</b> dosyasındaki <code>firebaseConfig</code> objesinin içerisine kendi Firebase anahtarlarını yapıştırmalısın.
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("store");
  const [playingGame, setPlayingGame] = useState(null);
  const [selectedLibraryGame, setSelectedLibraryGame] = useState(GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminTab, setAdminTab] = useState("users");
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const featuredGames = useMemo(() => GAMES.filter(g => g.status === "Yayında"), []);
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter(g => `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase().includes(q));
  }, [searchQuery]);

  const sortedUsers = useMemo(() => {
    const list = [...usersList].sort((a, b) => {
      if (a.pendingRequest && !b.pendingRequest) return -1;
      if (!a.pendingRequest && b.pendingRequest) return 1;
      return 0;
    });
    const q = adminSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [usersList, adminSearch]);

  const isAdmin = currentUser ? isUserAdmin(currentUser) : false;

  // Kullanıcı durumu dinleyicisi
  useEffect(() => {
    if (!auth) return;
    let unsubscribeUser = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
            const userEmail = firebaseUser.email?.toLowerCase().trim() || "";
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
              if (Object.keys(updates).length > 0) {
                await updateDoc(userRef, updates).catch(console.error);
                Object.assign(userData, updates);
              }
              setCurrentUser({ id: firebaseUser.uid, ...userData });
            } else {
              const paymentCode = "FP-" + firebaseUser.uid.substring(0, 4).toUpperCase();
              const safeName = sanitizeText(firebaseUser.displayName || userEmail.split("@")[0] || "Oyuncu");
              const newUser = {
                name: safeName,
                email: userEmail,
                role: isAdminEmail ? "admin" : "user",
                premiumEndDate: isAdminEmail ? new Date("2099-01-01").toISOString() : null,
                pendingRequest: null,
                playCount: 0,
                paymentCode,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              };
              await setDoc(userRef, newUser);
              setCurrentUser({ id: firebaseUser.uid, ...newUser });
            }
            setAuthLoading(false);
          });
        } catch (error) {
          console.error("User snapshot error:", error);
          setAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Feedback ve kullanıcı listesi dinleyicileri
  useEffect(() => {
    if (!db) return;
    const unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "feedbacks"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const fbList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        setFeedbacks(fbList);
      },
      console.error
    );

    let unsubscribeUsers = null;
    if (isAdmin) {
      unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, console.error);
    }

    return () => {
      unsubscribeFeedbacks();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [isAdmin]);

  // Oyun açma
  const openGame = useCallback(async (game) => {
    if (!game) return;
    if (game.requiresPremium && !isUserPremium(currentUser)) {
      setShowPricingModal(true);
      return;
    }
    if (!game.url) {
      alert("Bu oyun henüz yayında değil.");
      return;
    }
    setPlayingGame(game);
    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.id), {
          playCount: (currentUser.playCount || 0) + 1,
          lastPlayed: serverTimestamp()
        });
      } catch (error) {
        console.error("Play count update failed:", error);
      }
    }
  }, [currentUser]);

  const getSecureGameUrl = useCallback((baseUrl) => {
    if (!baseUrl) return "";
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("source", "forgeandplay");
      url.searchParams.set("userId", currentUser?.id || "guest");
      return url.toString();
    } catch {
      return baseUrl;
    }
  }, [currentUser]);

  // Login işlemleri
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const email = emailInput.trim().toLowerCase();
    if (!email || !passwordInput) {
      setAuthError("E-posta ve şifre boş bırakılamaz.");
      return;
    }
    if (!loginRateLimiter(email)) {
      setAuthError("Çok fazla başarısız deneme. Lütfen 5 dakika bekleyin.");
      return;
    }
    try {
      if (isRegistering) {
        if (passwordInput.length < 6) {
          setAuthError("Şifre en az 6 karakter olmalıdır.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, email, passwordInput);
      }
      setShowLoginModal(false);
      setPasswordInput("");
      setEmailInput("");
    } catch (error) {
      console.error("Login error:", error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAuthError("Bu e-posta adresi zaten kullanılıyor.");
          break;
        case 'auth/invalid-email':
          setAuthError("Geçersiz e-posta adresi.");
          break;
        case 'auth/user-disabled':
          setAuthError("Bu hesap devre dışı bırakılmış.");
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setAuthError("E-posta veya şifre hatalı.");
          break;
        case 'auth/too-many-requests':
          setAuthError("Çok fazla başarısız deneme. Hesabınız geçici olarak kilitlendi.");
          break;
        default:
          setAuthError("Giriş yapılırken bir hata oluştu.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Google login error:", error);
      setAuthError(error.code === 'auth/popup-closed-by-user' ? "Giriş penceresi kapatıldı." : "Google ile giriş yapılamadı.");
    }
  };

  const handlePasswordReset = async () => {
    if (!emailInput) {
      setAuthError("Şifre sıfırlama için e-posta adresinizi girin.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailInput);
      setAuthError("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      setShowResetPassword(false);
    } catch (error) {
      console.error("Password reset error:", error);
      setAuthError("Şifre sıfırlama e-postası gönderilemedi.");
    }
  };

  // Satın alma talebi
  const handlePurchaseRequest = async (plan) => {
    if (!currentUser) {
      setShowPricingModal(false);
      setShowLoginModal(true);
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        pendingRequest: plan,
        lastPurchaseAttempt: serverTimestamp()
      });
      const paymentUrl = PAYMENT_LINKS[plan];
      if (paymentUrl) {
        setShowPricingModal(false);
        setPaymentIntent({ url: paymentUrl, plan });
      } else {
        alert("Bu plan için ödeme linki henüz tanımlanmadı.");
      }
    } catch (error) {
      console.error("Purchase request error:", error);
      alert("Satın alma talebi oluşturulurken bir hata oluştu.");
    }
  };

  // Feedback gönderme
  const handleFeedbackSubmit = async (feedbackData) => {
    if (!currentUser) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        ...feedbackData,
        userId: currentUser.id,
        user: currentUser.name || currentUser.email,
        email: currentUser.email,
        status: "beklemede",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('tr-TR')
      });
    } catch (error) {
      console.error("Feedback submit error:", error);
      throw error;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Oyun overlay
  if (playingGame) {
    const isLockedPremium = playingGame.requiresPremium && !isUserPremium(currentUser);
    const secureUrl = getSecureGameUrl(playingGame.url);

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
        <div className="flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-slate-950 border-b border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 md:gap-3 text-white font-bold truncate">
            <div className="flex bg-slate-900 p-1.5 rounded-md border border-slate-800 shadow-sm shadow-orange-500/20">
              <img src={LOGO_URL} alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            </div>
            <span className="inline tracking-tight">Forge<span className="text-orange-500">&</span>Play</span>
            <span className="hidden sm:inline text-slate-600 select-none">|</span>
            <span className="text-xs md:text-sm text-slate-300 font-medium truncate flex items-center gap-2">
              <span className="hidden sm:inline">Oynanıyor:</span>
              <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{playingGame.title}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={() => setPlayingGame(null)}
              autoFocus
              className={`flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${focusStyles}`}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Oyundan Çık</span>
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
          {isLockedPremium ? (
            <div className="text-center space-y-6 p-6 max-w-md bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
              <Lock className="w-16 h-16 text-amber-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Premium İçerik</h2>
              <p className="text-slate-400"><b>{playingGame.title}</b> içeriğini kullanabilmek için aktif aboneliğiniz olmalıdır.</p>
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => {setPlayingGame(null); setActiveTab("premium");}}
                  className={`flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 font-bold transition-colors ${focusStyles}`}
                >
                  <Sparkles className="w-5 h-5" /> Abonelik Planlarını Gör
                </button>
                <button
                  onClick={() => setPlayingGame(null)}
                  className={`w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold ${focusStyles}`}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          ) : playingGame.url ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
              <iframe
                src={secureUrl}
                className="w-full h-full border-none outline-none"
                style={{ width: "100%", height: "100%", display: "block" }}
                title={playingGame.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone; camera; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-center space-y-4 p-6">
              <FlaskConical className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-400">Oyun Henüz Hazır Değil</h2>
              <button
                onClick={() => setPlayingGame(null)}
                className={`mt-4 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold ${focusStyles}`}
              >
                Geri Dön
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal render'ları
  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative">
        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
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
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center font-bold">
            {authError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta Adresi</label>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="ornek@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
          </div>

          {!isRegistering && (
            <div className="text-right">
              <button type="button" onClick={() => setShowResetPassword(true)} className="text-xs text-orange-500 hover:text-orange-400">
                Şifremi Unuttum
              </button>
            </div>
          )}

          {showResetPassword && (
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir.</p>
              <button type="button" onClick={handlePasswordReset} className="text-sm font-bold text-orange-500 hover:text-orange-400">
                Bağlantı Gönder
              </button>
            </div>
          )}

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 mt-2">
            {isRegistering ? "Kayıt Ol ve Başla" : "Giriş Yap"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-medium">veya</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-colors mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google ile {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
        </button>

        <p className="text-center text-sm text-slate-400">
          {isRegistering ? "Zaten hesabın var mı?" : "Henüz hesabın yok mu?"}{" "}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-orange-500 font-bold hover:text-orange-400 transition-colors" type="button">
            {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </button>
        </p>
      </div>
    </div>
  );

  const renderPricingCards = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Paket 1 */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col hover:border-orange-500/30 transition-all relative">
        <h3 className="text-xl font-bold text-white mb-2">Aylık Bilet</h3>
        <p className="text-slate-500 text-sm mb-6 h-10">Kısa süreli deneme ve tek bir oyun gecesi için ideal.</p>
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">39₺</span>
          <span className="text-slate-500 text-sm font-medium">/ ay</span>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-300 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="pt-0.5">Tüm Premium oyunlara erişim</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("1A")} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Seç ve Başla</button>
      </div>

      {/* Paket 2 */}
      <div className="bg-gradient-to-b from-amber-900/40 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 md:p-8 flex flex-col transform lg:-translate-y-4 shadow-2xl shadow-amber-500/20 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">EN POPÜLER</div>
        <h3 className="text-2xl font-bold text-white mb-2">Sezonluk Kart</h3>
        <p className="text-amber-200/60 text-sm mb-6 h-10">Düzenli oyuncular için harika bir tasarruf fırsatı.</p>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">179₺</span><span className="text-slate-400 text-sm line-through">234₺</span>
        </div>
        <div className="text-amber-400 text-sm mb-6 font-bold flex items-center gap-1"><Sparkles className="w-4 h-4" /> %23 İndirim (Aylık 29.8₺)</div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /><span className="pt-0.5">Tüm Premium özellikler</span></li>
          <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" /><span className="pt-0.5">Özel rozet ve sıralama</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("6A")} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">6 Ay İçin Satın Al</button>
      </div>

      {/* Paket 3 */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col hover:border-amber-500/50 transition-all relative">
        <div className="absolute top-5 right-5 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded text-xs font-black border border-amber-500/20">%36 İNDİRİM</div>
        <h3 className="text-xl font-bold text-white mb-2">1 Yıllık Efsane</h3>
        <p className="text-slate-500 text-sm mb-6 h-10">En yüksek indirimi ve statüyü kap.</p>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">299₺</span><span className="text-slate-500 text-sm line-through">468₺</span>
        </div>
        <div className="text-amber-500 text-sm mb-6 font-bold flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Aylık 24.9₺</div>
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-300 items-start"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /><span className="pt-0.5">Tüm Premium özellikler</span></li>
        </ul>
        <button onClick={() => handlePurchaseRequest("1Y")} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-amber-500/30 hover:border-amber-500">Kalıcı Destekçi Ol</button>
      </div>
    </div>
  );

  const renderPaymentCodeModal = () => {
    if (!paymentIntent || !currentUser) return null;

    const handleCopyCode = () => {
      try {
        navigator.clipboard.writeText(currentUser.paymentCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Kopyalama hatası', err);
      }
    };

    return (
      <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={() => setPaymentIntent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">Çok Önemli Bir Adım!</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Ödemenizin hesabınıza anında tanımlanabilmesi için Shopier ekranındaki <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">"Sipariş Notu"</strong> kısmına aşağıdaki size özel kodu yazmanız gerekmektedir.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between shadow-inner">
            <span className="text-2xl md:text-3xl font-mono font-black text-orange-400 tracking-wider pl-2">{currentUser.paymentCode}</span>
            <button
              onClick={handleCopyCode}
              className={`p-3 rounded-lg transition-colors flex items-center justify-center border ${isCopied ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700"}`}
              title="Kodu Kopyala"
            >
              {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={() => { window.open(paymentIntent.url, "_blank"); setPaymentIntent(null); }}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 text-lg transform hover:scale-[1.02]"
          >
            Kopyaladım, Ödemeye Geç
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderPricingModal = () => (
    <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl p-6 md:p-10 shadow-2xl relative my-auto">
        <button onClick={() => setShowPricingModal(false)} className="absolute top-4 md:top-6 right-4 md:right-6 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 md:mb-12 max-w-2xl mx-auto mt-4 md:mt-0">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-md">Maceraya Kesintisiz Devam Et</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">Premium abonelik ile Monopoly Dijital Banka dahil tüm araçlara anında erişim sağla.</p>
        </div>

        {renderPricingCards()}

        {!currentUser && (
          <div className="mt-8 text-center text-sm text-slate-400">Satın almak için önce <button className="text-orange-500 font-bold hover:text-orange-400" onClick={() => { setShowPricingModal(false); setShowLoginModal(true); }}>giriş yap</button>.</div>
        )}
      </div>
    </div>
  );

  // Sayfa render'ları
  const renderStore = () => {
    const slideList = featuredGames;
    return (
      <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
        <section className={`relative group cursor-pointer rounded-3xl ${focusStyles} overflow-hidden h-[450px] md:h-[500px] lg:h-[550px] shadow-2xl shrink-0`} tabIndex={0} onClick={() => slideList.length && openGame(slideList[currentSlide])} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); slideList.length && openGame(slideList[currentSlide]); } }}>
          {!slideList.length ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="text-center space-y-3 p-6">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="text-white font-black text-2xl">Öne çıkan içerik yok</div>
              </div>
            </div>
          ) : (
            <>
              {slideList.map((game, idx) => (
                <div key={game.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"}`}>
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
                        <span className={`${currentSlide === idx ? "animate-pulse" : ""} bg-red-500/20 text-red-400 border border-red-500/30 text-xs md:text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm`}>Öne Çıkan</span>
                        {game.requiresPremium && <span className="bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight leading-tight line-clamp-2">{game.title}</h1>
                      <p className="text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl line-clamp-3">{game.description}</p>

                      <div className="pt-2">
                        <LivePlayerCount base={game.basePlayers} />
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2 md:pt-4">
                        <button tabIndex={-1} className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shrink-0 ${game.requiresPremium && !isUserPremium(currentUser) ? "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}`} onClick={(e) => { e.stopPropagation(); if (game.requiresPremium && !isUserPremium(currentUser)) { setShowPricingModal(true); return; } openGame(game); }}>
                          <Play className="w-5 h-5 fill-current" />
                          {game.requiresPremium && !isUserPremium(currentUser) ? "Premium Al" : game.id === "monopoly-bank" ? "Sistemi Başlat" : "Hemen Oyna"}
                        </button>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center justify-center w-[220px] h-[220px] xl:w-[260px] xl:h-[260px] shrink-0 bg-slate-950/80 rounded-full border-4 border-slate-800/50 backdrop-blur-md shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                      <GameIcon iconKey={game.iconKey} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slideList.map((_, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" : "w-2 bg-slate-500/50 hover:bg-slate-400"}`} />
                ))}
              </div>
            </>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-500" /> Platform Projeleri</h2>
            <div className="md:hidden flex items-center bg-slate-900/60 border border-slate-800 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ara..." className="bg-transparent outline-none border-none text-sm text-white ml-2 w-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGames.map((game) => {
              const locked = game.requiresPremium && !isUserPremium(currentUser);
              return (
                <div key={game.id} tabIndex={0} onClick={() => { if (locked && game.url) { setShowPricingModal(true); return; } openGame(game); }} className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] cursor-pointer flex flex-col ${focusStyles}`}>
                  <div className={`h-32 md:h-40 bg-gradient-to-br ${game.gradient} p-4 md:p-6 flex flex-col justify-between relative overflow-hidden`}>
                    {game.image && <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-60 transition-all transform group-hover:scale-110 duration-500 z-0 pointer-events-none" />}
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500 z-10"><GameIcon iconKey={game.iconKey} className="w-12 h-12" /></div>
                    <div className="flex justify-between items-start z-10 relative">
                      <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full ${game.type === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm" : "bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm"}`}>{game.status}</span>
                      {game.requiresPremium && <span className="bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white z-10 drop-shadow-md relative">{game.title}</h3>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col z-10 bg-slate-900">
                    <p className="text-slate-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 flex-1">{game.description}</p>
                    <LivePlayerCount base={game.basePlayers} />
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-semibold text-white">{game.price}</span>
                      </div>
                      <button tabIndex={-1} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${game.url ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        {game.url ? (locked ? "Premium Al" : "Oyna") : "İncele"}
                      </button>
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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-in fade-in duration-500">
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
              <div className="mt-auto pt-8 border-t border-slate-800">
                <button onClick={() => { if (selectedLibraryGame.requiresPremium && !isUserPremium(currentUser)) { setShowPricingModal(true); } else { openGame(selectedLibraryGame); } }} className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  {selectedLibraryGame.requiresPremium && !isUserPremium(currentUser) ? "Premium Alarak Oyna" : "Şimdi Oyna"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full flex-1">
            <Library className="w-12 h-12 mb-4 opacity-50" />
            <p>Oynamak için sol taraftan bir oyun seçin</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden">
        <FlaskConical className="w-16 h-16 text-orange-500 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Geliştirme Laboratuvarı</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Burada geleceğin oyunlarını ve AI deneyimlerini tasarlıyoruz. Geliştirme aşamasındaki projelerimize göz at ve ilerlemeyi takip et.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LAB_PROJECTS.map(proj => (
          <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:border-slate-700 transition-all group">
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
                <span>Tamamlanma</span>
                <span>%{proj.progress}</span>
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

  const renderPremiumPage = () => (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Hero Alanı */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] text-center p-8 md:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 pointer-events-none"></div>
        <div className="relative z-10">
          <Crown className="w-16 h-16 md:w-20 md:h-20 text-amber-500 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Oyun Deneyimini <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Zirveye Taşı</span></h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Forge&Play Premium ile sınırları kaldırın. En popüler parti oyunlarına ve gelişmiş dijital masa araçlarına kesintisiz erişim sağlayın.
          </p>
        </div>
      </div>

      {/* Avantajlar Grid */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Neden Premium?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Lock, title: "Sınırsız Erişim", desc: "Monopoly Banka, Tabu ve Quiz gibi tüm kilitli Premium oyunları anında açın.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Crown, title: "Özel Rozet", desc: "Profilinizde ve skor tablolarında size özel altın rengi Premium rozetini taşıyın.", color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: Zap, title: "Erken Erişim", desc: "Laboratuvarda geliştirilen yeni oyunları herkesden önce ilk siz deneyin.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: HeartHandshake, title: "Projeye Destek", desc: "Bağımsız geliştiriciye destek olarak platformun daha hızlı büyümesini sağlayın.", color: "text-rose-400", bg: "bg-rose-500/10" },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-colors">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Satın Alma Adımları */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Nasıl Premium Olurum?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-slate-800"></div>
          {[
            { step: "1", title: "Planınızı Seçin", desc: "Aşağıdaki tablodan size en uygun abonelik süresini belirleyin." },
            { step: "2", title: "Kodunuzu Kopyalayın", desc: "Sistemin size verdiği eşsiz 4 haneli güvenlik kodunu kopyalayın." },
            { step: "3", title: "Not Olarak Ekleyin", desc: "Shopier ödeme sayfasındaki 'Sipariş Notu' kısmına kodunuzu yapıştırın." }
          ].map((item, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
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
            <CheckCircle2 className="w-5 h-5" /> Kodunuzu eklediğinizde ödemeniz sistem tarafından eşleştirilir ve anında onaylanır.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Maceraya Başla</h2>
          <p className="text-slate-400">Hemen bir plan seçin ve oyun gecelerini mükemmelleştirin.</p>
        </div>
        {renderPricingCards()}
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
      userBadges.push({ id: 'gamer_pro', title: 'Efsanevi Oyuncu', desc: 'Platformda 50+ oyun oynadı.', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' });
    } else if ((currentUser.playCount || 0) >= 10) {
      userBadges.push({ id: 'gamer_mid', title: 'Sıkı Oyuncu', desc: 'Platformda 10+ oyun oynadı.', icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' });
    }
    const approvedFeedbacks = userFeedbacks.filter(fb => fb.status === "onaylandi").length;
    if (approvedFeedbacks > 0) {
      userBadges.push({ id: 'idea', title: 'Fikir Öncüsü', desc: 'Topluluğa harika fikirler kattı.', icon: Star, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' });
    }
    if (userBadges.length === 0) {
      userBadges.push({ id: 'newbie', title: 'Yeni Maceracı', desc: 'Platforma yeni katıldı.', icon: User, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' });
    }

    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
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
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Standart Üye
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Lock className="w-4 h-4 mr-2" /> Yönetici
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Oynanan Oyun</div>
              <div className="text-2xl font-black text-white">{currentUser.playCount || 0}</div>
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
              {!isPremium && <button onClick={() => setActiveTab("premium")} className="text-orange-500 hover:text-orange-400 font-bold text-sm transition-colors">Premium Al</button>}
              {isPremium && <span className="text-emerald-500 font-bold text-sm">Ayrıcalıklısın!</span>}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" /> Kazanılan Rozetler
            </h3>
            <div className="flex flex-wrap gap-4">
              {userBadges.map(badge => (
                <div key={badge.id} className={`flex items-center gap-3 p-3 pr-5 rounded-2xl border ${badge.border} ${badge.bg} transition-all hover:scale-105 cursor-default`} title={badge.desc}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800/50 shadow-inner">
                    <badge.icon className={`w-5 h-5 ${badge.color}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${badge.color}`}>{badge.title}</div>
                    <div className="text-[10px] text-slate-400">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500" /> Benim Fikirlerim
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userFeedbacks.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                Henüz hiç fikir göndermedin. Platformu geliştirmemize yardımcı olmak için Fikir Kutusu'nu kullan!
              </div>
            ) : (
              userFeedbacks.map((fb) => (
                <div key={fb.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">{fb.game}</div>
                    <div className="text-[10px] text-slate-500">{fb.date}</div>
                  </div>
                  <p className="text-sm text-slate-300 mb-4 flex-1">"{fb.text}"</p>
                  <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Durum:</span>
                    {fb.status === "onaylandi" && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">✅ Onaylandı</span>}
                    {fb.status === "reddedildi" && <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/20">❌ İptal Edildi</span>}
                    {fb.status === "inceleniyor" && <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/20">⏳ İnceleniyor</span>}
                    {fb.status === "beklemede" && <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded">Beklemede</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
        <Lightbulb className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-white mb-3">Fikir Kutusu</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto">
          Oyunlarımızla ilgili önerilerini, karşılaştığın sorunları veya aklındaki yeni fikirleri bizimle paylaş. Her fikir, platformu daha iyiye taşımamıza yardımcı olur.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        {!currentUser ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Fikir göndermek için giriş yapmalısın.</p>
            <button onClick={() => setShowLoginModal(true)} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        ) : (
          <FeedbackForm currentUser={currentUser} onSubmit={handleFeedbackSubmit} />
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-orange-500" /> Son Gönderilen Fikirler
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {feedbacks.slice(0, 5).map(fb => (
            <div key={fb.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">{fb.game}</span>
                <span className="text-[10px] text-slate-500">{fb.user}</span>
              </div>
              <p className="text-sm text-slate-300">{fb.text}</p>
            </div>
          ))}
          {feedbacks.length === 0 && (
            <p className="text-slate-500 text-center py-4">Henüz fikir gönderilmemiş.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => {
    const approvePremiumTime = async (userId, planCode) => {
      let monthsToAdd = 1;
      if (planCode === "6A") monthsToAdd = 6;
      if (planCode === "1Y") monthsToAdd = 12;
      const u = usersList.find(user => user.id === userId);
      if (!u) return;
      const base = u.premiumEndDate && new Date(u.premiumEndDate) > new Date() ? new Date(u.premiumEndDate) : new Date();
      base.setMonth(base.getMonth() + monthsToAdd);
      await updateDoc(doc(db, "users", userId), { premiumEndDate: base.toISOString(), pendingRequest: null });
    };

    const revokePremium = async (userId) => {
      await updateDoc(doc(db, "users", userId), { premiumEndDate: null, pendingRequest: null });
    };

    const changeFeedbackStatus = async (id, newStatus) => {
      await updateDoc(doc(db, "feedbacks", id), { status: newStatus });
    };

    const deleteFeedback = async (id) => {
      if (window.confirm("Bu fikri kalıcı olarak silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, "feedbacks", id));
      }
    };

    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Yönetici Paneli</h2>
            </div>
            <p className="text-amber-200/60 text-sm">Canlı Veritabanı Kontrol Merkezi</p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "users" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Kullanıcılar</button>
            <button onClick={() => setAdminTab("feedbacks")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "feedbacks" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Fikir Kutusu</button>
          </div>
        </div>

        {adminTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 gap-3">
              <h3 className="font-bold text-white">Kayıtlı Kullanıcılar</h3>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-500" />
                <input value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} type="text" placeholder="İsim/E-posta ara..." className="bg-transparent border-none outline-none text-xs text-white ml-2 w-36 md:w-52" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <th className="px-6 py-4 font-semibold">Kullanıcı (Kod)</th>
                    <th className="px-6 py-4 font-semibold">E-posta</th>
                    <th className="px-6 py-4 font-semibold text-center">Durum</th>
                    <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedUsers.map((user) => {
                    const isPremium = isUserPremium(user);
                    const remDays = getRemainingDays(user.premiumEndDate);
                    const isPending = user.pendingRequest !== null;
                    return (
                      <tr key={user.id} className={`hover:bg-slate-800/30 transition-colors ${isPending ? "bg-amber-900/10" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{user.name || "Kullanıcı"}</div>
                          <div className="text-[10px] text-orange-400 font-mono mt-0.5">Kod: {user.paymentCode || "KOD-YOK"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{user.email || "E-posta Yok"}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isPending ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">ÖDEME BEKLİYOR ({user.pendingRequest})</span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${isPremium ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : remDays !== null && remDays <= 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                {isPremium ? "AKTİF" : remDays !== null && remDays <= 0 ? "SÜRESİ DOLDU" : "STANDART"}
                              </span>
                            )}
                            {isPremium && !isPending && <span className="text-[10px] text-slate-500">{remDays} gün kaldı</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 md:gap-2">
                            {isPending ? (
                              <>
                                <button onClick={() => approvePremiumTime(user.id, user.pendingRequest)} className={`text-[10px] md:text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-500/20`}>Onayla</button>
                                <button onClick={() => revokePremium(user.id)} className={`text-[10px] md:text-xs font-bold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors`}>Reddet</button>
                              </>
                            ) : (
                              <>
                                {isPremium && <button onClick={() => revokePremium(user.id)} className={`text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-lg transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20`} title="Aboneliği İptal Et"><ShieldAlert className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                <button onClick={() => approvePremiumTime(user.id, "1A")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors`} title="1 Ay Manuel Ekle">+1A</button>
                                <button onClick={() => approvePremiumTime(user.id, "6A")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-orange-900/50 hover:bg-orange-800/50 text-orange-300 transition-colors`} title="6 Ay Manuel Ekle">+6A</button>
                                <button onClick={() => approvePremiumTime(user.id, "1Y")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-300 transition-colors`} title="1 Yıl Manuel Ekle">+1Y</button>
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

        {adminTab === "feedbacks" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            {feedbacks.map((fb) => (
              <div key={fb.id} className={`bg-slate-900 border rounded-2xl p-6 flex flex-col ${fb.status === "beklemede" ? "border-orange-500/50 shadow-lg shadow-orange-500/10" : "border-slate-800"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded inline-block mb-2">{fb.game}</div>
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-500" /> {fb.user || "Anonim"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">{fb.date}</div>
                    <button onClick={() => deleteFeedback(fb.id)} className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Kalıcı Olarak Sil">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm mb-6 flex-1 italic">
                  "{fb.text}"
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-slate-800/50 pt-4">
                  <a href={`mailto:${fb.email || ''}?subject=Forge&Play Fikir Kutusu Bildirimi&body=Merhaba ${fb.user}, fikriniz incelendi...`} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-lg w-full sm:w-auto justify-center transition-colors">
                    <Mail className="w-4 h-4" /> Mail At
                  </a>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => changeFeedbackStatus(fb.id, "inceleniyor")} className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-colors ${fb.status === "inceleniyor" ? "bg-amber-500 text-slate-900" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"}`}>İncelemeye Al</button>
                    <button onClick={() => changeFeedbackStatus(fb.id, "onaylandi")} className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-colors ${fb.status === "onaylandi" ? "bg-emerald-500 text-slate-900" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"}`}>Onayla</button>
                    <button onClick={() => changeFeedbackStatus(fb.id, "reddedildi")} className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-colors ${fb.status === "reddedildi" ? "bg-red-500 text-slate-900" : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"}`}>Reddet</button>
                  </div>
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">Hiç fikir gelmemiş.</div>}
          </div>
        )}
      </div>
    );
  };

  // Navigasyon çubukları
  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-sm transition-all">
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
              { id: "store", icon: Sparkles, label: "Mağaza" },
              { id: "library", icon: Library, label: "Kütüphanem" },
              { id: "lab", icon: FlaskConical, label: "Laboratuvar" },
              { id: "feedback", icon: Lightbulb, label: "Fikir Kutusu" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${focusStyles} ${activeTab === tab.id ? "bg-slate-800/80 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}

            <div className="pl-2 border-l border-slate-800 ml-2">
              <button onClick={() => setActiveTab("premium")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${focusStyles} ${activeTab === "premium" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105" : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"}`}>
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
          <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-700/50 rounded-full px-3 py-2 focus-within:border-orange-500 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Oyun ara..." className="bg-transparent outline-none border-none text-sm text-white ml-2 w-32 lg:w-48 placeholder-slate-500" />
          </div>
          <button className={`md:hidden p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-full border border-slate-800 ${focusStyles}`} onClick={() => setActiveTab("store")}>
            <Search className="w-4 h-4" />
          </button>

          {authLoading ? (
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 pl-2 md:border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end justify-center h-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("profile")}>
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name || "Kullanıcı"}</span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-400">Yönetici</span>
                ) : currentUser.pendingRequest ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                ) : isUserPremium(currentUser) ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400">Premium ({getRemainingDays(currentUser.premiumEndDate)} Gün)</span>
                ) : getRemainingDays(currentUser.premiumEndDate) !== null && getRemainingDays(currentUser.premiumEndDate) <= 0 ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-red-400">Süresi Bitti</span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Standart Profil</span>
                )}
              </div>
              <div className={`w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-950 ring-orange-500 transition-all ${!isUserPremium(currentUser) && !isAdmin ? "animate-pulse" : ""}`} onClick={() => setActiveTab("profile")}>
                {String(currentUser.name || "U").charAt(0).toUpperCase()}
              </div>
              <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1" title="Çıkış Yap">
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

  const renderMobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center p-2">
        {[
          { id: "store", icon: Sparkles, label: "Mağaza" },
          { id: "library", icon: Library, label: "Kütüphane" },
          { id: "premium", icon: Crown, label: "Premium" },
          { id: "profile", icon: User, label: "Profilim" },
        ].map(tab => (
          <button key={tab.id} onClick={() => currentUser && tab.id === "profile" ? setActiveTab("profile") : !currentUser && tab.id === "profile" ? setShowLoginModal(true) : setActiveTab(tab.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === tab.id ? (tab.id === "premium" ? "text-amber-500" : "text-orange-500") : "text-slate-500 hover:text-slate-300"}`}>
            <tab.icon className={`w-6 h-6 mb-1 ${tab.id === "premium" && activeTab !== "premium" ? "text-amber-500/70" : ""}`} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
        {isAdmin && (
          <button onClick={() => setActiveTab("admin")} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === "admin" ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}>
            <Lock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 flex flex-col overflow-x-hidden w-full">
      {renderNavbar()}
      {showLoginModal && renderLoginModal()}
      {showPricingModal && renderPricingModal()}
      {paymentIntent && renderPaymentCodeModal()}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12">
        {activeTab === "store" && renderStore()}
        {activeTab === "library" && renderLibrary()}
        {activeTab === "premium" && renderPremiumPage()}
        {activeTab === "lab" && renderLab()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "feedback" && renderFeedback()}
        {activeTab === "admin" && isAdmin && renderAdminDashboard()}
      </main>
      <footer className="hidden md:block border-t border-slate-800 bg-slate-950 py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0 font-bold">
            <img src={LOGO_URL} alt="Forge&Play" className="w-6 h-6 object-contain" />
            <span>© 2026 Forge&Play. Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
      {renderMobileBottomNav()}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, #root {
          max-width: 100vw;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          background-color: #020617;
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      ` }} />
    </div>
  );
}
