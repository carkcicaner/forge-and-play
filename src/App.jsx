import React, { useEffect, useMemo, useState } from "react";
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
  AlertTriangle
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
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc 
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

// Config kontrolü (Eğer değiştirilmemişse uyarı ekranı göstermek için)
const isFirebaseConfigured = firebaseConfig.apiKey !== "BURAYA_GELECEK";

let app, auth, db, googleProvider;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
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
    players: "1.2k Aktif",
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
    price: "Premium: 29₺",
    players: "340 Aktif",
    gradient: "from-emerald-900 via-teal-950 to-black",
    iconKey: "wallet",
    url: "https://siprayt-monopoly.vercel.app/",
    image: "https://i.ibb.co/RGmKfVY8/freepik-3d-cinematic-monopoly-style-board-game-world-comin-87944.png",
    requiresPremium: true,
  },
  {
    id: "tabu",
    title: "Tabu",
    status: "Yakında",
    type: "upcoming",
    tags: ["Parti", "Kelime Oyunu", "Takım"],
    description: "Yasaklı kelimeleri kullanmadan takım arkadaşlarına gizli kelimeyi anlatmaya çalış. Süre dolmadan en çok kelimeyi bilen takım kazanır!",
    price: "Geliştiriliyor",
    players: "Yakında",
    gradient: "from-purple-900 via-fuchsia-950 to-black",
    iconKey: "message",
    url: null,
    image: "https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "sessiz-sinema",
    title: "Sessiz Sinema",
    status: "Yakında",
    type: "upcoming",
    tags: ["Parti", "Eğlence", "Rol Yapma"],
    description: "Hiç konuşmadan, sadece hareketlerinle en zorlu filmleri takımına anlat. Klasik sessiz sinema eğlencesi şimdi dijital ortamda.",
    price: "Geliştiriliyor",
    players: "Yakında",
    gradient: "from-blue-900 via-cyan-950 to-black",
    iconKey: "film",
    url: null,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    requiresPremium: false,
  },
  {
    id: "dogru-mu-salliyor-mu",
    title: "Doğru mu, Sallıyor mu?",
    status: "Yakında",
    type: "upcoming",
    tags: ["Bilgi", "Blöf", "Parti"],
    description: "İnternetin derinliklerinden gelen garip bilgiler... Gerçek mi yoksa tamamen uydurma mı? Rakiplerini blöf yaparak kandır veya doğruyu bilerek puanları topla!",
    price: "Geliştiriliyor",
    players: "Yakında",
    gradient: "from-orange-900 via-amber-950 to-black",
    iconKey: "help",
    url: null,
    image: "https://images.unsplash.com/photo-1518133835878-5a93ac3f000c?auto=format&fit=crop&q=80&w=800",
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
    gradient: "from-indigo-900 to-slate-900",
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

const focusStyles = "focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950";

/* ---------------------------------------------
   ICON MAP
---------------------------------------------- */
function GameIcon({ iconKey, className }) {
  const cls = className || "w-10 h-10 md:w-12 md:h-12";
  switch (iconKey) {
    case "wallet": return <Wallet className={`${cls} text-emerald-500`} />;
    case "message": return <MessageCircle className={`${cls} text-purple-500`} />;
    case "film": return <Film className={`${cls} text-blue-500`} />;
    case "help": return <HelpCircle className={`${cls} text-orange-500`} />;
    case "user": default: return <User className={`${cls} text-red-500`} />;
  }
}

export default function App() {
  // Eğer Firebase bilgileri girilmemişse uyarı ekranı göster
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

  // Auth / UI
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore Data States
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");

  // Feedback Form
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [newFeedbackGame, setNewFeedbackGame] = useState("Vampir Köylü");

  // Store search & Slider
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Login form
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  const featuredGames = useMemo(() => GAMES.filter((g) => g.status === "Yayında"), []);

  /* ---------------------------------------------
     FIREBASE: KULLANICI (AUTH) DİNLEYİCİSİ
  ---------------------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı giriş yaptı, veritabanından bilgilerini çekelim
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ id: firebaseUser.uid, ...docSnap.data() });
          } else {
            // İlk kez giren kullanıcıysa veritabanında kaydını oluştur
            const isFirstAdmin = firebaseUser.email === "admin@aiarcade.com" || firebaseUser.email === "admin@forgeandplay.com"; 
            const newUser = {
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              role: isFirstAdmin ? "admin" : "user", // Admin maili ise yetki ver
              premiumEndDate: isFirstAdmin ? new Date("2099-01-01").toISOString() : null,
              pendingRequest: null
            };
            setDoc(userRef, newUser);
            setCurrentUser({ id: firebaseUser.uid, ...newUser });
          }
          setAuthLoading(false);
        });
        return () => unsubUser();
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  /* ---------------------------------------------
     FIREBASE: ADMIN LİSTESİ VE FİKİR KUTUSU DİNLEYİCİSİ
  ---------------------------------------------- */
  useEffect(() => {
    // Fikirleri getir (Herkes görebilir)
    const unsubFeedbacks = onSnapshot(collection(db, "feedbacks"), (snapshot) => {
      const fbList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fbList.sort((a, b) => b.createdAt - a.createdAt);
      setFeedbacks(fbList);
    });

    // Admin ise tüm kullanıcıları getir
    let unsubUsers = () => {};
    if (currentUser?.role === "admin") {
      unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const uList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersList(uList);
      });
    }

    return () => {
      unsubFeedbacks();
      unsubUsers();
    };
  }, [currentUser?.role]);


  /* ---------------------------------------------
     Helpers
  ---------------------------------------------- */
  const isUserPremium = (user) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!user.premiumEndDate) return false;
    return new Date(user.premiumEndDate) > new Date();
  };

  const getRemainingDays = (dateString) => {
    if (!dateString) return null;
    const diffTime = new Date(dateString) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const openGame = (game) => {
    if (!game) return;
    if (!game.url) {
      setPlayingGame(game);
      return;
    }
    if (game.requiresPremium && !isUserPremium(currentUser)) {
      setPlayingGame(game);
      return;
    }
    setPlayingGame(game);
  };

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  useEffect(() => {
    if (activeTab !== "store" || playingGame) return;
    if (!featuredGames.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeTab, playingGame, featuredGames.length]);

  const handleGameKeypress = (e, game) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGame(game);
    }
  };

  /* ---------------------------------------------
     PLAYER OVERLAY
  ---------------------------------------------- */
  if (playingGame) {
    const isLockedPremium = playingGame.requiresPremium && !isUserPremium(currentUser);

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
        <div className="flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-slate-950 border-b border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 md:gap-3 text-white font-bold truncate">
            <div className="hidden sm:block bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-md">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline">Forge&Play</span>
            <span className="hidden sm:inline text-slate-600 select-none">|</span>
            <span className="text-sm md:text-base text-slate-300 font-medium truncate">
              Oynanıyor: <span className="text-emerald-400 font-bold">{playingGame.title}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {playingGame.url && (
              <a href={playingGame.url} target="_blank" rel="noopener noreferrer" className={`hidden md:block text-xs text-slate-400 hover:text-white transition-colors p-2 rounded ${focusStyles}`}>
                Yeni Sekmede Aç
              </a>
            )}
            <button onClick={() => setPlayingGame(null)} autoFocus className={`flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${focusStyles}`}>
              <X className="w-4 h-4" /> <span className="hidden sm:inline">Oyundan Çık</span>
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
                <button onClick={() => setShowPricingModal(true)} className={`flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold transition-colors ${focusStyles}`}>
                  <Sparkles className="w-5 h-5" /> Abonelik Planlarını Gör
                </button>
                <button onClick={() => setPlayingGame(null)} className={`w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold ${focusStyles}`}>
                  Vazgeç
                </button>
              </div>
            </div>
          ) : playingGame.url ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
              {/* OYUNLARIN AÇILMASI İÇİN TÜM TARAYICI İZİNLERİ (ALLOW) EKLENDİ */}
              <iframe
                src={playingGame.url}
                className="w-full h-full border-none outline-none"
                style={{ width: "100%", height: "100%", display: "block" }}
                title={playingGame.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone; camera; fullscreen"
              />
            </div>
          ) : (
            <div className="text-center space-y-4 p-6">
              <FlaskConical className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-400">Oyun Henüz Hazır Değil</h2>
              <button onClick={() => setPlayingGame(null)} className={`mt-4 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold ${focusStyles}`}>
                Geri Dön
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------
     COMPONENTS
  ---------------------------------------------- */
  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 lg:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10">
          <button className={`flex items-center gap-2.5 cursor-pointer rounded-lg py-1 ${focusStyles} shrink-0`} onClick={() => setActiveTab("store")}>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 lg:p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-xl lg:text-2xl font-black tracking-tight text-white hidden sm:block">
              Forge<span className="text-indigo-500">&</span>Play
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
            {currentUser?.role === "admin" && (
              <button onClick={() => setActiveTab("admin")} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all ml-2 border border-amber-500/20 ${focusStyles} ${activeTab === "admin" ? "bg-amber-500/20 text-amber-400" : "text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10"}`}>
                <Lock className="w-4 h-4" /> Admin
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-700/50 rounded-full px-3 py-2 focus-within:border-indigo-500 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Oyun ara..." className="bg-transparent outline-none border-none text-sm text-white ml-2 w-32 lg:w-48 placeholder-slate-500" />
          </div>
          <button className={`md:hidden p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-full border border-slate-800 ${focusStyles}`} onClick={() => setActiveTab("store")}>
            <Search className="w-4 h-4" />
          </button>

          {authLoading ? (
             <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 pl-2 md:border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end justify-center h-full">
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name}</span>
                {currentUser.role === "admin" ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-400">Yönetici</span>
                ) : currentUser.pendingRequest ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                ) : isUserPremium(currentUser) ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400">Premium ({getRemainingDays(currentUser.premiumEndDate)} Gün)</span>
                ) : getRemainingDays(currentUser.premiumEndDate) !== null && getRemainingDays(currentUser.premiumEndDate) <= 0 ? (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-red-400">Süresi Bitti</span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Standart</span>
                )}
              </div>
              <div className={`w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-950 ring-indigo-500 transition-all ${!isUserPremium(currentUser) && currentUser.role !== "admin" ? "animate-pulse" : ""}`} onClick={() => !isUserPremium(currentUser) && currentUser.role !== "admin" && setShowPricingModal(true)}>
                {currentUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1" title="Çıkış Yap">
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className={`flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 ${focusStyles} shrink-0`}>
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
          { id: "feedback", icon: Lightbulb, label: "Fikirler" },
        ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === tab.id ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}>
            <tab.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
        {currentUser?.role === "admin" && (
          <button onClick={() => setActiveTab("admin")} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${focusStyles} ${activeTab === "admin" ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}>
            <Lock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  /* ---------------------------------------------
     FIREBASE: GİRİŞ İŞLEMLERİ (AUTH)
  ---------------------------------------------- */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const email = emailInput.trim().toLowerCase();
    if (!email || !passwordInput) return;

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, email, passwordInput);
      }
      setShowLoginModal(false);
      setPasswordInput("");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') setAuthError("Bu e-posta zaten kayıtlı!");
      else if (error.code === 'auth/wrong-password') setAuthError("Hatalı şifre!");
      else if (error.code === 'auth/user-not-found') setAuthError("Kullanıcı bulunamadı!");
      else setAuthError("Bir hata oluştu: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      console.error(error);
      setAuthError("Google ile giriş yapılamadı.");
    }
  };

  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative">
        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Gamepad2 className="w-8 h-8 text-white" />
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
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="ornek@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 mt-2">
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
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors" type="button">
            {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </button>
        </p>
      </div>
    </div>
  );

  /* ---------------------------------------------
     FIREBASE: SATIN ALMA TALEBİ (PRICING)
  ---------------------------------------------- */
  const handlePurchaseRequest = async (plan) => {
    alert("Shopier ödeme sayfasına yönlendiriliyorsunuz... Ödeme tamamlandığında sistem yönetici onayına düşecektir.");
    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.id), { pendingRequest: plan });
    }
    setShowPricingModal(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Paket 1: 1 Ay */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col hover:border-indigo-500/30 transition-all relative">
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

          {/* Paket 2: 6 Ay */}
          <div className="bg-gradient-to-b from-indigo-900/50 to-slate-950 border-2 border-indigo-500 rounded-3xl p-6 md:p-8 flex flex-col transform lg:-translate-y-4 shadow-2xl shadow-indigo-500/20 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">EN POPÜLER</div>
            <h3 className="text-2xl font-bold text-white mb-2">Sezonluk Kart</h3>
            <p className="text-indigo-200/60 text-sm mb-6 h-10">Düzenli oyuncular için harika bir tasarruf fırsatı.</p>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">179₺</span><span className="text-slate-400 text-sm line-through">234₺</span>
            </div>
            <div className="text-indigo-400 text-sm mb-6 font-bold flex items-center gap-1"><Sparkles className="w-4 h-4" /> %23 İndirim (Aylık 29.8₺)</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /><span className="pt-0.5">Tüm Premium özellikler</span></li>
              <li className="flex gap-3 text-sm text-slate-200 items-start"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /><span className="pt-0.5">Özel rozet</span></li>
            </ul>
            <button onClick={() => handlePurchaseRequest("6A")} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/30 transform hover:scale-[1.02]">6 Ay İçin Satın Al</button>
          </div>

          {/* Paket 3: 12 Ay */}
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

        {!currentUser && (
          <div className="mt-8 text-center text-sm text-slate-400">Satın almak için önce <button className="text-indigo-400 font-bold hover:text-indigo-300" onClick={() => { setShowPricingModal(false); setShowLoginModal(true); }}>giriş yap</button>.</div>
        )}
      </div>
    </div>
  );

  /* ---------------------------------------------
     FIREBASE: FEEDBACK (FİKİR KUTUSU)
  ---------------------------------------------- */
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (newFeedbackText.trim() === "") return;

    await addDoc(collection(db, "feedbacks"), {
      userId: currentUser.id,
      user: currentUser.name,
      game: newFeedbackGame,
      text: newFeedbackText,
      status: "beklemede",
      date: new Date().toLocaleDateString('tr-TR'),
      createdAt: Date.now()
    });

    setNewFeedbackText("");
    alert("Fikrin buluta kaydedildi ve geliştiriciye iletildi!");
  };

  const renderFeedback = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            <h2 className="text-2xl md:text-4xl font-black text-white">Oyuncuların Sesi</h2>
          </div>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            Forge&Play oyunlarını birlikte geliştiriyoruz! Aklına gelen fikri yaz, anında veritabanımıza kaydolsun.
          </p>
        </div>

        <div className="w-full md:w-[400px] bg-slate-950 rounded-xl p-5 md:p-6 border border-slate-800 shadow-2xl shrink-0">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-indigo-400" /> Bir Fikir Gönder</h3>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hangi Oyun İçin?</label>
              <select value={newFeedbackGame} onChange={(e) => setNewFeedbackGame(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
                {GAMES.map((g) => <option key={g.id} value={g.title}>{g.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fikriniz Nedir?</label>
              <textarea required rows="3" value={newFeedbackText} onChange={(e) => setNewFeedbackText(e.target.value)} placeholder="Örn: Şu özellik gelirse çok iyi olur..." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <button type="submit" className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors ${focusStyles}`}>
              <Send className="w-4 h-4" /> Gönder
            </button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3">Canlı Topluluk Fikirleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col h-full hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold text-indigo-400 mb-1">{fb.game}</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {fb.user}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">{fb.date}</div>
              </div>
              <p className="text-sm text-slate-300 mb-6 flex-1 italic border-l-2 border-slate-700 pl-3">"{fb.text}"</p>
              <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Geliştirici Durumu:</span>
                {fb.status === "onaylandi" && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">✅ Onaylandı</span>}
                {fb.status === "inceleniyor" && <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/20">⏳ İnceleniyor</span>}
                {fb.status === "beklemede" && <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded">Beklemede</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------
     FIREBASE: ADMIN DASHBOARD İŞLEMLERİ
  ---------------------------------------------- */
  const renderAdminDashboard = () => {
    const approvePremiumTime = async (userId, planCode) => {
      let monthsToAdd = 1;
      if (planCode === "6A") monthsToAdd = 6;
      if (planCode === "1Y") monthsToAdd = 12;

      const u = usersList.find(user => user.id === userId);
      if(!u) return;

      const base = u.premiumEndDate && new Date(u.premiumEndDate) > new Date() ? new Date(u.premiumEndDate) : new Date();
      base.setMonth(base.getMonth() + monthsToAdd);

      // Sadece veritabanını güncelliyoruz, dinleyici ekranı otomatik güncelleyecek
      await updateDoc(doc(db, "users", userId), {
        premiumEndDate: base.toISOString(),
        pendingRequest: null,
      });
    };

    const revokePremium = async (userId) => {
      await updateDoc(doc(db, "users", userId), { premiumEndDate: null, pendingRequest: null });
    };

    const sortedUsers = useMemo(() => {
      const list = [...usersList].sort((a, b) => (b.pendingRequest ? 1 : 0) - (a.pendingRequest ? 1 : 0));
      const q = adminSearch.trim().toLowerCase();
      if (!q) return list;
      return list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }, [usersList, adminSearch]);

    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Yönetici Paneli (Firebase Canlı)</h2>
            </div>
            <p className="text-amber-200/60 text-sm">Tüm veriler Firestore üzerinden canlı olarak okunur ve yazılır.</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
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
                  <th className="px-6 py-4 font-semibold">Kullanıcı</th>
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
                      <td className="px-6 py-4 text-sm font-medium text-white">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isPending ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">ÖDEME ONAYI BEKLİYOR ({user.pendingRequest})</span>
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
                              <button onClick={() => approvePremiumTime(user.id, user.pendingRequest)} className={`text-[10px] md:text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-500/20 ${focusStyles}`}>Onayla</button>
                              <button onClick={() => revokePremium(user.id)} className={`text-[10px] md:text-xs font-bold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ${focusStyles}`}>Reddet</button>
                            </>
                          ) : (
                            <>
                              {isPremium ? (
                                <button onClick={() => revokePremium(user.id)} className={`text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-lg transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20 ${focusStyles}`} title="Aboneliği İptal Et"><ShieldAlert className="w-3 h-3 md:w-4 md:h-4" /></button>
                              ) : null}
                              <button onClick={() => approvePremiumTime(user.id, "1A")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors ${focusStyles}`} title="1 Ay Manuel Ekle">+1A</button>
                              <button onClick={() => approvePremiumTime(user.id, "6A")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300 transition-colors ${focusStyles}`} title="6 Ay Manuel Ekle">+6A</button>
                              <button onClick={() => approvePremiumTime(user.id, "1Y")} className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-300 transition-colors ${focusStyles}`} title="1 Yıl Manuel Ekle">+1Y</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!sortedUsers.length && <div className="p-6 text-center text-sm text-slate-400">Kullanıcı bulunamadı.</div>}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------
     STORE EKRANI
  ---------------------------------------------- */
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter((g) => {
      const hay = `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery]);

  const renderStore = () => {
    const slideList = featuredGames;
    return (
      <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
        <section className={`relative group cursor-pointer rounded-3xl ${focusStyles} overflow-hidden h-[450px] md:h-[500px] lg:h-[550px] shadow-2xl shrink-0`} tabIndex={0} onClick={() => slideList.length && openGame(slideList[currentSlide])} onKeyDown={(e) => slideList.length && handleGameKeypress(e, slideList[currentSlide])}>
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
                        {game.requiresPremium && <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight leading-tight line-clamp-2">{game.title}</h1>
                      <p className="text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl line-clamp-3">{game.description}</p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2 md:pt-4">
                        <button tabIndex={-1} className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shrink-0 ${game.requiresPremium && !isUserPremium(currentUser) ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}`} onClick={(e) => { e.stopPropagation(); if (game.requiresPremium && !isUserPremium(currentUser)) { setShowPricingModal(true); return; } openGame(game); }}>
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
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" : "w-2 bg-slate-500/50 hover:bg-slate-400"}`} />
                ))}
              </div>
            </>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" /> Platform Projeleri</h2>
            <div className="md:hidden flex items-center bg-slate-900/60 border border-slate-800 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ara..." className="bg-transparent outline-none border-none text-sm text-white ml-2 w-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGames.map((game) => {
              const locked = game.requiresPremium && !isUserPremium(currentUser);
              return (
                <div key={game.id} tabIndex={0} onClick={() => { if (locked && game.url) { setShowPricingModal(true); return; } openGame(game); }} className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all group hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] cursor-pointer flex flex-col ${focusStyles}`}>
                  <div className={`h-32 md:h-40 bg-gradient-to-br ${game.gradient} p-4 md:p-6 flex flex-col justify-between relative overflow-hidden`}>
                    {game.image && <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-60 transition-all transform group-hover:scale-110 duration-500 z-0 pointer-events-none" />}
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500 z-10"><GameIcon iconKey={game.iconKey} className="w-12 h-12" /></div>
                    <div className="flex justify-between items-start z-10 relative">
                      <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full ${game.type === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm" : "bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm"}`}>{game.status}</span>
                      {game.requiresPremium && <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Lock className="w-3 h-3" /> PREMIUM</span>}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white z-10 drop-shadow-md relative">{game.title}</h3>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col z-10 bg-slate-900">
                    <p className="text-slate-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 flex-1">{game.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs text-slate-500 mb-0.5">{game.players}</span>
                        <span className="text-sm md:text-base font-semibold text-white">{game.price}</span>
                      </div>
                      <button tabIndex={-1} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${game.url ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 flex flex-col">
      {renderNavbar()}
      {showLoginModal && renderLoginModal()}
      {showPricingModal && renderPricingModal()}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12">
        {activeTab === "store" && renderStore()}
        {activeTab === "library" && renderLibrary()}
        {activeTab === "lab" && renderLab()}
        {activeTab === "feedback" && renderFeedback()}
        {activeTab === "admin" && currentUser?.role === "admin" && renderAdminDashboard()}
      </main>
      <footer className="hidden md:block border-t border-slate-800 bg-slate-950 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0 font-bold">
            <Gamepad2 className="w-5 h-5 text-indigo-500" /><span>© 2026 Forge&Play. Tüm hakları saklıdır.</span>
          </div>
        </div>
      </footer>
      {renderMobileBottomNav()}
      <style dangerouslySetInnerHTML={{ __html: `.pb-safe { padding-bottom: env(safe-area-inset-bottom); }` }} />
    </div>
  );
}
