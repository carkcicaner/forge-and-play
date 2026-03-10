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
  Star,
  Share2,
  Download,
  Smartphone,
  Maximize
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
].map(email => String(email).toLowerCase().trim());

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
    id: "isim-sehir-online",
    title: "İsim Şehir Online",
    status: "Yayında",
    type: "live",
    tags: ["Kelime Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Efsanevi İsim Şehir Hayvan oyunu şimdi dijitalde! Rastgele harfini seç, kelimeleri hızlıca bul ve arkadaşlarınla kıyasıya yarışarak en yüksek puanı topla.",
    price: "Premium İçerik",
    basePlayers: 950,
    gradient: "from-pink-900 via-purple-950 to-black",
    iconKey: "message",
    url: "https://isim-sehir-online.vercel.app/",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=800",
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
    KÜFÜR FİLTRESİ SÖZLÜĞÜ
---------------------------------------------- */
const BAD_WORDS = [
  "amk", "aq", "sg", "siktir", "yavşak", "oç", "orospu", "piç", "ibne",
  "göt", "sik", "yarrak", "am", "meme", "sikik", "amcık", "orospu çocuğu",
  "ananı", "bacı", "pezevenk", "gerizekalı", "salak", "aptal"
];

const sanitizeText = (text) => {
  if (!text) return '';
  return String(text).replace(/[<>]/g, '').replace(/[{}[\]()]/g, '').trim();
};

const containsProfanity = (text) => {
  if (!text) return false;
  const lowerText = String(text).toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

/* ---------------------------------------------
    YARDIMCI FONKSİYONLAR
---------------------------------------------- */
const calculateRank = (playCount) => {
  const baseRank = 50000;
  const rank = baseRank - (Number(playCount || 0) * 142);
  return rank < 1 ? 1 : rank.toLocaleString('tr-TR');
};

const isUserAdmin = (user) => {
  if (!user || !user.email) return false;
  if (user.role === "admin") return true;
  const userEmail = String(user.email).toLowerCase().trim();
  return ADMIN_EMAILS.includes(userEmail);
};

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

const feedbackRateLimiter = createRateLimiter(3, 60000);
const loginRateLimiter = createRateLimiter(5, 300000);

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
    FEEDBACK FORMU BİLEŞENİ
---------------------------------------------- */
const FeedbackForm = ({ currentUser, onSubmit }) => {
  const [text, setText] = useState("");
  const [game, setGame] = useState("Vampir Köylü");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
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

    if (honeypot) { setError("Bot tespit edildi."); return; }
    if (parseInt(mathAnswer) !== mathQuestion.answer) { setError("Matematik sorusunu doğru cevaplayın."); return; }
    if (!currentUser) { setError("Giriş yapmalısınız."); return; }
    if (!text.trim() || text.length < 10) { setError("Fikir en az 10 karakter olmalıdır."); return; }
    if (containsProfanity(text)) { setError("Uygunsuz kelime tespit edildi."); return; }
    if (!feedbackRateLimiter(currentUser.id)) { setError("Çok fazla fikir gönderdiniz, lütfen bekleyin."); return; }

    setIsSubmitting(true);
    try {
      await onSubmit({ text: sanitizeText(text), game: sanitizeText(game) });
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
      <div className="hidden">
        <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex="-1" autoComplete="off" />
      </div>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {String(error)}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Oyun Seç</label>
        <select value={game} onChange={(e) => setGame(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
          {GAMES.filter(g => g.status === "Yayında").map(g => (
            <option key={g.id} value={g.title}>{g.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Fikriniz</label>
        <textarea value={text} onChange={handleTextChange} placeholder="Oyun hakkındaki fikirlerinizi, önerilerinizi veya karşılaştığınız sorunları yazın..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 min-h-[120px]" maxLength={500} disabled={isSubmitting} />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${charCount >= 450 ? 'text-orange-400' : 'text-slate-500'}`}>{Number(charCount)}/500</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Bot değilseniz, lütfen şu işlemin sonucunu yazın: {Number(mathQuestion.a)} + {Number(mathQuestion.b)} = ?</label>
        <input type="number" value={mathAnswer} onChange={(e) => setMathAnswer(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" required />
      </div>
      <button type="submit" disabled={isSubmitting || !text.trim()} className={`w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}>
        {isSubmitting ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Gönderiliyor...</>
        ) : (
          <><Send className="w-5 h-5" /> Fikri Gönder</>
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
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [premiumWarningGame, setPremiumWarningGame] = useState(null); 
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

  // --- PWA ve Paylaşım (Share) API State'leri ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const featuredGames = useMemo(() => GAMES.filter(g => g.status === "Yayında"), []);
  const filteredGames = useMemo(() => {
    const q = String(searchQuery).trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter(g => `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase().includes(q));
  }, [searchQuery]);

  const sortedUsers = useMemo(() => {
    const list = [...usersList].sort((a, b) => {
      if (a.pendingRequest && !b.pendingRequest) return -1;
      if (!a.pendingRequest && b.pendingRequest) return 1;
      return 0;
    });
    const q = String(adminSearch).trim().toLowerCase();
    if (!q) return list;
    return list.filter(u => String(u.name || "").toLowerCase().includes(q) || String(u.email || "").toLowerCase().includes(q));
  }, [usersList, adminSearch]);

  const isAdmin = currentUser ? isUserAdmin(currentUser) : false;

  // --- PWA Kurulum Dinleyicisi ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

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
              // Güvenlik & Stabilite: Email'i her zaman güvenli tut
              setCurrentUser({ id: firebaseUser.uid, email: userEmail, ...userData });
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

  useEffect(() => {
    if (!db) return;
    const unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "feedbacks"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const fbList = snapshot.docs.map(doc => {
          const data = doc.data();
          let dateStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              dateStr = data.createdAt.toDate().toISOString();
            } else if (data.createdAt instanceof Date) {
              dateStr = data.createdAt.toISOString();
            }
          }
          return {
            id: doc.id,
            ...data,
            createdAt: dateStr
          };
        });
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

  // --- Paylaşım (Share API) ve Yükleme İşlemleri ---
  const handleSharePlatform = async () => {
    const shareData = {
      title: 'Forge&Play Eğlence Platformu',
      text: 'Harika parti ve masa oyunlarını arkadaşlarınla oynamak için Forge&Play tam sana göre! Hadi gel, DM grubunu kurup birlikte oynayalım.',
      url: window.location.origin
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log("Paylaşım iptal edildi."); }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Platform bağlantısı kopyalandı! Instagram veya TikTok üzerinden arkadaşlarına gönderebilirsin.");
    }
  };

  const handleShareGame = async (game, e) => {
    e?.stopPropagation();
    const shareData = {
      title: game.title,
      text: `Forge&Play'de ${game.title} oynuyoruz! Sende gelsene, efsane sarıyor:`,
      url: window.location.origin
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log("Paylaşım iptal edildi."); }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert(`${game.title} oyun bağlantısı kopyalandı! Arkadaşlarına hemen gönder.`);
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

  // Oyun Açma Mantığı - Çökme olmadan Premium Kontrolü
  const openGame = useCallback(async (game) => {
    if (!game) return;
    
    // Eğer oyun premium ise ve kullanıcı premium değilse, özel uyarı popup'ını aç
    if (game.requiresPremium && !isUserPremium(currentUser)) {
      setPremiumWarningGame(game);
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
          playCount: (Number(currentUser.playCount) || 0) + 1,
          lastPlayedGameName: game.title
        });
        setCurrentUser(prev => ({
          ...prev,
          playCount: (Number(prev?.playCount) || 0) + 1,
          lastPlayedGameName: game.title
        }));
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const email = String(emailInput).trim().toLowerCase();
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
      switch (error.code) {
        case 'auth/email-already-in-use': setAuthError("Bu e-posta adresi zaten kullanılıyor."); break;
        case 'auth/invalid-email': setAuthError("Geçersiz e-posta adresi."); break;
        case 'auth/user-disabled': setAuthError("Bu hesap devre dışı bırakılmış."); break;
        case 'auth/user-not-found':
        case 'auth/wrong-password': setAuthError("E-posta veya şifre hatalı."); break;
        case 'auth/too-many-requests': setAuthError("Çok fazla başarısız deneme. Hesabınız kilitlendi."); break;
        default: setAuthError("Giriş yapılırken bir hata oluştu.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
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
      setAuthError("Şifre sıfırlama e-postası gönderilemedi.");
    }
  };

  const handlePurchaseRequest = async (plan) => {
    if (!currentUser) {
      setActiveTab("premium");
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
        setPaymentIntent({ url: paymentUrl, plan });
      } else {
        alert("Bu plan için ödeme linki henüz tanımlanmadı.");
      }
    } catch (error) {
      alert("Satın alma talebi oluşturulurken bir hata oluştu.");
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    if (!currentUser) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        ...feedbackData,
        userId: currentUser.id,
        user: String(currentUser.name || currentUser.email),
        email: String(currentUser.email),
        status: "beklemede",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('tr-TR')
      });
    } catch (error) {
      throw error;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  /* ---------------------------------------------
     YENİ: PREMIUM OYUN UYARI POPUP'I
  ---------------------------------------------- */
  const renderPremiumWarningModal = () => {
    if (!premiumWarningGame) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
           <button onClick={() => setPremiumWarningGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
             <X className="w-5 h-5" />
           </button>
           <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
           <h2 className="text-2xl font-black text-white mb-2">Premium'a Özel İçerik</h2>
           <p className="text-slate-300 text-sm mb-6 leading-relaxed">
             Bu harika oyun Premium üyelere özeldir. <b>{String(premiumWarningGame.title)}</b> oyununa erişmek ve reklamsız bir deneyim yaşamak için hemen avantajları inceleyin.
           </p>
           <div className="flex flex-col gap-3">
             <button onClick={() => { setPremiumWarningGame(null); setActiveTab("premium"); }} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">
               Premium Paketleri İncele
             </button>
             <button onClick={() => setPremiumWarningGame(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
               Vazgeç
             </button>
           </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------
     YENİ: OYUN EKRANI EKLENTİLERİ (TAM EKRAN, YÜKLENİYOR)
  ---------------------------------------------- */
  const renderPlayerOverlay = () => {
    if (!playingGame) return null;
    const secureUrl = getSecureGameUrl(playingGame.url);

    const toggleFullScreen = () => {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(err => console.log(err));
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    };

    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300" style={{ height: "100dvh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950 border-b border-slate-800 shadow-xl z-20">
          <div className="flex items-center gap-2 md:gap-3 text-white font-bold truncate">
            <div className="flex bg-slate-900 p-1.5 rounded-md border border-slate-800 shadow-sm shadow-orange-500/20">
              <img src={LOGO_URL} alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="hidden sm:inline tracking-tight">Forge<span className="text-orange-500">&</span>Play</span>
            <span className="hidden sm:inline text-slate-600 select-none">|</span>
            <span className="text-xs md:text-sm text-slate-300 font-medium truncate flex items-center gap-2">
              <span className="hidden sm:inline">Oynanıyor:</span>
              <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{String(playingGame.title)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleFullScreen} className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors hidden sm:block" title="Tam Ekran">
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPlayingGame(null);
                if (document.fullscreenElement) document.exitFullscreen();
              }}
              className={`flex items-center gap-1.5 md:gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${focusStyles}`}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Oyundan Çık</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
          {/* Yükleniyor Animasyonu (Arka Planda) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-slate-950">
             <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
             <div className="text-orange-500 font-bold animate-pulse text-sm">Oyun Motoru Yükleniyor...</div>
          </div>
          <iframe
            src={secureUrl}
            className="absolute inset-0 w-full h-full border-none outline-none z-10 bg-transparent"
            title={playingGame.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone; camera; fullscreen"
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
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <Download className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Ana Ekrana Ekle</h2>
          <p className="text-slate-400 text-sm mb-6">Forge&Play'i telefonunuza kurarak tek tıkla oyunlara erişin!</p>
          
          <div className="text-left space-y-4 mb-6">
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-2 mb-2">🍎 iOS (iPhone/iPad) İçin:</h4>
                <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside pl-2">
                   <li>Tarayıcının alt menüsündeki <b className="text-slate-200">Paylaş</b> (Yukarı ok) ikonuna dokunun.</li>
                   <li>Açılan menüyü aşağı kaydırıp <b className="text-slate-200">Ana Ekrana Ekle</b> seçeneğini bulun.</li>
                   <li>Sağ üstteki <b className="text-slate-200">Ekle</b> butonuna basarak tamamlayın.</li>
                </ol>
             </div>
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-2 mb-2">🤖 Android İçin:</h4>
                <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside pl-2">
                   <li>Tarayıcının sağ üst köşesindeki <b className="text-slate-200">Üç Nokta</b> menüsüne dokunun.</li>
                   <li><b className="text-slate-200">Ana Ekrana Ekle</b> (veya Uygulamayı Yükle) seçeneğini seçin.</li>
                   <li>Gelen uyarıda <b className="text-slate-200">Ekle</b> butonuna basarak tamamlayın.</li>
                </ol>
             </div>
          </div>
          <button onClick={() => setShowInstallGuide(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            Anladım, Teşekkürler
          </button>
        </div>
      </div>
    );
  };

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
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${focusStyles} ${activeTab === tab.id ? "bg-slate-800/80 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}>
                  <TabIcon className="w-4 h-4" /> {String(tab.label)}
                </button>
              );
            })}

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
          
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-800 pr-4 mr-2">
             <button onClick={handleSharePlatform} className="text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold" title="Arkadaşlarını Davet Et">
               <Share2 className="w-4 h-4" /> Davet Et
             </button>
             <button onClick={handleInstallApp} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold" title="Ana Ekrana Ekle">
               <Download className="w-4 h-4" /> Yükle
             </button>
          </div>

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
                <span className="text-sm font-bold text-white leading-tight">{String(currentUser.name || "Kullanıcı")}</span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-400">Yönetici</span>
                ) : currentUser.pendingRequest ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                ) : isUserPremium(currentUser) ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400">Premium ({String(getRemainingDays(currentUser.premiumEndDate))} Gün)</span>
                ) : getRemainingDays(currentUser.premiumEndDate) !== null && getRemainingDays(currentUser.premiumEndDate) <= 0 ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-red-400">Süresi Bitti</span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Standart Profil</span>
                )}
              </div>
              <div className={`w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-950 ring-orange-500 transition-all ${!isUserPremium(currentUser) && !isAdmin ? "animate-pulse" : ""}`} onClick={() => setActiveTab("profile")}>
                {String(currentUser.name || "U").charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => {
                  signOut(auth).then(() => {
                    setActiveTab("store");
                    setCurrentUser(null);
                  }).catch(err => console.error("Çıkış hatası", err));
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

  const renderMobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center p-2">
        {[
          { id: "store", icon: Sparkles, label: "Mağaza" },
          { id: "library", icon: Library, label: "Kütüphane" },
          { id: "premium", icon: Crown, label: "Premium" },
          { id: "profile", icon: User, label: "Profilim" },
        ].map(tab => {
           const TabIcon = tab.icon;
           return (
             <button key={tab.id} onClick={() => currentUser && tab.id === "profile" ? setActiveTab("profile") : !currentUser && tab.id === "profile" ? setShowLoginModal(true) : setActiveTab(tab.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === tab.id ? (tab.id === "premium" ? "text-amber-500" : "text-orange-500") : "text-slate-500 hover:text-slate-300"}`}>
               <TabIcon className={`w-6 h-6 mb-1 ${tab.id === "premium" && activeTab !== "premium" ? "text-amber-500/70" : ""}`} />
               <span className="text-[10px] font-bold">{String(tab.label)}</span>
             </button>
           )
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
            {String(authError)}
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
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight leading-tight line-clamp-2">{String(game.title)}</h1>
                      <p className="text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl line-clamp-3">{String(game.description)}</p>
                      
                      <div className="pt-2">
                        <LivePlayerCount base={game.basePlayers} />
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2 md:pt-4">
                        <button tabIndex={-1} className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shrink-0 ${game.requiresPremium && !isUserPremium(currentUser) ? "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}`} onClick={(e) => { e.stopPropagation(); openGame(game); }}>
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
                <div key={game.id} tabIndex={0} onClick={() => { openGame(game); }} className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] cursor-pointer flex flex-col ${focusStyles}`}>
                  <div className={`h-32 md:h-40 bg-gradient-to-br ${game.gradient} p-4 md:p-6 flex flex-col justify-between relative overflow-hidden`}>
                    {game.image && <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-60 transition-all transform group-hover:scale-110 duration-500 z-0 pointer-events-none" />}
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500 z-10"><GameIcon iconKey={game.iconKey} className="w-12 h-12" /></div>
                    <div className="flex justify-between items-start z-10 relative">
                      <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full ${game.type === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm" : "bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm"}`}>{String(game.status)}</span>
                      {game.requiresPremium && <span className="bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white z-10 drop-shadow-md relative">{String(game.title)}</h3>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col z-10 bg-slate-900">
                    <p className="text-slate-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 flex-1">{String(game.description)}</p>
                    
                    <LivePlayerCount base={game.basePlayers} />

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-semibold text-white">{String(game.price)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <button onClick={(e) => handleShareGame(game, e)} className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors" title="Oyunu Paylaş">
                           <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                         </button>
                         <button tabIndex={-1} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${game.url ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                           {game.url ? (locked ? "Premium Al" : "Oyna") : "İncele"}
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
              <span className="font-semibold text-sm truncate">{String(game.title)}</span>
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
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{String(selectedLibraryGame.title)}</h2>
                  <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed mb-4">{String(selectedLibraryGame.description)}</p>
                  <LivePlayerCount base={selectedLibraryGame.basePlayers} />
                </div>
                <div className={`hidden md:flex w-20 h-20 rounded-2xl items-center justify-center shrink-0 bg-gradient-to-br ${selectedLibraryGame.gradient} shadow-xl`}>
                  <GameIcon iconKey={selectedLibraryGame.iconKey} className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="mt-auto pt-8 border-t border-slate-800 flex items-center gap-3">
                <button onClick={() => { openGame(selectedLibraryGame); }} className="flex-1 sm:flex-none px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  {selectedLibraryGame.requiresPremium && !isUserPremium(currentUser) ? "Premium Alarak Oyna" : "Şimdi Oyna"}
                </button>
                <button onClick={() => handleShareGame(selectedLibraryGame)} className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700" title="Arkadaşlarına Gönder">
                   <Share2 className="w-5 h-5" />
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 flex flex-col overflow-x-hidden w-full">
      {renderInstallGuideModal()}
      {renderPremiumWarningModal()}
      {playingGame && renderPlayerOverlay()}
      {renderNavbar()}
      {showLoginModal && renderLoginModal()}
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
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <a href="mailto:forgeandplay@gmail.com" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
               <Mail className="w-3.5 h-3.5"/> İletişim / Destek
             </a>
             <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><Smartphone className="w-3.5 h-3.5"/> App Store'da Çok Yakında</span>
             <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><Play className="w-3.5 h-3.5"/> Play Store'da Çok Yakında</span>
          </div>
        </div>
      </footer>
      {renderMobileBottomNav()}
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />
    </div>
  );
}
