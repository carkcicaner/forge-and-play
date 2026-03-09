// api/shopier-webhook.js
import * as admin from 'firebase-admin';
import crypto from 'crypto';

// Firebase Admin'i SADECE BİR KERE başlat (Vercel cold start sorunu için)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel'de private key'deki \n karakterlerinin doğru okunması için replace kullanılır
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et (Shopier'in veri gönderme şekli)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST istekleri kabul edilir' });
  }

  try {
    const data = req.body;
    
    // Shopier'den gelen ana veriler
    const status = data.status; // 'success' olmalı
    const orderId = data.platform_order_id;
    const randomNr = data.random_nr;
    const incomingSignature = data.signature; // Shopier'in imzaladığı şifre
    
    // Güvenlik: İsteğin gerçekten Shopier'den geldiğini doğrulama
    const apiSecret = process.env.SHOPIER_API_SECRET;
    
    // Shopier imza algoritması
    const expectedSignatureString = randomNr + orderId + status;
    const expectedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(expectedSignatureString)
      .digest('base64');

    if (incomingSignature !== expectedSignature) {
      console.error("Geçersiz imza! İstek Shopier'den gelmiyor olabilir.");
      return res.status(401).json({ message: 'Geçersiz İmza' });
    }

    if (status === 'success') {
      // Başarılı ödeme! Şimdi kime ait olduğunu bulalım.
      // Not: Shopier ödeme linkini oluştururken custom_parameter veya extra_data gibi bir alana kullanıcının Firebase UID'sini göndermelisiniz.
      // Örnek: data.custom_parameter alanında "abcd123_1A" (KullanıcıID_PaketKodu) gibi bir veri geldiğini varsayalım.
      
      const customParam = data.custom_parameter || data.extra_data; 
      
      if (!customParam) {
        console.error("Ödeme başarılı ama kullanıcı UID bulunamadı.");
        return res.status(400).json({ message: 'Eksik parametre' });
      }

      // "UID_PaketKodu" (Örn: "abcd123_1A") verisini ayır
      const [userId, planCode] = customParam.split('_');

      // Firebase'den kullanıcıyı bul
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error(`Kullanıcı bulunamadı: ${userId}`);
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      // Mevcut premium süresini al veya şimdiki zamanı referans al
      const userData = userDoc.data();
      let baseDate = userData.premiumEndDate && new Date(userData.premiumEndDate) > new Date() 
                     ? new Date(userData.premiumEndDate) 
                     : new Date();

      // Pakete göre eklenecek ayı hesapla
      let monthsToAdd = 1;
      if (planCode === '6A') monthsToAdd = 6;
      if (planCode === '1Y') monthsToAdd = 12;

      baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

      // Veritabanını güncelle (Kullanıcı saniyesinde premium olur!)
      await userRef.update({
        premiumEndDate: baseDate.toISOString(),
        pendingRequest: null // Bekleyen isteği temizle
      });

      console.log(`BINGO! Kullanıcı ${userId} için ${monthsToAdd} aylık premium onaylandı.`);
      return res.status(200).json({ message: 'Ödeme onaylandı ve Firebase güncellendi' });
    } else {
      // Ödeme başarısız (status !== 'success')
      return res.status(200).json({ message: 'Ödeme başarısız veya iptal edildi, işlem yapılmadı' });
    }

  } catch (error) {
    console.error("Webhook Hatası:", error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.toString() });
  }
}
