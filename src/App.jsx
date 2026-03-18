import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Gamepad2, Library, FlaskConical, Search, User, Play,
  ChevronRight, Sparkles, Wallet, X, Lock, LogOut, CalendarDays,
  CheckCircle2, ShieldAlert, MessageCircle, Film, HelpCircle,
  Lightbulb, MessageSquarePlus, Send, AlertTriangle, Trophy, Mail,
  Copy, Check, Crown, Zap, HeartHandshake, Star, Share2, Download,
  Smartphone, Maximize, Trash, Gift, ShoppingBag, Coins, Truck,
  CreditCard, Clock, Eye, EyeOff, Edit, Instagram, ExternalLink,
  TrendingUp, Users, Package, BarChart3, Plus, Sword, Gem,
  Brain, Rocket, Globe
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

const ADMIN_EMAILS = Object.freeze([
  "forgeandplay@gmail.com",
  "carkci.caner@gmail.com"
]);

const PAYMENT_LINKS = Object.freeze({
  "1A": "https://www.shopier.com/forgeandplay/44689059",
  "6A": "https://www.shopier.com/forgeandplay/44689160",
  "1Y": "https://www.shopier.com/forgeandplay/44689235"
});

const LOGO_URL = "https://i.ibb.co/HppdF5nY/freepik-minimal-futuristic-gaming-logo-forge-hammer-combin-64278.png";
const INSTAGRAM_URL = "https://www.instagram.com/forgeandplayshop?igsh=MWFsdWp1bDIwMzJxaA%3D%3D&utm_source=qr";

/* =========================================================================
   FAP COIN AYARLARI
   ========================================================================= */
const FAP_COIN_CONFIG = {
  perSession: 0.5,        // Her 10 dk aktif oyun = 0.5 FAP
  sessionMinutes: 10,     // Oturum süresi (dakika)
  dailyMax: 16,           // Günlük maksimum FAP
  checkInterval: 15000,   // Kontrol aralığı (ms) - 15 saniye
  sessionSeconds: 600,    // 600 saniye = 10 dakika
};

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
    description: "Konuş, şüphelen, oyla: Vampirleri bul, kasabayı kurtar. Rol yapma ve strateji bir arada.",
    price: "Premium İçerik", basePlayers: 1240,
    gradient: "from-red-900 via-rose-950 to-black", iconKey: "user",
    url: "https://vampir-oyunu.vercel.app/",
    image: "https://i.ibb.co/KxP67Mm1/Ba-l-ks-z-4.png",
    requiresPremium: true,
  },
  {
    id: "forge-play-quiz", title: "Forge&Play Quiz", status: "Yayında", type: "live",
    tags: ["Bilgi", "Yarışma", "Zeka"],
    description: "Genel kültürünü sına, arkadaşlarınla yarış! Liderlik tablosunda zirvede yerini al.",
    price: "Premium İçerik", basePlayers: 420,
    gradient: "from-indigo-900 via-blue-950 to-black", iconKey: "help",
    url: "https://forge-and-play-quiz.vercel.app/",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "pis-yedili", title: "Pis 7'li", status: "Yayında", type: "live",
    tags: ["Kart Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Klasik kart oyunu Pis 7'li şimdi dijitalde! Hünerlerini sergile, arkadaşlarını geride bırak.",
    price: "Premium İçerik", basePlayers: 1560,
    gradient: "from-fuchsia-900 via-purple-950 to-black", iconKey: "user",
    url: "https://pis7li-oyunu.vercel.app/",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: true,
  },
  {
    id: "monopoly-bank", title: "Monopoly Dijital Banka", status: "Yayında", type: "live",
    tags: ["Araç", "Masa Oyunu", "Finans"],
    description: "Kağıt paralarla uğraşmaya son! Arkadaşlarınızla Monopoly oynarken kasanızı dijital olarak yönetin.",
    price: "Premium İçerik", basePlayers: 345,
    gradient: "from-emerald-900 via-teal-950 to-black", iconKey: "wallet",
    url: "https://siprayt-monopoly.vercel.app/",
    image: "https://i.ibb.co/RGmKfVY8/freepik-3d-cinematic-monopoly-style-board-game-world-comin-87944.png",
    requiresPremium: true,
  },
  {
    id: "sessiz-sinema", title: "Sessiz Sinema", status: "Yakında", type: "upcoming",
    tags: ["Parti", "Eğlence", "Rol Yapma"],
    description: "Hiç konuşmadan, sadece hareketlerinle filmleri takımına anlat. Klasik eğlence dijitalde.",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-blue-900 via-cyan-950 to-black", iconKey: "film", url: null,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "yuzbir-okey", title: "101 Okey", status: "Yakında", type: "upcoming",
    tags: ["Masa Oyunu", "Klasik", "Çok Oyunculu"],
    description: "Efsanevi 101 Okey deneyimi yakında dijital masalarınızda. Taşları dizmeye hazır mısınız?",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-red-900 via-red-950 to-black", iconKey: "user", url: null,
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "koz-maca-batak", title: "Koz Maça (Batak)", status: "Yakında", type: "upcoming",
    tags: ["Kart Oyunu", "Klasik", "Strateji"],
    description: "İhaleyi al, kozunu belirle ve masayı domine et. Efsanevi batak yakında Forge&Play'de.",
    price: "Geliştiriliyor", basePlayers: 0,
    gradient: "from-slate-800 via-slate-950 to-black", iconKey: "user", url: null,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  }
];

/* =========================================================================
   LAB PROJELERİ — Genişletilmiş
   ========================================================================= */
const LAB_PROJECTS = [
  {
    id: "forge-defend",
    title: "Forge & Defend: Dragon's Sabotage",
    progress: 38,
    status: "Geliştiriliyor",
    tag: "Tower Defense",
    description: "Ejderhaların saldırısı altındaki kalenizi savunun! Kuleleri stratejik noktalara yerleştirin, büyüler kullanın, düşman dalgalarını geçirmeyin. Her seviyede artan zorluk ve özel boss savaşları sizi bekliyor.",
    gradient: "from-red-900 to-orange-950",
    iconKey: "sword",
    accentColor: "text-red-400",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "gem-crush",
    title: "Gem Crush: Forge Edition",
    progress: 62,
    status: "Beta Yakında",
    tag: "Puzzle / Match-3",
    description: "Renkli taşları eşleştir, patlat, rekor kır! Candy Crush'tan ilham alan bu match-3 yapboz oyununda Forge&Play evreni temasıyla tasarlanmış 100+ seviye sizi bekliyor. Arkadaşlarınla rekabete gir!",
    gradient: "from-purple-900 to-pink-950",
    iconKey: "gem",
    accentColor: "text-purple-400",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ai-dungeon",
    title: "AI Zindan Ustası (D&D)",
    progress: 45,
    status: "Geliştiriliyor",
    tag: "RPG / AI",
    description: "Yapay zekanın oyun yöneticisi olduğu, sınırsız senaryoya sahip RPG deneyimi. Her karar farklı bir maceraya yol açıyor. Zindanları keşfet, canavarlarla savaş, efsanevi silahlar kazan.",
    gradient: "from-orange-900 to-slate-900",
    iconKey: "brain",
    accentColor: "text-orange-400",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "life-path",
    title: "LifePath Simulator",
    progress: 80,
    status: "Beta Yakında",
    tag: "Simülasyon",
    description: "Hayatın iplerini eline al. Kariyer, ilişki, finans — her seçim seni farklı bir geleceğe götürüyor. Arkadaşlarınla kıyaslayın, kim daha başarılı bir hayat kurabildi?",
    gradient: "from-amber-900 to-slate-900",
    iconKey: "rocket",
    accentColor: "text-amber-400",
    image: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "world-quiz-live",
    title: "World Quiz LIVE",
    progress: 55,
    status: "Geliştiriliyor",
    tag: "Bilgi / Canlı",
    description: "Tüm Forge&Play kullanıcılarıyla aynı anda canlı bilgi yarışması! Her gece 21:00'de başlayan turnuvaya katıl, ilk 3'e gir, özel FAP Coin ödülleri kazan.",
    gradient: "from-blue-900 to-indigo-950",
    iconKey: "globe",
    accentColor: "text-blue-400",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "forge-cards",
    title: "Forge Cards: Dueling Arena",
    progress: 20,
    status: "Erken Geliştirme",
    tag: "Kart Oyunu / Strateji",
    description: "Forge&Play evreniyle bütünleşik koleksiyon kart oyunu. Desteni oluştur, efsanevi kartlar topla, rakiplerine karşı taktiksel savaşlar ver. Hearthstone'dan ilham, tamamen özgün kart seti.",
    gradient: "from-teal-900 to-slate-900",
    iconKey: "sword",
    accentColor: "text-teal-400",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=800",
  },
];

const focusStyles = "focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950";

/* =========================================================================
   GÜVENLİK
   ========================================================================= */
const BAD_WORDS = ["amk","aq","sg","siktir","yavşak","oç","orospu","piç","ibne","göt","sik","yarrak","am","meme","sikik","amcık","ananı","bacı","pezevenk","gerizekalı","salak","aptal"];

function sanitizeText(text) {
  if (!text) return '';
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;').replace(/[{}[\]()]/g,'').trim().substring(0,1000);
}
function containsProfanity(text) {
  if (!text) return false;
  const l = String(text).toLowerCase();
  return BAD_WORDS.some(w => l.includes(w));
}
function calculateRank(playCount) {
  return Math.max(1, 50000 - Math.max(0, Number(playCount)||0) * 142).toLocaleString('tr-TR');
}
function isUserAdmin(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.email) return ADMIN_EMAILS.includes(String(user.email).toLowerCase().trim());
  return false;
}
function isUserPremium(user) {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  if (!user.premiumEndDate) return false;
  try { return new Date(user.premiumEndDate) > new Date(); } catch { return false; }
}
function getRemainingDays(d) {
  if (!d) return null;
  try { return Math.ceil((new Date(d) - new Date()) / 86400000); } catch { return null; }
}
function createRateLimiter(max=5, window=60000, maxKeys=1000) {
  const m = new Map();
  return key => {
    const now = Date.now();
    if (m.size > maxKeys) m.delete(m.keys().next().value);
    const r = (m.get(key)||[]).filter(t=>now-t<window);
    if (r.length >= max) return false;
    r.push(now); m.set(key, r); return true;
  };
}
const feedbackRateLimiter = createRateLimiter(3, 60000);
const loginRateLimiter = createRateLimiter(5, 300000);

/* =========================================================================
   ICON MAP
   ========================================================================= */
function GameIcon({ iconKey, className }) {
  const cls = className || "w-10 h-10 md:w-12 md:h-12";
  const map = { wallet: [Wallet,"text-emerald-500"], message: [MessageCircle,"text-orange-500"], film: [Film,"text-blue-500"], help: [HelpCircle,"text-amber-500"], sword: [Sword,"text-red-400"], gem: [Gem,"text-purple-400"], brain: [Brain,"text-orange-400"], rocket: [Rocket,"text-amber-400"], globe: [Globe,"text-blue-400"] };
  const [Icon, color] = map[iconKey] || [User,"text-red-500"];
  return <Icon className={`${cls} ${color}`} />;
}

function LivePlayerCount({ base }) {
  const [count, setCount] = useState(base);
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    if (!base) return;
    const iv = setInterval(() => { if (ref.current) setCount(p => Math.max(Math.max(0,base-50), Math.min(base+50, p+(Math.floor(Math.random()*9)-3)))); }, 4000);
    return () => { ref.current=false; clearInterval(iv); };
  }, [base]);
  if (!base) return <span className="text-[10px] text-slate-500">Yakında</span>;
  return (
    <span className="text-[10px] md:text-xs text-emerald-400 flex items-center gap-1 font-medium">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
      {count.toLocaleString('tr-TR')} Oynuyor
    </span>
  );
}

/* =========================================================================
   FEEDBACK FORMU
   ========================================================================= */
const FeedbackForm = ({ currentUser, onSubmit }) => {
  const [text, setText] = useState(""); const [game, setGame] = useState("Tabu");
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  const [chars, setChars] = useState(0); const [hp, setHp] = useState(""); const [math, setMath] = useState("");
  const [q] = useState(() => { const a=Math.floor(Math.random()*9)+1, b=Math.floor(Math.random()*9)+1; return {a,b,ans:a+b}; });

  const submit = async e => {
    e.preventDefault(); setError("");
    if (hp) { setError("Gönderim başarısız."); return; }
    if (parseInt(math,10)!==q.ans) { setError("Matematik sorusunu doğru cevaplayın."); return; }
    if (!currentUser) { setError("Giriş yapmalısınız."); return; }
    const t = text.trim();
    if (t.length < 10) { setError("En az 10 karakter yazın."); return; }
    if (containsProfanity(t)) { setError("Uygunsuz ifade tespit edildi."); return; }
    if (!feedbackRateLimiter(currentUser.id)) { setError("Çok hızlı gönderiyorsunuz, 1 dakika bekleyin."); return; }
    setSubmitting(true);
    try { await onSubmit({ text: sanitizeText(t), game: sanitizeText(game) }); setText(""); setChars(0); setMath(""); }
    catch { setError("Gönderilemedi, tekrar deneyin."); }
    finally { setSubmitting(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div aria-hidden="true" style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',overflow:'hidden'}}>
        <input type="text" value={hp} onChange={e=>setHp(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      {error && <div role="alert" className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Oyun</label>
        <select value={game} onChange={e=>setGame(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
          {GAMES.filter(g=>g.status==="Yayında").map(g=><option key={g.id} value={g.title}>{g.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Fikriniz</label>
        <textarea value={text} onChange={e=>{const v=e.target.value;setChars(v.length);if(v.length<=500)setText(v);}} placeholder="Oyun hakkında düşüncenizi paylaşın..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 min-h-[110px] resize-none" maxLength={500} disabled={submitting}/>
        <div className="flex justify-end mt-1"><span className={`text-xs ${chars>=450?'text-orange-400':'text-slate-600'}`}>{chars}/500</span></div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Güvenlik: {q.a} + {q.b} = ?</label>
        <input type="number" value={math} onChange={e=>setMath(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" required min="0" max="99"/>
      </div>
      <button type="submit" disabled={submitting||!text.trim()} className={`w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${focusStyles}`}>
        {submitting?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Gönderiliyor...</>:<><Send className="w-4 h-4"/>Gönder</>}
      </button>
    </form>
  );
};

/* =========================================================================
   ANA UYGULAMA
   ========================================================================= */
export default function App() {
  if (!isFirebaseConfigured) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse"/>
        <h1 className="text-2xl font-bold text-white">Firebase Kurulumu Gerekiyor</h1>
        <p className="text-slate-400 text-sm"><b>App.jsx</b> içindeki <code>firebaseConfig</code>'e kendi anahtarlarını yapıştır.</p>
      </div>
    </div>
  );

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("store");
  const [playingGame, setPlayingGame] = useState(null);
  const [selectedLibraryGame, setSelectedLibraryGame] = useState(GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [premiumWarningGame, setPremiumWarningGame] = useState(null);
  const [trialPromptGame, setTrialPromptGame] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Store state
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  // Admin state
  const [adminTab, setAdminTab] = useState("users");
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [newProductData, setNewProductData] = useState({ name:'', price:'', image:'', desc:'', type:'Dijital', isVisible:true });
  const [editingProductId, setEditingProductId] = useState(null);
  const editingProductIdRef = useRef(null); // Ref: stale closure'a karşı güvence
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Refs
  const playTimerRef = useRef(null);
  const fapIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const botIntervalRef = useRef(null);
  const activeSecondsRef = useRef(0);

  // ── MEMOIZED ───────────────────────────────────────────────────────────────
  const featuredGames = useMemo(() => GAMES.filter(g=>g.status==="Yayında"), []);
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter(g=>`${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase().includes(q));
  }, [searchQuery]);

  const sortedUsers = useMemo(() => {
    const list = [...usersList].sort((a,b)=>(a.pendingRequest?-1:1)-(b.pendingRequest?-1:1));
    const q = adminSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u=>String(u.name||"").toLowerCase().includes(q)||String(u.email||"").toLowerCase().includes(q));
  }, [usersList, adminSearch]);

  const isAdmin = useMemo(() => currentUser ? isUserAdmin(currentUser) : false, [currentUser]);

  const handleFirebaseError = useCallback(err => {
    if (process.env.NODE_ENV==='development') console.warn("FB:", err?.message||err);
  }, []);

  // ── EFFECTS ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (fapIntervalRef.current) clearInterval(fapIntervalRef.current);
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
  }, []);

  // Carousel auto-play
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(() => setCurrentSlide(p=>(p+1)%featuredGames.length), 5000);
    return () => clearInterval(slideIntervalRef.current);
  }, [featuredGames.length]);

  // PWA
  useEffect(() => {
    const h = e => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener('beforeinstallprompt', h);
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) setIsIOS(true);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  // Auth listener
  useEffect(() => {
    if (!auth) return;
    let unsubUser=null, mounted=true;
    const unsubAuth = onAuthStateChanged(auth, async fbUser => {
      if (!mounted) return;
      if (fbUser) {
        try {
          const ref = doc(db, "users", fbUser.uid);
          unsubUser = onSnapshot(ref, async snap => {
            if (!mounted) return;
            const email = String(fbUser.email||"").toLowerCase().trim();
            const adminMail = ADMIN_EMAILS.includes(email);
            if (snap.exists()) {
              const data = snap.data();
              const upd = {};
              if (adminMail && data.role!=="admin") { upd.role="admin"; upd.premiumEndDate=new Date("2099-01-01").toISOString(); }
              if (!data.paymentCode) upd.paymentCode="FP-"+fbUser.uid.substring(0,4).toUpperCase();
              if (data.fapCoin===undefined) upd.fapCoin=0;
              if (data.dailyFap===undefined) upd.dailyFap=0;
              if (data.lastFapDate===undefined) upd.lastFapDate="";
              if (Object.keys(upd).length) await updateDoc(ref, upd).catch(handleFirebaseError);
              if (mounted) setCurrentUser({ id:fbUser.uid, email, ...data, ...upd });
            } else {
              const pc="FP-"+fbUser.uid.substring(0,4).toUpperCase();
              const safeName=sanitizeText(fbUser.displayName||email.split("@")[0]||"Oyuncu").substring(0,50);
              const nu={ name:safeName, email, role:adminMail?"admin":"user", premiumEndDate:adminMail?new Date("2099-01-01").toISOString():null, pendingRequest:null, playCount:0, premiumTrialsUsed:0, gamePlayCounts:{}, fapCoin:0, dailyFap:0, lastFapDate:"", paymentCode:pc, createdAt:serverTimestamp(), lastLogin:serverTimestamp() };
              await setDoc(ref, nu).catch(handleFirebaseError);
              if (mounted) setCurrentUser({ id:fbUser.uid, ...nu });
            }
            if (mounted) setAuthLoading(false);
          }, err=>{ handleFirebaseError(err); if(mounted) setAuthLoading(false); });
        } catch(err){ handleFirebaseError(err); if(mounted) setAuthLoading(false); }
      } else {
        if (mounted) { setCurrentUser(null); setAuthLoading(false); }
      }
    });
    return () => { mounted=false; unsubAuth(); if(unsubUser) unsubUser(); };
  }, [handleFirebaseError]);

  // Firestore listeners
  useEffect(() => {
    if (!db) return;
    // Store products — client-side sort, no index needed
    setStoreLoading(true);
    const unsubProducts = onSnapshot(collection(db,"store_products"), snap => {
      const prods = snap.docs.map(d=>({id:d.id,...d.data()}));
      prods.sort((a,b)=>{
        const at=a.createdAt?.seconds??0, bt=b.createdAt?.seconds??0;
        return bt-at;
      });
      setStoreProducts(prods);
      setStoreLoading(false);
    }, err=>{ handleFirebaseError(err); setStoreLoading(false); });

    const unsubFeedbacks = onSnapshot(query(collection(db,"feedbacks"),orderBy("createdAt","desc")), snap => {
      setFeedbacks(snap.docs.map(d=>{
        const data=d.data();
        let date=new Date().toISOString();
        if (data.createdAt?.toDate) date=data.createdAt.toDate().toISOString();
        return { id:d.id, ...data, createdAt:date };
      }));
    }, handleFirebaseError);

    let unsubUsers=null, unsubOrders=null;
    if (isAdmin) {
      unsubUsers = onSnapshot(collection(db,"users"), snap=>setUsersList(snap.docs.map(d=>({id:d.id,...d.data()}))), handleFirebaseError);
      unsubOrders = onSnapshot(query(collection(db,"orders"),orderBy("createdAt","desc")), snap=>{
        setOrdersList(snap.docs.map(d=>{
          const data=d.data();
          let dt=new Date().toLocaleDateString('tr-TR');
          if (data.createdAt?.toDate) { const dd=data.createdAt.toDate(); dt=dd.toLocaleDateString('tr-TR')+" "+dd.toLocaleTimeString('tr-TR'); }
          return { id:d.id, ...data, displayDate:dt };
        }));
      }, handleFirebaseError);
    }
    return () => { unsubProducts(); unsubFeedbacks(); if(unsubUsers) unsubUsers(); if(unsubOrders) unsubOrders(); };
  }, [isAdmin, handleFirebaseError]);

  // ── FAP COIN LOGIC ─────────────────────────────────────────────────────────
  const earnFapCoin = useCallback(async () => {
    if (!currentUser || !isUserPremium(currentUser)) return;
    const today = new Date().toLocaleDateString('tr-TR');
    const dailyEarned = currentUser.lastFapDate===today ? Number(currentUser.dailyFap||0) : 0;
    if (dailyEarned >= FAP_COIN_CONFIG.dailyMax) return;
    try {
      const add = FAP_COIN_CONFIG.perSession;
      const newDaily = dailyEarned + add;
      await updateDoc(doc(db,"users",currentUser.id), { fapCoin:increment(add), dailyFap:newDaily, lastFapDate:today }).catch(handleFirebaseError);
      setCurrentUser(prev=>prev?({...prev, fapCoin:(Number(prev.fapCoin)||0)+add, dailyFap:newDaily, lastFapDate:today}):null);
    } catch(e){ handleFirebaseError(e); }
  }, [currentUser, handleFirebaseError]);

  const startFapTimer = useCallback(() => {
    if (fapIntervalRef.current) clearInterval(fapIntervalRef.current);
    activeSecondsRef.current = 0;
    fapIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        activeSecondsRef.current += FAP_COIN_CONFIG.checkInterval / 1000;
        if (activeSecondsRef.current >= FAP_COIN_CONFIG.sessionSeconds) {
          earnFapCoin();
          activeSecondsRef.current = 0;
        }
      }
    }, FAP_COIN_CONFIG.checkInterval);
  }, [earnFapCoin]);

  const stopFapTimer = useCallback(() => {
    if (fapIntervalRef.current) { clearInterval(fapIntervalRef.current); fapIntervalRef.current=null; }
    activeSecondsRef.current = 0;
  }, []);

  // ── GAME LOGIC ─────────────────────────────────────────────────────────────
  const proceedToGame = useCallback((game, isTrial=false) => {
    setTrialPromptGame(null);
    setPlayingGame(game);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    playTimerRef.current = setTimeout(async () => {
      if (currentUser) {
        try {
          const gc = { ...(currentUser.gamePlayCounts||{}) };
          gc[game.id] = (Number(gc[game.id])||0)+1;
          const upd = { playCount:(Number(currentUser.playCount)||0)+1, lastPlayedGameName:game.title, lastPlayed:serverTimestamp(), gamePlayCounts:gc };
          if (isTrial) upd.premiumTrialsUsed=(Number(currentUser.premiumTrialsUsed)||0)+1;
          await updateDoc(doc(db,"users",currentUser.id), upd).catch(handleFirebaseError);
          setCurrentUser(prev=>prev?({...prev, playCount:(Number(prev.playCount)||0)+1, lastPlayedGameName:game.title, gamePlayCounts:gc, premiumTrialsUsed:isTrial?(Number(prev.premiumTrialsUsed)||0)+1:prev.premiumTrialsUsed}):null);
        } catch(e){ handleFirebaseError(e); }
      }
    }, 60000);
    if (currentUser && isUserPremium(currentUser)) startFapTimer();
  }, [currentUser, handleFirebaseError, startFapTimer]);

  const openGame = useCallback(game => {
    if (!game) return;
    if (!game.url) { alert("Bu oyun henüz yayında değil."); return; }
    if (game.requiresPremium && !isUserPremium(currentUser)) {
      if (!currentUser) { setShowLoginModal(true); return; }
      const t = Number(currentUser?.premiumTrialsUsed||0);
      if (t >= 3) { setPremiumWarningGame(game); return; }
      setTrialPromptGame(game); return;
    }
    proceedToGame(game, false);
  }, [currentUser, proceedToGame]);

  const closeGame = useCallback(() => {
    setPlayingGame(null);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    stopFapTimer();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(()=>{});
  }, [stopFapTimer]);

  const getSecureGameUrl = useCallback(url => {
    if (!url) return "";
    try { const u=new URL(url); u.searchParams.set("source","forgeandplay"); return u.toString(); } catch { return url; }
  }, []);

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async e => {
    e.preventDefault(); setAuthError("");
    const email=emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAuthError("Geçerli bir e-posta girin."); return; }
    if (!passwordInput) { setAuthError("Şifre boş bırakılamaz."); return; }
    if (!loginRateLimiter(email)) { setAuthError("Çok fazla deneme. 5 dakika bekleyin."); return; }
    try {
      if (isRegistering) { if (passwordInput.length<6){setAuthError("Şifre en az 6 karakter.");return;} await createUserWithEmailAndPassword(auth,email,passwordInput); }
      else await signInWithEmailAndPassword(auth,email,passwordInput);
      setShowLoginModal(false); setPasswordInput(""); setEmailInput("");
    } catch(err) {
      const m={'auth/email-already-in-use':"Bu e-posta kullanılıyor.",'auth/invalid-email':"Geçersiz e-posta.",'auth/user-disabled':"Hesap devre dışı.",'auth/user-not-found':"Bilgiler hatalı.",'auth/wrong-password':"Bilgiler hatalı.",'auth/invalid-credential':"Bilgiler hatalı.",'auth/too-many-requests':"Hesap kilitlendi."};
      setAuthError(m[err.code]||"Giriş başarısız.");
    }
  };
  const handleGoogleLogin = async () => {
    setAuthError("");
    try { await signInWithPopup(auth,googleProvider); setShowLoginModal(false); }
    catch(e){ setAuthError(e.code==='auth/popup-closed-by-user'?"Pencere kapatıldı.":"Google ile giriş yapılamadı."); }
  };
  const handlePasswordReset = async () => {
    const email=emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setAuthError("Geçerli e-posta girin.");return;}
    try { await sendPasswordResetEmail(auth,email); setAuthError("Şifre sıfırlama bağlantısı gönderildi."); setShowResetPassword(false); }
    catch { setAuthError("E-posta gönderilemedi."); }
  };

  // ── PREMIUM PURCHASE ────────────────────────────────────────────────────────
  const handlePurchaseRequest = async plan => {
    if (!currentUser) { setPremiumWarningGame(null); setActiveTab("premium"); setShowLoginModal(true); return; }
    if (!PAYMENT_LINKS[plan]) { alert("Geçersiz plan."); return; }
    try {
      await updateDoc(doc(db,"users",currentUser.id),{pendingRequest:plan,lastPurchaseAttempt:serverTimestamp()}).catch(handleFirebaseError);
      setPremiumWarningGame(null);
      setPaymentIntent({ url:PAYMENT_LINKS[plan], plan });
    } catch { alert("Satın alma talebi oluşturulamadı."); }
  };

  // ── FEEDBACK ─────────────────────────────────────────────────────────────────
  const handleFeedbackSubmit = async data => {
    if (!currentUser) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db,"feedbacks"),{ text:sanitizeText(data.text), game:sanitizeText(data.game), userId:currentUser.id, user:sanitizeText(currentUser.name||currentUser.email), email:String(currentUser.email), status:"beklemede", createdAt:serverTimestamp(), date:new Date().toLocaleDateString('tr-TR') }).catch(handleFirebaseError);
      alert("Geri bildiriminiz gönderildi, teşekkürler!");
    } catch { alert("Gönderilemedi."); }
    finally { setIsSubmittingFeedback(false); }
  };

  // ── STORE ───────────────────────────────────────────────────────────────────
  const handleRewardPurchase = async e => {
    e.preventDefault();
    if (!currentUser||!selectedProduct) return;
    const balance = Number(currentUser.fapCoin||0);
    const cost = Number(selectedProduct.price||0);
    if (balance < cost) { alert(`Yetersiz FAP Coin!\nBakiye: ${balance.toFixed(1)}\nGerekli: ${cost}`); return; }
    if (selectedProduct.type==="Fiziksel"&&!orderAddress.trim()) { alert("Teslimat adresi zorunludur."); return; }
    setIsOrdering(true);
    try {
      const newBal = balance-cost;
      await updateDoc(doc(db,"users",currentUser.id),{fapCoin:newBal}).catch(handleFirebaseError);
      await addDoc(collection(db,"orders"),{ userId:currentUser.id, userEmail:String(currentUser.email), userName:sanitizeText(currentUser.name||"İsimsiz"), productId:selectedProduct.id, productName:sanitizeText(selectedProduct.name), productType:selectedProduct.type, fapCost:cost, addressDetails:sanitizeText(orderAddress||"Dijital Ürün"), status:"Onay Bekliyor", createdAt:serverTimestamp() }).catch(handleFirebaseError);
      setCurrentUser(prev=>prev?{...prev,fapCoin:newBal}:null);
      alert("Siparişiniz alındı! Admin onayından sonra e-posta ile bilgilendirileceksiniz.");
      setSelectedProduct(null); setOrderAddress("");
    } catch(err){ handleFirebaseError(err); alert("Sipariş oluşturulamadı."); }
    finally { setIsOrdering(false); }
  };

  // ── PWA ──────────────────────────────────────────────────────────────────────
  const handleInstallApp = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const{outcome}=await deferredPrompt.userChoice; if(outcome==='accepted') setIsInstallable(false); setDeferredPrompt(null); }
    else setShowInstallGuide(true);
  };
  const handleSharePlatform = async () => {
    const d={title:'Forge&Play',text:'Harika parti oyunları için Forge&Play!',url:window.location.origin};
    if (navigator.share){try{await navigator.share(d);}catch{}}
    else { try{await navigator.clipboard.writeText(d.url);alert("Bağlantı kopyalandı!");}catch{alert("Bağlantı: "+d.url);} }
  };
  const handleShareGame = async (game, e) => {
    e?.stopPropagation();
    const d={title:game.title,text:`Forge&Play'de ${game.title} oynuyoruz!`,url:window.location.origin};
    if (navigator.share){try{await navigator.share(d);}catch{}}
    else{try{await navigator.clipboard.writeText(d.url);alert("Bağlantı kopyalandı!");}catch{}}
  };

  // ── BOT SİMÜLASYONU ─────────────────────────────────────────────────────────
  const toggleBot = async () => {
    if (isBotRunning) { if(botIntervalRef.current){clearInterval(botIntervalRef.current);botIntervalRef.current=null;} setIsBotRunning(false); alert("Bot durduruldu."); return; }
    if (!currentUser) { alert("Bot için giriş yapmalısınız."); return; }
    setIsBotRunning(true);
    alert("Bot başlatıldı! Her 30 saniyede 1 oturum simüle edilir.");
    botIntervalRef.current = setInterval(async () => {
      try {
        const live = GAMES.filter(g=>g.status==="Yayında");
        const rg = live[Math.floor(Math.random()*live.length)];
        await updateDoc(doc(db,"users",currentUser.id),{ playCount:increment(1), lastPlayedGameName:rg.title, lastLogin:serverTimestamp(), [`gamePlayCounts.${rg.id}`]:increment(1) }).catch(handleFirebaseError);
        setCurrentUser(prev=>prev?({...prev,playCount:(Number(prev.playCount)||0)+1,lastPlayedGameName:rg.title,gamePlayCounts:{...(prev.gamePlayCounts||{}),[rg.id]:(Number((prev.gamePlayCounts||{})[rg.id])||0)+1}}):null);
        await earnFapCoin();
        if (Math.random()<0.25) {
          const texts=["Oyun harika!","Yükleme biraz uzun.","Mobil uyum daha iyi olabilir.","Skor tablosu istiyoruz!","Davet sistemi ekleyin.","Sesler çok güzel.","Yeni oyun ne zaman?"];
          await addDoc(collection(db,"feedbacks"),{ userId:currentUser.id, user:`[BOT] ${currentUser.name||"Admin"}`, email:String(currentUser.email), game:rg.title, text:texts[Math.floor(Math.random()*texts.length)], status:"beklemede", createdAt:serverTimestamp(), date:new Date().toLocaleDateString('tr-TR'), isBotTest:true }).catch(handleFirebaseError);
        }
      } catch(e){ handleFirebaseError(e); }
    }, 30000);
  };

  // ── ADMIN HELPERS ────────────────────────────────────────────────────────────
  const approvePremium = async (userId, plan) => {
    const m={'1A':1,'6A':6,'1Y':12};
    const u = usersList.find(x=>x.id===userId); if(!u) return;
    const base = u.premiumEndDate&&new Date(u.premiumEndDate)>new Date()?new Date(u.premiumEndDate):new Date();
    base.setMonth(base.getMonth()+(m[plan]||1));
    await updateDoc(doc(db,"users",userId),{premiumEndDate:base.toISOString(),pendingRequest:null}).catch(handleFirebaseError);
  };
  const revokePremium = async userId => await updateDoc(doc(db,"users",userId),{premiumEndDate:null,pendingRequest:null}).catch(handleFirebaseError);
  const deleteUser = async user => {
    if (user.role==="admin"||ADMIN_EMAILS.includes(String(user.email).toLowerCase().trim())){alert("Admin silinemez!");return;}
    if (!window.confirm(`"${user.name||user.email}" silinsin mi?\n\nFirebase Auth kaydını Console'dan ayrıca silmeniz gerekir.`)) return;
    try { await deleteDoc(doc(db,"users",user.id)); alert("Kullanıcı silindi."); }
    catch(e){ handleFirebaseError(e); alert("Silinemedi: "+(e?.code||e?.message)); }
  };
  const approveFeedback = async (id, status) => await updateDoc(doc(db,"feedbacks",id),{status}).catch(handleFirebaseError);
  const handleOrderStatus = async (orderId, status, userId, cost) => {
    try {
      await updateDoc(doc(db,"orders",orderId),{status});
      if (status==="İptal/İade Edildi") { await updateDoc(doc(db,"users",userId),{fapCoin:increment(cost)}); alert("Sipariş iptal edildi, coinler iade edildi."); }
      else alert("Durum güncellendi: "+status);
    } catch(e){ handleFirebaseError(e); }
  };

  // Admin Store
  const saveProduct = async e => {
    e.preventDefault();
    const currentEditId = editingProductIdRef.current;

    if (!newProductData.name?.trim()||!newProductData.image?.trim()||!newProductData.desc?.trim()) {
      alert("Lütfen tüm alanları doldurun."); return;
    }
    const price = Number(newProductData.price);
    if (isNaN(price)||price<=0||price>100000) {
      alert("Geçerli bir fiyat girin (1 - 100.000)."); return;
    }
    if (!newProductData.image.startsWith('http')) {
      alert("Görsel URL'i http:// veya https:// ile başlamalıdır."); return;
    }

    const prod = {
      name: sanitizeText(newProductData.name).substring(0,150),
      price,
      image: newProductData.image.trim(),
      desc: sanitizeText(newProductData.desc).substring(0,500),
      type: ["Dijital","Fiziksel"].includes(newProductData.type) ? newProductData.type : "Dijital",
      isVisible: newProductData.isVisible !== false
    };

    try {
      if (currentEditId) {
        // setDoc ile güncelle — updateDoc'tan daha güvenilir,
        // mevcut ürünün createdAt'ini koru
        const existingProd = storeProducts.find(p => p.id === currentEditId);
        await setDoc(doc(db, "store_products", currentEditId), {
          ...prod,
          createdAt: existingProd?.createdAt ?? serverTimestamp()
        });
        alert(`"${prod.name}" başarıyla güncellendi!`);
      } else {
        await addDoc(collection(db, "store_products"), {
          ...prod,
          createdAt: serverTimestamp()
        });
        alert(`"${prod.name}" mağazaya eklendi!`);
      }
      setNewProductData({ name:'', price:'', image:'', desc:'', type:'Dijital', isVisible:true });
      setEditingProductId(null);
      editingProductIdRef.current = null;
    } catch(err) {
      handleFirebaseError(err);
      const code = err?.code || err?.message || "bilinmiyor";
      alert(
        `Kaydetme başarısız! Hata: ${code}\n\n` +
        `⚠️ Firestore Console → Firestore Database → Rules sekmesine git.\n` +
        `Aşağıdaki store_products kurallarının tam olarak bu şekilde olduğunu kontrol et:\n\n` +
        `match /store_products/{productId} {\n` +
        `  allow read: if true;\n` +
        `  allow create: if isAdmin();\n` +
        `  allow update: if isAdmin();\n` +
        `  allow delete: if isAdmin();\n` +
        `}\n\n` +
        `Değiştirdikten sonra "Yayınla" butonuna bas ve tekrar dene.`
      );
    }
  };

  const editProduct = prod => {
    if (!prod.id) { alert("Ürün ID'si bulunamadı."); return; }
    // Hem state hem ref'i güncelle
    setEditingProductId(prod.id);
    editingProductIdRef.current = prod.id;
    setNewProductData({
      name: prod.name || '',
      price: String(prod.price || ''),
      image: prod.image || '',
      desc: prod.desc || '',
      type: prod.type || 'Dijital',
      isVisible: prod.isVisible !== false
    });
    // Forma kaydır
    document.getElementById('product-form-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    editingProductIdRef.current = null;
    setNewProductData({ name:'', price:'', image:'', desc:'', type:'Dijital', isVisible:true });
  };
  const toggleVisibility = async (id, vis) => {
    if (!id) { alert("Ürün ID bulunamadı."); return; }
    try {
      const existing = storeProducts.find(p => p.id === id);
      await setDoc(doc(db,"store_products",id), { ...existing, isVisible: !vis, id: undefined }, { merge: false });
    } catch(e){
      // setDoc başarısız olursa updateDoc dene
      try { await updateDoc(doc(db,"store_products",id),{isVisible:!vis}); }
      catch(e2){ handleFirebaseError(e2); alert("Görünürlük değiştirilemedi. Firestore kurallarını kontrol edin."); }
    }
  };
  const deleteProduct = async id => {
    if (!id){alert("Ürün ID bulunamadı.");return;}
    if (!window.confirm("Bu ürünü kalıcı olarak silmek istiyorsunuz?")) return;
    try { await deleteDoc(doc(db,"store_products",id)); }
    catch(e){ handleFirebaseError(e); alert("Silinemedi: "+(e?.code||e?.message)); }
  };
  const clearAllProducts = async () => {
    if (!storeProducts.length){alert("Mağaza zaten boş.");return;}
    if (!window.confirm(`${storeProducts.length} ürün silinecek. Emin misiniz?`)) return;
    const errs=[];
    for (const p of storeProducts) { if (!p.id) continue; try{await deleteDoc(doc(db,"store_products",p.id));}catch(e){errs.push(p.name+": "+(e?.code||e?.message));} }
    if (errs.length) alert("Bazı ürünler silinemedi:\n"+errs.join("\n")); else alert("Tüm ürünler silindi.");
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 lg:h-[72px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 lg:gap-8">
          <button className={`flex items-center gap-2.5 cursor-pointer rounded-lg ${focusStyles} shrink-0`} onClick={()=>setActiveTab("store")}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/20 p-1.5 lg:p-2 rounded-xl shadow-lg shadow-orange-500/10 flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-6 h-6 lg:w-7 lg:h-7 object-contain"/>
            </div>
            <span className="text-xl lg:text-2xl font-black tracking-tight text-white hidden sm:block">Forge<span className="text-orange-500">&</span>Play</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {[{id:"store",icon:Gamepad2,label:"Oyunlar"},{id:"rewards",icon:Gift,label:"Ödül Mağazası"},{id:"library",icon:Library,label:"Kütüphane"},{id:"lab",icon:FlaskConical,label:"Lab"},{id:"feedback",icon:MessageSquarePlus,label:"Fikir Kutusu"}].map(tab=>{
              const Icon=tab.icon;
              return <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${focusStyles} ${activeTab===tab.id?"bg-slate-800 text-white shadow-sm":"text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><Icon className="w-4 h-4"/>{tab.label}</button>;
            })}
            <div className="pl-2 border-l border-slate-800 ml-1">
              <button onClick={()=>setActiveTab("premium")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${focusStyles} ${activeTab==="premium"?"bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105":"bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20"}`}>
                <Crown className="w-4 h-4"/> Premium
              </button>
            </div>
            {isAdmin && <button onClick={()=>setActiveTab("admin")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm ml-1 border border-slate-700 transition-all ${focusStyles} ${activeTab==="admin"?"bg-slate-800 text-white":"text-slate-500 hover:text-white hover:bg-slate-800"}`}><Lock className="w-4 h-4"/> Admin</button>}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-1 border-r border-slate-800 pr-3 mr-1">
            <button onClick={handleSharePlatform} className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors text-xs font-semibold"><Share2 className="w-3.5 h-3.5"/> Paylaş</button>
            <button onClick={handleInstallApp} className="flex items-center gap-1.5 px-2.5 py-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors text-xs font-semibold"><Download className="w-3.5 h-3.5"/> Yükle</button>
          </div>
          {authLoading ? <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/> : currentUser ? (
            <div className="flex items-center gap-2 pl-2 md:border-l border-slate-800">
              {isUserPremium(currentUser)&&<div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={()=>setActiveTab("rewards")} title="FAP Coin"><Coins className="w-3.5 h-3.5 text-amber-500"/><span className="text-xs font-bold text-amber-400">{Number(currentUser.fapCoin||0).toFixed(1)}</span></div>}
              <div className="hidden sm:flex flex-col items-end cursor-pointer hover:opacity-80" onClick={()=>setActiveTab("profile")}>
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name||"Kullanıcı"}</span>
                {isAdmin?<span className="text-[10px] font-bold uppercase text-amber-400">Yönetici</span>
                :currentUser.pendingRequest?<span className="text-[10px] font-bold uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                :isUserPremium(currentUser)?<span className="text-[10px] font-bold uppercase text-emerald-400">Premium · {getRemainingDays(currentUser.premiumEndDate)} Gün</span>
                :<span className="text-[10px] font-bold uppercase text-slate-500">Standart</span>}
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2 hover:ring-offset-slate-950 transition-all" onClick={()=>setActiveTab("profile")}>
                {String(currentUser.name||"U").charAt(0).toUpperCase()}
              </div>
              <button onClick={async()=>{setActiveTab("store");setPlayingGame(null);stopFapTimer();if(playTimerRef.current)clearTimeout(playTimerRef.current);try{await signOut(auth);}catch{}}} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Çıkış"><LogOut className="w-4 h-4"/></button>
            </div>
          ) : (
            <button onClick={()=>setShowLoginModal(true)} className={`flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 ${focusStyles}`}>
              <User className="w-4 h-4"/><span className="hidden sm:inline">Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const renderMobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/80 z-50 pb-safe">
      <div className="flex justify-around items-center px-2 py-1.5">
        {[{id:"store",icon:Gamepad2,label:"Oyunlar"},{id:"rewards",icon:Gift,label:"Mağaza"},{id:"premium",icon:Crown,label:"Premium"},{id:"feedback",icon:MessageSquarePlus,label:"Fikirler"},{id:"profile",icon:User,label:"Profil"}].map(tab=>{
          const Icon=tab.icon;
          return <button key={tab.id} onClick={()=>{if(tab.id==="profile"&&!currentUser)setShowLoginModal(true);else setActiveTab(tab.id);}} className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${focusStyles} ${activeTab===tab.id?(tab.id==="premium"?"text-amber-500":"text-orange-500"):"text-slate-500"}`}>
            <Icon className={`w-5 h-5 mb-0.5 ${tab.id==="premium"&&activeTab!=="premium"?"text-amber-500/60":""}`}/>
            <span className="text-[9px] font-bold">{tab.label}</span>
          </button>;
        })}
        {isAdmin&&<button onClick={()=>setActiveTab("admin")} className={`flex flex-col items-center py-1 px-2 rounded-lg ${activeTab==="admin"?"text-amber-400":"text-slate-500"}`}><Lock className="w-5 h-5 mb-0.5"/><span className="text-[9px] font-bold">Admin</span></button>}
      </div>
    </div>
  );

  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto mx-auto">
        <button onClick={()=>{setShowLoginModal(false);setAuthError("");}} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 p-2"><img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain"/></div>
          <h2 className="text-2xl font-black text-white">{isRegistering?"Aramıza Katıl":"Giriş Yap"}</h2>
          <p className="text-slate-400 text-sm mt-1">Forge&Play kütüphanene erişmek için giriş yap.</p>
        </div>
        {authError&&<div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs text-center font-bold">{authError}</div>}
        <form onSubmit={handleLoginSubmit} className="space-y-3">
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label><input type="email" required value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="ornek@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm" autoComplete="email"/></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label><input type="password" required value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm" autoComplete={isRegistering?"new-password":"current-password"}/></div>
          {!isRegistering&&<div className="text-right"><button type="button" onClick={()=>setShowResetPassword(true)} className="text-xs text-orange-500 hover:text-orange-400">Şifremi Unuttum</button></div>}
          {showResetPassword&&<div className="p-3 bg-slate-800 rounded-xl text-center"><p className="text-sm text-slate-300 mb-2">Şifre sıfırlama bağlantısı gönderilecek.</p><button type="button" onClick={handlePasswordReset} className="text-sm font-bold text-orange-500 hover:text-orange-400">Gönder</button></div>}
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-2">{isRegistering?"Kayıt Ol":"Giriş Yap"}</button>
        </form>
        <div className="flex items-center py-4"><div className="flex-grow border-t border-slate-800"/><span className="mx-3 text-slate-500 text-xs">veya</span><div className="flex-grow border-t border-slate-800"/></div>
        <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-colors mb-5">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google ile {isRegistering?"Kayıt Ol":"Giriş Yap"}
        </button>
        <p className="text-center text-sm text-slate-400">{isRegistering?"Hesabın var mı?":"Hesabın yok mu?"}{" "}<button onClick={()=>{setIsRegistering(!isRegistering);setAuthError("");}} className="text-orange-500 font-bold hover:text-orange-400" type="button">{isRegistering?"Giriş Yap":"Kayıt Ol"}</button></p>
      </div>
    </div>
  );

  const renderPaymentModal = () => {
    if (!paymentIntent||!currentUser) return null;
    const copy=async()=>{ try{await navigator.clipboard.writeText(currentUser.paymentCode);setIsCopied(true);setTimeout(()=>setIsCopied(false),2000);}catch{} };
    return (
      <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={()=>setPaymentIntent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
          <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20"><Wallet className="w-7 h-7 text-orange-500"/></div>
          <h2 className="text-xl font-black text-white mb-2">Ödeme Kodu</h2>
          <p className="text-slate-300 text-sm mb-5">Shopier'daki <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">"Sipariş Notu"</strong> kısmına bu kodu yazın.</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 flex items-center justify-between">
            <span className="text-2xl font-mono font-black text-orange-400 tracking-wider">{currentUser.paymentCode}</span>
            <button onClick={copy} className={`p-2.5 rounded-lg border transition-colors ${isCopied?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30":"bg-slate-800 text-slate-300 hover:text-white border-slate-700"}`}>{isCopied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</button>
          </div>
          <button onClick={()=>{window.open(paymentIntent.url,"_blank","noopener,noreferrer");setPaymentIntent(null);}} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">Kopyaladım, Ödemeye Geç <ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
    );
  };

  const renderTrialModal = () => {
    if (!trialPromptGame||!currentUser) return null;
    const rem = 3-Number(currentUser.premiumTrialsUsed||0);
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" role="dialog">
        <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={()=>setTrialPromptGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
          <Sparkles className="w-14 h-14 text-emerald-500 mx-auto mb-4"/>
          <h2 className="text-2xl font-black text-white mb-2">Ücretsiz Deneme!</h2>
          <p className="text-slate-300 text-sm mb-5 leading-relaxed"><b>{trialPromptGame.title}</b> için 1 hak kullanılacak. <em className="text-slate-400">(1 dk'dan az kalırsanız hak düşmez.)</em></p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-5"><span className="text-emerald-400 font-bold">Kalan: {rem} / 3 Hak</span></div>
          <div className="flex flex-col gap-3">
            <button onClick={()=>proceedToGame(trialPromptGame,true)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Hakkımı Kullan ({rem} Kaldı)</button>
            <button onClick={()=>setTrialPromptGame(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl">Şimdilik Sakla</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumWarningModal = () => {
    if (!premiumWarningGame) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog">
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-lg p-6 md:p-10 shadow-2xl relative my-auto text-center">
          <button onClick={()=>setPremiumWarningGame(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
          <Lock className="w-14 h-14 text-amber-500 mx-auto mb-4"/>
          <h2 className="text-3xl font-black text-white mb-2">Deneme Hakkınız Bitti</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto mb-8"><b>{premiumWarningGame.title}</b> için Premium aboneliği inceleyin.</p>
          <button onClick={()=>{setPremiumWarningGame(null);setActiveTab("premium");}} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-lg">Premium Paketleri İncele</button>
          <button onClick={()=>setPremiumWarningGame(null)} className="block mx-auto mt-4 px-8 py-3 text-slate-400 hover:text-white font-bold">Vazgeç</button>
        </div>
      </div>
    );
  };

  const renderPlayerOverlay = () => {
    if (!playingGame) return null;
    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col" style={{height:"100dvh"}}>
        <div className="flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950 border-b border-slate-800 z-20">
          <div className="flex items-center gap-2 truncate">
            <img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain bg-slate-900 p-0.5 rounded border border-slate-800"/>
            <span className="hidden sm:inline text-white font-black text-sm tracking-tight">Forge<span className="text-orange-500">&</span>Play</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-orange-400 font-bold text-xs bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 truncate max-w-[160px]">{playingGame.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={()=>{const d=document.documentElement;if(!document.fullscreenElement)d.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});}} className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800 hidden sm:block"><Maximize className="w-4 h-4"/></button>
            <button onClick={closeGame} className={`flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 py-2 rounded-lg text-xs font-bold transition-all ${focusStyles}`}><X className="w-4 h-4"/><span className="hidden sm:inline">Çık</span></button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-950">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
            <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3"/>
            <span className="text-orange-500 text-sm font-bold animate-pulse">Yükleniyor...</span>
          </div>
          <iframe src={getSecureGameUrl(playingGame.url)} className="absolute inset-0 w-full h-full border-none z-10" title={playingGame.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads" loading="lazy"/>
        </div>
      </div>
    );
  };

  const renderInstallModal = () => {
    if (!showInstallGuide) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={()=>setShowInstallGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
          <Download className="w-10 h-10 text-emerald-500 mx-auto mb-4"/>
          <h2 className="text-xl font-black text-white mb-2">Ana Ekrana Ekle</h2>
          <div className="text-left space-y-3 mb-5 text-sm">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><b className="text-white">🍎 iOS:</b><ol className="text-slate-400 mt-2 space-y-1 list-decimal list-inside"><li>Alt menü → <b className="text-slate-300">Paylaş</b> ikonu</li><li><b className="text-slate-300">Ana Ekrana Ekle</b></li><li><b className="text-slate-300">Ekle</b>'ye bas</li></ol></div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><b className="text-white">🤖 Android:</b><ol className="text-slate-400 mt-2 space-y-1 list-decimal list-inside"><li>Sağ üst → <b className="text-slate-300">Üç Nokta</b></li><li><b className="text-slate-300">Ana Ekrana Ekle</b></li><li><b className="text-slate-300">Ekle</b>'ye bas</li></ol></div>
          </div>
          <button onClick={()=>setShowInstallGuide(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Anladım</button>
        </div>
      </div>
    );
  };

  // ── STORE PAGE ────────────────────────────────────────────────────────────────
  const renderRewardsStore = () => {
    const renderPurchaseModal = () => {
      if (!selectedProduct) return null;
      const isPhysical = selectedProduct.type==="Fiziksel";
      return (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto">
            <button onClick={()=>setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
            <div className="mb-5 text-center">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-36 object-cover rounded-xl mb-4 border border-slate-800"/>
              <h3 className="text-lg font-bold text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-amber-400 font-bold flex items-center justify-center gap-1"><Coins className="w-4 h-4"/> {Number(selectedProduct.price)} FAP Coin</p>
            </div>
            <form onSubmit={handleRewardPurchase} className="space-y-4">
              {isPhysical ? (
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Teslimat Adresi *</label><textarea required value={orderAddress} onChange={e=>setOrderAddress(e.target.value)} placeholder="Ürünün gönderileceği tam adres..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 min-h-[90px] resize-none text-sm" maxLength={500}/></div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center"><p className="text-emerald-400 text-sm">Dijital ürün — onaydan sonra <b>{currentUser?.email}</b> adresine gönderilir.</p></div>
              )}
              <button type="submit" disabled={isOrdering} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {isOrdering?<><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"/>İşleniyor...</>:"Siparişi Tamamla"}
              </button>
            </form>
          </div>
        </div>
      );
    };

    const visibleProducts = storeProducts.filter(p=>p.isVisible!==false);
    const isPremium = isUserPremium(currentUser);
    const dailyToday = new Date().toLocaleDateString('tr-TR');
    const dailyEarned = currentUser?.lastFapDate===dailyToday ? Number(currentUser?.dailyFap||0) : 0;
    const dailyPct = Math.min(100, (dailyEarned/FAP_COIN_CONFIG.dailyMax)*100);

    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {renderPurchaseModal()}

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.12),_transparent_60%)] pointer-events-none"/>
          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30"><Gift className="w-6 h-6 text-amber-400"/></div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">FAP Ödül Mağazası</h1>
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Oyna · Kazan · Harca</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                Premium üyeler her <b className="text-amber-400">10 dakika aktif oyun</b> başına <b className="text-amber-400">0.5 FAP Coin</b> kazanır.
                Günde en fazla <b className="text-amber-300">16 FAP</b> kazanabilirsin. Biriktir, gerçek ödüllere dönüştür!
              </p>
              {!currentUser ? (
                <button onClick={()=>setShowLoginModal(true)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors text-sm">Giriş Yap, Kazan</button>
              ) : !isPremium ? (
                <button onClick={()=>setActiveTab("premium")} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-sm">
                  <Crown className="w-4 h-4"/> Premium Ol, FAP Kazan
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl px-5 py-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Bakiye</div>
                    <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5"><Coins className="w-5 h-5"/>{Number(currentUser.fapCoin||0).toFixed(1)}</div>
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Bugün</span><span className="text-amber-400 font-bold">{dailyEarned.toFixed(1)}/{FAP_COIN_CONFIG.dailyMax}</span></div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full transition-all duration-700" style={{width:`${dailyPct}%`,background:dailyPct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{dailyPct>=100?"Günlük limit doldu ✓":`${(FAP_COIN_CONFIG.dailyMax-dailyEarned).toFixed(1)} FAP daha kazanabilirsin`}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full items-center justify-center border border-amber-500/20 shrink-0">
              <ShoppingBag className="w-20 h-20 text-amber-500/60"/>
            </div>
          </div>
        </div>

        {/* Nasıl kazanılır */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {icon:Play,label:"Oyun Aç",desc:"Premium oyunları aç"},
            {icon:Clock,label:"10 Dk Oyna",desc:"Aktif sekmede kal"},
            {icon:Coins,label:"+0.5 FAP",desc:"Her oturumda kazan"},
            {icon:Gift,label:"Ödül Al",desc:"Mağazadan harca"},
          ].map((s,i)=>{
            const Icon=s.icon;
            return <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-amber-500/20"><Icon className="w-5 h-5 text-amber-400"/></div>
              <div className="text-sm font-bold text-white">{s.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
            </div>;
          })}
        </div>

        {/* Ürün grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-amber-500"/> Tüm Ödüller <span className="text-slate-500 text-base font-normal">({visibleProducts.length})</span></h2>
          </div>
          {storeLoading ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : visibleProducts.length===0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-16 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Mağaza Yakında Açılıyor</h3>
              <p className="text-slate-500 text-sm">Harika ödüller çok yakında burada olacak. FAP Coin biriktirmeye şimdiden başlayın!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleProducts.map(p=>{
                const canAfford = currentUser && isUserPremium(currentUser) && Number(currentUser.fapCoin||0)>=p.price;
                const needsPremium = currentUser && !isUserPremium(currentUser);
                return (
                  <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all group flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" loading="lazy"/>
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border ${p.type==="Fiziksel"?"bg-emerald-500/20 text-emerald-300 border-emerald-500/30":"bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                          {p.type==="Fiziksel"?<Truck className="w-2.5 h-2.5"/>:<CreditCard className="w-2.5 h-2.5"/>}{p.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{p.name}</h3>
                      <p className="text-[11px] text-slate-400 flex-grow line-clamp-3 mb-3">{p.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-amber-400 font-black text-lg"><Coins className="w-4 h-4"/>{Number(p.price)}</span>
                        <button onClick={()=>{if(!currentUser){setShowLoginModal(true);return;}if(needsPremium){setActiveTab("premium");return;}if(!canAfford)return;setSelectedProduct(p);}} disabled={currentUser&&isUserPremium(currentUser)&&!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${!currentUser?"bg-slate-800 text-white hover:bg-slate-700":needsPremium?"bg-amber-500/10 text-amber-400 border border-amber-500/20":canAfford?"bg-amber-500 text-slate-950 hover:bg-amber-400":"bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"}`}>
                          {!currentUser?"Giriş Yap":needsPremium?"Premium":canAfford?"Hemen Al":"Yetersiz"}
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

  // ── STORE (GAMES) PAGE ─────────────────────────────────────────────────────────
  const renderStore = () => (
    <div className="space-y-8 md:space-y-10">
      {/* Hero Carousel */}
      <section className={`relative group cursor-pointer rounded-3xl ${focusStyles} overflow-hidden h-[440px] md:h-[500px] lg:h-[540px] shadow-2xl`} tabIndex={0}
        onClick={()=>featuredGames.length&&openGame(featuredGames[currentSlide])}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();featuredGames.length&&openGame(featuredGames[currentSlide]);}}}>
        {featuredGames.map((game,idx)=>{
          const locked=game.requiresPremium&&!isUserPremium(currentUser);
          const trials=currentUser?Number(currentUser.premiumTrialsUsed||0):0;
          const hasTrials=trials<3;
          return (
            <div key={game.id} className={`absolute inset-0 transition-all duration-1000 ${currentSlide===idx?"opacity-100 z-10":"opacity-0 z-0 pointer-events-none"}`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} z-0`}/>
              {game.image&&<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden"><img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-35 mix-blend-overlay"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent"/><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent"/></div>}
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 md:p-10 lg:p-12 h-full gap-6">
                <div className="lg:max-w-2xl space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">★ Öne Çıkan</span>
                    {game.requiresPremium&&<span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-600/90 text-white flex items-center gap-1"><Lock className="w-3 h-3"/> PREMIUM</span>}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl leading-tight line-clamp-2">{game.title}</h1>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-xl line-clamp-3">{game.description}</p>
                  <LivePlayerCount base={game.basePlayers}/>
                  <button tabIndex={-1} onClick={e=>{e.stopPropagation();openGame(game);}}
                    className={`flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 ${locked&&!hasTrials?"bg-orange-600 hover:bg-orange-500 text-white":"bg-emerald-500 hover:bg-emerald-400 text-slate-950"}`}>
                    <Play className="w-5 h-5 fill-current"/>
                    {locked?(hasTrials?`Ücretsiz Dene (${3-trials} Hak)`:"Premium Ol"):"Hemen Oyna"}
                  </button>
                </div>
                <div className="hidden lg:flex w-56 h-56 shrink-0 bg-slate-950/70 rounded-full border-4 border-slate-800/50 items-center justify-center backdrop-blur-md group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                  <GameIcon iconKey={game.iconKey}/>
                </div>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featuredGames.map((_,i)=>(
            <button key={i} onClick={e=>{e.stopPropagation();setCurrentSlide(i);if(slideIntervalRef.current){clearInterval(slideIntervalRef.current);slideIntervalRef.current=setInterval(()=>setCurrentSlide(p=>(p+1)%featuredGames.length),5000);}}}
              className={`h-2 rounded-full transition-all ${currentSlide===i?"w-8 bg-orange-500":"w-2 bg-slate-500/50 hover:bg-slate-400"}`}/>
          ))}
        </div>
      </section>

      {/* Game Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-orange-500"/> Tüm Oyunlar</h2>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-2 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500"/>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Oyun ara..." className="bg-transparent outline-none text-sm text-white w-32 md:w-44" aria-label="Oyun ara"/>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredGames.map(game=>{
            const locked=game.requiresPremium&&!isUserPremium(currentUser);
            const trials=currentUser?Number(currentUser.premiumTrialsUsed||0):0;
            const hasTrials=trials<3;
            let btnText="İncele", btnCls="bg-slate-800 text-slate-300 hover:bg-slate-700";
            if(game.url){if(locked){btnText=hasTrials?`Dene (${3-trials})`:"Abone Ol";btnCls=hasTrials?"bg-emerald-600 hover:bg-emerald-500 text-white":"bg-orange-600 hover:bg-orange-500 text-white";}else{btnText="Oyna";btnCls="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold";}}
            return (
              <div key={game.id} tabIndex={0} onClick={()=>openGame(game)} onKeyDown={e=>e.key==="Enter"&&openGame(game)} className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group cursor-pointer flex flex-col hover:shadow-[0_0_25px_rgba(249,115,22,0.08)] ${focusStyles}`}>
                <div className={`h-36 md:h-40 bg-gradient-to-br ${game.gradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                  {game.image&&<img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay group-hover:opacity-55 group-hover:scale-110 transition-all duration-500 pointer-events-none" loading="lazy"/>}
                  <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-35 transition-opacity"><GameIcon iconKey={game.iconKey} className="w-12 h-12"/></div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${game.type==="live"?"bg-emerald-500/25 text-emerald-400 border border-emerald-500/30":"bg-amber-500/25 text-amber-400 border border-amber-500/30"}`}>{game.status}</span>
                    {game.requiresPremium&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600/90 text-white flex items-center gap-0.5"><Lock className="w-2.5 h-2.5"/> PREMIUM</span>}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white relative z-10 drop-shadow">{game.title}</h3>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-slate-400 text-xs md:text-sm line-clamp-3 mb-3 flex-1">{game.description}</p>
                  <LivePlayerCount base={game.basePlayers}/>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <span className="text-sm font-semibold text-white">{game.price}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={e=>handleShareGame(game,e)} className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"><Share2 className="w-4 h-4"/></button>
                      <button tabIndex={-1} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${btnCls}`}>{btnText}</button>
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

  const renderLibrary = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 shrink-0 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1 mb-4"><Library className="w-5 h-5 text-orange-500"/> Kütüphanem</h2>
        {GAMES.filter(g=>g.status==="Yayında").map(game=>(
          <button key={game.id} onClick={()=>setSelectedLibraryGame(game)} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedLibraryGame?.id===game.id?"bg-orange-600/20 border border-orange-500/50 text-white":"bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${game.gradient}`}><GameIcon iconKey={game.iconKey} className="w-4 h-4 text-white"/></div>
            <span className="font-semibold text-sm truncate">{game.title}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[400px]">
        {selectedLibraryGame ? (
          <>
            <div className={`absolute top-0 left-0 w-full h-52 bg-gradient-to-br ${selectedLibraryGame.gradient} opacity-15`}/>
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedLibraryGame.title}</h2>
                  <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-3">{selectedLibraryGame.description}</p>
                  <LivePlayerCount base={selectedLibraryGame.basePlayers}/>
                </div>
                <div className={`hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0 bg-gradient-to-br ${selectedLibraryGame.gradient} shadow-xl`}><GameIcon iconKey={selectedLibraryGame.iconKey} className="w-8 h-8 text-white"/></div>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-800 flex items-center gap-3">
                {(()=>{
                  const locked=selectedLibraryGame.requiresPremium&&!isUserPremium(currentUser);
                  const t=currentUser?Number(currentUser.premiumTrialsUsed||0):0;
                  const txt=locked?(t<3?`Ücretsiz Dene (${3-t})`:"Premium Abone Ol"):"Hemen Oyna";
                  return <button onClick={()=>openGame(selectedLibraryGame)} className="flex items-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl"><Play className="w-5 h-5"/>{txt}</button>;
                })()}
                <button onClick={e=>handleShareGame(selectedLibraryGame,e)} className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700"><Share2 className="w-5 h-5"/></button>
              </div>
            </div>
          </>
        ) : <div className="flex flex-col items-center justify-center text-slate-500 h-full flex-1"><Library className="w-12 h-12 mb-4 opacity-30"/><p>Sol taraftan bir oyun seçin</p></div>}
      </div>
    </div>
  );

  const renderPricingCards = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {[
        { plan:"1A", title:"Aylık Bilet", price:"39₺", sub:"/ ay", badge:null, desc:"Kısa süreli deneme için.", highlight:false, btnText:"Seç ve Başla", btnCls:"bg-slate-800 hover:bg-slate-700 text-white" },
        { plan:"6A", title:"Sezonluk Kart", price:"179₺", sub:"", badge:"EN POPÜLER", oldPrice:"234₺", indirim:"%23 İndirim · Aylık 29.8₺", desc:"Düzenli oyuncular için.", highlight:true, btnText:"6 Ay İçin Satın Al", btnCls:"bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black" },
        { plan:"1Y", title:"1 Yıllık Efsane", price:"299₺", sub:"", badge:"%36 İNDİRİM", oldPrice:"468₺", indirim:"Aylık 24.9₺", desc:"En yüksek indirim ve statü.", highlight:false, btnText:"Kalıcı Destekçi Ol", btnCls:"bg-slate-800 hover:bg-slate-700 text-white border border-amber-500/30 hover:border-amber-500" },
      ].map(p=>(
        <div key={p.plan} className={`rounded-3xl p-6 md:p-8 flex flex-col relative ${p.highlight?"bg-gradient-to-b from-amber-950/50 to-slate-950 border-2 border-amber-500 shadow-2xl shadow-amber-500/15 lg:-translate-y-3":"bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"}`}>
          {p.badge&&<div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.highlight?"bg-amber-500 text-slate-950":"bg-slate-700 text-slate-300"}`}>{p.badge}</div>}
          <h3 className="text-xl font-bold text-white mb-1">{p.title}</h3>
          <p className="text-slate-500 text-sm mb-5 h-9">{p.desc}</p>
          <div className="flex items-baseline gap-2 mb-2"><span className="text-4xl font-black text-white">{p.price}</span>{p.sub&&<span className="text-slate-500 text-sm">{p.sub}</span>}{p.oldPrice&&<span className="text-slate-500 text-sm line-through">{p.oldPrice}</span>}</div>
          {p.indirim&&<p className="text-amber-400 text-sm font-bold mb-5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/>{p.indirim}</p>}
          {!p.indirim&&<div className="mb-5"/>}
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight?"text-amber-400":"text-emerald-500"}`}/>Tüm Premium oyunlara erişim</li>
            {p.highlight&&<><li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>Özel rozet ve sıralama</li><li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>FAP Coin kazanım hakkı</li></>}
          </ul>
          <button onClick={()=>handlePurchaseRequest(p.plan)} className={`w-full py-3.5 rounded-xl font-bold transition-all ${p.btnCls}`}>{p.btnText}</button>
        </div>
      ))}
    </div>
  );

  const renderPremiumPage = () => (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/25 text-center p-8 md:p-16 shadow-[0_0_50px_rgba(245,158,11,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_60%)] pointer-events-none"/>
        <Crown className="w-14 h-14 md:w-20 md:h-20 text-amber-500 mx-auto mb-6 drop-shadow-lg relative z-10"/>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 relative z-10 leading-tight">
          Oyun Deneyimini<br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Zirveye Taşı</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed relative z-10">En popüler parti oyunlarına sınırsız erişim. FAP Coin kazan, ödüllere dönüştür.</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          {icon:Lock,t:"Sınırsız Erişim",d:"Tüm Premium oyunlar açık",c:"text-emerald-400",bg:"bg-emerald-500/10"},
          {icon:Crown,t:"Özel Rozet",d:"Altın Premium rozet",c:"text-amber-400",bg:"bg-amber-500/10"},
          {icon:Coins,t:"FAP Coin Kazan",d:"Oyna, biriktir, harca",c:"text-yellow-400",bg:"bg-yellow-500/10"},
          {icon:Zap,t:"Erken Erişim",d:"Lab projelerini ilk dene",c:"text-blue-400",bg:"bg-blue-500/10"},
        ].map((f,i)=>{const Icon=f.icon;return <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-colors"><div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${f.bg}`}><Icon className={`w-6 h-6 ${f.c}`}/></div><h3 className="font-bold text-white text-sm mb-1">{f.t}</h3><p className="text-[11px] text-slate-400">{f.d}</p></div>;})}
      </div>

      {/* Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-10">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Nasıl Premium Olurum?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{n:"1",t:"Plan Seç",d:"Aşağıdan uygun süreyi seçin."},{n:"2",t:"Kodu Kopyala",d:"Size özel güvenlik kodunu kopyalayın."},{n:"3",t:"Nota Ekle",d:"Shopier'da 'Sipariş Notu'na yapıştırın."}].map((s,i)=>(
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-2xl font-black text-amber-500 mb-3">{s.n}</div>
              <h3 className="font-bold text-white mb-1">{s.t}</h3><p className="text-sm text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-sm font-medium flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>Ödemeniz otomatik eşleştirilir, anında onaylanır.</p>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-3xl font-black text-white text-center mb-3">Planını Seç</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">İstediğin zaman iptal edebilirsin. Taahhüt yok.</p>
        {renderPricingCards()}
      </div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/20 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.06),_transparent_60%)] pointer-events-none"/>
        <FlaskConical className="w-14 h-14 text-orange-500 mx-auto mb-5 drop-shadow-lg relative z-10"/>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 relative z-10">Geliştirme <span className="text-orange-500">Laboratuvarı</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed relative z-10">
          Forge&Play'in geleceği burada şekilleniyor. Aktif geliştirilen projeleri takip edin,
          tamamlananları ilk siz keşfedin.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 relative z-10">
          <div className="text-center"><div className="text-2xl font-black text-orange-400">{LAB_PROJECTS.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Aktif Proje</div></div>
          <div className="w-px h-8 bg-slate-800"/>
          <div className="text-center"><div className="text-2xl font-black text-emerald-400">{LAB_PROJECTS.filter(p=>p.status.includes("Beta")||p.status.includes("Yakında")).length}</div><div className="text-xs text-slate-500 uppercase font-bold">Beta Yakında</div></div>
          <div className="w-px h-8 bg-slate-800"/>
          <div className="text-center"><div className="text-2xl font-black text-amber-400">{Math.round(LAB_PROJECTS.reduce((s,p)=>s+p.progress,0)/LAB_PROJECTS.length)}%</div><div className="text-xs text-slate-500 uppercase font-bold">Ort. İlerleme</div></div>
        </div>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {LAB_PROJECTS.map(proj=>(
          <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col">
            <div className="relative h-40 overflow-hidden">
              <img src={proj.image} alt={proj.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"/>
              <div className={`absolute inset-0 bg-gradient-to-br ${proj.gradient} opacity-60`}/>
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 backdrop-blur-sm border border-slate-700/50">{proj.tag}</span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border ${proj.status.includes("Beta")||proj.status.includes("Yakında")?"bg-emerald-500/20 text-emerald-400 border-emerald-500/30":proj.status.includes("Erken")?"bg-slate-800/80 text-slate-400 border-slate-700":"bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>{proj.status}</span>
              </div>
              <div className="absolute bottom-3 left-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"><GameIcon iconKey={proj.iconKey} className="w-5 h-5"/></div>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-black text-white text-base md:text-lg mb-2 leading-tight">{proj.title}</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed flex-1 mb-5 line-clamp-4">{proj.description}</p>
              <div>
                <div className="flex justify-between items-center mb-1.5"><span className="text-[10px] text-slate-500 uppercase font-bold">İlerleme</span><span className={`text-xs font-black ${proj.accentColor}`}>%{proj.progress}</span></div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-1000" style={{width:`${proj.progress}%`,background:proj.progress>=75?'linear-gradient(90deg,#10b981,#34d399)':proj.progress>=50?'linear-gradient(90deg,#f59e0b,#f97316)':'linear-gradient(90deg,#6366f1,#8b5cf6)'}}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-orange-900/20 to-slate-900 border border-orange-500/15 rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-sm">Yeni oyun fikirlerin mi var? <button onClick={()=>setActiveTab("feedback")} className="text-orange-400 hover:text-orange-300 font-bold underline underline-offset-2">Fikir Kutusu</button>'na yaz, değerlendirelim!</p>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!currentUser) return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MessageSquarePlus className="w-16 h-16 text-slate-700 mb-4"/>
        <h2 className="text-2xl font-bold text-white mb-2">Fikir Kutusu</h2>
        <p className="text-slate-400 mb-6 max-w-xs">Fikirlerinizi paylaşmak için önce giriş yapmanız gerekiyor.</p>
        <button onClick={()=>setShowLoginModal(true)} className="px-7 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl">Giriş Yap</button>
      </div>
    );
    const mine = feedbacks.filter(f=>f.userId===currentUser.id);
    return (
      <div className="space-y-7 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-900/25 to-slate-900 border border-orange-500/25 rounded-3xl p-7 text-center">
          <Lightbulb className="w-14 h-14 text-orange-500 mx-auto mb-4"/>
          <h1 className="text-3xl font-black text-white mb-2">Fikir Kutusu</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Oyunlarımız, platformumuz hakkında düşüncelerinizi paylaşın. Her fikir bize ilham veriyor.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-xs text-slate-500 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">{feedbacks.length} toplam fikir</span>
            <span className="text-xs text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">{mine.length} fikriniz</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-orange-500"/> Fikir Gönder</h3>
            <FeedbackForm currentUser={currentUser} onSubmit={handleFeedbackSubmit}/>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500"/> Gönderilen Fikirler</h3>
            {mine.length===0 ? <div className="text-center py-10 text-slate-600"><Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-40"/><p className="text-sm">Henüz fikir göndermediniz.</p></div> : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {mine.map((fb,i)=>(
                  <div key={fb.id||i} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{fb.game}</span>
                      <span className="text-[10px] text-slate-600">{fb.createdAt?new Date(fb.createdAt).toLocaleDateString('tr-TR'):fb.date}</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2 line-clamp-3">{fb.text}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${fb.status==="onaylandi"?"bg-emerald-500/10 text-emerald-400":fb.status==="reddedildi"?"bg-red-500/10 text-red-400":"bg-amber-500/10 text-amber-400"}`}>{fb.status==="onaylandi"?"✓ Onaylandı":fb.status==="reddedildi"?"✗ Reddedildi":"Beklemede"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (!currentUser) return null;
    const prem = isUserPremium(currentUser);
    const rem = getRemainingDays(currentUser.premiumEndDate);
    const mine = feedbacks.filter(f=>f.userId===currentUser.id);
    const today = new Date().toLocaleDateString('tr-TR');
    const dailyEarned = currentUser.lastFapDate===today?Number(currentUser.dailyFap||0):0;
    const dailyPct = Math.min(100,(dailyEarned/FAP_COIN_CONFIG.dailyMax)*100);

    const badges=[];
    if (isAdmin) badges.push({id:'admin',t:'Platform Yöneticisi',d:'Sistemin koruyucusu.',I:ShieldAlert,c:'text-amber-400',bg:'bg-amber-500/10',b:'border-amber-500/30'});
    if (prem) badges.push({id:'prem',t:'Premium Üye',d:'Ayrıcalıklı destekçi.',I:Crown,c:'text-emerald-400',bg:'bg-emerald-500/10',b:'border-emerald-500/30'});
    if ((currentUser.playCount||0)>=50) badges.push({id:'gp',t:'Efsanevi Oyuncu',d:'50+ oyun oynadı.',I:Zap,c:'text-purple-400',bg:'bg-purple-500/10',b:'border-purple-500/30'});
    else if ((currentUser.playCount||0)>=10) badges.push({id:'gm',t:'Sıkı Oyuncu',d:'10+ oyun oynadı.',I:Gamepad2,c:'text-blue-400',bg:'bg-blue-500/10',b:'border-blue-500/30'});
    if (mine.filter(f=>f.status==="onaylandi").length>0) badges.push({id:'idea',t:'Fikir Öncüsü',d:'Onaylanan fikir.',I:Star,c:'text-orange-400',bg:'bg-orange-500/10',b:'border-orange-500/30'});
    if (!badges.length) badges.push({id:'new',t:'Yeni Maceracı',d:'Platforma yeni katıldı.',I:User,c:'text-slate-400',bg:'bg-slate-800',b:'border-slate-700'});

    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none"/>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10 mb-8">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-white text-4xl shadow-xl shadow-orange-500/20 shrink-0">{String(currentUser.name||"U").charAt(0).toUpperCase()}</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{currentUser.name||"Kullanıcı"}</h2>
              <div className="text-slate-400 text-sm mb-3 flex items-center justify-center md:justify-start gap-1.5"><Mail className="w-3.5 h-3.5"/>{currentUser.email}</div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {prem?<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Sparkles className="w-3.5 h-3.5"/>Premium · {rem} Gün</span>:<span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">Standart</span>}
                {isAdmin&&<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Lock className="w-3.5 h-3.5"/>Yönetici</span>}
              </div>
            </div>
          </div>

          {/* FAP Coin */}
          <div className="bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="text-center md:text-left">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500"/>FAP Coin Bakiyesi</div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">{Number(currentUser.fapCoin||0).toFixed(1)}</div>
                {!prem&&<p className="text-xs text-slate-500 mt-1">FAP kazanmak için Premium ol.</p>}
              </div>
              {prem&&(
                <div className="flex-1 max-w-sm">
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Bugünkü kazanım</span><span className="text-amber-400 font-bold">{dailyEarned.toFixed(1)} / {FAP_COIN_CONFIG.dailyMax} FAP</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-1">
                    <div className="h-2.5 rounded-full transition-all duration-700" style={{width:`${dailyPct}%`,background:dailyPct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/>
                  </div>
                  <p className="text-[10px] text-slate-500">{dailyPct>=100?"✓ Günlük limit doldu":`${(FAP_COIN_CONFIG.dailyMax-dailyEarned).toFixed(1)} FAP daha kazanabilirsin`}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Her 10 dk aktif oyun = +0.5 FAP</p>
                </div>
              )}
              <button onClick={()=>setActiveTab("rewards")} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shrink-0">Mağazaya Git</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Oynama</div><div className="text-2xl font-black text-white">{Number(currentUser.playCount||0)}</div></div>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Global Sıra</div><div className="text-xl font-black text-orange-400 flex items-center justify-center gap-1"><Trophy className="w-4 h-4"/>#{calculateRank(currentUser.playCount||0)}</div></div>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Fikir</div><div className="text-2xl font-black text-white">{mine.length}</div></div>
          </div>

          {!prem&&<div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"><div><p className="text-amber-400 font-bold text-sm">Premium'a geç!</p><p className="text-slate-500 text-xs">39₺/ay'dan tüm oyunlar açık.</p></div><button onClick={()=>setActiveTab("premium")} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm whitespace-nowrap flex items-center gap-1.5"><Crown className="w-4 h-4"/>Satın Al</button></div>}

          {currentUser.lastPlayedGameName&&<div className="bg-orange-500/8 border border-orange-500/15 rounded-xl p-3 mb-6 flex items-center gap-2 text-sm"><Gamepad2 className="w-4 h-4 text-orange-500 shrink-0"/>Son oyun: <b className="text-white">{currentUser.lastPlayedGameName}</b></div>}

          {/* Badges */}
          <div className="pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-orange-500"/>Rozetler</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map(badge=>{const I=badge.I;return <div key={badge.id} className={`flex items-center gap-2.5 p-2.5 pr-4 rounded-2xl border ${badge.b} ${badge.bg}`}><div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-950 border border-slate-800/50"><I className={`w-4 h-4 ${badge.c}`}/></div><div><div className={`text-xs font-bold ${badge.c}`}>{badge.t}</div><div className="text-[10px] text-slate-500">{badge.d}</div></div></div>;})}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-5 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1"><Lock className="w-5 h-5 text-amber-500"/><h2 className="text-xl md:text-2xl font-bold text-white">Yönetici Paneli</h2></div>
          <p className="text-amber-200/50 text-xs">Sadece kuruculara özel · {usersList.length} kullanıcı · {storeProducts.length} ürün · {ordersList.length} sipariş</p>
        </div>
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          {[{id:"users",l:"Kullanıcılar"},{id:"orders",l:"Siparişler"},{id:"products",l:"Mağaza"},{id:"feedbacks",l:"Fikirler"},{id:"test",l:"Test & Bot"}].map(t=>(
            <button key={t.id} onClick={()=>setAdminTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab===t.id?"bg-amber-500 text-slate-950":"text-slate-400 hover:text-white"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* Users */}
      {adminTab==="users"&&(
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 gap-3">
            <span className="font-bold text-white text-sm">Kullanıcılar ({usersList.length})</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500"/>
              <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Ara..." className="bg-transparent outline-none text-xs text-white w-32 md:w-48"/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-900 text-slate-500 text-[10px] uppercase border-b border-slate-800"><th className="px-5 py-3">Kullanıcı</th><th className="px-5 py-3 text-center">Oynama</th><th className="px-5 py-3 text-center">Durum</th><th className="px-5 py-3 text-right">İşlem</th></tr></thead>
              <tbody className="divide-y divide-slate-800/40">
                {sortedUsers.map(u=>{
                  const up=isUserPremium(u); const rem=getRemainingDays(u.premiumEndDate); const pend=!!u.pendingRequest;
                  return <tr key={u.id} className={`hover:bg-slate-800/25 transition-colors ${pend?"bg-amber-950/15":""}`}>
                    <td className="px-5 py-3"><div className="text-sm font-medium text-white">{u.name||"Kullanıcı"}</div><div className="text-[10px] text-slate-500">{u.email}</div><div className="text-[10px] text-orange-400 font-mono">{u.paymentCode||"—"}</div></td>
                    <td className="px-5 py-3 text-center"><div className="text-sm font-bold text-white">{Number(u.playCount||0)}</div><div className="text-[10px] text-amber-400">{Number(u.fapCoin||0).toFixed(1)} FAP</div></td>
                    <td className="px-5 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pend?"bg-amber-500/20 text-amber-400 animate-pulse":up?"bg-emerald-500/20 text-emerald-400":"bg-slate-800 text-slate-500"}`}>{pend?`ÖDEME (${u.pendingRequest})`:up?`AKTİF ${rem}g`:"STANDART"}</span></td>
                    <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-1 flex-wrap">
                      {pend?<><button onClick={()=>approvePremium(u.id,u.pendingRequest)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Onayla</button><button onClick={()=>revokePremium(u.id)} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">Reddet</button></>
                      :<>{up&&<button onClick={()=>revokePremium(u.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="İptal"><ShieldAlert className="w-3.5 h-3.5"/></button>}<button onClick={()=>approvePremium(u.id,"1A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">+1A</button><button onClick={()=>approvePremium(u.id,"6A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-orange-900/50 text-orange-300">+6A</button><button onClick={()=>approvePremium(u.id,"1Y")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-amber-900/50 text-amber-300">+1Y</button></>}
                      {u.role!=="admin"&&!ADMIN_EMAILS.includes(String(u.email).toLowerCase().trim())&&<button onClick={()=>deleteUser(u)} className="p-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/40" title="Sil"><Trash className="w-3.5 h-3.5"/></button>}
                    </div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders */}
      {adminTab==="orders"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {ordersList.length===0&&<div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">Henüz sipariş yok.</div>}
          {ordersList.map(o=>(
            <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${o.status==="Onay Bekliyor"?"bg-amber-500/10 text-amber-400 border-amber-500/20":o.status.includes("Kargo")||o.status.includes("İletildi")?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-red-500/10 text-red-400 border-red-500/20"}`}>{o.status}</span><div className="font-bold text-white text-base mt-1.5">{o.productName}</div><div className="text-xs text-amber-500 font-bold">{Number(o.fapCost)} FAP</div></div>
                <span className="text-[10px] text-slate-500">{o.displayDate}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm mb-3 space-y-1">
                <p><span className="text-slate-500">Kullanıcı: </span><span className="text-white">{o.userName}</span></p>
                <p><span className="text-slate-500">E-posta: </span><a href={`mailto:${o.userEmail}`} className="text-blue-400 hover:underline">{o.userEmail}</a></p>
                {o.productType==="Fiziksel"&&<p className="border-t border-slate-800 pt-1 mt-1"><span className="text-slate-500">Adres: </span><span className="text-slate-300 text-xs">{o.addressDetails}</span></p>}
              </div>
              {o.status==="Onay Bekliyor"&&<div className="flex gap-2"><button onClick={()=>handleOrderStatus(o.id,"Kargolandı / İletildi",o.userId,o.fapCost)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">Onayla & İlet</button><button onClick={()=>handleOrderStatus(o.id,"İptal/İade Edildi",o.userId,o.fapCost)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-lg border border-slate-700 text-xs">Reddet (İade)</button></div>}
            </div>
          ))}
        </div>
      )}

          {/* Products */}
          {adminTab==="products"&&(
            <div className="space-y-5">
              {/* Form */}
              <div id="product-form-section" className={`bg-slate-900 border-2 ${editingProductId?"border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]":"border-slate-800"} rounded-2xl p-6 transition-all`}>
                {editingProductId && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Edit className="w-4 h-4 text-amber-500 shrink-0"/>
                    <p className="text-amber-300 text-sm font-bold">Düzenleme modu aktif — mevcut ürün güncelleniyor, yeni ürün eklenmez.</p>
                  </div>
                )}
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  {editingProductId
                    ? <><Edit className="w-4 h-4 text-amber-500"/>Ürünü Düzenle</>
                    : <><Plus className="w-4 h-4 text-emerald-500"/>Yeni Ürün Ekle</>
                  }
                </h3>
                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Adı *</label>
                    <input required type="text" placeholder="Örn: 100 TL Steam Kodu" value={newProductData.name} onChange={e=>setNewProductData({...newProductData,name:e.target.value})} maxLength={150} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">FAP Coin Fiyatı *</label>
                    <input required type="number" placeholder="Örn: 350" value={newProductData.price} onChange={e=>setNewProductData({...newProductData,price:e.target.value})} min="1" max="100000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Görsel URL *</label>
                    <input required type="text" placeholder="https://images.unsplash.com/..." value={newProductData.image} onChange={e=>setNewProductData({...newProductData,image:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Tipi *</label>
                    <select value={newProductData.type} onChange={e=>setNewProductData({...newProductData,type:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none">
                      <option value="Dijital">Dijital (Kod / Link)</option>
                      <option value="Fiziksel">Fiziksel (Kargo ile)</option>
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Açıklama *</label>
                    <textarea required placeholder="Ürün hakkında detaylı açıklama..." value={newProductData.desc} onChange={e=>setNewProductData({...newProductData,desc:e.target.value})} maxLength={500} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none min-h-[80px] resize-none"/>
                  </div>
                  <div className="col-span-full flex gap-3">
                    <button type="submit" className={`flex-1 py-3 font-bold rounded-xl text-sm transition-colors ${editingProductId?"bg-amber-600 hover:bg-amber-500 text-white":"bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                      {editingProductId ? "✓ Değişiklikleri Kaydet" : "+ Mağazaya Ekle"}
                    </button>
                    {editingProductId && (
                      <button type="button" onClick={cancelEdit} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm border border-slate-700">
                        İptal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Ürün listesi başlığı */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Ürünler <span className="text-white">({storeProducts.length})</span>{editingProductId&&<span className="ml-2 text-amber-400 text-[11px]">↑ Düzenleme modu aktif</span>}</span>
                {storeProducts.length>0&&<button onClick={clearAllProducts} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors"><Trash className="w-3.5 h-3.5"/>Tümünü Sil</button>}
              </div>

              {storeProducts.length===0 ? (
                <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-10 text-center text-slate-500">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40"/>
                  <p className="text-sm font-bold text-slate-400 mb-1">Mağaza boş</p>
                  <p className="text-xs">Yukarıdaki formu kullanarak ürün ekleyin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {storeProducts.map(p=>{
                    const vis=p.isVisible!==false;
                    const isEditing = editingProductId === p.id;
                    return (
                      <div key={p.id} className={`bg-slate-950 border rounded-xl p-3 flex flex-col transition-all ${isEditing?"border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]":!vis?"border-slate-800 opacity-50 grayscale":"border-slate-800 hover:border-slate-700"}`}>
                        <div className="relative h-28 overflow-hidden rounded-lg mb-3">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy"/>
                          {!vis&&<div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-[10px] font-black tracking-widest">GİZLİ</div>}
                          {isEditing&&<div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center"><span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">DÜZENLENİYOR</span></div>}
                        </div>
                        <h4 className="text-white font-bold text-xs mb-1 line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{p.desc}</p>
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm mb-3"><Coins className="w-3.5 h-3.5"/>{Number(p.price)} FAP</div>
                        <div className="grid grid-cols-3 gap-1.5 mt-auto">
                          <button onClick={()=>toggleVisibility(p.id,vis)} className={`py-1.5 rounded-lg flex items-center justify-center border text-[10px] font-bold transition-colors ${vis?"bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700":"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"}`} title={vis?"Gizle":"Yayınla"}>{vis?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}</button>
                          <button onClick={()=>editProduct(p)} className={`py-1.5 rounded-lg flex items-center justify-center border text-[10px] font-bold transition-colors ${isEditing?"bg-amber-500 text-slate-950 border-amber-500":"bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white"}`} title="Düzenle"><Edit className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>deleteProduct(p.id)} disabled={isEditing} className="py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Sil"><Trash className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

      {/* Feedbacks */}
      {adminTab==="feedbacks"&&(
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
            <span className="font-bold text-white text-sm">Fikirler ({feedbacks.length})</span>
            <span className="text-xs text-slate-500">Bekleyen: {feedbacks.filter(f=>f.status==="beklemede").length}</span>
          </div>
          {feedbacks.length===0&&<div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">Henüz fikir yok.</div>}
          {feedbacks.map(fb=>(
            <div key={fb.id} className={`bg-slate-900 border rounded-2xl p-4 ${fb.isBotTest?"border-blue-800/30":"border-slate-800"}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{fb.game}</span>
                  {fb.isBotTest&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">BOT</span>}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fb.status==="onaylandi"?"bg-emerald-500/10 text-emerald-400":fb.status==="reddedildi"?"bg-red-500/10 text-red-400":"bg-amber-500/10 text-amber-400"}`}>{fb.status==="onaylandi"?"✓ Onaylı":fb.status==="reddedildi"?"✗ Reddedildi":"Beklemede"}</span>
                </div>
                <span className="text-[10px] text-slate-600">{fb.createdAt?new Date(fb.createdAt).toLocaleDateString('tr-TR'):fb.date}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{fb.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{fb.user} · {fb.email}</span>
                {fb.status==="beklemede"&&<div className="flex gap-1.5"><button onClick={()=>approveFeedback(fb.id,"onaylandi")} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Onayla</button><button onClick={()=>approveFeedback(fb.id,"reddedildi")} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400">Reddet</button></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test & Bot */}
      {adminTab==="test"&&(
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/>Test Araçları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h4 className="font-bold text-white mb-1 text-sm">+1 Ay Premium (Kendinize)</h4>
              <p className="text-xs text-slate-500 mb-4">Admin hesabına 1 aylık premium ekler.</p>
              <button onClick={()=>approvePremium(currentUser?.id,"1A")} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm">+1 Ay Ekle</button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h4 className="font-bold text-white mb-1 text-sm flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-500"/>Simülasyon Botu</h4>
              <p className="text-xs text-slate-500 mb-4">Her 30 sn'de oyun oturumu simüle eder, %25 feedback gönderir.</p>
              <button onClick={toggleBot} className={`w-full py-2.5 font-bold rounded-xl text-sm transition-colors ${isBotRunning?"bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20":"bg-emerald-600 hover:bg-emerald-500 text-white"}`}>{isBotRunning?"Botu Durdur":"Botu Başlat"}</button>
              {isBotRunning&&<p className="text-[10px] text-emerald-400 mt-1.5 text-center animate-pulse">Bot aktif...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── MAIN RETURN ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 flex flex-col overflow-x-hidden">
      {renderInstallModal()}
      {renderTrialModal()}
      {renderPremiumWarningModal()}
      {playingGame&&renderPlayerOverlay()}
      {renderNavbar()}
      {showLoginModal&&renderLoginModal()}
      {paymentIntent&&renderPaymentModal()}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
        {activeTab==="store"&&renderStore()}
        {activeTab==="rewards"&&renderRewardsStore()}
        {activeTab==="library"&&renderLibrary()}
        {activeTab==="premium"&&renderPremiumPage()}
        {activeTab==="lab"&&renderLab()}
        {activeTab==="profile"&&renderProfile()}
        {activeTab==="feedback"&&renderFeedback()}
        {activeTab==="admin"&&isAdmin&&renderAdminDashboard()}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="hidden md:block border-t border-slate-800/60 bg-slate-950 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-slate-900 border border-orange-500/20 p-1.5 rounded-xl"><img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain"/></div>
                <span className="text-lg font-black text-white">Forge<span className="text-orange-500">&</span>Play</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xs">Türkiye'nin en eğlenceli dijital oyun platformu. Arkadaşlarınla oyna, kazan, paylaş.</p>
              <div className="flex items-center gap-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 text-pink-400 border border-pink-500/20 rounded-xl transition-all text-sm font-bold group">
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform"/>@forgeandplayshop
                  <ExternalLink className="w-3 h-3 opacity-50"/>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {[{t:"Oyunlar",id:"store"},{t:"Ödül Mağazası",id:"rewards"},{t:"Laboratuvar",id:"lab"},{t:"Premium",id:"premium"},{t:"Fikir Kutusu",id:"feedback"}].map(l=>(
                  <li key={l.id}><button onClick={()=>setActiveTab(l.id)} className="hover:text-orange-400 transition-colors text-left">{l.t}</button></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">İletişim</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:forgeandplay@gmail.com" className="hover:text-orange-400 transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/>forgeandplay@gmail.com</a></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5"/>Instagram</a></li>
                <li className="text-slate-500 flex items-center gap-1.5 mt-3"><Smartphone className="w-3.5 h-3.5"/>App Store · Yakında</li>
                <li className="text-slate-500 flex items-center gap-1.5"><Play className="w-3.5 h-3.5"/>Google Play · Yakında</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© 2026 Forge&Play. Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"><TrendingUp className="w-3 h-3 text-emerald-500"/>{GAMES.filter(g=>g.status==="Yayında").length} Oyun Yayında</span>
              <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"><Users className="w-3 h-3 text-orange-500"/>Her gün büyüyoruz</span>
            </div>
          </div>
        </div>
      </footer>

      {renderMobileBottomNav()}

      <style dangerouslySetInnerHTML={{__html:`
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#020617}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#f97316}
        html,body,#root{max-width:100vw;overflow-x:hidden;margin:0;padding:0;background:#020617}
        .pb-safe{padding-bottom:env(safe-area-inset-bottom)}
      `}}/>
    </div>
  );
}
