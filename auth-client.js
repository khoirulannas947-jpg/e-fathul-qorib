/* E-Fathul Qorib — klien login (Firebase Authentication).
   Menulis cookie "fb_session" berisi ID token dan memperbaruinya saat token berganti,
   agar middleware Vercel mengizinkan akses. */
(function () {
  const C = window.EFQ_AUTH || {};
  const FB_VER = "10.12.2";
  const FB_COOKIE = "fb_session";
  const store = {
    get(k) { try { return localStorage.getItem("efq:" + k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem("efq:" + k) : localStorage.setItem("efq:" + k, v); } catch (e) {} },
  };

  function setCookie(name, value, maxAge) {
    document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/; Max-Age=" + maxAge + "; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  }
  // ID perangkat acak (untuk batas jumlah perangkat per akun); dikirim ke server lewat cookie "efq_dev".
  (function () {
    let id = store.get("dev");
    if (!/^[a-z0-9-]{16,64}$/i.test(id || "")) {
      try { id = (crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) { return b.toString(16).padStart(2, "0"); }).join("")); } catch (e) { id = ""; }
      if (id) store.set("dev", id);
    }
    if (id) setCookie("efq_dev", id, 31536000);
  })();
  function loadScript(src, attrs) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Gagal memuat " + src)); };
      document.head.appendChild(s);
    });
  }
  const hasFirebase = !!(C.firebase && C.firebase.apiKey && C.firebase.projectId);

  let fbP = null;
  function firebaseAuth() {
    if (!hasFirebase) return Promise.reject(new Error("Firebase belum dikonfigurasi"));
    if (!fbP) {
      const base = "https://www.gstatic.com/firebasejs/" + FB_VER + "/";
      fbP = loadScript(base + "firebase-app-compat.js")
        .then(function () { return loadScript(base + "firebase-auth-compat.js"); })
        .then(function () {
          if (!window.firebase.apps.length) window.firebase.initializeApp(C.firebase);
          const auth = window.firebase.auth();
          auth.useDeviceLanguage();
          auth.onIdTokenChanged(function (u) {
            if (u) u.getIdToken().then(function (t) { setCookie(FB_COOKIE, t, 3600); });
            else setCookie(FB_COOKIE, "", 0);
          });
          return new Promise(function (resolve) {
            const off = auth.onAuthStateChanged(function () { off(); resolve(auth); });
          });
        })
        .catch(function (e) { fbP = null; throw e; });
    }
    return fbP;
  }

  function userFromFirebase(auth) {
    const u = auth.currentUser;
    if (!u) return null;
    return { provider: "firebase", name: u.displayName || u.email || "Pengguna", email: u.email || "", image: u.photoURL || "" };
  }

  const api = {
    configured: { firebase: hasFirebase },
    provider: function () { return store.get("provider"); },
    firebaseAuth: firebaseAuth,

    /* Sesi aktif (memuat SDK penyedia yang terakhir dipakai). */
    session: function () {
      if (hasFirebase) return firebaseAuth().then(userFromFirebase);
      return Promise.resolve(null);
    },

    /* Dipanggil setelah login sukses di halaman masuk. */
    markSignedIn: function (provider) { store.set("provider", provider); },
    setFirebaseCookie: function (user) {
      return user.getIdToken().then(function (t) { setCookie(FB_COOKIE, t, 3600); });
    },

    /* Memaksa token diperbarui (misalnya setelah laptop tidur). */
    refresh: function () {
      if (hasFirebase) {
        return firebaseAuth().then(function (auth) {
          if (!auth.currentUser) return false;
          return auth.currentUser.getIdToken(true).then(function (t) { setCookie(FB_COOKIE, t, 3600); return true; });
        });
      }
      return Promise.resolve(false);
    },

    toLogin: function () {
      location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search) + location.hash;
    },

    signOut: function () {
      const jobs = [];
      if (hasFirebase) jobs.push(firebaseAuth().then(function (a) { return a.signOut(); }).catch(function () {}));
      return Promise.all(jobs).then(function () {
        setCookie(FB_COOKIE, "", 0);
        store.set("provider", null);
        // Hapus simpanan offline kitab di perangkat ini saat keluar.
        try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage("hapus-data"); } catch (e) {}
        try { if (window.caches) return Promise.all([caches.delete("efq-data-v1"), caches.delete("efq-shell-v1")]).then(function () {}); } catch (e) {}
      });
    },
  };
  window.EFQAuth = api;
})();
