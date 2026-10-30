
/* =========================================================
   SERVICE WORKER — DX ANUBIS
   Cache shell + Offline fallback + Web Push
   Naikkan VERSION setiap rilis.
========================================================= */

const VERSION = 'v6-dx-push';
const CACHE = 'app-' + VERSION;

const PRECACHE = [
  "./",
  "index.html",
  "bayar-transfer.html",
  "deposito.html",
  "saya.html",
  "scan-qris.html",
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


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async (cache) => {
        // Cache satu per satu agar satu aset yang gagal
        // tidak menggagalkan seluruh proses instalasi.
        await Promise.allSettled(
          PRECACHE.map((url) => cache.add(url))
        );
      })
      .then(() => self.skipWaiting())
  );
});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});


/* =========================================================
   FETCH — CACHE STRATEGY
========================================================= */

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/.well-known/')
  ) {
    return;
  }

  // HALAMAN: Network First
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE)
              .then((cache) => cache.put(req, copy));
          }

          return response;
        })
        .catch(async () => {
          const cached = await caches.match(
            req,
            { ignoreSearch: true }
          );

          return cached ||
            await caches.match('offline.html');
        })
    );

    return;
  }

  // ASET: Cache First + Network Update
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE)
              .then((cache) => cache.put(req, copy));
          }

          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});


/* =========================================================
   PUSH — DX ANUBIS
   Menerima notifikasi dari backend Supabase.
========================================================= */

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let data = {};

    try {
      data = event.data
        ? event.data.json()
        : {};
    } catch (_) {
      data = {
        title: 'Dx ANUBIS',
        body: event.data ? event.data.text() : ''
      };
    }

    const title =
      data.title || 'Notifikasi Dx ANUBIS';

    const options = {
      body: data.body || 'Ada data Dx baru.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',

      tag: data.tag || (
        data.id ? 'dx-' + data.id : 'dx-anubis'
      ),

      renotify: true,
      requireInteraction: true,

      vibrate: [250, 100, 250, 100, 400],

      data: {
        url: data.url || '/saya.html',
        id: data.id || null
      }
    };

    await self.registration.showNotification(
      title,
      options
    );
  })());
});


/* =========================================================
   NOTIFICATION CLICK
========================================================= */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const targetUrl = new URL(
      event.notification.data?.url || '/saya.html',
      self.location.origin
    ).href;

    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.navigate(targetUrl);
        return client.focus();
      }
    }

    return self.clients.openWindow(targetUrl);
  })());
});


/* =========================================================
   NOTIFICATION CLOSE
========================================================= */

self.addEventListener('notificationclose', (event) => {
  // Ruang untuk pencatatan jika dibutuhkan nanti.
});
