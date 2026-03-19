import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Gamepad2, Library, FlaskConical, Search, User, Play,
  ChevronRight, Sparkles, Wallet, X, Lock, LogOut, CalendarDays,
  CheckCircle2, ShieldAlert, MessageCircle, Film, HelpCircle,
  Lightbulb, MessageSquarePlus, Send, AlertTriangle, Trophy, Mail,
  Copy, Check, Crown, Zap, HeartHandshake, Star, Share2, Download,
  Smartphone, Maximize, Trash, Gift, ShoppingBag, Coins, Truck,
  CreditCard, Clock, Eye, EyeOff, Edit, ExternalLink,
  TrendingUp, Users, Package, Plus, Sword, Gem, Brain, Rocket, Globe,
  Shield, Heart, ThumbsUp, MessageSquare, ChevronDown, ArrowRight,
  Flame, Award, BarChart2, Instagram, Info, FileText, Phone,
  MapPin, CheckSquare, Layers, Target, BookOpen
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore, collection, onSnapshot, doc, setDoc, updateDoc,
  addDoc, deleteDoc, query, orderBy, serverTimestamp, increment, getDoc,
  writeBatch, getDocs
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

const ADMIN_EMAILS = Object.freeze(["forgeandplay@gmail.com","carkci.caner@gmail.com"]);
const PAYMENT_LINKS = Object.freeze({ "1A":"https://www.shopier.com/forgeandplay/44689059","6A":"https://www.shopier.com/forgeandplay/44689160","1Y":"https://www.shopier.com/forgeandplay/44689235" });
const LOGO_URL = "https://i.ibb.co/HppdF5nY/freepik-minimal-futuristic-gaming-logo-forge-hammer-combin-64278.png";
const INSTAGRAM_URL = "https://www.instagram.com/forgeandplayshop?igsh=MWFsdWp1bDIwMzJxaA%3D%3D&utm_source=qr";

const FAP_COIN_CONFIG = { perSession:0.5, sessionMinutes:10, dailyMax:16, checkInterval:15000, sessionSeconds:600 };

let app, auth, db, googleProvider;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt:'select_account' });
}

/* =========================================================================
   SOSYAL KANIT — Sahte Kullanıcılar & Yorumlar (Sosyal Proof)
   ========================================================================= */
const SEED_USERS = [
  { name:"Ahmet Yıldız", avatar:"AY", color:"from-blue-500 to-cyan-500", city:"İstanbul", level:12 },
  { name:"Zeynep Kaya", avatar:"ZK", color:"from-pink-500 to-rose-500", city:"Ankara", level:8 },
  { name:"Mert Demir", avatar:"MD", color:"from-emerald-500 to-teal-500", city:"İzmir", level:15 },
  { name:"Elif Çelik", avatar:"EÇ", color:"from-purple-500 to-violet-500", city:"Bursa", level:6 },
  { name:"Burak Şahin", avatar:"BŞ", color:"from-orange-500 to-amber-500", city:"Antalya", level:20 },
  { name:"Selin Arslan", avatar:"SA", color:"from-red-500 to-rose-500", city:"Adana", level:9 },
  { name:"Emre Koç", avatar:"EK", color:"from-indigo-500 to-blue-500", city:"Gaziantep", level:11 },
  { name:"Ayşe Öztürk", avatar:"AÖ", color:"from-yellow-500 to-amber-500", city:"Konya", level:7 },
  { name:"Can Yılmaz", avatar:"CY", color:"from-green-500 to-emerald-500", city:"Mersin", level:18 },
  { name:"Melis Aydın", avatar:"MA", color:"from-fuchsia-500 to-pink-500", city:"Trabzon", level:5 },
  { name:"Baran Kılıç", avatar:"BK", color:"from-teal-500 to-cyan-500", city:"Samsun", level:14 },
  { name:"Deniz Güneş", avatar:"DG", color:"from-sky-500 to-blue-500", city:"Eskişehir", level:10 },
  { name:"Hüseyin Polat", avatar:"HP", color:"from-lime-500 to-green-500", city:"Malatya", level:3 },
  { name:"Gamze Doğan", avatar:"GD", color:"from-rose-500 to-pink-500", city:"Kayseri", level:16 },
  { name:"Furkan Acar", avatar:"FA", color:"from-violet-500 to-purple-500", city:"Denizli", level:22 },
  { name:"Tuba Çetin", avatar:"TÇ", color:"from-amber-500 to-orange-500", city:"Manisa", level:4 },
  { name:"Kerem Güler", avatar:"KG", color:"from-cyan-500 to-sky-500", city:"Balıkesir", level:13 },
  { name:"Rana Arslan", avatar:"RA", color:"from-emerald-400 to-green-500", city:"Tekirdağ", level:8 },
  { name:"Alp Sezer", avatar:"AS", color:"from-orange-400 to-red-500", city:"Edirne", level:17 },
  { name:"Nisa Yıldırım", avatar:"NY", color:"from-purple-400 to-fuchsia-500", city:"Çanakkale", level:6 },
];

const SEED_COMMENTS = [
  { user:0, game:"tabu", text:"Arkadaşlarımla saatlerce oynadık, çok eğlenceli bir oyun!", stars:5, time:"2 saat önce" },
  { user:2, game:"vampir-koylu", text:"Vampir Köylü gerçekten rekabetçi bir oyun. Kesinlikle tavsiye ederim!", stars:5, time:"4 saat önce" },
  { user:4, game:"forge-play-quiz", text:"Quiz soruları çok kaliteli hazırlanmış. Hem eğlenceli hem öğretici.", stars:4, time:"6 saat önce" },
  { user:1, game:"isim-sehir-online", text:"Klasik oyunun dijital versiyonu mükemmel olmuş. Mobilde de gayet akıcı çalışıyor.", stars:5, time:"dün" },
  { user:3, game:"pis-yedili", text:"Arayüz çok temiz ve hızlı. Arkadaşlarımı hemen davet ettim.", stars:4, time:"dün" },
  { user:6, game:"monopoly-bank", text:"Monopoly oynamak artık çok daha kolay. Kağıt para karmaşasına son!", stars:5, time:"2 gün önce" },
  { user:5, game:"tabu", text:"Parti oyunlarının en iyisi! Her buluşmamızda oynuyoruz.", stars:5, time:"2 gün önce" },
  { user:8, game:"vampir-koylu", text:"Strateji ve iletişim gerektiriyor. Takım çalışması için harika.", stars:5, time:"3 gün önce" },
  { user:7, game:"forge-play-quiz", text:"Türkçe quiz seçenekleri süper. Daha fazla kategori gelse iyi olur.", stars:4, time:"3 gün önce" },
  { user:9, game:"isim-sehir-online", text:"Kelime oyunları sever misiniz? O zaman bu oyun tam size göre!", stars:5, time:"4 gün önce" },
  { user:11, game:"tabu", text:"Çok eğlenceli bir platform. İnsanları bir araya getiriyor.", stars:5, time:"4 gün önce" },
  { user:10, game:"pis-yedili", text:"Kart oyunu tutkunlarına müjde! Harika bir deneyim.", stars:5, time:"5 gün önce" },
  { user:14, game:"vampir-koylu", text:"20 kişilik büyük gruplar için bile mükemmel çalışıyor.", stars:5, time:"5 gün önce" },
  { user:12, game:"monopoly-bank", text:"Para takibini dijitale taşımak çok iyi bir fikir olmuş.", stars:4, time:"6 gün önce" },
  { user:13, game:"tabu", text:"Arayüz çok sezgisel. İlk kez oynayanlar bile hemen adapte oluyor.", stars:5, time:"1 hafta önce" },
  { user:15, game:"forge-play-quiz", text:"Bilgi yarışması severler için bulunmaz bir platform!", stars:5, time:"1 hafta önce" },
  { user:17, game:"isim-sehir-online", text:"Çocukluktan gelen nostaljik oyun artık telefonda. Harika!", stars:5, time:"1 hafta önce" },
  { user:16, game:"pis-yedili", text:"Grafik tasarımı şık ve modern görünüyor. Tebrikler!", stars:4, time:"1 hafta önce" },
  { user:19, game:"vampir-koylu", text:"Arkadaş grubumuza çok yakıştı bu oyun. Herkese öneririm.", stars:5, time:"2 hafta önce" },
  { user:18, game:"tabu", text:"Türkçe kelime seçenekleri gerçekten zengin. Çok düşünülmüş.", stars:5, time:"2 hafta önce" },
];

const LIVE_STATS = { todayPlayers: 1247, totalGamesPlayed: 18934, activeNow: 342, totalUsers: 4821 };

/* =========================================================================
   EMAILjs YAPILANDIRMASI
   ─────────────────────────────────────────────────────────────────────────
   KURULUM (ücretsiz, 200 mail/ay):
   1. emailjs.com → Ücretsiz hesap aç
   2. Email Services → Gmail'i bağla → Service ID'yi kopyala
   3. Email Templates → Yeni şablon oluştur → Template ID'yi kopyala
   4. Account → Public Key'i kopyala
   5. Aşağıdaki değerleri doldur
   ========================================================================= */
const EMAILJS_CONFIG = {
  serviceId:  "service_x9l5ijz",    // EmailJS panelinden al
  templateId: "templates_rt35wq5",   // EmailJS panelinden al
  publicKey:  "067egHH8ARUOtBrGU", // EmailJS Account → Public Key
  enabled: true, // Yukarıdakileri doldurduktan sonra true yap
};

// EmailJS REST API ile mail gönder (npm paketi gerektirmez)
async function sendEmailNotification(subject, body, replyTo) {
  if (!EMAILJS_CONFIG.enabled) return; // Yapılandırılmamışsa atla
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id:     EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: "forgeandplay@gmail.com",
          cc_email:  "carkci.caner@gmail.com",
          subject,
          message: body,
          reply_to: replyTo || "noreply@forgeandplay.com",
        }
      })
    });
  } catch (e) {
    console.warn("Email gönderilemedi:", e);
  }
}

/* =========================================================================
   OYUN VERİLERİ
   ========================================================================= */
const GAMES = [
  { id:"tabu", title:"Tabu", status:"Yayında", type:"live", tags:["Parti","Kelime Oyunu","Takım"], description:"Yasaklı kelimeleri kullanmadan takım arkadaşlarına gizli kelimeyi anlatmaya çalış. Süre dolmadan en çok kelimeyi bilen takım kazanır! Aile ve arkadaş buluşmalarının vazgeçilmezi.", price:"Premium İçerik", basePlayers:890, gradient:"from-orange-900 via-rose-950 to-black", iconKey:"message", url:"https://tabu-game-three.vercel.app/", image:"https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&q=80&w=800", requiresPremium:true, likes:342, plays:8920 },
  { id:"isim-sehir-online", title:"İsim Şehir Online", status:"Yayında", type:"live", tags:["Kelime Oyunu","Klasik","Çok Oyunculu"], description:"Efsanevi İsim Şehir Hayvan oyunu şimdi dijitalde! Rastgele harfini seç, kelimeleri hızlıca bul ve arkadaşlarınla kıyasıya yarışarak en yüksek puanı topla.", price:"Premium İçerik", basePlayers:950, gradient:"from-pink-900 via-purple-950 to-black", iconKey:"message", url:"https://isim-sehir-online.vercel.app/", image:"https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=800", requiresPremium:true, likes:298, plays:9500 },
  { id:"vampir-koylu", title:"Vampir Köylü", status:"Yayında", type:"live", tags:["Parti","Çok Oyunculu","Gizem"], description:"Konuş, şüphelen, oyla: Vampirleri bul, kasabayı kurtar. Rol yapma ve strateji bir arada. Büyük gruplar için mükemmel sosyal dedüksiyon oyunu.", price:"Premium İçerik", basePlayers:1240, gradient:"from-red-900 via-rose-950 to-black", iconKey:"user", url:"https://vampir-oyunu.vercel.app/", image:"https://i.ibb.co/KxP67Mm1/Ba-l-ks-z-4.png", requiresPremium:true, likes:421, plays:12400 },
  { id:"forge-play-quiz", title:"Forge&Play Quiz", status:"Yayında", type:"live", tags:["Bilgi","Yarışma","Zeka"], description:"Genel kültürünü sına, arkadaşlarınla yarış! Liderlik tablosunda zirvede yerini al. Farklı kategorilerde yüzlerce soru seni bekliyor.", price:"Premium İçerik", basePlayers:420, gradient:"from-indigo-900 via-blue-950 to-black", iconKey:"help", url:"https://forge-and-play-quiz.vercel.app/", image:"https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800", requiresPremium:true, likes:187, plays:4200 },
  { id:"pis-yedili", title:"Pis 7'li", status:"Yayında", type:"live", tags:["Kart Oyunu","Klasik","Çok Oyunculu"], description:"Klasik kart oyunu Pis 7'li şimdi dijitalde! Hünerlerini sergile, rakiplerine kart atlatma ve arkadaşlarını geride bırak.", price:"Premium İçerik", basePlayers:1560, gradient:"from-fuchsia-900 via-purple-950 to-black", iconKey:"user", url:"https://pis7li-oyunu.vercel.app/", image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", requiresPremium:true, likes:389, plays:15600 },
  { id:"monopoly-bank", title:"Monopoly Dijital Banka", status:"Yayında", type:"live", tags:["Araç","Masa Oyunu","Finans"], description:"Kağıt paralarla uğraşmaya son! Arkadaşlarınızla Monopoly oynarken kasanızı dijital olarak yönetin. Hızlı, pratik, eğlenceli.", price:"Premium İçerik", basePlayers:345, gradient:"from-emerald-900 via-teal-950 to-black", iconKey:"wallet", url:"https://siprayt-monopoly.vercel.app/", image:"https://i.ibb.co/RGmKfVY8/freepik-3d-cinematic-monopoly-style-board-game-world-comin-87944.png", requiresPremium:true, likes:156, plays:3450 },
  { id:"sessiz-sinema", title:"Sessiz Sinema", status:"Yakında", type:"upcoming", tags:["Parti","Eğlence","Rol Yapma"], description:"Hiç konuşmadan, sadece hareketlerinle filmleri takımına anlat.", price:"Geliştiriliyor", basePlayers:0, gradient:"from-blue-900 via-cyan-950 to-black", iconKey:"film", url:null, image:"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", requiresPremium:false, likes:94, plays:0 },
  { id:"yuzbir-okey", title:"101 Okey", status:"Yakında", type:"upcoming", tags:["Masa Oyunu","Klasik","Çok Oyunculu"], description:"Efsanevi 101 Okey deneyimi yakında dijital masalarınızda.", price:"Geliştiriliyor", basePlayers:0, gradient:"from-red-900 via-red-950 to-black", iconKey:"user", url:null, image:"https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=800", requiresPremium:false, likes:211, plays:0 },
  { id:"koz-maca-batak", title:"Koz Maça (Batak)", status:"Yakında", type:"upcoming", tags:["Kart Oyunu","Klasik","Strateji"], description:"İhaleyi al, kozunu belirle ve masayı domine et.", price:"Geliştiriliyor", basePlayers:0, gradient:"from-slate-800 via-slate-950 to-black", iconKey:"user", url:null, image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", requiresPremium:false, likes:178, plays:0 },
];

const LAB_PROJECTS = [
  { id:"forge-defend", title:"Forge & Defend: Dragon's Sabotage", progress:38, status:"Geliştiriliyor", tag:"Tower Defense", description:"Ejderhaların saldırısı altındaki kalenizi savunun! Kuleleri stratejik noktalara yerleştirin, büyüler kullanın.", gradient:"from-red-900 to-orange-950", iconKey:"sword", accentColor:"text-red-400", image:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" },
  { id:"gem-crush", title:"Gem Crush: Forge Edition", progress:62, status:"Beta Yakında", tag:"Puzzle / Match-3", description:"Renkli taşları eşleştir, patlat, rekor kır! 100+ seviye sizi bekliyor.", gradient:"from-purple-900 to-pink-950", iconKey:"gem", accentColor:"text-purple-400", image:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" },
  { id:"ai-dungeon", title:"AI Zindan Ustası (D&D)", progress:45, status:"Geliştiriliyor", tag:"RPG / AI", description:"Yapay zekanın oyun yöneticisi olduğu, sınırsız senaryoya sahip RPG deneyimi.", gradient:"from-orange-900 to-slate-900", iconKey:"brain", accentColor:"text-orange-400", image:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
  { id:"life-path", title:"LifePath Simulator", progress:80, status:"Beta Yakında", tag:"Simülasyon", description:"Hayatın iplerini eline al. Kariyer, ilişki, finans — her seçim seni farklı bir geleceğe götürüyor.", gradient:"from-amber-900 to-slate-900", iconKey:"rocket", accentColor:"text-amber-400", image:"https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80&w=800" },
  { id:"world-quiz-live", title:"World Quiz LIVE", progress:55, status:"Geliştiriliyor", tag:"Bilgi / Canlı", description:"Tüm kullanıcılarla aynı anda canlı bilgi yarışması! Her gece turnuvaya katıl, FAP Coin kazan.", gradient:"from-blue-900 to-indigo-950", iconKey:"globe", accentColor:"text-blue-400", image:"https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800" },
  { id:"forge-cards", title:"Forge Cards: Dueling Arena", progress:20, status:"Erken Geliştirme", tag:"Kart Oyunu / Strateji", description:"Forge&Play evreniyle bütünleşik koleksiyon kart oyunu. Desteni oluştur, rakiplerine kart savaşı ver.", gradient:"from-teal-900 to-slate-900", iconKey:"sword", accentColor:"text-teal-400", image:"https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=800" },
];

const focusStyles = "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

/* =========================================================================
   SEVİYE SİSTEMİ
   ========================================================================= */
const LEVELS = [
  { min:0, max:4, name:"Çaylak", color:"text-slate-400", bg:"bg-slate-800", icon:"🎮" },
  { min:5, max:14, name:"Oyuncu", color:"text-emerald-400", bg:"bg-emerald-500/20", icon:"⚔️" },
  { min:15, max:29, name:"Usta", color:"text-blue-400", bg:"bg-blue-500/20", icon:"🏆" },
  { min:30, max:49, name:"Kahraman", color:"text-purple-400", bg:"bg-purple-500/20", icon:"👑" },
  { min:50, max:99, name:"Efsane", color:"text-amber-400", bg:"bg-amber-500/20", icon:"⭐" },
  { min:100, max:Infinity, name:"Tanrı", color:"text-orange-400", bg:"bg-orange-500/20", icon:"🔥" },
];

function getLevel(playCount) {
  const count = Number(playCount || 0);
  return LEVELS.find(l => count >= l.min && count <= l.max) || LEVELS[0];
}

function getNextLevelProgress(playCount) {
  const count = Number(playCount || 0);
  const lv = LEVELS.findIndex(l => count >= l.min && count <= l.max);
  if (lv === -1 || lv === LEVELS.length - 1) return 100;
  const current = LEVELS[lv];
  const range = current.max - current.min + 1;
  return Math.min(100, Math.round(((count - current.min) / range) * 100));
}

/* =========================================================================
   AVATAR RENK
   ========================================================================= */
const AVATAR_COLORS = [
  "from-orange-500 to-amber-600","from-blue-500 to-cyan-600","from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600","from-rose-500 to-pink-600","from-indigo-500 to-blue-600",
];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name||"").length; i++) hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* =========================================================================
   GÜVENLİK & YARDIMCI
   ========================================================================= */
const BAD_WORDS = ["amk","aq","sg","siktir","yavşak","oç","orospu","piç","ibne","göt","sik","yarrak"];
function sanitizeText(t) {
  if (!t) return '';
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').trim().substring(0,1000);
}
function containsProfanity(t) { if(!t)return false; const l=String(t).toLowerCase(); return BAD_WORDS.some(w=>l.includes(w)); }
function calculateRank(p) { return Math.max(1,50000-Math.max(0,Number(p)||0)*142).toLocaleString('tr-TR'); }
function isUserAdmin(u) { if(!u)return false; if(u.role==="admin")return true; if(u.email)return ADMIN_EMAILS.includes(String(u.email).toLowerCase().trim()); return false; }
function isUserPremium(u) { if(!u)return false; if(isUserAdmin(u))return true; if(!u.premiumEndDate)return false; try{return new Date(u.premiumEndDate)>new Date();}catch{return false;} }
function getRemainingDays(d) { if(!d)return null; try{return Math.ceil((new Date(d)-new Date())/86400000);}catch{return null;} }
function createRateLimiter(max=5,w=60000,maxK=1000) {
  const m=new Map();
  return k=>{const now=Date.now();if(m.size>maxK)m.delete(m.keys().next().value);const r=(m.get(k)||[]).filter(t=>now-t<w);if(r.length>=max)return false;r.push(now);m.set(k,r);return true;};
}
const feedbackRateLimiter = createRateLimiter(3,60000);
const loginRateLimiter = createRateLimiter(5,300000);
const commentRateLimiter = createRateLimiter(5,120000);

function GameIcon({ iconKey, className }) {
  const cls=className||"w-10 h-10 md:w-12 md:h-12";
  const map={wallet:[Wallet,"text-emerald-500"],message:[MessageCircle,"text-orange-500"],film:[Film,"text-blue-500"],help:[HelpCircle,"text-amber-500"],sword:[Sword,"text-red-400"],gem:[Gem,"text-purple-400"],brain:[Brain,"text-orange-400"],rocket:[Rocket,"text-amber-400"],globe:[Globe,"text-blue-400"]};
  const [Icon,color]=map[iconKey]||[User,"text-red-500"];
  return <Icon className={`${cls} ${color}`}/>;
}

function LivePlayerCount({ base }) {
  const [count,setCount]=useState(base);
  const ref=useRef(true);
  useEffect(()=>{ref.current=true;if(!base)return;const iv=setInterval(()=>{if(ref.current)setCount(p=>Math.max(Math.max(0,base-50),Math.min(base+50,p+(Math.floor(Math.random()*9)-3))));},4000);return()=>{ref.current=false;clearInterval(iv);};}, [base]);
  if(!base)return <span className="text-[10px] text-slate-500">Yakında</span>;
  return <span className="text-[10px] md:text-xs text-emerald-400 flex items-center gap-1 font-medium"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>{count.toLocaleString('tr-TR')} Oynuyor</span>;
}

/* =========================================================================
   FEEDBACK FORMU
   ========================================================================= */
const FeedbackForm = ({ currentUser, onSubmit }) => {
  const [text,setText]=useState(""); const [game,setGame]=useState("Tabu");
  const [sub,setSub]=useState(false); const [err,setErr]=useState("");
  const [chars,setChars]=useState(0); const [hp,setHp]=useState(""); const [math,setMath]=useState("");
  const [q]=useState(()=>{const a=Math.floor(Math.random()*9)+1,b=Math.floor(Math.random()*9)+1;return{a,b,ans:a+b};});
  const submit=async e=>{
    e.preventDefault();setErr("");
    if(hp){setErr("Gönderim başarısız.");return;}
    if(parseInt(math,10)!==q.ans){setErr("Matematik sorusunu doğru cevaplayın.");return;}
    if(!currentUser){setErr("Giriş yapmalısınız.");return;}
    const t=text.trim();
    if(t.length<10){setErr("En az 10 karakter yazın.");return;}
    if(containsProfanity(t)){setErr("Uygunsuz ifade tespit edildi.");return;}
    if(!feedbackRateLimiter(currentUser.id)){setErr("Çok hızlı gönderiyorsunuz.");return;}
    setSub(true);
    try{await onSubmit({text:sanitizeText(t),game:sanitizeText(game)});setText("");setChars(0);setMath("");}
    catch{setErr("Gönderilemedi.");}
    finally{setSub(false);}
  };
  return(
    <form onSubmit={submit} className="space-y-4">
      <div aria-hidden="true" style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',overflow:'hidden'}}><input type="text" value={hp} onChange={e=>setHp(e.target.value)} tabIndex={-1}/></div>
      {err&&<div role="alert" className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{err}</div>}
      <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Oyun</label><select value={game} onChange={e=>setGame(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm">{GAMES.filter(g=>g.status==="Yayında").map(g=><option key={g.id} value={g.title}>{g.title}</option>)}</select></div>
      <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Fikriniz</label><textarea value={text} onChange={e=>{const v=e.target.value;setChars(v.length);if(v.length<=500)setText(v);}} placeholder="Oyun hakkında düşüncenizi paylaşın..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 min-h-[100px] resize-none text-sm" maxLength={500} disabled={sub}/><div className="flex justify-end mt-1"><span className={`text-xs ${chars>=450?'text-orange-400':'text-slate-600'}`}>{chars}/500</span></div></div>
      <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Güvenlik: {q.a} + {q.b} = ?</label><input type="number" value={math} onChange={e=>setMath(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm" required min="0" max="99"/></div>
      <button type="submit" disabled={sub||!text.trim()} className={`w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${focusStyles}`}>
        {sub?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Gönderiliyor...</>:<><Send className="w-4 h-4"/>Gönder</>}
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
        <p className="text-slate-400 text-sm"><b>App.jsx</b> içindeki <code>firebaseConfig</code>'e anahtarlarını yapıştır.</p>
      </div>
    </div>
  );

  // ── STATE ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("home");
  const [playingGame, setPlayingGame] = useState(null);
  const [selectedLibraryGame, setSelectedLibraryGame] = useState(GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [shopierOrderInput, setShopierOrderInput] = useState("");
  const [selfActivating, setSelfActivating] = useState(false);
  const [premiumWarningGame, setPremiumWarningGame] = useState(null);
  const [trialPromptGame, setTrialPromptGame] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // ── Canlı İstatistikler (sürekli değişen) ──────────────────────────────────
  const [liveCounters, setLiveCounters] = useState({
    todayPlayers: LIVE_STATS.todayPlayers,
    totalGamesPlayed: LIVE_STATS.totalGamesPlayed,
    activeNow: LIVE_STATS.activeNow,
    totalUsers: LIVE_STATS.totalUsers,
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy'|'terms'|'about'|'contact'|'gameDetail'
  const [selectedGameDetail, setSelectedGameDetail] = useState(null);
  const [contactForm, setContactForm] = useState({ name:'', email:'', message:'' });
  const [contactSent, setContactSent] = useState(false);
  const [gameComments, setGameComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [gameLikes, setGameLikes] = useState({});
  const [likedGames, setLikedGames] = useState(new Set());

  // Store
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  // Admin
  const [adminTab, setAdminTab] = useState("users");
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [newProductData, setNewProductData] = useState({ name:'',price:'',image:'',desc:'',type:'Dijital',isVisible:true });
  const [editingProductId, setEditingProductId] = useState(null);
  const editingProductIdRef = useRef(null);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Refs
  const playTimerRef = useRef(null);
  const fapIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const botIntervalRef = useRef(null);
  const activeSecondsRef = useRef(0);

  // ── MEMOIZED ────────────────────────────────────────────────────────────────
  const featuredGames = useMemo(()=>GAMES.filter(g=>g.status==="Yayında"),[]);
  const filteredGames = useMemo(()=>{const q=searchQuery.trim().toLowerCase();if(!q)return GAMES;return GAMES.filter(g=>`${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase().includes(q));}, [searchQuery]);
  const sortedUsers = useMemo(()=>{const list=[...usersList].sort((a,b)=>(a.pendingRequest?-1:1)-(b.pendingRequest?-1:1));const q=adminSearch.trim().toLowerCase();if(!q)return list;return list.filter(u=>String(u.name||"").toLowerCase().includes(q)||String(u.email||"").toLowerCase().includes(q));}, [usersList, adminSearch]);
  const isAdmin = useMemo(()=>currentUser?isUserAdmin(currentUser):false,[currentUser]);

  const handleFirebaseError = useCallback(err=>{if(process.env.NODE_ENV==='development')console.warn("FB:",err?.message||err);},[]);

  // ── EFFECTS ──────────────────────────────────────────────────────────────────
  useEffect(()=>()=>{
    if(playTimerRef.current)clearTimeout(playTimerRef.current);
    if(fapIntervalRef.current)clearInterval(fapIntervalRef.current);
    if(slideIntervalRef.current)clearInterval(slideIntervalRef.current);
    if(botIntervalRef.current)clearInterval(botIntervalRef.current);
  },[]);

  useEffect(()=>{if(featuredGames.length<=1)return;if(slideIntervalRef.current)clearInterval(slideIntervalRef.current);slideIntervalRef.current=setInterval(()=>setCurrentSlide(p=>(p+1)%featuredGames.length),5000);return()=>clearInterval(slideIntervalRef.current);},[featuredGames.length]);

  useEffect(()=>{const h=e=>{e.preventDefault();setDeferredPrompt(e);};window.addEventListener('beforeinstallprompt',h);const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(ios&&!window.matchMedia('(display-mode: standalone)').matches)setIsIOS(true);return()=>window.removeEventListener('beforeinstallprompt',h);},[]);

  // ── CANLI SAYAÇ — Her 4 saniyede gerçekçi artış/azalış ────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveCounters(prev => {
        const rand = (base, min, max) => {
          const delta = Math.floor(Math.random() * (max - min + 1)) + min;
          return Math.max(base * 0.85, prev[base] ? prev[base] + delta : base + delta);
        };
        // activeNow: ±2-8 kişi değişir (en hareketli)
        const newActive = Math.max(280, Math.min(420,
          prev.activeNow + (Math.floor(Math.random() * 11) - 4)
        ));
        // todayPlayers: sürekli artar, gece yavaş gündüz hızlı
        const hour = new Date().getHours();
        const playerIncrease = hour >= 9 && hour <= 23
          ? Math.floor(Math.random() * 4)   // gündüz: 0-3
          : Math.floor(Math.random() * 2);   // gece: 0-1
        // totalGamesPlayed: sürekli artar
        const gameIncrease = Math.floor(Math.random() * 6); // 0-5
        // totalUsers: yavaş artar
        const userIncrease = Math.random() < 0.08 ? 1 : 0; // %8 ihtimalle +1

        return {
          todayPlayers:     prev.todayPlayers + playerIncrease,
          totalGamesPlayed: prev.totalGamesPlayed + gameIncrease,
          activeNow:        newActive,
          totalUsers:       prev.totalUsers + userIncrease,
        };
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  // Auth listener
  useEffect(()=>{if(!auth)return;let unsubUser=null,mounted=true;const unsubAuth=onAuthStateChanged(auth,async fbUser=>{if(!mounted)return;if(fbUser){try{const ref=doc(db,"users",fbUser.uid);unsubUser=onSnapshot(ref,async snap=>{if(!mounted)return;const email=String(fbUser.email||"").toLowerCase().trim();const adminMail=ADMIN_EMAILS.includes(email);if(snap.exists()){const data=snap.data();const upd={};if(adminMail&&data.role!=="admin"){upd.role="admin";upd.premiumEndDate=new Date("2099-01-01").toISOString();}if(!data.paymentCode)upd.paymentCode="FP-"+fbUser.uid.substring(0,4).toUpperCase();if(data.fapCoin===undefined)upd.fapCoin=0;if(data.dailyFap===undefined)upd.dailyFap=0;if(data.lastFapDate===undefined)upd.lastFapDate="";if(Object.keys(upd).length)await updateDoc(ref,upd).catch(handleFirebaseError);if(mounted)setCurrentUser({id:fbUser.uid,email,...data,...upd});}else{
        // ── YENİ KULLANICI oluşturuluyor ──────────────────────────────────────
        const pc="FP-"+fbUser.uid.substring(0,4).toUpperCase();
        const safeName=sanitizeText(fbUser.displayName||email.split("@")[0]||"Oyuncu").substring(0,50);
        const nu={name:safeName,email,role:adminMail?"admin":"user",premiumEndDate:adminMail?new Date("2099-01-01").toISOString():null,pendingRequest:null,playCount:0,premiumTrialsUsed:0,gamePlayCounts:{},fapCoin:0,dailyFap:0,lastFapDate:"",paymentCode:pc,createdAt:serverTimestamp(),lastLogin:serverTimestamp()};
        await setDoc(ref,nu).catch(handleFirebaseError);
        if(mounted)setCurrentUser({id:fbUser.uid,...nu});
        // 📧 Admin'e yeni üye bildirimi
        if(!adminMail) {
          sendEmailNotification(
            `🆕 Yeni Üye: ${safeName}`,
            `Yeni bir kullanıcı Forge&Play'e katıldı!\n\nİsim: ${safeName}\nE-posta: ${email}\nKod: ${pc}\nTarih: ${new Date().toLocaleString('tr-TR')}\n\nAdmin panelinden görüntüleyebilirsiniz.`,
            email
          );
        }
      }if(mounted)setAuthLoading(false);},err=>{handleFirebaseError(err);if(mounted)setAuthLoading(false);});}catch(err){handleFirebaseError(err);if(mounted)setAuthLoading(false);}}else{if(mounted){setCurrentUser(null);setAuthLoading(false);}}});return()=>{mounted=false;unsubAuth();if(unsubUser)unsubUser();};},[handleFirebaseError]);

  // Firestore listeners
  useEffect(()=>{
    if(!db)return;
    setStoreLoading(true);

    /*
     * ─── STORE_PRODUCTS LISTENER ──────────────────────────────────────────────
     * Bu listener Firestore'daki gerçek veriyi dinler.
     * Eğer ürün Firestore'dan gerçekten silinmişse buraya boş gelir.
     * Eğer silme sonrası ürün geri geliyorsa → Firestore Rules izin vermiyordur.
     * Gerekli Firestore Rules:
     *   match /store_products/{id} { allow read, write: if true; }
     */
    const unsubProducts = onSnapshot(
      collection(db, "store_products"),
      snap => {
        // DEBUG: Firestore'un gerçekte ne gönderdiğini görmek için
        console.log("store_products snapshot:", snap.docs.map(d => ({ id: d.id, ...d.data() })));

        const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        prods.sort((a, b) => {
          const at = a.createdAt?.seconds ?? 0;
          const bt = b.createdAt?.seconds ?? 0;
          return bt - at;
        });
        setStoreProducts(prods);
        setStoreLoading(false);
      },
      err => {
        console.error("store_products onSnapshot error:", err);
        handleFirebaseError(err);
        setStoreLoading(false);
      }
    );
    const unsubFeedbacks=onSnapshot(query(collection(db,"feedbacks"),orderBy("createdAt","desc")),snap=>{setFeedbacks(snap.docs.map(d=>{const data=d.data();let date=new Date().toISOString();if(data.createdAt?.toDate)date=data.createdAt.toDate().toISOString();return{id:d.id,...data,createdAt:date};}));},handleFirebaseError);
    let unsubUsers=null,unsubOrders=null;
    if(isAdmin){unsubUsers=onSnapshot(collection(db,"users"),snap=>setUsersList(snap.docs.map(d=>({id:d.id,...d.data()}))),handleFirebaseError);unsubOrders=onSnapshot(query(collection(db,"orders"),orderBy("createdAt","desc")),snap=>{setOrdersList(snap.docs.map(d=>{const data=d.data();let dt=new Date().toLocaleDateString('tr-TR');if(data.createdAt?.toDate){const dd=data.createdAt.toDate();dt=dd.toLocaleDateString('tr-TR')+" "+dd.toLocaleTimeString('tr-TR');}return{id:d.id,...data,displayDate:dt};}));},handleFirebaseError);}
    return()=>{unsubProducts();unsubFeedbacks();if(unsubUsers)unsubUsers();if(unsubOrders)unsubOrders();};},[isAdmin,handleFirebaseError]);

  // Load game likes/comments from Firestore
  useEffect(()=>{if(!db)return;const unsubLikes=onSnapshot(collection(db,"game_likes"),snap=>{const map={};snap.docs.forEach(d=>{map[d.id]=d.data().count||0;});setGameLikes(map);},handleFirebaseError);const unsubComments=onSnapshot(query(collection(db,"game_comments"),orderBy("createdAt","desc")),snap=>{const map={};snap.docs.forEach(d=>{const data=d.data();if(!map[data.gameId])map[data.gameId]=[];map[data.gameId].push({id:d.id,...data});});setGameComments(map);},handleFirebaseError);if(currentUser){const unsubLiked=onSnapshot(doc(db,"user_likes",currentUser.id),snap=>{if(snap.exists())setLikedGames(new Set(snap.data().games||[]));},handleFirebaseError);return()=>{unsubLikes();unsubComments();unsubLiked();};}return()=>{unsubLikes();unsubComments();};},[currentUser,handleFirebaseError]);

  // ── FAP COIN ──────────────────────────────────────────────────────────────────
  const earnFapCoin = useCallback(async()=>{if(!currentUser||!isUserPremium(currentUser))return;const today=new Date().toLocaleDateString('tr-TR');const daily=currentUser.lastFapDate===today?Number(currentUser.dailyFap||0):0;if(daily>=FAP_COIN_CONFIG.dailyMax)return;try{const add=FAP_COIN_CONFIG.perSession;const nd=daily+add;await updateDoc(doc(db,"users",currentUser.id),{fapCoin:increment(add),dailyFap:nd,lastFapDate:today}).catch(handleFirebaseError);setCurrentUser(prev=>prev?({...prev,fapCoin:(Number(prev.fapCoin)||0)+add,dailyFap:nd,lastFapDate:today}):null);}catch(e){handleFirebaseError(e);}},[currentUser,handleFirebaseError]);

  const startFapTimer=useCallback(()=>{if(fapIntervalRef.current)clearInterval(fapIntervalRef.current);activeSecondsRef.current=0;fapIntervalRef.current=setInterval(()=>{if(!document.hidden){activeSecondsRef.current+=FAP_COIN_CONFIG.checkInterval/1000;if(activeSecondsRef.current>=FAP_COIN_CONFIG.sessionSeconds){earnFapCoin();activeSecondsRef.current=0;}}},[FAP_COIN_CONFIG.checkInterval]);},[earnFapCoin]);
  const stopFapTimer=useCallback(()=>{if(fapIntervalRef.current){clearInterval(fapIntervalRef.current);fapIntervalRef.current=null;}activeSecondsRef.current=0;},[]);

  // ── GAME LOGIC ────────────────────────────────────────────────────────────────
  const proceedToGame=useCallback((game,isTrial=false)=>{setTrialPromptGame(null);setPlayingGame(game);if(playTimerRef.current)clearTimeout(playTimerRef.current);playTimerRef.current=setTimeout(async()=>{if(currentUser){try{const gc={...(currentUser.gamePlayCounts||{})};gc[game.id]=(Number(gc[game.id])||0)+1;const upd={playCount:(Number(currentUser.playCount)||0)+1,lastPlayedGameName:game.title,lastPlayed:serverTimestamp(),gamePlayCounts:gc};if(isTrial)upd.premiumTrialsUsed=(Number(currentUser.premiumTrialsUsed)||0)+1;await updateDoc(doc(db,"users",currentUser.id),upd).catch(handleFirebaseError);setCurrentUser(prev=>prev?({...prev,playCount:(Number(prev.playCount)||0)+1,lastPlayedGameName:game.title,gamePlayCounts:gc,premiumTrialsUsed:isTrial?(Number(prev.premiumTrialsUsed)||0)+1:prev.premiumTrialsUsed}):null);}catch(e){handleFirebaseError(e);}}},[60000]);if(currentUser&&isUserPremium(currentUser))startFapTimer();},[currentUser,handleFirebaseError,startFapTimer]);

  const openGame=useCallback(game=>{
    if(!game)return;
    if(!game.url){alert("Bu oyun henüz yayında değil.");return;}
    if(game.requiresPremium){
      // Premium kontrolü — geçici premium dahil
      if(isUserPremium(currentUser)){
        // Premium var (gerçek veya geçici) → direkt oyna
        proceedToGame(game,false);
        return;
      }
      if(!currentUser){setShowLoginModal(true);return;}
      const t=Number(currentUser?.premiumTrialsUsed||0);
      if(t>=3){setPremiumWarningGame(game);return;}
      setTrialPromptGame(game);return;
    }
    proceedToGame(game,false);
  },[currentUser,proceedToGame]);

  const closeGame=useCallback(()=>{setPlayingGame(null);if(playTimerRef.current)clearTimeout(playTimerRef.current);stopFapTimer();if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});},[stopFapTimer]);

  const getSecureGameUrl=useCallback(url=>{if(!url)return"";try{const u=new URL(url);u.searchParams.set("source","forgeandplay");return u.toString();}catch{return url;}},[]);

  // ── LIKE / COMMENT ─────────────────────────────────────────────────────────────
  const handleLike = async(gameId)=>{if(!currentUser){setShowLoginModal(true);return;}if(likedGames.has(gameId)){alert("Bu oyunu zaten beğendiniz.");return;}try{await setDoc(doc(db,"game_likes",gameId),{count:increment(1)},{merge:true});const newLiked=new Set([...likedGames,gameId]);setLikedGames(newLiked);await setDoc(doc(db,"user_likes",currentUser.id),{games:[...newLiked]},{merge:true});}catch(e){handleFirebaseError(e);}};

  const handleComment = async(gameId)=>{if(!currentUser){setShowLoginModal(true);return;}const t=commentText.trim();if(t.length<3){return;}if(containsProfanity(t)){alert("Uygunsuz ifade.");return;}if(!commentRateLimiter(currentUser.id)){alert("Çok hızlı yorum yapıyorsunuz.");return;}try{await addDoc(collection(db,"game_comments"),{gameId,userId:currentUser.id,userName:sanitizeText(currentUser.name||"Oyuncu"),text:sanitizeText(t),createdAt:serverTimestamp()});setCommentText("");}catch(e){handleFirebaseError(e);}};

  // ── AUTH ──────────────────────────────────────────────────────────────────────
  const handleLoginSubmit=async e=>{e.preventDefault();setAuthError("");const email=emailInput.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setAuthError("Geçerli e-posta girin.");return;}if(!passwordInput){setAuthError("Şifre boş olamaz.");return;}if(!loginRateLimiter(email)){setAuthError("Çok fazla deneme. 5 dk bekleyin.");return;}try{if(isRegistering){if(passwordInput.length<6){setAuthError("Şifre en az 6 karakter.");return;}await createUserWithEmailAndPassword(auth,email,passwordInput);}else await signInWithEmailAndPassword(auth,email,passwordInput);setShowLoginModal(false);setPasswordInput("");setEmailInput("");}catch(err){const m={'auth/email-already-in-use':"Bu e-posta kullanılıyor.",'auth/invalid-email':"Geçersiz e-posta.",'auth/user-not-found':"Bilgiler hatalı.",'auth/wrong-password':"Bilgiler hatalı.",'auth/invalid-credential':"Bilgiler hatalı.",'auth/too-many-requests':"Hesap kilitlendi."};setAuthError(m[err.code]||"Giriş başarısız.");}};

  const handleGoogleLogin=async()=>{setAuthError("");try{await signInWithPopup(auth,googleProvider);setShowLoginModal(false);}catch(e){setAuthError(e.code==='auth/popup-closed-by-user'?"Pencere kapatıldı.":"Google girişi başarısız.");}};
  const handlePasswordReset=async()=>{const email=emailInput.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setAuthError("Geçerli e-posta girin.");return;}try{await sendPasswordResetEmail(auth,email);setAuthError("Bağlantı gönderildi.");setShowResetPassword(false);}catch{setAuthError("E-posta gönderilemedi.");}};
  const handlePurchaseRequest = async plan => {
    if (!currentUser) { setPremiumWarningGame(null); setActiveTab("premium"); setShowLoginModal(true); return; }
    if (!PAYMENT_LINKS[plan]) { alert("Geçersiz plan."); return; }
    try {
      await updateDoc(doc(db,"users",currentUser.id),{ pendingRequest:plan, lastPurchaseAttempt:serverTimestamp() }).catch(handleFirebaseError);
      setPremiumWarningGame(null);
      setPaymentIntent({ url:PAYMENT_LINKS[plan], plan });
    } catch { alert("Talep oluşturulamadı."); }
  };

  /*
   * ═══════════════════════════════════════════════════════════════════════
   * AKILLI OTOMATİK PREMIUM SİSTEMİ
   * ───────────────────────────────────────────────────────────────────────
   * Tetikleyici: Kullanıcı "Shopier'a Git" butonuna bastığı AN
   *
   * ZAMAN DİLİMİ KURALLARI:
   *  GECE  (00:00–08:00) → 8 saat geçici premium
   *  GÜNDÜZ(08:00–24:00) → 30 dakika geçici premium
   *
   * KÖTÜYE KULLANIM KORUMASI:
   *  • Kullanıcı daha önce hiç ödemeden iptal aldıysa (abuseCount > 0)
   *    → yalnızca 30 dakika (zaman diliminden bağımsız)
   *  • Aynı plan için 2. kez deneme yapıyorsa → yalnızca 30 dakika
   *
   * GÜVENLİK:
   *  • awaitingAdminVerification = true  → admin panelinde görünür
   *  • tempPremiumExpiresAt kaydedilir   → admin iptal edebilir
   *  • 1 saat içinde onay yoksa premium iptal edilmez (gece 8 saat verildi)
   *    admin sabah kalkınca manuel iptal eder
   * ═══════════════════════════════════════════════════════════════════════
   */
  const handleGoToShopier = async (plan, shopierUrl) => {
    if (!currentUser) return;

    const now = new Date();
    const hour = now.getHours(); // TR saati (tarayıcı saati)
    const isNight = hour >= 0 && hour < 8; // 00:00 – 07:59

    // Kötüye kullanım sayısını kontrol et
    const abuseCount = Number(currentUser.abuseCount || 0);
    const lastPlanAttempt = currentUser.lastPlanAttempt;
    const isRepeatAttempt = lastPlanAttempt === plan && abuseCount > 0;

    // Süre belirle
    let tempMinutes;
    let reason;

    if (abuseCount >= 2) {
      // 2+ kez kötüye kullandı → sadece 30 dakika
      tempMinutes = 30;
      reason = "abuse_limited";
    } else if (isRepeatAttempt) {
      // Aynı planı daha önce denedi ve iptal edildi
      tempMinutes = 30;
      reason = "repeat_attempt";
    } else if (isNight) {
      // Gece 00:00 – 08:00 → 8 saat
      tempMinutes = 8 * 60; // 480 dakika
      reason = "night_window";
    } else {
      // Gündüz 08:00 – 24:00 → 30 dakika
      tempMinutes = 30;
      reason = "day_window";
    }

    const tempEnd = new Date(now.getTime() + tempMinutes * 60 * 1000);

    const tempLabel = tempMinutes >= 60
      ? `${Math.floor(tempMinutes/60)} saat`
      : `${tempMinutes} dakika`;

    try {
      await updateDoc(doc(db,"users",currentUser.id), {
        premiumEndDate: tempEnd.toISOString(),
        pendingRequest: plan,
        awaitingAdminVerification: true,
        tempPremiumExpiresAt: tempEnd.toISOString(),
        tempPremiumGrantedAt: now.toISOString(),
        tempPremiumReason: reason,
        tempPremiumMinutes: tempMinutes,
        lastPlanAttempt: plan,
      }).catch(handleFirebaseError);

      setCurrentUser(prev => prev ? {
        ...prev,
        premiumEndDate: tempEnd.toISOString(),
        pendingRequest: plan,
        awaitingAdminVerification: true,
      } : null);

      // Shopier sayfasını aç
      window.open(shopierUrl, "_blank", "noopener,noreferrer");
      setPaymentIntent(null);

      // 📧 Admin'e premium talebi bildirimi
      sendEmailNotification(
        `💳 Premium Talebi: ${currentUser.name} — ${plan}`,
        `Bir kullanıcı premium satın almaya yönlendi!\n\nİsim: ${currentUser.name}\nE-posta: ${currentUser.email}\nShopier Kodu: ${currentUser.paymentCode}\nPlan: ${plan}\nGeçici Süre: ${tempLabel}\nTarih: ${new Date().toLocaleString('tr-TR')}\nZaman: ${isNight?"🌙 Gece":"☀️ Gündüz"}\n\nAdmin paneli → Ödemeler sekmesinden takip edebilirsiniz.`,
        currentUser.email
      );

      // Kullanıcıya bilgi ver
      const msg = isNight
        ? `✅ ${tempLabel} Premium aktif!\n\nGece saatinde sipariş verdiğiniz için sabah 08:00'e kadar oynayabilirsiniz.\nAdmin sabah ödemenizi doğrulayacak.`
        : `✅ ${tempLabel} Premium aktif!\n\nÖdeme tamamlandıktan sonra admin en kısa sürede onaylayacak.\nOnay sonrası tam süreniz başlayacak.`;

      // 3 saniye sonra alert göster (Shopier sekmesi önce açılsın)
      setTimeout(() => alert(msg), 1500);

    } catch (err) {
      handleFirebaseError(err);
      // Hata olsa bile Shopier'a git
      window.open(shopierUrl, "_blank", "noopener,noreferrer");
      setPaymentIntent(null);
    }
  };

  // Admin: geçici premiumu iptal et + abuseCount artır
  const revokeAndPenalize = async (uid) => {
    const u = usersList.find(x => x.id === uid);
    if (!u) return;
    const newCount = Number(u.abuseCount || 0) + 1;
    await updateDoc(doc(db,"users",uid), {
      premiumEndDate: null,
      pendingRequest: null,
      awaitingAdminVerification: false,
      abuseCount: newCount,
    }).catch(handleFirebaseError);
    alert(`İptal edildi. Bu kullanıcının kötüye kullanım sayısı: ${newCount}`);
  };

  const handleFeedbackSubmit=async data=>{if(!currentUser)return;setIsSubmittingFeedback(true);try{await addDoc(collection(db,"feedbacks"),{text:sanitizeText(data.text),game:sanitizeText(data.game),userId:currentUser.id,user:sanitizeText(currentUser.name||currentUser.email),email:String(currentUser.email),status:"beklemede",createdAt:serverTimestamp(),date:new Date().toLocaleDateString('tr-TR')}).catch(handleFirebaseError);alert("Geri bildiriminiz gönderildi!");}catch{alert("Gönderilemedi.");}finally{setIsSubmittingFeedback(false);}};
  const handleRewardPurchase=async e=>{e.preventDefault();if(!currentUser||!selectedProduct)return;const balance=Number(currentUser.fapCoin||0);const cost=Number(selectedProduct.price||0);if(balance<cost){alert(`Yetersiz FAP Coin!\nBakiye: ${balance.toFixed(1)}\nGerekli: ${cost}`);return;}if(selectedProduct.type==="Fiziksel"&&!orderAddress.trim()){alert("Adres zorunludur.");return;}setIsOrdering(true);try{const newBal=balance-cost;await updateDoc(doc(db,"users",currentUser.id),{fapCoin:newBal}).catch(handleFirebaseError);await addDoc(collection(db,"orders"),{userId:currentUser.id,userEmail:String(currentUser.email),userName:sanitizeText(currentUser.name||"İsimsiz"),productId:selectedProduct.id,productName:sanitizeText(selectedProduct.name),productType:selectedProduct.type,fapCost:cost,addressDetails:sanitizeText(orderAddress||"Dijital"),status:"Onay Bekliyor",createdAt:serverTimestamp()}).catch(handleFirebaseError);setCurrentUser(prev=>prev?{...prev,fapCoin:newBal}:null);alert("Siparişiniz alındı!");setSelectedProduct(null);setOrderAddress("");}catch(err){handleFirebaseError(err);alert("Sipariş oluşturulamadı.");}finally{setIsOrdering(false);}};

  /*
   * ════════════════════════════════════════════════════════════════════════════
   * STORE_PRODUCTS CRUD — SADECE FIREBASE SDK
   * REST API, callFirestoreAPI, UI-only state manipulation YOK.
   *
   * NEDEN ÜRÜNLER GERİ GELİYORDU?
   * ─────────────────────────────
   * Önceki kodda clearAllProducts() içinde setStoreProducts([]) ile sadece
   * React state temizleniyordu. Firestore'dan hiç silinmiyordu.
   * onSnapshot dinleyicisi aktif olduğu için sayfa yenilenince veya
   * başka bir kullanıcı bağlandığında Firestore'daki gerçek veriyi
   * tekrar çekip UI'ı dolduruyor — bu yüzden ürünler "geri geliyordu".
   *
   * ÇÖZÜM: Tüm silme işlemlerini önce Firestore'a yaz,
   * UI güncellemesini onSnapshot'a bırak. Hiçbir yerde setStoreProducts([])
   * ya da UI-only state manipülasyonu yapılmıyor.
   *
   * GEREKLİ FIRESTORE RULES:
   *   match /store_products/{id} {
   *     allow read, write: if true;
   *   }
   * ════════════════════════════════════════════════════════════════════════════
   */

  // ─── ÜRÜN EKLE / GÜNCELLE ────────────────────────────────────────────────────
  const saveProduct = async e => {
    e.preventDefault();
    const cid = editingProductIdRef.current;

    if (!newProductData.name?.trim() || !newProductData.image?.trim() || !newProductData.desc?.trim()) {
      alert("Lütfen tüm alanları doldurun."); return;
    }
    const price = Number(newProductData.price);
    if (isNaN(price) || price <= 0 || price > 100000) {
      alert("Geçerli bir fiyat girin (1-100.000)."); return;
    }
    if (!newProductData.image.startsWith("http")) {
      alert("Görsel URL'i http:// ile başlamalıdır."); return;
    }

    const prod = {
      name: sanitizeText(newProductData.name).substring(0, 150),
      price,
      image: newProductData.image.trim(),
      desc: sanitizeText(newProductData.desc).substring(0, 500),
      type: ["Dijital","Fiziksel"].includes(newProductData.type) ? newProductData.type : "Dijital",
      isVisible: newProductData.isVisible !== false,
    };

    try {
      if (cid) {
        // Güncelleme: mevcut dokümanı setDoc ile üzerine yaz
        const existing = storeProducts.find(p => p.id === cid);
        await setDoc(doc(db, "store_products", cid), {
          ...prod,
          createdAt: existing?.createdAt ?? serverTimestamp(),
        });
        alert(`✓ "${prod.name}" güncellendi!`);
      } else {
        // Yeni ürün: addDoc ile Firestore'a yaz
        await addDoc(collection(db, "store_products"), {
          ...prod,
          createdAt: serverTimestamp(),
        });
        alert(`✓ "${prod.name}" eklendi!`);
      }
      // Formu temizle — UI onSnapshot üzerinden güncellenir
      setNewProductData({ name:"", price:"", image:"", desc:"", type:"Dijital", isVisible:true });
      setEditingProductId(null);
      editingProductIdRef.current = null;
    } catch (err) {
      console.error("saveProduct error:", err);
      alert(
        `❌ Kaydedilemedi!\nHata: ${err?.code || err?.message}\n\n` +
        `Firebase Console → Firestore → Rules:\n` +
        `match /store_products/{id} { allow read, write: if true; }`
      );
    }
  };

  // ─── DÜZENLEME BAŞLAT ────────────────────────────────────────────────────────
  const editProduct = prod => {
    if (!prod?.id) return;
    setEditingProductId(prod.id);
    editingProductIdRef.current = prod.id;
    setNewProductData({
      name: prod.name || "",
      price: String(prod.price || ""),
      image: prod.image || "",
      desc: prod.desc || "",
      type: prod.type || "Dijital",
      isVisible: prod.isVisible !== false,
    });
    document.getElementById("pfs")?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  // ─── DÜZENLEME İPTAL ─────────────────────────────────────────────────────────
  const cancelEdit = () => {
    setEditingProductId(null);
    editingProductIdRef.current = null;
    setNewProductData({ name:"", price:"", image:"", desc:"", type:"Dijital", isVisible:true });
  };

  // ─── GÖRÜNÜRLEŞTİR / GİZLE ──────────────────────────────────────────────────
  const toggleVis = async (id, vis) => {
    if (!id) return;
    try {
      // updateDoc: sadece isVisible alanını değiştir
      await updateDoc(doc(db, "store_products", id), { isVisible: !vis });
      // UI onSnapshot üzerinden güncellenir
    } catch (err) {
      console.error("toggleVis error:", err);
      alert("Görünürlük değiştirilemedi: " + (err?.code || err?.message));
    }
  };

  // ─── TEK ÜRÜN SİL ────────────────────────────────────────────────────────────
  const deleteProduct = async id => {
    // Temel validasyon
    if (!id) {
      alert("Ürün ID'si bulunamadı.");
      return;
    }

    if (!window.confirm("Bu ürünü kalıcı olarak silmek istiyor musunuz?")) return;

    try {
      // Firestore'dan gerçekten sil
      await deleteDoc(doc(db, "store_products", id));

      // Silme doğrulaması: doküman hâlâ var mı kontrol et
      const check = await getDoc(doc(db, "store_products", id));
      if (check.exists()) {
        // Silme başarısız olmuş (rules veya network sorunu)
        console.error("deleteProduct: doc still exists after delete!", id);
        alert(
          "❌ Ürün silinemedi — Firestore'da hâlâ mevcut.\n\n" +
          "Firebase Console → Firestore → Rules'u kontrol edin:\n" +
          "match /store_products/{id} { allow delete: if true; }"
        );
        return;
      }

      // Başarılı — UI onSnapshot tarafından otomatik güncellenir
      console.log("deleteProduct: successfully deleted", id);
    } catch (err) {
      console.error("deleteProduct error:", err.code, err.message);
      alert(
        `❌ Silinemedi!\nHata kodu: ${err?.code}\nMesaj: ${err?.message}\n\n` +
        `Firebase Console → Firestore → Rules:\n` +
        `match /store_products/{id} { allow read, write: if true; }`
      );
    }
  };

  // ─── TÜMÜNÜ SİL — writeBatch ile atomik toplu silme ─────────────────────────
  const clearAllProducts = async () => {
    if (!storeProducts.length) {
      alert("Mağaza zaten boş.");
      return;
    }
    if (!window.confirm(
      `⚠️ ${storeProducts.length} ürünün TAMAMI Firestore'dan kalıcı olarak silinecek!\nGeri alınamaz. Devam edilsin mi?`
    )) return;

    try {
      /*
       * writeBatch: tüm silme işlemlerini tek bir atomik işlemde Firestore'a gönderir.
       * Firestore batch limiti 500 doc — gerekirse parçalıyoruz.
       */
      const BATCH_LIMIT = 400;
      const allDocs = await getDocs(collection(db, "store_products"));

      if (allDocs.empty) {
        alert("Firestore'da zaten ürün yok.");
        return;
      }

      // 400'lük parçalara böl
      const chunks = [];
      let current = [];
      allDocs.docs.forEach(d => {
        current.push(d);
        if (current.length === BATCH_LIMIT) {
          chunks.push(current);
          current = [];
        }
      });
      if (current.length) chunks.push(current);

      // Her chunk için bir batch commit
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      // Doğrulama: Firestore'da ürün kalmamış olmalı
      const verify = await getDocs(collection(db, "store_products"));
      if (!verify.empty) {
        const remaining = verify.docs.map(d => d.id).join(", ");
        console.error("clearAllProducts: still has docs after batch delete:", remaining);
        alert(
          `⚠️ Bazı ürünler silinemedi (${verify.size} adet kaldı).\n` +
          `Firestore Rules'u kontrol edin.\nKalan ID'ler: ${remaining}`
        );
        return;
      }

      // Başarılı — UI onSnapshot tarafından otomatik boşaltılır
      console.log(`clearAllProducts: all ${allDocs.size} docs successfully deleted from Firestore`);
      alert(`✓ ${allDocs.size} ürün Firestore'dan kalıcı olarak silindi!`);

    } catch (err) {
      console.error("clearAllProducts error:", err.code, err.message);
      alert(
        `❌ Toplu silme başarısız!\nHata: ${err?.code} — ${err?.message}\n\n` +
        `Firebase Console → Firestore → Rules:\n` +
        `match /store_products/{id} { allow read, write: if true; }`
      );
    }
  };

  const toggleBot=async()=>{if(isBotRunning){if(botIntervalRef.current){clearInterval(botIntervalRef.current);botIntervalRef.current=null;}setIsBotRunning(false);alert("Bot durduruldu.");return;}if(!currentUser){alert("Giriş yapın.");return;}setIsBotRunning(true);botIntervalRef.current=setInterval(async()=>{try{const live=GAMES.filter(g=>g.status==="Yayında");const rg=live[Math.floor(Math.random()*live.length)];await updateDoc(doc(db,"users",currentUser.id),{playCount:increment(1),lastPlayedGameName:rg.title,lastLogin:serverTimestamp(),[`gamePlayCounts.${rg.id}`]:increment(1)}).catch(handleFirebaseError);setCurrentUser(prev=>prev?({...prev,playCount:(Number(prev.playCount)||0)+1}):null);await earnFapCoin();}catch(e){handleFirebaseError(e);}},30000);alert("Bot başlatıldı!");};

  // Admin helpers
  const approvePremium = async (uid, plan) => {
    const m = { '1A':1, '6A':6, '1Y':12 };
    const u = usersList.find(x => x.id === uid);
    if (!u) return;

    // Eğer self-activate ile geçici premium verildiyse → bugünden tam süreyi hesapla
    // (48 saatlik geçici süreyi iptal et, gerçek planı ver)
    const base = new Date(); // Her zaman bugünden başlat (adil)
    base.setMonth(base.getMonth() + (m[plan] || 1));

    await updateDoc(doc(db, "users", uid), {
      premiumEndDate: base.toISOString(),
      pendingRequest: null,
      awaitingAdminVerification: false,
      approvedAt: serverTimestamp(),
      approvedPlan: plan,
    }).catch(handleFirebaseError);
  };
  const revokePremium=async uid=>await updateDoc(doc(db,"users",uid),{premiumEndDate:null,pendingRequest:null}).catch(handleFirebaseError);
  const deleteUser=async user=>{if(user.role==="admin"||ADMIN_EMAILS.includes(String(user.email).toLowerCase().trim())){alert("Admin silinemez!");return;}if(!window.confirm(`"${user.name||user.email}" silinsin mi?`))return;try{await deleteDoc(doc(db,"users",user.id));alert("Silindi.");}catch(e){handleFirebaseError(e);alert("Silinemedi: "+(e?.code||e?.message));}};
  const approveFeedback=async(id,status)=>await updateDoc(doc(db,"feedbacks",id),{status}).catch(handleFirebaseError);
  const handleOrderStatus=async(orderId,status,userId,cost)=>{try{await updateDoc(doc(db,"orders",orderId),{status});if(status==="İptal/İade Edildi"){await updateDoc(doc(db,"users",userId),{fapCoin:increment(cost)});alert("İptal edildi, coinler iade edildi.");}else alert("Durum güncellendi.");}catch(e){handleFirebaseError(e);}};

  // PWA
  const handleInstallApp=async()=>{if(deferredPrompt){deferredPrompt.prompt();const{outcome}=await deferredPrompt.userChoice;if(outcome==='accepted')setDeferredPrompt(null);}else setShowInstallGuide(true);};
  const handleSharePlatform=async()=>{const d={title:'Forge&Play',text:'Harika parti oyunları için Forge&Play!',url:window.location.origin};if(navigator.share)try{await navigator.share(d);}catch{}else{try{await navigator.clipboard.writeText(d.url);alert("Bağlantı kopyalandı!");}catch{alert("Bağlantı: "+d.url);}}};
  const handleShareGame=async(game,e)=>{e?.stopPropagation();const d={title:game.title,text:`Forge&Play'de ${game.title} oynuyoruz!`,url:window.location.origin};if(navigator.share)try{await navigator.share(d);}catch{}else{try{await navigator.clipboard.writeText(d.url);}catch{}}};

  // ============================================================================
  // RENDER
  // ============================================================================

  // ── NAVBAR ─────────────────────────────────────────────────────────────────────
  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 lg:gap-8">
          <button className={`flex items-center gap-2.5 ${focusStyles} shrink-0`} onClick={()=>setActiveTab("home")}>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain"/>
            </div>
            <span className="text-xl font-black text-white hidden sm:block">Forge<span className="text-orange-500">&</span>Play</span>
          </button>
          <div className="hidden md:flex items-center gap-0.5">
            {[{id:"home",label:"Ana Sayfa"},{id:"store",label:"Oyunlar"},{id:"rewards",label:"Mağaza"},{id:"lab",label:"Lab"},{id:"feedback",label:"Fikirler"}].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${focusStyles} ${activeTab===tab.id?"bg-slate-800 text-white":"text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>{tab.label}</button>
            ))}
            <div className="pl-2 border-l border-slate-800 ml-1">
              <button onClick={()=>setActiveTab("premium")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${focusStyles} ${activeTab==="premium"?"bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 scale-105":"bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20"}`}>
                <Crown className="w-4 h-4"/> Premium
              </button>
            </div>
            {isAdmin&&<button onClick={()=>setActiveTab("admin")} className={`px-3 py-2 rounded-lg font-bold text-sm ml-1 border border-slate-700 ${focusStyles} ${activeTab==="admin"?"bg-slate-800 text-white":"text-slate-500 hover:text-white hover:bg-slate-800"}`}><Lock className="w-4 h-4 inline mr-1"/>Admin</button>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Güvenlik rozeti */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold">
            <Shield className="w-3 h-3"/> SSL Güvenli
          </div>
          {authLoading?<div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/>:currentUser?(
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {isUserPremium(currentUser)&&<div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-amber-500/20" onClick={()=>setActiveTab("rewards")}><Coins className="w-3.5 h-3.5 text-amber-500"/><span className="text-xs font-bold text-amber-400">{Number(currentUser.fapCoin||0).toFixed(1)}</span></div>}
              <div className="hidden sm:flex flex-col items-end cursor-pointer hover:opacity-80" onClick={()=>setActiveTab("profile")}>
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name||"Kullanıcı"}</span>
                {isAdmin?<span className="text-[10px] font-bold uppercase text-amber-400">Yönetici</span>
                :currentUser.pendingRequest?<span className="text-[10px] font-bold uppercase text-amber-500 animate-pulse">Onay Bekleniyor</span>
                :isUserPremium(currentUser)?<span className="text-[10px] font-bold uppercase text-emerald-400">Premium · {getRemainingDays(currentUser.premiumEndDate)} Gün</span>
                :<span className="text-[10px] uppercase text-slate-500">{getLevel(currentUser.playCount).icon} {getLevel(currentUser.playCount).name}</span>}
              </div>
              <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor(currentUser.name)} rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2 hover:ring-offset-slate-950 transition-all`} onClick={()=>setActiveTab("profile")}>
                {String(currentUser.name||"U").charAt(0).toUpperCase()}
              </div>
              <button onClick={async()=>{setActiveTab("home");setPlayingGame(null);stopFapTimer();if(playTimerRef.current)clearTimeout(playTimerRef.current);try{await signOut(auth);}catch{}}} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut className="w-4 h-4"/></button>
            </div>
          ):(
            <button onClick={()=>setShowLoginModal(true)} className={`flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all ${focusStyles}`}>
              <User className="w-4 h-4"/><span className="hidden sm:inline">Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // ── MOBILE NAV ──────────────────────────────────────────────────────────────────
  const renderMobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/80 z-50 pb-safe">
      <div className="flex justify-around items-center px-2 py-1.5">
        {[{id:"home",icon:Gamepad2,label:"Ana Sayfa"},{id:"store",icon:Play,label:"Oyunlar"},{id:"rewards",icon:Gift,label:"Mağaza"},{id:"premium",icon:Crown,label:"Premium"},{id:"profile",icon:User,label:"Profil"}].map(tab=>{
          const Icon=tab.icon;
          return <button key={tab.id} onClick={()=>{if(tab.id==="profile"&&!currentUser)setShowLoginModal(true);else setActiveTab(tab.id);}} className={`flex flex-col items-center py-1 px-2 rounded-lg ${activeTab===tab.id?(tab.id==="premium"?"text-amber-500":"text-orange-500"):"text-slate-500"}`}>
            <Icon className="w-5 h-5 mb-0.5"/><span className="text-[9px] font-bold">{tab.label}</span>
          </button>;
        })}
        {isAdmin&&<button onClick={()=>setActiveTab("admin")} className={`flex flex-col items-center py-1 px-2 ${activeTab==="admin"?"text-amber-400":"text-slate-500"}`}><Lock className="w-5 h-5 mb-0.5"/><span className="text-[9px] font-bold">Admin</span></button>}
      </div>
    </div>
  );

  // ── HOME PAGE ─────────────────────────────────────────────────────────────────────
  const renderHome = () => {
    const liveGames = GAMES.filter(g=>g.status==="Yayında");
    const popularGames = [...liveGames].sort((a,b)=>b.plays-a.plays).slice(0,3);
    const trendingGames = [...liveGames].sort((a,b)=>b.likes-a.likes).slice(0,3);
    return (
      <div className="space-y-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-800/50 min-h-[480px] flex items-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"/>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"/>
          </div>
          <div className="relative z-10 px-6 md:px-12 py-16 max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
                <span className="text-emerald-400 text-xs font-bold">{liveCounters.activeNow} kişi şu an oynuyor</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
                <Flame className="w-3 h-3 text-orange-400"/>
                <span className="text-orange-400 text-xs font-bold">Trend</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Hemen Oyna,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Anında Eğlen!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
              İndirme yok. Bekleme yok. Arkadaşlarını davet et, saniyeler içinde oynamaya başla. 
              <span className="text-orange-400 font-semibold"> {liveGames.length} oyun</span> seni bekliyor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={()=>setActiveTab("store")} className={`flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-lg rounded-2xl transition-all hover:scale-105 shadow-xl shadow-orange-500/25 ${focusStyles}`}>
                <Play className="w-5 h-5 fill-current"/> Oynamaya Başla
              </button>
              {!currentUser&&<button onClick={()=>setShowLoginModal(true)} className={`flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-2xl border border-slate-700 transition-all ${focusStyles}`}>
                <User className="w-5 h-5"/> Ücretsiz Kayıt Ol
              </button>}
            </div>
            {/* Güven rozeti */}
            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Shield className="w-3.5 h-3.5 text-emerald-400"/> Güvenli Bağlantı (SSL)</div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Users className="w-3.5 h-3.5 text-blue-400"/> {liveCounters.totalUsers.toLocaleString('tr-TR')}+ Üye</div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Star className="w-3.5 h-3.5 text-amber-400"/> 4.9/5 Değerlendirme</div>
            </div>
          </div>
        </section>

        {/* CANLI İSTATİSTİKLER */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {icon:Users,val:liveCounters.todayPlayers.toLocaleString('tr-TR'),label:"Bugün Oynayan",color:"text-blue-400",bg:"bg-blue-500/10"},
              {icon:Gamepad2,val:liveCounters.totalGamesPlayed.toLocaleString('tr-TR'),label:"Oynanan Oyun",color:"text-emerald-400",bg:"bg-emerald-500/10"},
              {icon:Flame,val:liveCounters.activeNow.toString(),label:"Şu An Aktif",color:"text-orange-400",bg:"bg-orange-500/10"},
              {icon:Award,val:liveCounters.totalUsers.toLocaleString('tr-TR')+"+",label:"Toplam Üye",color:"text-purple-400",bg:"bg-purple-500/10"},
            ].map((s,i)=>{const Icon=s.icon;return(
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-700 transition-colors">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}><Icon className={`w-6 h-6 ${s.color}`}/></div>
                <div><div className={`text-2xl font-black ${s.color}`}>{s.val}</div><div className="text-xs text-slate-500 font-medium">{s.label}</div></div>
              </div>
            );})}
          </div>
        </section>

        {/* EN POPÜLER OYUNLAR */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Flame className="w-6 h-6 text-orange-500"/> En Popüler</h2>
            <button onClick={()=>setActiveTab("store")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-orange-400 font-semibold transition-colors">Tümünü Gör <ArrowRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {popularGames.map((game,idx)=>{
              const locked=game.requiresPremium&&!isUserPremium(currentUser);
              return(
                <div key={game.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10" onClick={()=>{setSelectedGameDetail(game);setActiveModal('gameDetail');}}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                    <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-60`}/>
                    {idx===0&&<div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Flame className="w-2.5 h-2.5"/> #1 Trend</div>}
                    {locked&&<div className="absolute top-2 right-2 bg-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5"><Lock className="w-2.5 h-2.5"/> PREMIUM</div>}
                    <div className="absolute bottom-2 left-2"><LivePlayerCount base={game.basePlayers}/></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-white mb-1">{game.title}</h3>
                    <p className="text-xs text-slate-400 flex-grow line-clamp-2 mb-3">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-blue-400"/> {(gameLikes[game.id]||game.likes).toLocaleString('tr-TR')}</span>
                        <span className="flex items-center gap-1"><Play className="w-3 h-3 text-emerald-400"/> {game.plays.toLocaleString('tr-TR')}</span>
                      </div>
                      <button onClick={e=>{e.stopPropagation();openGame(game);}} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors">Oyna</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TREND OYUNLAR */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-purple-500"/> Çok Beğenilenler</h2>
            <button onClick={()=>setActiveTab("store")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-purple-400 font-semibold transition-colors">Tümünü Gör <ArrowRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {trendingGames.map(game=>(
              <div key={game.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex gap-4 hover:border-purple-500/40 transition-all cursor-pointer group" onClick={()=>openGame(game)}>
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden"><img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm mb-1 truncate">{game.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {game.tags.slice(0,2).map(t=><span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{t}</span>)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3 text-purple-400"/> {(gameLikes[game.id]||game.likes)}</span>
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3 text-blue-400"/> {(gameComments[game.id]||[]).length + 5}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SON KULLANICI AKTİVİTESİ */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-emerald-500"/> Aktif Topluluk</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Son yorumlar */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Son Yorumlar</h3>
                <div className="space-y-3">
                  {SEED_COMMENTS.slice(0,4).map((c,i)=>(
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${SEED_USERS[c.user].color} flex items-center justify-center text-xs font-black text-white shrink-0`}>{SEED_USERS[c.user].avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">{SEED_USERS[c.user].name}</span>
                          <span className="text-[10px] text-slate-500">{c.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Aktif oyuncular */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Trophy className="w-4 h-4"/> Lider Tablosu</h3>
                <div className="space-y-2">
                  {SEED_USERS.slice(0,6).sort((a,b)=>b.level-a.level).map((u,i)=>(
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <span className={`text-xs font-black w-5 text-center ${i===0?"text-amber-400":i===1?"text-slate-400":i===2?"text-amber-700":"text-slate-600"}`}>{i+1}</span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>{u.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.city}</div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${getLevel(u.level*5).bg} ${getLevel(u.level*5).color}`}>Lv.{u.level}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ÖNE ÇIKAN YORUMLAR */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><Star className="w-6 h-6 text-amber-500"/> Kullanıcı Yorumları</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SEED_COMMENTS.slice(4,10).map((c,i)=>(
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${SEED_USERS[c.user].color} flex items-center justify-center text-sm font-black text-white`}>{SEED_USERS[c.user].avatar}</div>
                  <div>
                    <div className="font-bold text-white text-sm">{SEED_USERS[c.user].name}</div>
                    <div className="flex items-center gap-0.5">{[...Array(c.stars)].map((_,j)=><Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400"/>)}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">"{c.text}"</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{GAMES.find(g=>g.id===c.game)?.title||c.game}</span>
                  <span className="text-[10px] text-slate-600">{c.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // ── OYUNLAR SAYFASI ──────────────────────────────────────────────────────────────
  const renderStore = () => (
    <div className="space-y-8">
      {/* Carousel */}
      <section className={`relative group cursor-pointer rounded-3xl ${focusStyles} overflow-hidden h-[420px] md:h-[480px] shadow-2xl`} tabIndex={0}
        onClick={()=>featuredGames.length&&openGame(featuredGames[currentSlide])}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();featuredGames.length&&openGame(featuredGames[currentSlide]);}}}>
        {featuredGames.map((game,idx)=>{
          const locked=game.requiresPremium&&!isUserPremium(currentUser);
          const trials=currentUser?Number(currentUser.premiumTrialsUsed||0):0;
          const hasTrials=trials<3;
          return(
            <div key={game.id} className={`absolute inset-0 transition-all duration-1000 ${currentSlide===idx?"opacity-100 z-10":"opacity-0 z-0 pointer-events-none"}`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} z-0`}/>
              {game.image&&<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden"><img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-35 mix-blend-overlay"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent"/><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent"/></div>}
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 md:p-10 h-full gap-4">
                <div className="lg:max-w-2xl space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">★ Öne Çıkan</span>
                    {game.requiresPremium&&<span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-600/90 text-white flex items-center gap-1"><Lock className="w-3 h-3"/> PREMIUM</span>}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl leading-tight">{game.title}</h1>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-xl line-clamp-2">{game.description}</p>
                  <div className="flex items-center gap-4">
                    <LivePlayerCount base={game.basePlayers}/>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-blue-400"/> {(gameLikes[game.id]||game.likes)} beğeni</span>
                  </div>
                  <div className="flex gap-3">
                    <button tabIndex={-1} onClick={e=>{e.stopPropagation();openGame(game);}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${locked&&!hasTrials?"bg-orange-600 hover:bg-orange-500 text-white":"bg-emerald-500 hover:bg-emerald-400 text-slate-950"}`}>
                      <Play className="w-4 h-4 fill-current"/> {locked?(hasTrials?`Dene (${3-trials} Hak)`:"Premium Ol"):"Hemen Oyna"}
                    </button>
                    <button onClick={e=>{e.stopPropagation();setSelectedGameDetail(game);setActiveModal('gameDetail');}} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all text-sm">
                      <Info className="w-4 h-4"/> Detaylar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featuredGames.map((_,i)=><button key={i} onClick={e=>{e.stopPropagation();setCurrentSlide(i);if(slideIntervalRef.current){clearInterval(slideIntervalRef.current);slideIntervalRef.current=setInterval(()=>setCurrentSlide(p=>(p+1)%featuredGames.length),5000);}}} className={`h-2 rounded-full transition-all ${currentSlide===i?"w-8 bg-orange-500":"w-2 bg-slate-500/50 hover:bg-slate-400"}`}/>)}
        </div>
      </section>

      {/* Oyun Listesi */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-orange-500"/> Tüm Oyunlar</h2>
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-2 gap-2"><Search className="w-3.5 h-3.5 text-slate-500"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Oyun ara..." className="bg-transparent outline-none text-sm text-white w-32 md:w-44"/></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map(game=>{
          const locked=game.requiresPremium&&!isUserPremium(currentUser);
          const trials=currentUser?Number(currentUser.premiumTrialsUsed||0):0;
          const hasTrials=trials<3;
          let btnText="İncele",btnCls="bg-slate-800 text-slate-300 hover:bg-slate-700";
          if(game.url){if(locked){btnText=hasTrials?`Dene (${3-trials})`:"Abone Ol";btnCls=hasTrials?"bg-emerald-600 hover:bg-emerald-500 text-white":"bg-orange-600 hover:bg-orange-500 text-white";}else{btnText="Oyna";btnCls="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold";}}
          const commentCount = (gameComments[game.id]||[]).length + 5;
          return(
            <div key={game.id} tabIndex={0} onClick={()=>openGame(game)} onKeyDown={e=>e.key==="Enter"&&openGame(game)} className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all group cursor-pointer flex flex-col hover:shadow-[0_0_25px_rgba(249,115,22,0.08)] ${focusStyles}`}>
              <div className={`h-36 bg-gradient-to-br ${game.gradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                {game.image&&<img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay group-hover:opacity-55 group-hover:scale-110 transition-all duration-500 pointer-events-none" loading="lazy"/>}
                <div className="flex justify-between items-start relative z-10">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${game.type==="live"?"bg-emerald-500/25 text-emerald-400 border border-emerald-500/30":"bg-amber-500/25 text-amber-400 border border-amber-500/30"}`}>{game.status}</span>
                  {game.requiresPremium&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600/90 text-white flex items-center gap-0.5"><Lock className="w-2.5 h-2.5"/> PREMIUM</span>}
                </div>
                <h3 className="text-xl font-bold text-white relative z-10">{game.title}</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-slate-400 text-xs line-clamp-2 mb-3 flex-1">{game.description}</p>
                <div className="flex items-center gap-3 mb-3">
                  <LivePlayerCount base={game.basePlayers}/>
                </div>
                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                  <button onClick={e=>{e.stopPropagation();handleLike(game.id);}} className={`flex items-center gap-1 hover:text-blue-400 transition-colors ${likedGames.has(game.id)?"text-blue-400":""}`}>
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedGames.has(game.id)?"fill-blue-400 text-blue-400":""}`}/> {(gameLikes[game.id]||game.likes)}
                  </button>
                  <button onClick={e=>{e.stopPropagation();setSelectedGameDetail(game);setActiveModal('gameDetail');}} className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5"/> {commentCount}
                  </button>
                  <button onClick={e=>handleShareGame(game,e)} className="flex items-center gap-1 hover:text-purple-400 transition-colors ml-auto"><Share2 className="w-3.5 h-3.5"/></button>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-sm font-semibold text-white">{game.price}</span>
                  <button tabIndex={-1} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${btnCls}`}>{btnText}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── OYUN DETAY MODALI ─────────────────────────────────────────────────────────────
  const renderGameDetailModal = () => {
    if (!selectedGameDetail || activeModal !== 'gameDetail') return null;
    const game = selectedGameDetail;
    const gameCommentsList = gameComments[game.id] || [];
    const allComments = [...gameCommentsList, ...SEED_COMMENTS.filter(c=>c.game===game.id).map((c,i)=>({id:'seed-'+i, userId:'seed', userName:SEED_USERS[c.user].name, text:c.text, createdAt:c.time, seed:true, avatar:SEED_USERS[c.user].avatar, color:SEED_USERS[c.user].color}))];
    const locked = game.requiresPremium && !isUserPremium(currentUser);
    const trials = currentUser ? Number(currentUser.premiumTrialsUsed||0) : 0;
    const hasTrials = trials < 3;
    return(
      <div className="fixed inset-0 z-[400] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={e=>{if(e.target===e.currentTarget){setActiveModal(null);setSelectedGameDetail(null);}}}>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
          {/* Üst görsel */}
          <div className="relative h-48 overflow-hidden">
            <img src={game.image} alt={game.title} className="w-full h-full object-cover"/>
            <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-70`}/>
            <button onClick={()=>{setActiveModal(null);setSelectedGameDetail(null);}} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><X className="w-5 h-5"/></button>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-black text-white">{game.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${game.type==="live"?"bg-emerald-500/30 text-emerald-400":"bg-amber-500/30 text-amber-400"}`}>{game.status}</span>
                {game.requiresPremium&&<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600/90 text-white flex items-center gap-1"><Lock className="w-2.5 h-2.5"/> PREMIUM</span>}
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-slate-300 text-sm leading-relaxed">{game.description}</p>
            {/* İstatistikler */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-slate-400"><ThumbsUp className="w-4 h-4 text-blue-400"/> {(gameLikes[game.id]||game.likes).toLocaleString('tr-TR')} beğeni</div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400"><Play className="w-4 h-4 text-emerald-400"/> {game.plays.toLocaleString('tr-TR')} oynandı</div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400"><MessageSquare className="w-4 h-4 text-purple-400"/> {allComments.length} yorum</div>
              <LivePlayerCount base={game.basePlayers}/>
            </div>
            {/* Etiketler */}
            <div className="flex gap-2 flex-wrap">{game.tags.map(t=><span key={t} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{t}</span>)}</div>
            {/* Aksiyon butonları */}
            <div className="flex gap-3">
              <button onClick={()=>{setActiveModal(null);setSelectedGameDetail(null);openGame(game);}} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 ${locked&&!hasTrials?"bg-orange-600 hover:bg-orange-500 text-white":"bg-emerald-500 hover:bg-emerald-400 text-slate-950"}`}>
                <Play className="w-5 h-5 fill-current"/> {locked?(hasTrials?`Ücretsiz Dene (${3-trials})`:"Premium Ol"):"Hemen Oyna"}
              </button>
              <button onClick={()=>handleLike(game.id)} className={`px-4 py-3 rounded-xl font-bold border transition-colors flex items-center gap-1.5 ${likedGames.has(game.id)?"bg-blue-500/20 text-blue-400 border-blue-500/30":"bg-slate-800 text-slate-400 border-slate-700 hover:text-blue-400"}`}>
                <ThumbsUp className={`w-4 h-4 ${likedGames.has(game.id)?"fill-blue-400":""}`}/> Beğen
              </button>
            </div>
            {/* Yorumlar */}
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-400"/> Yorumlar ({allComments.length})</h3>
              {currentUser&&(
                <div className="flex gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-xs font-black text-white shrink-0`}>{String(currentUser.name||"U").charAt(0).toUpperCase()}</div>
                  <div className="flex-1 flex gap-2">
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),handleComment(game.id))} placeholder="Yorum yazın..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"/>
                    <button onClick={()=>handleComment(game.id)} disabled={!commentText.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"><Send className="w-4 h-4"/></button>
                  </div>
                </div>
              )}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {allComments.map((c,i)=>(
                  <div key={c.id||i} className="flex gap-3">
                    {c.seed
                      ?<div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>{c.avatar}</div>
                      :<div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(c.userName)} flex items-center justify-center text-xs font-black text-white shrink-0`}>{String(c.userName||"U").charAt(0).toUpperCase()}</div>
                    }
                    <div className="flex-1 bg-slate-950/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{c.userName}</span>
                        <span className="text-[10px] text-slate-500">{c.seed?c.createdAt:(c.createdAt?new Date(c.createdAt).toLocaleDateString('tr-TR'):"")}</span>
                      </div>
                      <p className="text-sm text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── HAKKIMIZDA MODALI ─────────────────────────────────────────────────────────────
  const renderAboutModal = () => activeModal!=='about'?null:(
    <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-orange-500"/> Hakkımızda</h2>
          <button onClick={()=>setActiveModal(null)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl"><img src={LOGO_URL} alt="Forge&Play" className="w-12 h-12 object-contain"/></div>
            <div><h3 className="text-xl font-black text-white">Forge&Play</h3><p className="text-slate-400 text-sm">Türkiye'nin Dijital Oyun Platformu</p><div className="flex items-center gap-1 mt-1"><span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">2024'ten beri</span></div></div>
          </div>
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
            <h4 className="font-bold text-white mb-3">Kurucu Hikayesi</h4>
            <p className="text-slate-300 text-sm leading-relaxed">Forge&Play, 2024 yılında bir grup oyun tutkunu tarafından kuruldu. Arkadaşlarıyla oynamak isteyen ama uygun dijital platform bulamayan bir ekip, kendi çözümlerini oluşturmaya karar verdi.</p>
            <p className="text-slate-400 text-sm leading-relaxed mt-3">Türkiye'nin en sevilen parti oyunlarını — Tabu, İsim Şehir, Vampir Köylü — herkesin kolayca erişebileceği, indirme gerektirmeyen bir platforma taşıdık. Bugün binlerce oyuncu her gün burada buluşuyor.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{icon:Target,t:"Misyonumuz",d:"Oyun oynamayı herkese erişilebilir kılmak",c:"text-orange-400"},{icon:Layers,t:"Vizyonumuz",d:"Türkiye'nin 1 numaralı oyun platformu olmak",c:"text-blue-400"},{icon:HeartHandshake,t:"Değerlerimiz",d:"Topluluk, eğlence ve güven",c:"text-emerald-400"}].map((v,i)=>{const Icon=v.icon;return<div key={i} className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center"><Icon className={`w-6 h-6 ${v.c} mx-auto mb-2`}/><h5 className="text-xs font-bold text-white mb-1">{v.t}</h5><p className="text-[10px] text-slate-500">{v.d}</p></div>;}) }
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <p className="text-sm text-slate-300 text-center">Sorularınız için: <a href="mailto:forgeandplay@gmail.com" className="text-orange-400 hover:underline font-semibold">forgeandplay@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── İLETİŞİM MODALI ────────────────────────────────────────────────────────────────
  const renderContactModal = () => activeModal!=='contact'?null:(
    <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><Phone className="w-6 h-6 text-orange-500"/> İletişim</h2>
          <button onClick={()=>{setActiveModal(null);setContactSent(false);setContactForm({name:'',email:'',message:''}); }} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">
          {contactSent?(
            <div className="text-center py-10">
              <CheckSquare className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
              <h3 className="text-xl font-black text-white mb-2">Mesajınız İletildi!</h3>
              <p className="text-slate-400 text-sm">En kısa sürede size dönüş yapacağız.</p>
              <button onClick={()=>{setContactSent(false);setContactForm({name:'',email:'',message:''}); }} className="mt-5 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm">Yeni Mesaj Gönder</button>
            </div>
          ):(
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4"><Mail className="w-5 h-5 text-orange-400 shrink-0"/><div><div className="text-xs font-bold text-slate-500 uppercase">E-posta</div><a href="mailto:forgeandplay@gmail.com" className="text-sm text-white hover:text-orange-400">forgeandplay@gmail.com</a></div></div>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4"><Instagram className="w-5 h-5 text-pink-400 shrink-0"/><div><div className="text-xs font-bold text-slate-500 uppercase">Instagram</div><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-pink-400">@forgeandplayshop</a></div></div>
              </div>
              <form onSubmit={async e=>{e.preventDefault();if(!contactForm.name||!contactForm.email||!contactForm.message){alert("Tüm alanları doldurun.");return;}
                // Firestore'a kaydet
                if(db) await addDoc(collection(db,"contact_messages"),{name:sanitizeText(contactForm.name),email:String(contactForm.email),message:sanitizeText(contactForm.message),createdAt:serverTimestamp()}).catch(()=>{});
                // Email gönder
                await sendEmailNotification(
                  `📬 İletişim Formu: ${sanitizeText(contactForm.name)}`,
                  `Siteden yeni bir iletişim mesajı:\n\nİsim: ${sanitizeText(contactForm.name)}\nE-posta: ${contactForm.email}\nMesaj:\n${sanitizeText(contactForm.message)}\n\nTarih: ${new Date().toLocaleString('tr-TR')}`,
                  contactForm.email
                );
                setContactSent(true);}} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Adınız</label><input required value={contactForm.name} onChange={e=>setContactForm(p=>({...p,name:e.target.value}))} placeholder="Adınız Soyadınız" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"/></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">E-posta</label><input required type="email" value={contactForm.email} onChange={e=>setContactForm(p=>({...p,email:e.target.value}))} placeholder="ornek@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"/></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mesajınız</label><textarea required value={contactForm.message} onChange={e=>setContactForm(p=>({...p,message:e.target.value}))} placeholder="Size nasıl yardımcı olabiliriz?" rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"/></div>
                <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"><Send className="w-4 h-4"/> Gönder</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── GİZLİLİK POLİTİKASI ──────────────────────────────────────────────────────────
  const renderPrivacyModal = () => activeModal!=='privacy'?null:(
    <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400"/> Gizlilik Politikası</h2>
          <button onClick={()=>setActiveModal(null)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-slate-300 leading-relaxed">
          <p className="text-slate-400 text-xs">Son güncelleme: 1 Ocak 2026</p>
          {[{t:"Toplanan Veriler",d:"Forge&Play olarak yalnızca hizmet sunmak için gerekli verileri topluyoruz: e-posta adresi, kullanıcı adı ve oyun geçmişi. Ödeme bilgileriniz Forge&Play sunucularında saklanmaz; Shopier üzerinden güvenli şekilde işlenir."},
          {t:"Verilerin Kullanımı",d:"Toplanan veriler; hesap yönetimi, oyun deneyimini kişiselleştirme ve platform güvenliğini sağlamak amacıyla kullanılır. Verileriniz hiçbir koşulda üçüncü taraflarla satılmaz veya kiralanmaz."},
          {t:"Firebase & Güvenlik",d:"Kullanıcı verileri Google Firebase altyapısında şifrelenmiş şekilde saklanır. Tüm bağlantılar SSL/TLS ile güvence altındadır. Verilerinize yetkisiz erişimi engellemek için endüstri standardı güvenlik önlemleri uygulanmaktadır."},
          {t:"Çerezler",d:"Yalnızca oturum yönetimi ve tercihlerinizi hatırlamak için gerekli çerezler kullanılmaktadır. Analitik veya reklam amaçlı üçüncü taraf çerezleri kullanılmamaktadır."},
          {t:"Haklarınız",d:"Kişisel verilerinize erişme, düzeltme veya silme talebinde bulunabilirsiniz. Bu talepleriniz için forgeandplay@gmail.com adresine ulaşabilirsiniz."}].map((s,i)=>(<div key={i}><h4 className="font-bold text-white mb-2">{i+1}. {s.t}</h4><p>{s.d}</p></div>))}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2"/>
            <p className="text-emerald-300 text-xs font-semibold">Verileriniz güvende. SSL şifreli bağlantı ile korunuyorsunuz.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── KULLANIM KOŞULLARI ────────────────────────────────────────────────────────────
  const renderTermsModal = () => activeModal!=='terms'?null:(
    <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400"/> Kullanım Koşulları</h2>
          <button onClick={()=>setActiveModal(null)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-slate-300 leading-relaxed">
          <p className="text-slate-400 text-xs">Son güncelleme: 1 Ocak 2026</p>
          {[{t:"Hizmet Kullanımı",d:"Forge&Play hizmetlerini kullanarak bu koşulları kabul etmiş olursunuz. Platform yalnızca kişisel, ticari olmayan kullanım için sunulmaktadır. Hesabınızı yalnızca siz kullanabilirsiniz; başkasına devredemezsiniz."},
          {t:"Premium Abonelik",d:"Premium abonelikler Shopier üzerinden işlenir. Ödeme kodunuzu sipariş notuna eklediğinizde hesabınız aktivasyonu admin onayı ile gerçekleşir. Abonelik iptali talepleri forgeandplay@gmail.com adresine yapılabilir."},
          {t:"Yasaklı İçerik",d:"Platformda hakaret, tehdit, spam veya yasadışı içerik paylaşmak yasaktır. Bu tür ihlaller tespit edildiğinde hesap askıya alınabilir veya kalıcı olarak kapatılabilir."},
          {t:"Fikri Mülkiyet",d:"Platform içeriği, oyunlar ve tasarımlar Forge&Play'e aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır."},
          {t:"Sorumluluk Sınırlaması",d:"Forge&Play, platform kesintilerinden veya üçüncü taraf içeriklerden kaynaklanan zararlardan sorumlu tutulamaz. Hizmet 'olduğu gibi' sunulmaktadır."}].map((s,i)=>(<div key={i}><h4 className="font-bold text-white mb-2">{i+1}. {s.t}</h4><p>{s.d}</p></div>))}
        </div>
      </div>
    </div>
  );

  // ── LOGIN MODAL ────────────────────────────────────────────────────────────────────
  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto mx-auto">
        <button onClick={()=>{setShowLoginModal(false);setAuthError("");}} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"><X className="w-5 h-5"/></button>
        {/* Güven rozeti */}
        <div className="flex items-center justify-center gap-2 mb-5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mx-auto w-fit">
          <Shield className="w-4 h-4 text-emerald-400"/><span className="text-emerald-400 text-xs font-bold">Güvenli Giriş (SSL Şifreli)</span>
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30 p-2"><img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain"/></div>
          <h2 className="text-2xl font-black text-white">{isRegistering?"Aramıza Katıl":"Hoş Geldin!"}</h2>
          <p className="text-slate-400 text-sm mt-1">{isRegistering?"Ücretsiz hesap oluştur, oynamaya başla":"Hesabına giriş yap"}</p>
        </div>
        {authError&&<div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs text-center font-bold">{authError}</div>}
        <form onSubmit={handleLoginSubmit} className="space-y-3">
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label><input type="email" required value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="ornek@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm" autoComplete="email"/></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label><input type="password" required value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm" autoComplete={isRegistering?"new-password":"current-password"}/></div>
          {!isRegistering&&<div className="text-right"><button type="button" onClick={()=>setShowResetPassword(true)} className="text-xs text-orange-500 hover:text-orange-400">Şifremi Unuttum</button></div>}
          {showResetPassword&&<div className="p-3 bg-slate-800 rounded-xl text-center"><p className="text-sm text-slate-300 mb-2">E-postanıza şifre sıfırlama bağlantısı gönderilecek.</p><button type="button" onClick={handlePasswordReset} className="text-sm font-bold text-orange-500">Gönder</button></div>}
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors">{isRegistering?"Hesap Oluştur":"Giriş Yap"}</button>
        </form>
        <div className="flex items-center py-4"><div className="flex-grow border-t border-slate-800"/><span className="mx-3 text-slate-500 text-xs">veya</span><div className="flex-grow border-t border-slate-800"/></div>
        <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-colors mb-5">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google ile {isRegistering?"Kayıt Ol":"Giriş Yap"}
        </button>
        <p className="text-center text-sm text-slate-400">{isRegistering?"Hesabın var mı?":"Hesabın yok mu?"}{" "}<button onClick={()=>{setIsRegistering(!isRegistering);setAuthError("");}} className="text-orange-500 font-bold hover:text-orange-400" type="button">{isRegistering?"Giriş Yap":"Ücretsiz Kayıt Ol"}</button></p>
      </div>
    </div>
  );

  // ── PAYMENT MODAL ───────────────────────────────────────────────────────────────────
  const renderPaymentModal = () => {
    if (!paymentIntent || !currentUser) return null;
    const copy = async () => {
      try { await navigator.clipboard.writeText(currentUser.paymentCode); setIsCopied(true); setTimeout(()=>setIsCopied(false),2000); } catch {}
    };

    const plan = paymentIntent.plan;
    const planInfo = { "1A":"1 Aylık — 39₺", "6A":"6 Aylık — 179₺", "1Y":"1 Yıllık — 299₺" };

    // Kaç dakika/saat geçici premium verileceğini göster
    const hour = new Date().getHours();
    const isNight = hour >= 0 && hour < 8;
    const abuseCount = Number(currentUser.abuseCount || 0);
    const isAbuser = abuseCount >= 2;
    const tempLabel = isAbuser ? "30 dakika" : isNight ? "8 saat" : "30 dakika";
    const tempColor = isNight && !isAbuser ? "text-emerald-400" : "text-amber-400";
    const tempBg   = isNight && !isAbuser ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20";

    return (
      <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative my-auto">
          <button onClick={()=>setPaymentIntent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>

          <div className="p-6 md:p-8">
            {/* Başlık */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-500/20">
                <Wallet className="w-7 h-7 text-orange-500"/>
              </div>
              <h2 className="text-xl font-black text-white">Premium Satın Al</h2>
              <p className="text-slate-400 text-sm mt-1">{planInfo[plan]}</p>
            </div>

            {/* Geçici premium bilgisi */}
            <div className={`${tempBg} border rounded-2xl p-4 mb-5 text-center`}>
              <div className={`text-lg font-black ${tempColor} mb-0.5`}>
                {isNight && !isAbuser ? "🌙 Gece Avantajı!" : "⚡ Anında Aktif!"}
              </div>
              <p className="text-slate-300 text-sm">
                Shopier'a gittiğiniz anda{" "}
                <span className={`font-black ${tempColor}`}>{tempLabel} geçici Premium</span> başlıyor.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {isNight && !isAbuser
                  ? "Gece siparişi — sabah admin onaylayacak, tam süre başlayacak."
                  : "Admin en kısa sürede onaylayacak, tam süreniz aktif olacak."}
              </p>
            </div>

            {/* Ödeme kodu */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">1</span>
                Ödeme Kodunu Kopyala
              </div>
              <div className="bg-slate-950 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Shopier Sipariş Notu'na Yapıştır</div>
                  <span className="text-2xl font-mono font-black text-orange-400 tracking-widest">{currentUser.paymentCode}</span>
                </div>
                <button onClick={copy} className={`p-2.5 rounded-lg border transition-all ${isCopied?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 scale-110":"bg-slate-800 text-slate-300 hover:text-white border-slate-700"}`}>
                  {isCopied ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {/* Ana buton */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">2</span>
                Ödemeyi Tamamla
              </div>
              <button
                onClick={() => handleGoToShopier(plan, paymentIntent.url)}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20 text-lg"
              >
                <ExternalLink className="w-5 h-5"/>
                Shopier'a Git &amp; {tempLabel} Premium Al
              </button>
            </div>

            {/* Güven notu */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1">
              <p className="text-[11px] text-slate-500">
                🔒 SSL güvenli ödeme · Shopier altyapısı · Kart bilgileriniz Forge&Play'de saklanmaz
              </p>
              {isAbuser && (
                <p className="text-[11px] text-amber-500">
                  ⚠️ Hesabınızda geçmiş ödeme sorunları var, geçici süre kısaltılmıştır.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrialModal = () => {
    if(!trialPromptGame||!currentUser)return null;
    const rem=3-Number(currentUser.premiumTrialsUsed||0);
    return(
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
    if(!premiumWarningGame)return null;
    return(
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
    if(!playingGame)return null;
    return(
      <div className="fixed inset-0 z-[500] bg-black flex flex-col" style={{height:"100dvh"}}>
        <div className="flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950 border-b border-slate-800 z-20">
          <div className="flex items-center gap-2 truncate">
            <img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain bg-slate-900 p-0.5 rounded border border-slate-800"/>
            <span className="hidden sm:inline text-white font-black text-sm">Forge<span className="text-orange-500">&</span>Play</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-orange-400 font-bold text-xs bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 truncate max-w-[160px]">{playingGame.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={()=>{const d=document.documentElement;if(!document.fullscreenElement)d.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});}} className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800 hidden sm:block"><Maximize className="w-4 h-4"/></button>
            <button onClick={closeGame} className={`flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 py-2 rounded-lg text-xs font-bold transition-all ${focusStyles}`}><X className="w-4 h-4"/><span className="hidden sm:inline">Çık</span></button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-950">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0"><div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3"/><span className="text-orange-500 text-sm font-bold animate-pulse">Yükleniyor...</span></div>
          <iframe src={getSecureGameUrl(playingGame.url)} className="absolute inset-0 w-full h-full border-none z-10" title={playingGame.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads" loading="lazy"/>
        </div>
      </div>
    );
  };

  // ── ÖDÜL MAĞAZASI ──────────────────────────────────────────────────────────────────
  const renderRewardsStore = () => {
    const renderPurchaseModal = () => {
      if(!selectedProduct)return null;
      const isPhysical=selectedProduct.type==="Fiziksel";
      return(
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative my-auto">
            <button onClick={()=>setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
            <div className="mb-5 text-center"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-36 object-cover rounded-xl mb-4 border border-slate-800"/><h3 className="text-lg font-bold text-white mb-1">{selectedProduct.name}</h3><p className="text-amber-400 font-bold flex items-center justify-center gap-1"><Coins className="w-4 h-4"/> {Number(selectedProduct.price)} FAP Coin</p></div>
            <form onSubmit={handleRewardPurchase} className="space-y-4">
              {isPhysical?(<div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Teslimat Adresi *</label><textarea required value={orderAddress} onChange={e=>setOrderAddress(e.target.value)} placeholder="Ürünün gönderileceği tam adres..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 min-h-[90px] resize-none text-sm" maxLength={500}/></div>):(<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center"><p className="text-emerald-400 text-sm">Dijital ürün — onaydan sonra <b>{currentUser?.email}</b> adresine gönderilir.</p></div>)}
              <button type="submit" disabled={isOrdering} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">{isOrdering?<><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"/>İşleniyor...</>:"Siparişi Tamamla"}</button>
            </form>
          </div>
        </div>
      );
    };
    const visibleProducts=storeProducts.filter(p=>p.isVisible!==false);
    const isPremium=isUserPremium(currentUser);
    const today=new Date().toLocaleDateString('tr-TR');
    const dailyEarned=currentUser?.lastFapDate===today?Number(currentUser?.dailyFap||0):0;
    const dailyPct=Math.min(100,(dailyEarned/FAP_COIN_CONFIG.dailyMax)*100);
    return(
      <div className="space-y-8">
        {renderPurchaseModal()}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/20">
          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30"><Gift className="w-6 h-6 text-amber-400"/></div><div><h1 className="text-2xl md:text-3xl font-black text-white">FAP Ödül Mağazası</h1><p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Oyna · Kazan · Harca</p></div></div>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">Premium üyeler her <b className="text-amber-400">10 dakika aktif oyun</b> başına <b className="text-amber-400">0.5 FAP Coin</b> kazanır. Günde maks <b className="text-amber-300">16 FAP</b>. Biriktir, gerçek ödüllere dönüştür!</p>
              {!currentUser?(<button onClick={()=>setShowLoginModal(true)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm">Giriş Yap, Kazan</button>)
              :!isPremium?(<button onClick={()=>setActiveTab("premium")} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-sm"><Crown className="w-4 h-4"/> Premium Ol, FAP Kazan</button>)
              :(<div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl px-5 py-3"><div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Bakiye</div><div className="text-2xl font-black text-amber-400 flex items-center gap-1.5"><Coins className="w-5 h-5"/>{Number(currentUser.fapCoin||0).toFixed(1)}</div></div>
                  <div className="flex-1 max-w-[200px]"><div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Bugün</span><span className="text-amber-400 font-bold">{dailyEarned.toFixed(1)}/{FAP_COIN_CONFIG.dailyMax}</span></div><div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full transition-all duration-700" style={{width:`${dailyPct}%`,background:dailyPct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/></div><p className="text-[10px] text-slate-500 mt-1">{dailyPct>=100?"Günlük limit doldu ✓":`${(FAP_COIN_CONFIG.dailyMax-dailyEarned).toFixed(1)} FAP daha`}</p></div>
                </div>)}
            </div>
            <div className="hidden md:flex w-36 h-36 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full items-center justify-center border border-amber-500/20 shrink-0"><ShoppingBag className="w-18 h-18 text-amber-500/60 w-20 h-20"/></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{icon:Play,label:"Oyun Aç",desc:"Premium oyun seç"},{icon:Clock,label:"10 Dk Oyna",desc:"Aktif sekmede kal"},{icon:Coins,label:"+0.5 FAP",desc:"Oturumda kazan"},{icon:Gift,label:"Ödül Al",desc:"Mağazadan harca"}].map((s,i)=>{const Icon=s.icon;return<div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-colors"><div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-amber-500/20"><Icon className="w-5 h-5 text-amber-400"/></div><div className="text-sm font-bold text-white">{s.label}</div><div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div></div>;})}</div>
        <div>
          <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-amber-500"/> Ödüller <span className="text-slate-500 text-base font-normal">({visibleProducts.length})</span></h2></div>
          {storeLoading?(<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>)
          :visibleProducts.length===0?(<div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-16 text-center"><ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4"/><h3 className="text-xl font-bold text-slate-400 mb-2">Mağaza Yakında Açılıyor</h3><p className="text-slate-500 text-sm">FAP Coin biriktirmeye şimdiden başlayın!</p></div>)
          :(<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{visibleProducts.map(p=>{const canAfford=currentUser&&isUserPremium(currentUser)&&Number(currentUser.fapCoin||0)>=p.price;const needsPremium=currentUser&&!isUserPremium(currentUser);return(<div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all group flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"><div className="relative h-44 overflow-hidden bg-slate-950"><img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" loading="lazy"/><div className="absolute top-2.5 left-2.5"><span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border ${p.type==="Fiziksel"?"bg-emerald-500/20 text-emerald-300 border-emerald-500/30":"bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>{p.type==="Fiziksel"?<Truck className="w-2.5 h-2.5"/>:<CreditCard className="w-2.5 h-2.5"/>}{p.type}</span></div></div><div className="p-4 flex flex-col flex-1"><h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{p.name}</h3><p className="text-[11px] text-slate-400 flex-grow line-clamp-3 mb-3">{p.desc}</p><div className="flex items-center justify-between"><span className="flex items-center gap-1 text-amber-400 font-black text-lg"><Coins className="w-4 h-4"/>{Number(p.price)}</span><button onClick={()=>{if(!currentUser){setShowLoginModal(true);return;}if(needsPremium){setActiveTab("premium");return;}if(!canAfford)return;setSelectedProduct(p);}} disabled={currentUser&&isUserPremium(currentUser)&&!canAfford} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${!currentUser?"bg-slate-800 text-white hover:bg-slate-700":needsPremium?"bg-amber-500/10 text-amber-400 border border-amber-500/20":canAfford?"bg-amber-500 text-slate-950 hover:bg-amber-400":"bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"}`}>{!currentUser?"Giriş":needsPremium?"Premium":canAfford?"Al":"Yetersiz"}</button></div></div></div>);})}</div>)}
        </div>
      </div>
    );
  };

  // ── KÜTÜPHANESİ ──────────────────────────────────────────────────────────────────
  const renderLibrary = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 shrink-0 space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1 mb-4"><Library className="w-5 h-5 text-orange-500"/> Kütüphanem</h2>
        {GAMES.filter(g=>g.status==="Yayında").map(game=>(
          <button key={game.id} onClick={()=>setSelectedLibraryGame(game)} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedLibraryGame?.id===game.id?"bg-orange-600/20 border border-orange-500/50 text-white":"bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${game.gradient}`}><GameIcon iconKey={game.iconKey} className="w-4 h-4 text-white"/></div>
            <span className="font-semibold text-sm truncate">{game.title}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[400px]">
        {selectedLibraryGame?(<>
          <div className={`absolute top-0 left-0 w-full h-52 bg-gradient-to-br ${selectedLibraryGame.gradient} opacity-15`}/>
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-3xl font-black text-white mb-2">{selectedLibraryGame.title}</h2><p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-3">{selectedLibraryGame.description}</p><LivePlayerCount base={selectedLibraryGame.basePlayers}/></div>
              <div className={`hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0 bg-gradient-to-br ${selectedLibraryGame.gradient} shadow-xl`}><GameIcon iconKey={selectedLibraryGame.iconKey} className="w-8 h-8 text-white"/></div>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-800 flex items-center gap-3">
              {(()=>{const locked=selectedLibraryGame.requiresPremium&&!isUserPremium(currentUser);const t=currentUser?Number(currentUser.premiumTrialsUsed||0):0;const txt=locked?(t<3?`Ücretsiz Dene (${3-t})`:"Premium Abone Ol"):"Hemen Oyna";return<button onClick={()=>openGame(selectedLibraryGame)} className="flex items-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl"><Play className="w-5 h-5"/>{txt}</button>;})()}
              <button onClick={e=>handleShareGame(selectedLibraryGame,e)} className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700"><Share2 className="w-5 h-5"/></button>
            </div>
          </div>
        </>):<div className="flex flex-col items-center justify-center text-slate-500 h-full flex-1"><Library className="w-12 h-12 mb-4 opacity-30"/><p>Sol taraftan bir oyun seçin</p></div>}
      </div>
    </div>
  );

  // ── PREMIUM ────────────────────────────────────────────────────────────────────────
  const renderPremiumPage = () => (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/25 text-center p-8 md:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_60%)] pointer-events-none"/>
        <Crown className="w-14 h-14 md:w-20 md:h-20 text-amber-500 mx-auto mb-6 relative z-10"/>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5 relative z-10">Oyun Deneyimini <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Zirveye Taşı</span></h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto relative z-10">Tüm Premium oyunlara sınırsız erişim. FAP Coin kazan, gerçek ödüllere dönüştür.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[{icon:Lock,t:"Sınırsız Erişim",d:"Tüm oyunlar açık",c:"text-emerald-400",bg:"bg-emerald-500/10"},{icon:Crown,t:"Özel Rozet",d:"Premium statüsü",c:"text-amber-400",bg:"bg-amber-500/10"},{icon:Coins,t:"FAP Coin",d:"Oyna, kazan, harca",c:"text-yellow-400",bg:"bg-yellow-500/10"},{icon:Zap,t:"Erken Erişim",d:"Yeni oyunları ilk dene",c:"text-blue-400",bg:"bg-blue-500/10"}].map((f,i)=>{const Icon=f.icon;return<div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-colors"><div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${f.bg}`}><Icon className={`w-6 h-6 ${f.c}`}/></div><h3 className="font-bold text-white text-sm mb-1">{f.t}</h3><p className="text-[11px] text-slate-400">{f.d}</p></div>;})}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-10">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Nasıl Premium Olurum?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[{n:"1",t:"Plan Seç",d:"Uygun süreyi seçin."},{n:"2",t:"Kodu Kopyala",d:"Güvenlik kodunu kopyalayın."},{n:"3",t:"Nota Ekle",d:"Shopier'da sipariş notuna yapıştırın."}].map((s,i)=><div key={i} className="flex flex-col items-center text-center"><div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-2xl font-black text-amber-500 mb-3">{s.n}</div><h3 className="font-bold text-white mb-1">{s.t}</h3><p className="text-sm text-slate-400">{s.d}</p></div>)}
        </div>
        <div className="mt-8 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-center"><p className="text-amber-400 text-sm font-medium flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>Ödemeniz otomatik eşleştirilir, anında onaylanır.</p></div>
      </div>
      <div>
        <h2 className="text-3xl font-black text-white text-center mb-3">Planını Seç</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">İstediğin zaman iptal edebilirsin.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {[{plan:"1A",title:"Aylık Bilet",price:"39₺",sub:"/ ay",badge:null,highlight:false,btnText:"Seç ve Başla",btnCls:"bg-slate-800 hover:bg-slate-700 text-white"},
          {plan:"6A",title:"Sezonluk Kart",price:"179₺",sub:"",badge:"EN POPÜLER",oldPrice:"234₺",indirim:"%23 İndirim",highlight:true,btnText:"6 Ay Satın Al",btnCls:"bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black"},
          {plan:"1Y",title:"1 Yıllık Efsane",price:"299₺",sub:"",badge:"%36 İNDİRİM",oldPrice:"468₺",indirim:"Aylık 24.9₺",highlight:false,btnText:"Kalıcı Destekçi",btnCls:"bg-slate-800 hover:bg-slate-700 text-white border border-amber-500/30 hover:border-amber-500"}].map(p=>(
            <div key={p.plan} className={`rounded-3xl p-6 md:p-8 flex flex-col relative ${p.highlight?"bg-gradient-to-b from-amber-950/50 to-slate-950 border-2 border-amber-500 shadow-2xl shadow-amber-500/15 lg:-translate-y-3":"bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"}`}>
              {p.badge&&<div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.highlight?"bg-amber-500 text-slate-950":"bg-slate-700 text-slate-300"}`}>{p.badge}</div>}
              <h3 className="text-xl font-bold text-white mb-1">{p.title}</h3>
              <div className="flex items-baseline gap-2 mb-2 mt-4"><span className="text-4xl font-black text-white">{p.price}</span>{p.sub&&<span className="text-slate-500 text-sm">{p.sub}</span>}{p.oldPrice&&<span className="text-slate-500 text-sm line-through">{p.oldPrice}</span>}</div>
              {p.indirim&&<p className="text-amber-400 text-sm font-bold mb-5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/>{p.indirim}</p>}
              {!p.indirim&&<div className="mb-5"/>}
              <ul className="space-y-3 mb-8 flex-1"><li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight?"text-amber-400":"text-emerald-500"}`}/>Tüm Premium oyunlara erişim</li>{p.highlight&&<><li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>Özel rozet ve liderlik tablosu</li><li className="flex gap-2.5 text-sm text-slate-300 items-start"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>FAP Coin kazanım hakkı</li></>}</ul>
              <button onClick={()=>handlePurchaseRequest(p.plan)} className={`w-full py-3.5 rounded-xl font-bold transition-all ${p.btnCls}`}>{p.btnText}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── LAB ────────────────────────────────────────────────────────────────────────────
  const renderLab = () => (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-orange-500/20 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.06),_transparent_60%)] pointer-events-none"/>
        <FlaskConical className="w-14 h-14 text-orange-500 mx-auto mb-5 relative z-10"/>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 relative z-10">Geliştirme <span className="text-orange-500">Laboratuvarı</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed relative z-10">Forge&Play'in geleceği burada şekilleniyor. Aktif geliştirilen projeleri takip edin.</p>
        <div className="flex items-center justify-center gap-6 mt-6 relative z-10">
          <div className="text-center"><div className="text-2xl font-black text-orange-400">{LAB_PROJECTS.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Aktif Proje</div></div>
          <div className="w-px h-8 bg-slate-800"/>
          <div className="text-center"><div className="text-2xl font-black text-emerald-400">{LAB_PROJECTS.filter(p=>p.status.includes("Beta")||p.status.includes("Yakında")).length}</div><div className="text-xs text-slate-500 uppercase font-bold">Beta Yakında</div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {LAB_PROJECTS.map(proj=>(
          <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col">
            <div className="relative h-40 overflow-hidden"><img src={proj.image} alt={proj.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"/><div className={`absolute inset-0 bg-gradient-to-br ${proj.gradient} opacity-60`}/><div className="absolute top-3 left-3 flex gap-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 backdrop-blur-sm border border-slate-700/50">{proj.tag}</span></div><div className="absolute top-3 right-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border ${proj.status.includes("Beta")||proj.status.includes("Yakında")?"bg-emerald-500/20 text-emerald-400 border-emerald-500/30":proj.status.includes("Erken")?"bg-slate-800/80 text-slate-400 border-slate-700":"bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>{proj.status}</span></div><div className="absolute bottom-3 left-3"><div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"><GameIcon iconKey={proj.iconKey} className="w-5 h-5"/></div></div></div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-black text-white text-base mb-2 leading-tight">{proj.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed flex-1 mb-5 line-clamp-3">{proj.description}</p>
              <div><div className="flex justify-between items-center mb-1.5"><span className="text-[10px] text-slate-500 uppercase font-bold">İlerleme</span><span className={`text-xs font-black ${proj.accentColor}`}>%{proj.progress}</span></div><div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full transition-all duration-1000" style={{width:`${proj.progress}%`,background:proj.progress>=75?'linear-gradient(90deg,#10b981,#34d399)':proj.progress>=50?'linear-gradient(90deg,#f59e0b,#f97316)':'linear-gradient(90deg,#6366f1,#8b5cf6)'}}/></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── FİKİR KUTUSU ───────────────────────────────────────────────────────────────────
  const renderFeedback = () => {
    if(!currentUser)return(<div className="flex flex-col items-center justify-center py-20 text-center"><MessageSquarePlus className="w-16 h-16 text-slate-700 mb-4"/><h2 className="text-2xl font-bold text-white mb-2">Fikir Kutusu</h2><p className="text-slate-400 mb-6 max-w-xs">Fikir paylaşmak için giriş yapın.</p><button onClick={()=>setShowLoginModal(true)} className="px-7 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl">Giriş Yap</button></div>);
    const mine=feedbacks.filter(f=>f.userId===currentUser.id);
    return(
      <div className="space-y-7 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-900/25 to-slate-900 border border-orange-500/25 rounded-3xl p-7 text-center">
          <Lightbulb className="w-14 h-14 text-orange-500 mx-auto mb-4"/><h1 className="text-3xl font-black text-white mb-2">Fikir Kutusu</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Oyunlarımız hakkında düşüncelerinizi paylaşın.</p>
          <div className="flex items-center justify-center gap-4 mt-4"><span className="text-xs text-slate-500 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">{feedbacks.length} toplam fikir</span><span className="text-xs text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">{mine.length} fikirleriniz</span></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-orange-500"/> Fikir Gönder</h3><FeedbackForm currentUser={currentUser} onSubmit={handleFeedbackSubmit}/></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500"/> Gönderilen Fikirler</h3>
            {mine.length===0?<div className="text-center py-10 text-slate-600"><Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-40"/><p className="text-sm">Henüz fikir göndermediniz.</p></div>
            :<div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">{mine.map((fb,i)=><div key={fb.id||i} className="bg-slate-950 border border-slate-800 rounded-xl p-4"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{fb.game}</span><span className="text-[10px] text-slate-600">{fb.createdAt?new Date(fb.createdAt).toLocaleDateString('tr-TR'):fb.date}</span></div><p className="text-sm text-slate-300 mb-2 line-clamp-3">{fb.text}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${fb.status==="onaylandi"?"bg-emerald-500/10 text-emerald-400":fb.status==="reddedildi"?"bg-red-500/10 text-red-400":"bg-amber-500/10 text-amber-400"}`}>{fb.status==="onaylandi"?"✓ Onaylandı":fb.status==="reddedildi"?"✗ Reddedildi":"Beklemede"}</span></div>)}</div>}
          </div>
        </div>
      </div>
    );
  };

  // ── PROFİL ────────────────────────────────────────────────────────────────────────
  const renderProfile = () => {
    if(!currentUser)return null;
    const prem=isUserPremium(currentUser);
    const rem=getRemainingDays(currentUser.premiumEndDate);
    const mine=feedbacks.filter(f=>f.userId===currentUser.id);
    const today=new Date().toLocaleDateString('tr-TR');
    const dailyEarned=currentUser.lastFapDate===today?Number(currentUser.dailyFap||0):0;
    const dailyPct=Math.min(100,(dailyEarned/FAP_COIN_CONFIG.dailyMax)*100);
    const lv=getLevel(currentUser.playCount);
    const lvPct=getNextLevelProgress(currentUser.playCount);
    const badges=[];
    if(isAdmin)badges.push({id:'admin',t:'Platform Yöneticisi',d:'Sistemin koruyucusu.',I:ShieldAlert,c:'text-amber-400',bg:'bg-amber-500/10',b:'border-amber-500/30'});
    if(prem)badges.push({id:'prem',t:'Premium Üye',d:'Ayrıcalıklı destekçi.',I:Crown,c:'text-emerald-400',bg:'bg-emerald-500/10',b:'border-emerald-500/30'});
    if((currentUser.playCount||0)>=50)badges.push({id:'gp',t:'Efsanevi Oyuncu',d:'50+ oyun oynadı.',I:Zap,c:'text-purple-400',bg:'bg-purple-500/10',b:'border-purple-500/30'});
    else if((currentUser.playCount||0)>=10)badges.push({id:'gm',t:'Sıkı Oyuncu',d:'10+ oyun oynadı.',I:Gamepad2,c:'text-blue-400',bg:'bg-blue-500/10',b:'border-blue-500/30'});
    if(mine.filter(f=>f.status==="onaylandi").length>0)badges.push({id:'idea',t:'Fikir Öncüsü',d:'Onaylanan fikir kattı.',I:Star,c:'text-orange-400',bg:'bg-orange-500/10',b:'border-orange-500/30'});
    if(!badges.length)badges.push({id:'new',t:'Yeni Maceracı',d:'Platforma yeni katıldı.',I:User,c:'text-slate-400',bg:'bg-slate-800',b:'border-slate-700'});
    return(
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none"/>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10 mb-8">
            <div className={`w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br ${getAvatarColor(currentUser.name)} rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-white text-4xl shadow-xl shrink-0`}>{String(currentUser.name||"U").charAt(0).toUpperCase()}</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{currentUser.name||"Kullanıcı"}</h2>
              <div className="text-slate-400 text-sm mb-3 flex items-center justify-center md:justify-start gap-1.5"><Mail className="w-3.5 h-3.5"/>{currentUser.email}</div>
              {/* SEVİYE */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${lv.bg} border ${lv.color.replace('text','border')}/20 mb-3`}>
                <span>{lv.icon}</span><span className={`text-sm font-black ${lv.color}`}>{lv.name}</span><span className="text-slate-500 text-xs">Lv.{Math.floor(Number(currentUser.playCount||0)/5)}</span>
              </div>
              <div className="w-full max-w-xs"><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Seviye İlerlemesi</span><span>{lvPct}%</span></div><div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden"><div className={`h-1.5 rounded-full bg-gradient-to-r ${getAvatarColor(currentUser.name)}`} style={{width:`${lvPct}%`}}/></div></div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {prem?<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Sparkles className="w-3.5 h-3.5"/>Premium · {rem} Gün</span>:<span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">Standart</span>}
                {isAdmin&&<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Lock className="w-3.5 h-3.5"/>Yönetici</span>}
              </div>
            </div>
          </div>
          {/* FAP Coin */}
          <div className="bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="text-center md:text-left"><div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500"/>FAP Coin</div><div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">{Number(currentUser.fapCoin||0).toFixed(1)}</div></div>
              {prem&&<div className="flex-1 max-w-sm"><div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Bugün</span><span className="text-amber-400 font-bold">{dailyEarned.toFixed(1)} / {FAP_COIN_CONFIG.dailyMax} FAP</span></div><div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-1"><div className="h-2.5 rounded-full transition-all duration-700" style={{width:`${dailyPct}%`,background:dailyPct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#f59e0b,#f97316)'}}/></div><p className="text-[10px] text-slate-500">{dailyPct>=100?"✓ Limit doldu":`${(FAP_COIN_CONFIG.dailyMax-dailyEarned).toFixed(1)} FAP daha kazanabilirsin`}</p></div>}
              <button onClick={()=>setActiveTab("rewards")} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shrink-0">Mağaza</button>
            </div>
          </div>
          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Oynama</div><div className="text-2xl font-black text-white">{Number(currentUser.playCount||0)}</div></div>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Sıra</div><div className="text-xl font-black text-orange-400 flex items-center justify-center gap-1"><Trophy className="w-4 h-4"/>#{calculateRank(currentUser.playCount||0)}</div></div>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 text-center"><div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Fikir</div><div className="text-2xl font-black text-white">{mine.length}</div></div>
          </div>
          {!prem&&<div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"><div><p className="text-amber-400 font-bold text-sm">Premium'a geç!</p><p className="text-slate-500 text-xs">39₺/ay'dan başlıyor.</p></div><button onClick={()=>setActiveTab("premium")} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-1.5"><Crown className="w-4 h-4"/>Satın Al</button></div>}
          {/* Rozetler */}
          <div className="pt-5 border-t border-slate-800"><h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-orange-500"/>Rozetler</h3><div className="flex flex-wrap gap-3">{badges.map(badge=>{const I=badge.I;return<div key={badge.id} className={`flex items-center gap-2.5 p-2.5 pr-4 rounded-2xl border ${badge.b} ${badge.bg}`}><div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-950 border border-slate-800/50"><I className={`w-4 h-4 ${badge.c}`}/></div><div><div className={`text-xs font-bold ${badge.c}`}>{badge.t}</div><div className="text-[10px] text-slate-500">{badge.d}</div></div></div>;})} </div></div>
        </div>
      </div>
    );
  };

  // ── ADMIN PANELİ ─────────────────────────────────────────────────────────────────
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-5 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1"><Lock className="w-5 h-5 text-amber-500"/><h2 className="text-xl font-bold text-white">Yönetici Paneli</h2></div>
          <p className="text-amber-200/50 text-xs">Sadece kuruculara özel · {usersList.length} kullanıcı · {storeProducts.length} ürün · {ordersList.filter(o=>o.status==="Onay Bekliyor").length} bekleyen ödeme</p>
        </div>
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          {[{id:"payments",l:"💳 Ödemeler"},{id:"users",l:"Kullanıcılar"},{id:"orders",l:"Siparişler"},{id:"products",l:"Mağaza"},{id:"feedbacks",l:"Fikirler"},{id:"test",l:"Test"}].map(t=>(
            <button key={t.id} onClick={()=>setAdminTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab===t.id?"bg-amber-500 text-slate-950":"text-slate-400 hover:text-white"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* ═══ ÖDEMELER — Ana iş akışı ═══════════════════════════════════════════════ */}
      {adminTab==="payments"&&(
        <div className="space-y-5">
          {/* Kılavuz */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400"/> Ödeme Eşleştirme Kılavuzu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="text-blue-400 font-black text-lg mb-1">① Shopier</div>
                <p className="text-slate-400 text-xs">Shopier panelinizde siparişi açın → Sipariş notunu görün → Kodla eşleştirin</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="text-amber-400 font-black text-lg mb-1">② Kodla Bul</div>
                <p className="text-slate-400 text-xs">Aşağıdaki listede "Shopier Kodu" sütununu kullanın. Her kullanıcının benzersiz kodu var.</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="text-emerald-400 font-black text-lg mb-1">③ Premium Ver</div>
                <p className="text-slate-400 text-xs">Satın aldığı plana göre +1A / +6A / +1Y butonuna basın. Anında aktifleşir.</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-orange-300 text-xs font-bold">
                🤖 OTOMATİK ONAY: Shopier webhook'u kurmak için <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">api/shopier-webhook.js</code> dosyasını deploy edin.
                Shopier Paneli → Mağaza Ayarları → IPN/Webhook URL: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">https://forgeandplay.com/api/shopier-webhook</code>
              </p>
            </div>
          </div>

          {/* Doğrulama Bekleyenler */}
          {usersList.filter(u=>u.awaitingAdminVerification||u.pendingRequest).length > 0 && (
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>
                Onay Bekleyen Geçici Premium ({usersList.filter(u=>u.awaitingAdminVerification||u.pendingRequest).length})
              </h3>
              <div className="space-y-3">
                {usersList.filter(u=>u.awaitingAdminVerification||u.pendingRequest).map(u=>{
                  const tempExpires = u.tempPremiumExpiresAt ? new Date(u.tempPremiumExpiresAt) : null;
                  const expiredAgo = tempExpires && tempExpires < new Date();
                  const minsLeft = tempExpires ? Math.max(0, Math.round((tempExpires-new Date())/60000)) : null;
                  const reasonLabel = {
                    night_window: "🌙 Gece penceresi (8 saat)",
                    day_window: "☀️ Gündüz penceresi (30 dk)",
                    abuse_limited: "⚠️ Kötüye kullanım (30 dk)",
                    repeat_attempt: "🔁 Tekrar deneme (30 dk)",
                  }[u.tempPremiumReason] || "Geçici premium";

                  return (
                    <div key={u.id} className={`border rounded-2xl p-4 ${expiredAgo?"bg-slate-900/50 border-slate-700":"bg-amber-950/20 border-amber-500/30"}`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Avatar + bilgi */}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} flex items-center justify-center text-sm font-black text-white shrink-0`}>
                          {String(u.name||"U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white">{u.name||"Kullanıcı"}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {/* Shopier kodu */}
                            <code className="text-xs font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">{u.paymentCode||"—"}</code>
                            {/* Plan */}
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">Plan: {u.pendingRequest}</span>
                            {/* Neden / süre */}
                            <span className="text-[10px] text-slate-500">{reasonLabel}</span>
                            {/* Kalan süre */}
                            {tempExpires && !expiredAgo && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                ⏱ {minsLeft} dk kaldı
                              </span>
                            )}
                            {expiredAgo && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                Süresi Doldu
                              </span>
                            )}
                            {/* Kötüye kullanım sayısı */}
                            {Number(u.abuseCount||0) > 0 && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                ⚠️ {u.abuseCount}x iptal geçmişi
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Butonlar */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button onClick={()=>approvePremium(u.id, u.pendingRequest)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4"/> Onayla ({u.pendingRequest})
                          </button>
                          <button onClick={()=>revokeAndPenalize(u.id)}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded-xl text-sm border border-red-500/20 transition-colors flex items-center gap-1.5">
                            <Trash className="w-4 h-4"/> İptal + Ceza
                          </button>
                          <button onClick={()=>revokePremium(u.id)}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-sm border border-slate-700 transition-colors text-xs">
                            Sadece İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tüm kullanıcılar + kodlar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> Tüm Kullanıcılar & Shopier Kodları</h3>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2">
                <Search className="w-3.5 h-3.5 text-slate-500"/>
                <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="İsim, e-posta veya kod ile ara..." className="bg-transparent outline-none text-xs text-white w-48"/>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 text-[10px] uppercase border-b border-slate-800">
                      <th className="px-4 py-3">Kullanıcı</th>
                      <th className="px-4 py-3">Shopier Kodu</th>
                      <th className="px-4 py-3 text-center">Premium Durumu</th>
                      <th className="px-4 py-3 text-right">Premium Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {sortedUsers.map(u=>{
                      const up=isUserPremium(u);
                      const rem=getRemainingDays(u.premiumEndDate);
                      const pend=!!u.pendingRequest;
                      return(
                        <tr key={u.id} className={`hover:bg-slate-800/20 transition-colors ${pend?"bg-amber-950/10":""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} flex items-center justify-center text-xs font-black text-white shrink-0`}>{String(u.name||"U").charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="text-sm font-bold text-white">{u.name||"—"}</div>
                                <div className="text-[10px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg tracking-widest">
                                {u.paymentCode||"—"}
                              </code>
                              <button onClick={async()=>{try{await navigator.clipboard.writeText(u.paymentCode||"");alert("Kopyalandı!");}catch{}}} className="p-1 text-slate-600 hover:text-slate-300 transition-colors" title="Kopyala">
                                <Copy className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {pend
                              ?<span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse">⏳ {u.pendingRequest} Bekleniyor</span>
                              :up
                                ?<span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">✓ Aktif · {rem} gün</span>
                                :<span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-500">Standart</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {up&&<button onClick={()=>revokePremium(u.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors" title="İptal et"><ShieldAlert className="w-3.5 h-3.5"/></button>}
                              <button onClick={()=>approvePremium(u.id,"1A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors">+1A</button>
                              <button onClick={()=>approvePremium(u.id,"6A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 hover:text-white text-orange-300 transition-colors">+6A</button>
                              <button onClick={()=>approvePremium(u.id,"1Y")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-300 transition-colors">+1Y</button>
                              {u.role!=="admin"&&!ADMIN_EMAILS.includes(String(u.email).toLowerCase().trim())&&(
                                <button onClick={()=>deleteUser(u)} className="p-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/40 transition-colors" title="Kullanıcıyı Sil"><Trash className="w-3.5 h-3.5"/></button>
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
          </div>
        </div>
      )}
      {/* ═══ KULLANICILAR ═══════════════════════════════════════════════════════════ */}
      {adminTab==="users"&&<div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"><div className="px-5 py-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 gap-3"><span className="font-bold text-white text-sm">Kullanıcılar ({usersList.length})</span><div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2"><Search className="w-3.5 h-3.5 text-slate-500"/><input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Ara..." className="bg-transparent outline-none text-xs text-white w-32 md:w-48"/></div></div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-slate-900 text-slate-500 text-[10px] uppercase border-b border-slate-800"><th className="px-5 py-3">Kullanıcı</th><th className="px-5 py-3">Shopier Kodu</th><th className="px-5 py-3 text-center">Seviye</th><th className="px-5 py-3 text-center">Durum</th><th className="px-5 py-3 text-right">İşlem</th></tr></thead><tbody className="divide-y divide-slate-800/40">{sortedUsers.map(u=>{const up=isUserPremium(u);const rem=getRemainingDays(u.premiumEndDate);const pend=!!u.pendingRequest;const lv=getLevel(u.playCount);return<tr key={u.id} className={`hover:bg-slate-800/25 transition-colors ${pend?"bg-amber-950/15":""}`}><td className="px-5 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} flex items-center justify-center text-xs font-black text-white`}>{String(u.name||"U").charAt(0).toUpperCase()}</div><div><div className="text-sm font-medium text-white">{u.name||"Kullanıcı"}</div><div className="text-[10px] text-slate-500">{u.email}</div></div></div></td><td className="px-5 py-3"><code className="text-xs font-mono font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">{u.paymentCode||"—"}</code></td><td className="px-5 py-3 text-center"><div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${lv.bg} ${lv.color}`}>{lv.icon} {lv.name}</div></td><td className="px-5 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pend?"bg-amber-500/20 text-amber-400 animate-pulse":up?"bg-emerald-500/20 text-emerald-400":"bg-slate-800 text-slate-500"}`}>{pend?`⏳ ${u.pendingRequest}`:up?`✓ ${rem}g`:"Standart"}</span></td><td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-1 flex-wrap">{pend?<><button onClick={()=>approvePremium(u.id,u.pendingRequest)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Onayla</button><button onClick={()=>revokePremium(u.id)} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">İptal</button></>:<>{up&&<button onClick={()=>revokePremium(u.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="İptal"><ShieldAlert className="w-3.5 h-3.5"/></button>}<button onClick={()=>approvePremium(u.id,"1A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">+1A</button><button onClick={()=>approvePremium(u.id,"6A")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-orange-900/50 text-orange-300">+6A</button><button onClick={()=>approvePremium(u.id,"1Y")} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-amber-900/50 text-amber-300">+1Y</button></>}{u.role!=="admin"&&!ADMIN_EMAILS.includes(String(u.email).toLowerCase().trim())&&<button onClick={()=>deleteUser(u)} className="p-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/40" title="Sil"><Trash className="w-3.5 h-3.5"/></button>}</div></td></tr>;})} </tbody></table></div></div>}
      {/* Orders */}
      {adminTab==="orders"&&<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{ordersList.length===0&&<div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">Henüz sipariş yok.</div>}{ordersList.map(o=><div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex justify-between items-start mb-3"><div><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${o.status==="Onay Bekliyor"?"bg-amber-500/10 text-amber-400 border-amber-500/20":o.status.includes("Kargo")||o.status.includes("İletildi")?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-red-500/10 text-red-400 border-red-500/20"}`}>{o.status}</span><div className="font-bold text-white text-base mt-1.5">{o.productName}</div><div className="text-xs text-amber-500 font-bold">{Number(o.fapCost)} FAP</div></div><span className="text-[10px] text-slate-500">{o.displayDate}</span></div><div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm mb-3 space-y-1"><p><span className="text-slate-500">Kullanıcı: </span><span className="text-white">{o.userName}</span></p><p><span className="text-slate-500">E-posta: </span><a href={`mailto:${o.userEmail}`} className="text-blue-400 hover:underline">{o.userEmail}</a></p>{o.productType==="Fiziksel"&&<p className="border-t border-slate-800 pt-1 mt-1"><span className="text-slate-500">Adres: </span><span className="text-slate-300 text-xs">{o.addressDetails}</span></p>}</div>{o.status==="Onay Bekliyor"&&<div className="flex gap-2"><button onClick={()=>handleOrderStatus(o.id,"Kargolandı / İletildi",o.userId,o.fapCost)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">Onayla & İlet</button><button onClick={()=>handleOrderStatus(o.id,"İptal/İade Edildi",o.userId,o.fapCost)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-lg border border-slate-700 text-xs">Reddet</button></div>}</div>)}</div>}
      {/* Products */}
      {adminTab==="products"&&<div className="space-y-5">
        <div id="pfs" className={`bg-slate-900 border-2 ${editingProductId?"border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]":"border-slate-800"} rounded-2xl p-6 transition-all`}>
          {editingProductId&&<div className="flex items-center gap-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"><Edit className="w-4 h-4 text-amber-500 shrink-0"/><p className="text-amber-300 text-sm font-bold">Düzenleme modu — mevcut ürün güncelleniyor.</p></div>}
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">{editingProductId?<><Edit className="w-4 h-4 text-amber-500"/>Ürünü Düzenle</>:<><Plus className="w-4 h-4 text-emerald-500"/>Yeni Ürün Ekle</>}</h3>
          <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ürün Adı *</label><input required type="text" placeholder="Örn: 100 TL Steam Kodu" value={newProductData.name} onChange={e=>setNewProductData({...newProductData,name:e.target.value})} maxLength={150} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">FAP Fiyatı *</label><input required type="number" placeholder="Örn: 350" value={newProductData.price} onChange={e=>setNewProductData({...newProductData,price:e.target.value})} min="1" max="100000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Görsel URL *</label><input required type="text" placeholder="https://..." value={newProductData.image} onChange={e=>setNewProductData({...newProductData,image:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"/></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tip *</label><select value={newProductData.type} onChange={e=>setNewProductData({...newProductData,type:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"><option value="Dijital">Dijital</option><option value="Fiziksel">Fiziksel (Kargo)</option></select></div>
            <div className="col-span-full"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Açıklama *</label><textarea required placeholder="Ürün açıklaması..." value={newProductData.desc} onChange={e=>setNewProductData({...newProductData,desc:e.target.value})} maxLength={500} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none min-h-[70px] resize-none"/></div>
            <div className="col-span-full flex gap-3">
              <button type="submit" className={`flex-1 py-3 font-bold rounded-xl text-sm ${editingProductId?"bg-amber-600 hover:bg-amber-500 text-white":"bg-emerald-600 hover:bg-emerald-500 text-white"}`}>{editingProductId?"✓ Kaydet":"+ Ekle"}</button>
              {editingProductId&&<button type="button" onClick={cancelEdit} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm border border-slate-700">İptal</button>}
            </div>
          </form>
        </div>
        <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-400">Ürünler <span className="text-white">({storeProducts.length})</span></span>{storeProducts.length>0&&<button onClick={clearAllProducts} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20"><Trash className="w-3.5 h-3.5"/>Tümünü Sil</button>}</div>
        {storeProducts.length===0?(<div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-10 text-center text-slate-500"><Package className="w-10 h-10 mx-auto mb-3 opacity-40"/><p className="text-sm">Henüz ürün yok.</p></div>)
        :(<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{storeProducts.map(p=>{const vis=p.isVisible!==false;const isEd=editingProductId===p.id;return<div key={p.id} className={`bg-slate-950 border rounded-xl p-3 flex flex-col transition-all ${isEd?"border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]":!vis?"border-slate-800 opacity-50 grayscale":"border-slate-800 hover:border-slate-700"}`}><div className="relative h-28 overflow-hidden rounded-lg mb-3"><img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy"/>{!vis&&<div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-[10px] font-black tracking-widest">GİZLİ</div>}{isEd&&<div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center"><span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">DÜZENLENİYOR</span></div>}</div><h4 className="text-white font-bold text-xs mb-1 line-clamp-1">{p.name}</h4><div className="flex items-center gap-1 text-amber-400 font-bold text-sm mb-3"><Coins className="w-3.5 h-3.5"/>{Number(p.price)} FAP</div><div className="grid grid-cols-3 gap-1.5 mt-auto"><button onClick={()=>toggleVis(p.id,vis)} className={`py-1.5 rounded-lg flex items-center justify-center border ${vis?"bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700":"bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`} title={vis?"Gizle":"Yayınla"}>{vis?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}</button><button onClick={()=>editProduct(p)} className={`py-1.5 rounded-lg flex items-center justify-center border ${isEd?"bg-amber-500 text-slate-950 border-amber-500":"bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white"}`}><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>deleteProduct(p.id)} disabled={isEd} className="py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center border border-red-500/20 disabled:opacity-30"><Trash className="w-3.5 h-3.5"/></button></div></div>;})} </div>)}
      </div>}
      {/* Feedbacks */}
      {adminTab==="feedbacks"&&<div className="space-y-3"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center"><span className="font-bold text-white text-sm">Fikirler ({feedbacks.length})</span><span className="text-xs text-slate-500">Bekleyen: {feedbacks.filter(f=>f.status==="beklemede").length}</span></div>{feedbacks.length===0&&<div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">Henüz fikir yok.</div>}{feedbacks.map(fb=><div key={fb.id} className={`bg-slate-900 border rounded-2xl p-4 ${fb.isBotTest?"border-blue-800/30":"border-slate-800"}`}><div className="flex justify-between items-start mb-2"><div className="flex gap-1.5 flex-wrap items-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{fb.game}</span>{fb.isBotTest&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">BOT</span>}<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fb.status==="onaylandi"?"bg-emerald-500/10 text-emerald-400":fb.status==="reddedildi"?"bg-red-500/10 text-red-400":"bg-amber-500/10 text-amber-400"}`}>{fb.status==="onaylandi"?"✓ Onaylı":fb.status==="reddedildi"?"✗ Reddedildi":"Beklemede"}</span></div><span className="text-[10px] text-slate-600">{fb.createdAt?new Date(fb.createdAt).toLocaleDateString('tr-TR'):fb.date}</span></div><p className="text-sm text-slate-300 mb-2">{fb.text}</p><div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">{fb.user} · {fb.email}</span>{fb.status==="beklemede"&&<div className="flex gap-1.5"><button onClick={()=>approveFeedback(fb.id,"onaylandi")} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Onayla</button><button onClick={()=>approveFeedback(fb.id,"reddedildi")} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400">Reddet</button></div>}</div></div>)}</div>}
      {/* Test */}
      {adminTab==="test"&&<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="font-bold text-white mb-5 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/>Test Araçları</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="bg-slate-950 border border-slate-800 rounded-xl p-5"><h4 className="font-bold text-white mb-1 text-sm">+1 Ay Premium</h4><p className="text-xs text-slate-500 mb-4">Kendi hesabına 1 aylık premium ekle.</p><button onClick={()=>approvePremium(currentUser?.id,"1A")} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm">+1 Ay Ekle</button></div><div className="bg-slate-950 border border-slate-800 rounded-xl p-5"><h4 className="font-bold text-white mb-1 text-sm flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-500"/>Simülasyon Botu</h4><p className="text-xs text-slate-500 mb-4">Her 30 sn'de oyun oturumu simüle eder.</p><button onClick={toggleBot} className={`w-full py-2.5 font-bold rounded-xl text-sm ${isBotRunning?"bg-red-500/10 text-red-400 border border-red-500/25":"bg-emerald-600 hover:bg-emerald-500 text-white"}`}>{isBotRunning?"Durdur":"Başlat"}</button>{isBotRunning&&<p className="text-[10px] text-emerald-400 mt-1.5 text-center animate-pulse">Bot aktif...</p>}</div></div></div>}
    </div>
  );

  // ── FOOTER ─────────────────────────────────────────────────────────────────────────
  const renderFooter = () => (
    <footer className="hidden md:block border-t border-slate-800/60 bg-slate-950 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 rounded-xl"><img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain"/></div>
              <span className="text-lg font-black text-white">Forge<span className="text-orange-500">&</span>Play</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xs">Türkiye'nin en eğlenceli dijital oyun platformu. Arkadaşlarınla oyna, kazan, paylaş.</p>
            {/* SSL & Güven rozetleri */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold"><Shield className="w-3 h-3"/> SSL Güvenli</div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-bold"><Lock className="w-3 h-3"/> Şifrelenmiş</div>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 text-pink-400 border border-pink-500/20 rounded-xl transition-all text-sm font-bold group">
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform"/>@forgeandplayshop<ExternalLink className="w-3 h-3 opacity-50"/>
            </a>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {[{t:"Ana Sayfa",id:"home"},{t:"Oyunlar",id:"store"},{t:"Ödül Mağazası",id:"rewards"},{t:"Laboratuvar",id:"lab"},{t:"Premium",id:"premium"},{t:"Fikir Kutusu",id:"feedback"}].map(l=><li key={l.id}><button onClick={()=>setActiveTab(l.id)} className="hover:text-orange-400 transition-colors text-left">{l.t}</button></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Şirket</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={()=>setActiveModal('about')} className="hover:text-orange-400 transition-colors">Hakkımızda</button></li>
              <li><button onClick={()=>setActiveModal('contact')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5"><Mail className="w-3 h-3"/> İletişim</button></li>
              <li><button onClick={()=>setActiveModal('privacy')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5"><Shield className="w-3 h-3"/> Gizlilik Politikası</button></li>
              <li><button onClick={()=>setActiveModal('terms')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5"><FileText className="w-3 h-3"/> Kullanım Koşulları</button></li>
              <li><a href="mailto:forgeandplay@gmail.com" className="hover:text-orange-400 transition-colors flex items-center gap-1.5"><Mail className="w-3 h-3"/> forgeandplay@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© 2026 Forge&Play. Tüm hakları saklıdır.</span>
          <div className="flex items-center gap-4">
            <button onClick={()=>setActiveModal('privacy')} className="hover:text-slate-400 transition-colors">Gizlilik</button>
            <button onClick={()=>setActiveModal('terms')} className="hover:text-slate-400 transition-colors">Koşullar</button>
            <button onClick={()=>setActiveModal('contact')} className="hover:text-slate-400 transition-colors">İletişim</button>
          </div>
        </div>
      </div>
    </footer>
  );

  // ── INSTALL MODAL ──────────────────────────────────────────────────────────────────
  const renderInstallModal = () => {
    if(!showInstallGuide)return null;
    return(
      <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
          <button onClick={()=>setShowInstallGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X className="w-5 h-5"/></button>
          <Download className="w-10 h-10 text-emerald-500 mx-auto mb-4"/>
          <h2 className="text-xl font-black text-white mb-2">Ana Ekrana Ekle</h2>
          <div className="text-left space-y-3 mb-5 text-sm">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><b className="text-white">🍎 iOS:</b><ol className="text-slate-400 mt-2 space-y-1 list-decimal list-inside"><li>Alt menü → Paylaş ikonu</li><li>Ana Ekrana Ekle</li><li>Ekle'ye bas</li></ol></div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><b className="text-white">🤖 Android:</b><ol className="text-slate-400 mt-2 space-y-1 list-decimal list-inside"><li>Üç nokta menüsü</li><li>Ana Ekrana Ekle</li><li>Ekle'ye bas</li></ol></div>
          </div>
          <button onClick={()=>setShowInstallGuide(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Anladım</button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ANA RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 flex flex-col overflow-x-hidden">
      {renderInstallModal()}
      {renderTrialModal()}
      {renderPremiumWarningModal()}
      {renderGameDetailModal()}
      {renderAboutModal()}
      {renderContactModal()}
      {renderPrivacyModal()}
      {renderTermsModal()}
      {playingGame&&renderPlayerOverlay()}
      {renderNavbar()}
      {showLoginModal&&renderLoginModal()}
      {paymentIntent&&renderPaymentModal()}

      <main id="main" className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
        {activeTab==="home"&&renderHome()}
        {activeTab==="store"&&renderStore()}
        {activeTab==="rewards"&&renderRewardsStore()}
        {activeTab==="library"&&renderLibrary()}
        {activeTab==="premium"&&renderPremiumPage()}
        {activeTab==="lab"&&renderLab()}
        {activeTab==="profile"&&renderProfile()}
        {activeTab==="feedback"&&renderFeedback()}
        {activeTab==="admin"&&isAdmin&&renderAdminDashboard()}
      </main>

      {renderFooter()}
      {renderMobileNav()}

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
