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
  Maximize,
  Gift,
  ShoppingBag,
  Coins,
  Truck,
  CreditCard,
  Clock,
  Eye,
  EyeOff,
  Edit,
  Trash
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
  serverTimestamp,
  increment
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
    OYUN VERİLERİ (YENİ SIRALAMA VE EKLENTİLER)
---------------------------------------------- */
const GAMES = [
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
    id: "vampir-koylu",
    title: "Vampir Köylü",
    status: "Yayında",
    type: "live",
    tags: ["Parti", "Çok Oyunculu", "Gizem"],
    description: "Konuş, şüphelen, oyla: Vampirleri bul, kasabayı kurtar. Yönetici kasabayı kurar, vampir sayısını belirler ve kaderleri dağıtır; oyun gece–gündüz döngüsü ile ilerler.",
    price: "Premium İçerik",
    basePlayers: 1240,
    gradient: "from-red-900 via-rose-950 to-black",
    iconKey: "user",
    url: "https://vampir-oyunu.vercel.app/",
    image: "https://i.ibb.co/KxP67Mm1/Ba-l-ks-z-4.png",
    requiresPremium: true,
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
    id: "pis-yedili",
    title: "Pis 7'li",
    status: "Yayında",
    type: "live",
    tags: ["Kart Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Klasik kart oyunu Pis 7'li şimdi dijitalde! Arkadaşlarınla toplan ve Forge&Play tarafından sunulan bu rekabetçi kart oyununda hünerlerini sergile.",
    price: "Premium İçerik",
    basePlayers: 1560,
    gradient: "from-fuchsia-900 via-purple-950 to-black",
    iconKey: "user",
    url: "https://pis7li-oyunu.vercel.app/",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
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
  {
    id: "yuzbir-okey",
    title: "101 Okey",
    status: "Yakında",
    type: "upcoming",
    tags: ["Masa Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Efsanevi 101 Okey deneyimi yakında dijital masalarınızda. Taşları dizmeye ve arkadaşlarınızı yenmeye hazırlanın!",
    price: "Geliştiriliyor",
    basePlayers: 0,
    gradient: "from-red-900 via-red-950 to-black",
    iconKey: "user",
    url: null,
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "koz-maca-batak",
    title: "Koz Maça (Batak)",
    status: "Yakında",
    type: "upcoming",
    tags: ["Kart Oyunu", "Klasik", "Strateji"],
    description: "İhaleyi al, kozunu belirle ve masayı domine et. Efsanevi batak eğlencesi yakında Forge&Play'de.",
    price: "Geliştiriliyor",
    basePlayers: 0,
    gradient: "from-slate-800 via-slate-950 to-black",
    iconKey: "user",
    url: null,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  }
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

const DEFAULT_STORE_PRODUCTS = [
  { 
    name: "100 TL Steam Cüzdan Kodu", 
    price: 350, 
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&q=80&w=800", 
    desc: "Favori oyunlarını almak için 100 TL değerinde Steam cüzdan kodu. Sipariş onaylandığında profilinizdeki e-posta adresine gönderilir.", 
    type: "Dijital",
    isVisible: true
  },
  { 
    name: "1 Aylık Discord Nitro", 
    price: 600, 
    image: "https://images.unsplash.com/photo-1614680376408-140b95764d9c?auto=format&fit=crop&q=80&w=800", 
    desc: "Oyun gecelerini renklendirmek için 1 aylık Discord Nitro. Özel emojiler ve yüksek yayın kalitesi avantajı.", 
    type: "Dijital",
    isVisible: true
  },
  { 
    name: "Forge&Play Tasarım Kupa", 
    price: 450, 
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800", 
    desc: "Sabahlara kadar süren oyun geceleri için özel tasarım kupa. Sipariş aşamasında açık adres girmeniz gerekmektedir.", 
    type: "Fiziksel",
    isVisible: true
  },
  { 
    name: "Profesyonel Oyuncu Faresi", 
    price: 1500, 
    image: "https://images.unsplash.com/photo-1527814050087-379381547962?auto=format&fit=crop&q=80&w=800", 
    desc: "Yüksek hassasiyetli, RGB aydınlatmalı e-spor faresi. Tamamen ücretsiz olarak adresinize kargolanır.", 
    type: "Fiziksel",
    isVisible: true
  },
  { 
    name: "Mekanik Oyuncu Klavyesi", 
    price: 2500, 
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800", 
    desc: "RGB aydınlatmalı, tam boy profesyonel mekanik klavye. En üst düzey FAP Coin ödülü!", 
    type: "Fiziksel",
    isVisible: true
  }
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

function sanitizeText(text) {
  if (!text) return '';
  return String(text).replace(/[<>]/g, '').replace(/[{}[\]()]/g, '').trim();
}

function containsProfanity(text) {
  if (!text) return false;
  const lowerText = String(text).toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

/* ---------------------------------------------
    YARDIMCI FONKSİYONLAR
---------------------------------------------- */
function calculateRank(playCount) {
  const baseRank = 50000;
  const count = Number(playCount) || 0;
  const rank = baseRank - (count * 142);
  return rank < 1 ? 1 : rank.toLocaleString('tr-TR');
}

function isUserAdmin(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.email) {
     const mail = String(user.email).toLowerCase().trim();
     return mail === "forgeandplay@gmail.com" || mail === "carkci.caner@gmail.com" || ADMIN_EMAILS.includes(mail);
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

function createRateLimiter(maxAttempts = 5, timeWindow = 60000) {
  const attempts = new Map();
  return function(key) {
    const now = Date.now();
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
  const [game, setGame] = useState("Tabu");
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

  // --- TEMEL STATE'LER ---
  const [activeTab, setActiveTab] = useState("store"); 
  const [playingGame, setPlayingGame] = useState(null);
  const [selectedLibraryGame, setSelectedLibraryGame] = useState(GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // Modallar ve Deneme (Trial) State'leri
  const [premiumWarningGame, setPremiumWarningGame] = useState(null); 
  const [trialPromptGame, setTrialPromptGame] = useState(null); 
  const playTimerRef = useRef(null);
  const fapCoinIntervalRef = useRef(null);

  // --- Ödül Mağazası Sipariş State'leri ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Admin Dashboard State
  const [adminTab, setAdminTab] = useState("users");
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]); 
  
  const [newProductData, setNewProductData] = useState({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true }); 
  const [editingProductId, setEditingProductId] = useState(null); 

  // BOT SIMULATION STATE
  const [isBotRunning, setIsBotRunning] = useState(false);
  const botIntervalRef = useRef(null);

  const [adminSearch, setAdminSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // --- PWA API State'leri ---
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

  const handleFirebaseError = useCallback((error) => {
    console.warn("Firebase Uyarısı: Firestore kuralları okuma/yazma işlemlerine kısıtlı olabilir.", error);
  }, []);

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
            const isAdminEmail = ADMIN_EMAILS.includes(userEmail) || userEmail === "forgeandplay@gmail.com" || userEmail === "carkci.caner@gmail.com";

            if (docSnap.exists()) {
              const userData = docSnap.data();
              const updates = {};
              
              if (isAdminEmail && userData.role !== "admin") {
                updates.role = "admin";
                updates.premiumEndDate = new Date("2099-01-01").toISOString();
              }
              if (!userData.paymentCode) updates.paymentCode = "FP-" + firebaseUser.uid.substring(0, 4).toUpperCase();
              
              if (userData.fapCoin === undefined) updates.fapCoin = 0;
              if (userData.dailyFap === undefined) updates.dailyFap = 0;
              if (userData.lastFapDate === undefined) updates.lastFapDate = "";

              if (Object.keys(updates).length > 0) {
                await updateDoc(userRef, updates).catch(handleFirebaseError);
                Object.assign(userData, updates);
              }
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
              setCurrentUser({ id: firebaseUser.uid, ...newUser });
            }
            setAuthLoading(false);
          }, (error) => {
             handleFirebaseError(error);
             setAuthLoading(false);
          });
        } catch (error) {
          handleFirebaseError(error);
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
  }, [handleFirebaseError]);

  useEffect(() => {
    if (!db) return;
    
    const unsubscribeProducts = onSnapshot(collection(db, "store_products"), (snapshot) => {
      setStoreProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleFirebaseError);

    const unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "feedbacks"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const fbList = snapshot.docs.map(doc => {
          const data = doc.data();
          let dateStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') dateStr = data.createdAt.toDate().toISOString();
            else if (data.createdAt instanceof Date) dateStr = data.createdAt.toISOString();
          }
          return { id: doc.id, ...data, createdAt: dateStr };
        });
        setFeedbacks(fbList);
      },
      handleFirebaseError
    );

    let unsubscribeUsers = null;
    let unsubscribeOrders = null;
    if (isAdmin) {
      unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, handleFirebaseError);

      unsubscribeOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
        setOrdersList(snapshot.docs.map(doc => {
          const data = doc.data();
          let dateStr = new Date().toLocaleDateString('tr-TR');
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            dateStr = data.createdAt.toDate().toLocaleDateString('tr-TR') + ' ' + data.createdAt.toDate().toLocaleTimeString('tr-TR');
          }
          return { id: doc.id, ...data, displayDate: dateStr };
        }));
      }, handleFirebaseError);
    }

    return () => {
      unsubscribeProducts();
      unsubscribeFeedbacks();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [isAdmin, handleFirebaseError]);

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

  const handleEarnFapCoin = useCallback(async () => {
    if (!currentUser || !isUserPremium(currentUser)) return;
    
    const todayStr = new Date().toLocaleDateString('tr-TR');
    let currentDailyFap = currentUser.lastFapDate === todayStr ? Number(currentUser.dailyFap || 0) : 0;
    
    if (currentDailyFap >= 8) {
      return; 
    }

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
      console.error("FAP Coin kazanım hatası:", error);
    }
  }, [currentUser, handleFirebaseError]);

  const proceedToGame = useCallback((game, isTrial = false) => {
    setTrialPromptGame(null);
    setPlayingGame(game);

    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);

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
          if (isTrial) {
            updates.premiumTrialsUsed = (Number(currentUser.premiumTrialsUsed) || 0) + 1;
          }
          await updateDoc(doc(db, "users", currentUser.id), updates).catch(handleFirebaseError);
          
          setCurrentUser(prev => prev ? ({
            ...prev,
            playCount: (Number(prev.playCount) || 0) + 1,
            lastPlayedGameName: game.title,
            gamePlayCounts: newGameCounts,
            premiumTrialsUsed: isTrial ? (Number(prev.premiumTrialsUsed) || 0) + 1 : prev.premiumTrialsUsed
          }) : null);
        } catch (error) {
          console.error("Play count update failed:", error);
        }
      }
    }, 60000);

    if (currentUser && isUserPremium(currentUser)) {
       let activeSecondsForFap = 0;
       fapCoinIntervalRef.current = setInterval(() => {
          if (!document.hidden) {
            activeSecondsForFap += 10; 
            if (activeSecondsForFap >= 600) {
               handleEarnFapCoin();
               activeSecondsForFap = 0; 
            }
          }
       }, 10000);
    }

  }, [currentUser, handleEarnFapCoin, handleFirebaseError]);

  const openGame = useCallback(async (game) => {
    if (!game) return;
    if (!game.url) { alert("Bu oyun henüz yayında değil."); return; }

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
        if (passwordInput.length < 6) { setAuthError("Şifre en az 6 karakter olmalıdır."); return; }
        await createUserWithEmailAndPassword(auth, email, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, email, passwordInput);
      }
      setShowLoginModal(false); setPasswordInput(""); setEmailInput("");
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
    if (!emailInput) { setAuthError("Şifre sıfırlama için e-posta adresinizi girin."); return; }
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
      setPremiumWarningGame(null);
      setActiveTab("premium");
      setShowLoginModal(true);
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        pendingRequest: plan,
        lastPurchaseAttempt: serverTimestamp()
      }).catch(handleFirebaseError);
      const paymentUrl = PAYMENT_LINKS[plan];
      if (paymentUrl) {
        setPremiumWarningGame(null);
        setShowPricingModal(false);
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
      }).catch(handleFirebaseError);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleRewardPurchase = async (e) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;

    if (Number(currentUser.fapCoin || 0) < selectedProduct.price) {
       alert("Yetersiz FAP Coin bakiyesi!");
       return;
    }

    setIsOrdering(true);
    try {
      const newBalance = Number(currentUser.fapCoin) - selectedProduct.price;
      await updateDoc(doc(db, "users", currentUser.id), {
         fapCoin: newBalance
      }).catch(handleFirebaseError);

      await addDoc(collection(db, "orders"), {
         userId: currentUser.id,
         userEmail: currentUser.email,
         userName: currentUser.name || "İsimsiz",
         productId: selectedProduct.id,
         productName: selectedProduct.name,
         productType: selectedProduct.type,
         fapCost: selectedProduct.price,
         addressDetails: orderAddress || "Belirtilmedi",
         status: "Onay Bekliyor",
         createdAt: serverTimestamp()
      }).catch(handleFirebaseError);

      setCurrentUser(prev => prev ? { ...prev, fapCoin: newBalance } : null);
      
      alert("Tebrikler! Siparişiniz başarıyla alındı ve yönetici onayına gönderildi. Durumu e-posta ile size bildirilecektir.");
      setSelectedProduct(null);
      setOrderAddress("");
      
    } catch (err) {
      console.error("Sipariş hatası:", err);
      alert("Sipariş oluşturulurken bir hata meydana geldi.");
    } finally {
      setIsOrdering(false);
    }
  };

  // --- RENDER FONKSİYONLARI ---

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
              { id: "store", icon: Gamepad2, label: "Oyunlar" },
              { id: "rewards", icon: Gift, label: "Ödül Mağazası" },
              { id: "library", icon: Library, label: "Kütüphanem" },
              { id: "lab", icon: FlaskConical, label: "Laboratuvar" },
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

          <button className={`md:hidden p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-full border border-slate-800 ${focusStyles}`} onClick={() => setActiveTab("store")}>
            <Search className="w-4 h-4" />
          </button>

          {authLoading ? (
             <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 pl-2 md:border-l border-slate-800">
              
              {isUserPremium(currentUser) && (
                <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => setActiveTab("rewards")} title="FAP Coin Bakiyesi">
                   <Coins className="w-4 h-4 text-amber-500" />
                   <span className="text-xs font-bold text-amber-400">{Number(currentUser.fapCoin || 0).toFixed(1)}</span>
                </div>
              )}

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
                onClick={async () => {
                  setActiveTab("store");
                  setPlayingGame(null);
                  try {
                    await signOut(auth);
                  } catch (err) {
                    console.error("Çıkış hatası", err);
                  }
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
          { id: "store", icon: Gamepad2, label: "Oyunlar" },
          { id: "rewards", icon: Gift, label: "Ödüller" },
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
        
        {/* MOBİL ADMİN BUTONU */}
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
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto flex flex-col mx-auto">
        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
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

        <form onSubmit={handleLoginSubmit} className="space-y-4 w-full">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta Adresi</label>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="ornek@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
          </div>
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
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
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-orange-500 font-bold hover:text-orange-400 transition-colors" type="button">
            {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </button>
        </p>
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
            <span className="text-2xl md:text-3xl font-mono font-black text-orange-400 tracking-wider pl-2">{String(currentUser.paymentCode)}</span>
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

  const renderPremiumPage = () => (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500 max-w-6xl mx-auto">
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
          ].map((feature, i) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-colors">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  <FeatureIcon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{String(feature.title)}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{String(feature.desc)}</p>
              </div>
            );
          })}
        </div>
      </div>

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
                {String(item.step)}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{String(item.title)}</h3>
              <p className="text-sm text-slate-400">{String(item.desc)}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Kodunuzu eklediğinizde ödemeniz sistem tarafından eşleştirilir ve anında onaylanır.
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
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
           <button onClick={() => setTrialPromptGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors z-20">
             <X className="w-5 h-5" />
           </button>

           <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
           <h2 className="text-2xl font-black text-white mb-2">Hediye Premium Denemesi!</h2>
           <p className="text-slate-300 text-sm mb-6 leading-relaxed">
             Yeni üyelerimize özel olarak tüm Premium oyunları ücretsiz test etme hakkınız var. <b>{String(trialPromptGame.title)}</b> oyununu oynamak isterseniz 1 hakkınız kullanılacaktır. <i>(Oyun içinde 1 dakikadan az kalırsanız hakkınız eksilmez!)</i>
           </p>
           <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
              <span className="text-emerald-400 font-bold text-lg">Kalan Hakkınız: {remaining} / 3</span>
           </div>
           
           <div className="flex flex-col gap-3">
             <button onClick={() => proceedToGame(trialPromptGame, true)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">
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
    
    const closeWarning = () => setPremiumWarningGame(null);

    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto py-12">
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-5xl p-6 md:p-10 shadow-2xl relative my-auto text-center">
           <button onClick={closeWarning} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors z-20">
             <X className="w-5 h-5" />
           </button>
           <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
           <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Deneme Haklarınız Bitti</h2>
           <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
             Ücretsiz deneme haklarınızı tamamladınız. <b>{String(premiumWarningGame.title)}</b> oyununa erişmeye devam etmek ve platformdaki tüm sınırları kaldırmak için Premium avantajlarına göz atın.
           </p>
           
           <button onClick={() => { closeWarning(); setActiveTab("premium"); }} className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg transform hover:scale-[1.02] text-lg">
               Premium Paketleri İncele
           </button>
           <button onClick={closeWarning} className="block w-full md:w-auto mx-auto mt-4 px-8 py-3 text-slate-400 hover:text-white transition-colors font-bold">
               Vazgeç
           </button>
        </div>
      </div>
    );
  };

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
                if (playTimerRef.current) clearTimeout(playTimerRef.current);
                if (fapCoinIntervalRef.current) clearInterval(fapCoinIntervalRef.current);
                if (document.fullscreenElement) document.exitFullscreen();
              }}
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

  const renderRewardsStore = () => {
    const renderPurchaseModal = () => {
      if (!selectedProduct) return null;
      const isPhysical = selectedProduct.type === "Fiziksel";
      return (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 text-center">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-800" />
              <h3 className="text-xl font-bold text-white mb-1">{String(selectedProduct.name)}</h3>
              <p className="text-amber-400 font-bold text-lg flex items-center justify-center gap-1">
                <Coins className="w-5 h-5" /> {Number(selectedProduct.price)} FAP
              </p>
            </div>
            
            <form onSubmit={handleRewardPurchase} className="space-y-4">
               {isPhysical ? (
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kargo Adresi</label>
                   <textarea required value={orderAddress} onChange={(e) => setOrderAddress(e.target.value)} placeholder="Ürünün gönderileceği tam adres..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 min-h-[100px]" />
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                   <p className="text-emerald-400 text-sm">Bu dijital bir üründür. Kodunuz veya linkiniz onaylandıktan sonra <b>{currentUser?.email}</b> adresinize gönderilecektir.</p>
                 </div>
               )}
               <button type="submit" disabled={isOrdering} className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}>
                 {isOrdering ? "İşleniyor..." : "Siparişi Tamamla"}
               </button>
            </form>
          </div>
        </div>
      );
    };

    const visibleProducts = storeProducts.filter(p => p.isVisible !== false);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {renderPurchaseModal()}
        
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              <Gift className="w-8 h-8 md:w-12 md:h-12 text-amber-500" /> Ödül Mağazası
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
              Oynadıkça kazan! Premium üyeler oyunlarda geçirdikleri her <b className="text-amber-400">10 dakikada 0.5 FAP Coin</b> kazanır (Günde Maks 8 FAP). Biriktirdiğin coinlerle aşağıdaki gerçek ödülleri ücretsiz alabilirsin.
            </p>
            {!currentUser ? (
              <button onClick={() => setShowLoginModal(true)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors">Kazanmaya Başlamak İçin Giriş Yap</button>
            ) : !isUserPremium(currentUser) ? (
              <button onClick={() => setActiveTab("premium")} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-2">
                <Crown className="w-5 h-5"/> Premium Ol ve FAP Kazan
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
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Tüm Ödüller</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                <p>Şu an mağazada ürün bulunmuyor. Çok yakında yeni ürünler eklenecektir!</p>
              </div>
            ) : visibleProducts.map(product => {
              const canAfford = currentUser && Number(currentUser.fapCoin || 0) >= product.price;
              const isPremiumOnly = currentUser && !isUserPremium(currentUser);

              return (
                <div key={product.id || Math.random()} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all group flex flex-col h-full hover:-translate-y-1 hover:shadow-xl shadow-amber-500/10">
                  <div className="relative h-48 md:h-52 overflow-hidden bg-slate-950 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5 text-xs font-bold text-slate-300">
                       {product.type === "Fiziksel" ? <Truck className="w-3.5 h-3.5 text-emerald-400" /> : <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                       {String(product.type)}
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2">{String(product.name)}</h3>
                    <p className="text-xs text-slate-400 mb-4 flex-grow line-clamp-4">{String(product.desc)}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl">
                        <Coins className="w-5 h-5" /> {Number(product.price)}
                      </div>
                      
                      <button 
                        onClick={() => {
                          if(!currentUser) { setShowLoginModal(true); return; }
                          if(isPremiumOnly) { setActiveTab("premium"); return; }
                          setSelectedProduct(product);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg ${
                          !currentUser ? "bg-slate-800 text-white hover:bg-slate-700" :
                          isPremiumOnly ? "bg-slate-800 border border-amber-500/30 text-amber-500 hover:bg-slate-700" :
                          canAfford ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20" : 
                          "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                        disabled={currentUser && isUserPremium(currentUser) && !canAfford}
                      >
                        {!currentUser ? "Giriş Yap" : isPremiumOnly ? "Premium Şart" : canAfford ? "Hemen Al" : "Yetersiz"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

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
              {slideList.map((game, idx) => {
                const locked = game.requiresPremium && !isUserPremium(currentUser);
                const trialsUsed = currentUser ? Number(currentUser.premiumTrialsUsed || 0) : 0;
                const hasTrials = trialsUsed < 3;

                return (
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
                          <button tabIndex={-1} className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shrink-0 ${locked && !hasTrials ? "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}`} onClick={(e) => { e.stopPropagation(); openGame(game); }}>
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
                {(() => {
                   const locked = selectedLibraryGame.requiresPremium && !isUserPremium(currentUser);
                   const trialsUsed = currentUser ? Number(currentUser.premiumTrialsUsed || 0) : 0;
                   const hasTrials = trialsUsed < 3;
                   
                   let btnText = "Hemen Oyna";
                   if (locked) {
                       btnText = hasTrials ? `Ücretsiz Dene (${3 - trialsUsed} Kaldı)` : "Premium Abone Ol";
                   }
                   
                   return (
                     <button onClick={() => { openGame(selectedLibraryGame); }} className="flex-1 sm:flex-none px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                       <Play className="w-5 h-5" />
                       {btnText}
                     </button>
                   );
                })()}
                <button onClick={(e) => handleShareGame(selectedLibraryGame, e)} className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700" title="Arkadaşlarına Gönder">
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
              <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">{String(proj.status)}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{String(proj.title)}</h3>
            <p className="text-slate-400 text-sm mb-8 flex-1">{String(proj.description)}</p>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Tamamlanma</span>
                <span>%{Number(proj.progress)}</span>
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
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{String(currentUser.name || "Kullanıcı")}</h2>
              <div className="text-slate-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" /> {String(currentUser.email || "E-posta Yok")}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isPremium ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4 mr-2" /> Premium Aktif ({String(remDays)} Gün)
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

          <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.05)] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <Coins className="w-16 h-16 text-amber-400 mb-4 drop-shadow-lg" />
            <div className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">Mevcut FAP Coin Bakiyesi</div>
            <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 drop-shadow-sm">
              {Number(currentUser.fapCoin || 0).toFixed(1)}
            </div>
            <p className="text-slate-400 text-sm mt-4 max-w-md">Oynadıkça FAP Coin biriktir, mağazadaki gerçek ödüllerin sahibi ol!</p>
            <button onClick={() => setActiveTab("rewards")} className="mt-6 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg hover:scale-105">
              Mağazaya Git
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Toplam Oynama</div>
              <div className="text-2xl font-black text-white">{Number(currentUser.playCount || 0)}</div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Global Sıra</div>
              <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5" /> #{String(calculateRank(currentUser.playCount || 0))}
              </div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Fikir Önerisi</div>
              <div className="text-2xl font-black text-white">{Number(userFeedbacks.length || 0)}</div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 text-center flex flex-col justify-center items-center">
              {!isPremium && <button onClick={() => setActiveTab("premium")} className="text-orange-500 hover:text-orange-400 font-bold text-sm transition-colors">Premium Al</button>}
              {isPremium && <span className="text-emerald-500 font-bold text-sm">Ayrıcalıklısın!</span>}
            </div>
          </div>
          
          {currentUser.lastPlayedGameName && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-center gap-3">
               <Gamepad2 className="w-5 h-5 text-orange-500" />
               <span className="text-sm text-slate-300">Son Oynanan Oyun: <b className="text-white">{String(currentUser.lastPlayedGameName)}</b></span>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-orange-500" /> Oyun İstatistikleri
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GAMES.map(g => {
                const count = currentUser.gamePlayCounts?.[g.id] || 0;
                if(count === 0) return null;
                return (
                  <div key={g.id} className="bg-slate-950 border border-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1 truncate" title={g.title}>{String(g.title)}</div>
                    <div className="text-xl font-black text-white">{Number(count)} <span className="text-[10px] text-slate-500 font-normal">kez oynandı</span></div>
                  </div>
                );
              })}
              {(!currentUser.gamePlayCounts || Object.keys(currentUser.gamePlayCounts).length === 0) && (
                <div className="col-span-full text-sm text-slate-500">Henüz hiçbir oyunda 1 dakikadan fazla vakit geçirmediniz.</div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="bg-gradient-to-r from-orange-900/20 to-slate-900 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Share2 className="w-5 h-5 text-orange-500" /> Platformu Büyütelim!</h3>
                  <p className="text-sm text-slate-400 max-w-md">Forge&Play oyunlarını arkadaşlarına gönder ve oyun gecelerini başlat. Uygulamayı ana ekrana ekleyerek tek tıkla ulaş.</p>
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

          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" /> Kazanılan Rozetler
            </h3>
            <div className="flex flex-wrap gap-4">
              {userBadges.map(badge => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.id} className={`flex items-center gap-3 p-3 pr-5 rounded-2xl border ${badge.border} ${badge.bg} transition-all hover:scale-105 cursor-default`} title={badge.desc}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800/50 shadow-inner">
                      <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${badge.color}`}>{String(badge.title)}</div>
                      <div className="text-[10px] text-slate-400">{String(badge.desc)}</div>
                    </div>
                  </div>
                )
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
      if(!u) return;
      const base = u.premiumEndDate && new Date(u.premiumEndDate) > new Date() ? new Date(u.premiumEndDate) : new Date();
      base.setMonth(base.getMonth() + monthsToAdd);
      await updateDoc(doc(db, "users", userId), { premiumEndDate: base.toISOString(), pendingRequest: null });
    };

    const revokePremium = async (userId) => {
      await updateDoc(doc(db, "users", userId), { premiumEndDate: null, pendingRequest: null });
    };

    const handleOrderStatus = async (orderId, newStatus, userId, fapCost) => {
       try {
         await updateDoc(doc(db, "orders", orderId), { status: newStatus });
         if (newStatus === "İptal/İade Edildi") {
            await updateDoc(doc(db, "users", userId), { fapCoin: increment(fapCost) });
            alert("Sipariş iptal edildi ve kullanıcının coinleri iade edildi.");
         } else {
            alert(`Sipariş durumu güncellendi: ${newStatus}`);
         }
       } catch (err) {
         console.error("Sipariş güncelleme hatası", err);
       }
    };

    const handleAddProduct = async (e) => {
      e.preventDefault();
      try {
        if (editingProductId) {
          await updateDoc(doc(db, "store_products", editingProductId), {
            ...newProductData,
            price: Number(newProductData.price)
          });
          alert("Ürün başarıyla güncellendi!");
        } else {
          await addDoc(collection(db, "store_products"), {
            ...newProductData,
            price: Number(newProductData.price),
            isVisible: true,
            createdAt: serverTimestamp()
          });
          alert("Yeni ürün başarıyla mağazaya eklendi!");
        }
        setNewProductData({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true });
        setEditingProductId(null);
      } catch(err) {
        console.error("Ürün kaydetme hatası", err);
        alert("Ürün kaydedilirken bir hata oluştu.");
      }
    };

    const handleEditProduct = (prod) => {
      setEditingProductId(prod.id);
      setNewProductData({
        name: prod.name || '',
        price: prod.price || '',
        image: prod.image || '',
        desc: prod.desc || '',
        type: prod.type || 'Dijital',
        isVisible: prod.isVisible !== false
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleProductVisibility = async (id, currentVisibility) => {
      try {
        await updateDoc(doc(db, "store_products", id), {
          isVisible: !currentVisibility
        });
      } catch(err) {
        console.error("Görünürlük değiştirme hatası", err);
      }
    };
    
    const handleDeleteProduct = async (id) => {
      if(window.confirm("Bu ürünü mağazadan kalıcı olarak silmek istediğinize emin misiniz?")) {
        try {
          await deleteDoc(doc(db, "store_products", id));
        } catch (err) {
          console.error("Silme hatası", err);
        }
      }
    };

    const toggleBotSimulation = async () => {
      if (isBotRunning) {
        clearInterval(botIntervalRef.current);
        setIsBotRunning(false);
        alert("Simülasyon Botu başarıyla durduruldu.");
      } else {
        const botId = "sim_bot_999";
        try {
          await setDoc(doc(db, "users", botId), {
            name: "Test Botu (Oto)",
            email: "bot@forgeandplay.com",
            role: "user",
            fapCoin: 0,
            playCount: 0,
            paymentCode: "BOT-9999",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          }, { merge: true });

          setIsBotRunning(true);
          alert("Bot başlatıldı! Arka planda oyunları gezecek, coin kazanacak ve hata raporları atacaktır.");

          botIntervalRef.current = setInterval(async () => {
            try {
              const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
              await updateDoc(doc(db, "users", botId), {
                 fapCoin: increment(0.5),
                 playCount: increment(1),
                 lastPlayedGameName: randomGame.title,
                 lastLogin: serverTimestamp()
              });

              if (Math.random() < 0.2) {
                 await addDoc(collection(db, "feedbacks"), {
                    userId: botId,
                    user: "Test Botu (Oto)",
                    email: "bot@forgeandplay.com",
                    game: randomGame.title,
                    text: "Sistem Testi: Bot oyun sırasında bir hata yakaladı veya otomatik geri bildirim gönderdi! (Test Mesajı)",
                    status: "beklemede",
                    createdAt: serverTimestamp(),
                    date: new Date().toLocaleDateString('tr-TR')
                 });
              }
            } catch(e) {
              console.error("Bot işlem yapamadı:", e);
            }
          }, 5000); 

        } catch (err) {
          console.error(err);
          alert("Bot başlatılamadı, veritabanı izinlerinizi kontrol edin.");
        }
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
            <p className="text-amber-200/60 text-sm">Sadece Kuruculara Özel Kontrol Merkezi</p>
          </div>
          <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "users" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Kullanıcılar</button>
            <button onClick={() => setAdminTab("orders")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "orders" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Siparişler</button>
            <button onClick={() => setAdminTab("products")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "products" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Mağaza Yönetimi</button>
            <button onClick={() => setAdminTab("test")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === "test" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>Test & Bot</button>
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
                    <th className="px-6 py-4 font-semibold text-center">Coin / Oyun</th>
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
                           <div className="text-sm font-medium text-white">{String(user.name || "Kullanıcı")}</div>
                           <div className="text-[10px] text-slate-400">{String(user.email || "E-posta Yok")}</div>
                           <div className="text-[10px] text-orange-400 font-mono mt-0.5">Kod: {String(user.paymentCode || "KOD-YOK")}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1"><Coins className="w-3.5 h-3.5"/> {Number(user.fapCoin || 0).toFixed(1)}</div>
                           <div className="text-[10px] text-slate-500">{Number(user.playCount || 0)} Oyun</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isPending ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">ÖDEME BEKLİYOR ({String(user.pendingRequest)})</span>
                          ) : (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${isPremium ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : remDays !== null && remDays <= 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                {isPremium ? "AKTİF" : remDays !== null && remDays <= 0 ? "SÜRESİ DOLDU" : "STANDART"}
                              </span>
                            )}
                            {isPremium && !isPending && <span className="text-[10px] text-slate-500">{remDays !== null ? remDays : 0} gün kaldı</span>}
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

        {adminTab === "orders" && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
              {ordersList.map(order => (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded border ${order.status === "Onay Bekliyor" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : order.status === "Kargolandı / İletildi" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                           {String(order.status)}
                         </span>
                         <div className="text-lg font-bold text-white mt-2">{String(order.productName)}</div>
                         <div className="text-xs text-amber-500 font-bold">{Number(order.fapCost)} FAP Harcandı</div>
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">
                         Tarih: {String(order.displayDate)}
                      </div>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm mb-4 space-y-2">
                      <p><span className="text-slate-500">Kullanıcı:</span> <span className="text-white">{String(order.userName)}</span></p>
                      <p><span className="text-slate-500">E-posta:</span> <a href={`mailto:${order.userEmail}`} className="text-blue-400 hover:underline">{String(order.userEmail)}</a></p>
                      {order.productType === "Fiziksel" && (
                        <p className="border-t border-slate-800 pt-2 mt-2"><span className="text-slate-500 block mb-1">Teslimat Adresi:</span> <span className="text-slate-300">{String(order.addressDetails)}</span></p>
                      )}
                   </div>
                   {order.status === "Onay Bekliyor" && (
                     <div className="flex gap-3">
                        <button onClick={() => handleOrderStatus(order.id, "Kargolandı / İletildi", order.userId, order.fapCost)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm">Onayla & İlet</button>
                        <button onClick={() => handleOrderStatus(order.id, "İptal/İade Edildi", order.userId, order.fapCost)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-lg transition-colors border border-slate-700 text-sm">Reddet (İade Et)</button>
                     </div>
                   )}
                </div>
              ))}
              {ordersList.length === 0 && <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">Henüz sipariş yok.</div>}
           </div>
        )}

        {adminTab === "products" && (
          <div className="space-y-6 animate-in fade-in">
            <div className={`bg-slate-900 border ${editingProductId ? "border-amber-500" : "border-slate-800"} rounded-2xl p-6 transition-colors`}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {editingProductId ? <Edit className="w-5 h-5 text-amber-500"/> : <Gift className="w-5 h-5 text-emerald-500"/>} 
                {editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Ürün Adı (Örn: 100 TL Steam Kodu)" value={newProductData.name} onChange={e => setNewProductData({...newProductData, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input required type="number" placeholder="FAP Coin Fiyatı (Örn: 350)" value={newProductData.price} onChange={e => setNewProductData({...newProductData, price: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input required type="url" placeholder="Görsel URL (Örn: https://...)" value={newProductData.image} onChange={e => setNewProductData({...newProductData, image: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <select value={newProductData.type} onChange={e => setNewProductData({...newProductData, type: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                  <option value="Dijital">Dijital Ürün (Kod vb.)</option>
                  <option value="Fiziksel">Fiziksel Ürün (Kargo)</option>
                </select>
                <textarea required placeholder="Ürün Açıklaması..." value={newProductData.desc} onChange={e => setNewProductData({...newProductData, desc: e.target.value})} className="col-span-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none min-h-[100px]" />
                
                <div className="col-span-full flex flex-col sm:flex-row gap-3">
                   <button type="submit" className={`flex-1 py-3 ${editingProductId ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"} text-slate-950 font-bold rounded-xl transition-colors`}>
                     {editingProductId ? "Değişiklikleri Kaydet" : "Ürünü Mağazaya Ekle"}
                   </button>
                   {editingProductId && (
                     <button type="button" onClick={() => { setEditingProductId(null); setNewProductData({ name: '', price: '', image: '', desc: '', type: 'Dijital', isVisible: true }); }} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                       İptal Et
                     </button>
                   )}
                   {!editingProductId && storeProducts.length === 0 && (
                     <button type="button" onClick={loadDefaultProducts} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold rounded-xl transition-colors">Varsayılanları Yükle</button>
                   )}
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {storeProducts.length === 0 ? (
                <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  Mağazanızda henüz hiç ürün yok. Yukarıdaki formu kullanarak ürün eklemeye başlayın.
                </div>
              ) : storeProducts.map(prod => {
                 const isVis = prod.isVisible !== false; 
                 return (
                   <div key={prod.id || Math.random()} className={`bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col ${!isVis ? "opacity-50 grayscale" : ""}`}>
                     <div className="relative h-32 overflow-hidden rounded-lg mb-3 shrink-0">
                       <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                       {!isVis && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-white tracking-widest text-xs">GİZLİ</div>}
                     </div>
                     <h4 className="text-white font-bold text-sm mb-1 line-clamp-1" title={prod.name}>{String(prod.name)}</h4>
                     <p className="text-[10px] text-slate-400 mb-3 line-clamp-2" title={prod.desc}>{String(prod.desc)}</p>
                     <div className="text-amber-500 font-bold text-sm mb-3 flex items-center gap-1"><Coins className="w-4 h-4"/> {Number(prod.price)} FAP</div>
                     
                     <div className="mt-auto grid grid-cols-3 gap-2">
                       <button onClick={() => toggleProductVisibility(prod.id, isVis)} className={`py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border ${isVis ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"}`} title={isVis ? "Mağazada Gizle" : "Mağazada Yayınla"}>
                         {isVis ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                         <span className="sr-only">{isVis ? "Gizle" : "Yayınla"}</span>
                       </button>
                       <button onClick={() => handleEditProduct(prod)} className="py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-blue-500/20 flex items-center justify-center" title="Düzenle">
                         <Edit className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => handleDeleteProduct(prod.id)} className="py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-red-500/20 flex items-center justify-center" title="Kalıcı Sil">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 animate-in fade-in">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/> Test Araçları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                 <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500"/> Bakiye Hilesi</h4>
                 <p className="text-xs text-slate-400 mb-4">Mağazayı test edebilmeniz için admin hesabınıza anında 10.000 FAP Coin yükler.</p>
                 <button onClick={async () => {
                    if (currentUser) {
                       await updateDoc(doc(db, "users", currentUser.id), { fapCoin: 10000 });
                       alert("Hesabınıza 10.000 FAP Coin başarıyla yüklendi!");
                    }
                 }} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors">10.000 Coin Yükle</button>
               </div>

               <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                 <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-500"/> Simülasyon Botu</h4>
                 <p className="text-xs text-slate-400 mb-4">Otomatik bir bot hesabı oluşturur. Arka planda sürekli oyun oynar, FAP coin kazanır ve rastgele fikir/hata bildirimi gönderir.</p>
                 <button onClick={toggleBotSimulation} className={`w-full py-3 font-bold rounded-xl transition-colors ${isBotRunning ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                    {isBotRunning ? "Botu Durdur" : "Test Botunu Başlat"}
                 </button>
                 {isBotRunning && <p className="text-[10px] text-emerald-400 mt-2 text-center animate-pulse">Bot şu an aktif. (Kullanıcılar ve Fikir Kutusu sekmesinden izleyebilirsiniz)</p>}
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
