/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORGE&PLAY — Shopier Otomatik Premium Webhook
 * Dosya: /api/shopier-webhook.js  (Vercel Serverless Function)
 *
 * KURULUM:
 * 1. Bu dosyayı projenizin /api/ klasörüne koyun
 * 2. .env dosyasına aşağıdaki değişkenleri ekleyin:
 *    SHOPIER_API_KEY=shopier_api_key_buraya
 *    SHOPIER_API_SECRET=shopier_api_secret_buraya
 *    FIREBASE_PROJECT_ID=forge-and-play
 *    FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@forge-and-play.iam.gserviceaccount.com
 *    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 * 3. Shopier Paneli → Mağaza Ayarları → IPN/Bildirim URL:
 *    https://forgeandplay.com/api/shopier-webhook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

// Firebase Admin SDK (npm install firebase-admin)
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase Admin başlat (Vercel'de her cold-start için)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Plan → Ay eşlemesi (Shopier ürün ID'lerine göre)
const PLAN_MAP = {
  '44689059': { months: 1,  label: '1A' },  // 1 Aylık
  '44689160': { months: 6,  label: '6A' },  // 6 Aylık
  '44689235': { months: 12, label: '1Y' },  // 1 Yıllık
};

/**
 * Shopier IPN hash doğrulaması
 * Hash = MD5(api_key + order_id + amount + currency + api_secret)
 */
function verifyShopierHash(params, apiKey, apiSecret) {
  const hashData = apiKey +
    (params.random_nr || '') +
    (params.platform_order_id || '') +
    (params.status || '') +
    apiSecret;

  const expected = crypto
    .createHash('md5')
    .update(hashData)
    .digest('hex');

  return expected === params.hash;
}

/**
 * Kullanıcıyı paymentCode ile Firestore'da bul
 */
async function findUserByPaymentCode(code) {
  if (!code) return null;
  const clean = code.toString().trim().toUpperCase();
  
  const snap = await db.collection('users')
    .where('paymentCode', '==', clean)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Kullanıcıya premium ver
 */
async function grantPremium(userId, months) {
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return false;

  const data = userSnap.data();
  const base = data.premiumEndDate && new Date(data.premiumEndDate) > new Date()
    ? new Date(data.premiumEndDate)
    : new Date();

  base.setMonth(base.getMonth() + months);

  await userRef.update({
    premiumEndDate: base.toISOString(),
    pendingRequest: null,
    lastPremiumGranted: new Date().toISOString(),
    premiumGrantedBy: 'shopier-webhook',
  });

  return true;
}

/**
 * Ödeme logunu Firestore'a kaydet
 */
async function logPayment(data) {
  await db.collection('payment_logs').add({
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// ─── ANA HANDLER ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const params = req.body;

    console.log('Shopier webhook alındı:', JSON.stringify(params));

    // ── 1. Hash doğrulama ──────────────────────────────────────────────────────
    const apiKey    = process.env.SHOPIER_API_KEY;
    const apiSecret = process.env.SHOPIER_API_SECRET;

    if (apiKey && apiSecret) {
      const isValid = verifyShopierHash(params, apiKey, apiSecret);
      if (!isValid) {
        await logPayment({ status: 'hash_error', params, error: 'Invalid hash' });
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    // ── 2. Ödeme durumu kontrolü ───────────────────────────────────────────────
    // Shopier: status=1 = başarılı ödeme
    if (String(params.status) !== '1') {
      await logPayment({ status: 'payment_not_successful', params });
      return res.status(200).json({ message: 'Payment not successful, ignored' });
    }

    // ── 3. Sipariş notundan payment code çıkar ─────────────────────────────────
    // Kullanıcı Shopier sipariş notuna "FP-XXXX" yazmış olmalı
    const note = params.buyer_description || params.note || params.order_description || '';
    const codeMatch = note.match(/FP-[A-Z0-9]{4}/i);
    const paymentCode = codeMatch ? codeMatch[0].toUpperCase() : null;

    if (!paymentCode) {
      await logPayment({
        status: 'no_payment_code',
        params,
        error: 'Payment code not found in order note: ' + note,
      });
      // Hata döndürme — sadece logla, Shopier retry yapmasın
      return res.status(200).json({
        message: 'No payment code found in order note',
        note,
      });
    }

    // ── 4. Plan belirle (Shopier ürün ID'sine göre) ───────────────────────────
    const productId = String(params.product_id || params.item_number || '');
    const plan = PLAN_MAP[productId];

    let months = 1; // Varsayılan 1 ay
    if (plan) {
      months = plan.months;
    } else {
      // Tutara göre tahmin et
      const amount = parseFloat(params.total_order_value || params.amount || 0);
      if (amount >= 280) months = 12;
      else if (amount >= 160) months = 6;
      else months = 1;
    }

    // ── 5. Kullanıcıyı bul ─────────────────────────────────────────────────────
    const user = await findUserByPaymentCode(paymentCode);

    if (!user) {
      await logPayment({
        status: 'user_not_found',
        paymentCode,
        params,
        error: 'No user with this payment code',
      });
      return res.status(200).json({
        message: 'User not found for payment code: ' + paymentCode,
      });
    }

    // ── 6. Premium ver ─────────────────────────────────────────────────────────
    const granted = await grantPremium(user.id, months);

    if (!granted) {
      await logPayment({
        status: 'grant_failed',
        userId: user.id,
        paymentCode,
        params,
      });
      return res.status(500).json({ error: 'Failed to grant premium' });
    }

    // ── 7. Başarı logu ─────────────────────────────────────────────────────────
    await logPayment({
      status: 'success',
      userId: user.id,
      userEmail: user.email,
      paymentCode,
      months,
      shopierOrderId: params.platform_order_id || params.order_no || '',
      amount: params.total_order_value || '',
      params,
    });

    console.log(`✅ Premium verildi: ${user.email} → ${months} ay (${paymentCode})`);

    return res.status(200).json({
      success: true,
      message: `Premium granted: ${months} months for ${user.email}`,
    });

  } catch (err) {
    console.error('Shopier webhook error:', err);
    await logPayment({ status: 'server_error', error: err.message }).catch(() => {});
    return res.status(500).json({ error: 'Internal server error' });
  }
};
