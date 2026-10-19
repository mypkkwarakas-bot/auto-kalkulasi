/* Service worker: precache shell + strategi cache. Naikkan VERSION setiap rilis. */
const VERSION = 'v4';
const CACHE = 'app-' + VERSION;
const PRECACHE = [
 "./",
 "index.html",
 "bayar-transfer.html",
 "deposito.html",
 "saya.html",
 "ruang-chat-cs.html",
 "offline.html",
 "pwa.js",
 "manifest.webmanifest",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-512.png",
 "icons/apple-touch-icon.png",
 "icons/favicon-32.png",
 "assets/img/avatar_profil.png",
 "assets/img/badge_65.png",
 "assets/img/banner_setor_tarik.png",
 "assets/img/bt_banklain.png",
 "assets/img/bt_bell.png",
 "assets/img/bt_bintang.png",
 "assets/img/bt_cari.png",
 "assets/img/bt_dana.png",
 "assets/img/bt_ewallet.png",
 "assets/img/bt_seabank.png",
 "assets/img/bt_seabank_kecil.png",
 "assets/img/bt_setor.png",
 "assets/img/bt_tarik.png",
 "assets/img/bt_telkomsel.png",
 "assets/img/bt_terjadwal.png",
 "assets/img/bt_topup.png",
 "assets/img/bt_va.png",
 "assets/img/btn_hadiah.png",
 "assets/img/btn_notif.png",
 "assets/img/dep_api.png",
 "assets/img/dep_hero.jpg",
 "assets/img/ikon_biaya_transfer.png",
 "assets/img/ikon_flash_deals.png",
 "assets/img/ikon_gopay.png",
 "assets/img/ikon_mata.png",
 "assets/img/ikon_orang_oranye.png",
 "assets/img/ikon_salin.png",
 "assets/img/ikon_toko_pembayaran.png",
 "assets/img/logo_ovo.png",
 "assets/img/logo_shopeepay.png",
 "assets/img/menu_deposito.png",
 "assets/img/menu_lihat_semua.png",
 "assets/img/menu_pinjaman.png",
 "assets/img/menu_tarik_tunai.png",
 "assets/img/menu_topup_ewallet.png",
 "assets/img/menu_topup_tagihan.png",
 "assets/img/menu_transfer.png",
 "assets/img/menu_undang_teman.png",
 "assets/img/nav_bayar_oranye.png",
 "assets/img/nav_bayar_transfer.png",
 "assets/img/nav_beranda.png",
 "assets/img/nav_beranda_abu.png",
 "assets/img/nav_deposito.png",
 "assets/img/nav_deposito_oranye.png",
 "assets/img/nav_qris.png",
 "assets/img/nav_saya.png",
 "assets/img/nav_saya_oranye.png",
 "assets/img/sy_avatar.png",
 "assets/img/sy_bell.png",
 "assets/img/sy_gift.png",
 "assets/img/sy_i_bantuan.png",
 "assets/img/sy_i_bifast.png",
 "assets/img/sy_i_chat.png",
 "assets/img/sy_i_estatement.png",
 "assets/img/sy_i_keamanan.png",
 "assets/img/sy_i_limit.png",
 "assets/img/sy_i_lokasi.png",
 "assets/img/sy_i_masukan.png",
 "assets/img/sy_i_profil.png",
 "assets/img/sy_i_promo.png",
 "assets/img/sy_i_umum.png",
 "assets/img/sy_i_undang.png",
 "assets/img/sy_promo_img.png"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/.well-known/')) return;
  if (req.mode === 'navigate') {
    // halaman: jaringan dulu, jatuh ke cache, terakhir offline.html
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('offline.html'))));
    return;
  }
  // aset statis: cache dulu, perbarui di latar belakang
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
