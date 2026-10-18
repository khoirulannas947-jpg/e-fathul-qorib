/* E-Fathul Qorib — klien login (Clerk + Firebase).
   Menjaga cookie sesi tetap segar agar middleware Vercel mengizinkan akses:
   - Clerk    : clerk-js menulis & memperbarui cookie "__session" sendiri.
   - Firebase : kita menulis cookie "fb_session" berisi ID token, diperbarui saat token berganti. */
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
  function clerkFrontendApi(pk) {
    try { return atob(String(pk || "").split("_")[2]).replace(/\$$/, ""); } catch (e) { return ""; }
  }

  const hasClerk = !!C.clerkPublishableKey;
  const hasFirebase = !!(C.firebase && C.firebase.apiKey && C.firebase.projectId);

  let clerkP = null;
  function clerk() {
    if (!hasClerk) return Promise.reject(new Error("Clerk belum dikonfigurasi"));
    if (!clerkP) {
      const fapi = clerkFrontendApi(C.clerkPublishableKey);
      clerkP = loadScript("https://" + fapi + "/npm/@clerk/clerk-js@5/dist/clerk.browser.js", { "data-clerk-publishable-key": C.clerkPublishableKey })
        .then(function () { return window.Clerk.load({ signInUrl: "/login", afterSignOutUrl: "/login?keluar=1" }); })
        .then(function () { return window.Clerk; })
        .catch(function (e) { clerkP = null; throw e; });
    }
    return clerkP;
  }

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

  function userFromClerk(c) {
    const u = c.user;
    if (!u) return null;
    return {
      provider: "clerk",
      name: u.fullName || u.username || (u.primaryEmailAddress && u.primaryEmailAddress.emailAddress) || "Pengguna",
      email: (u.primaryEmailAddress && u.primaryEmailAddress.emailAddress) || "",
      image: u.imageUrl || "",
    };
  }
  function userFromFirebase(auth) {
    const u = auth.currentUser;
    if (!u) return null;
    return { provider: "firebase", name: u.displayName || u.email || "Pengguna", email: u.email || "", image: u.photoURL || "" };
  }

  const api = {
    configured: { clerk: hasClerk, firebase: hasFirebase },
    provider: function () { return store.get("provider"); },
    clerk: clerk,
    firebaseAuth: firebaseAuth,

    /* Sesi aktif (memuat SDK penyedia yang terakhir dipakai). */
    session: function () {
      const p = api.provider();
      if (p === "firebase" && hasFirebase) return firebaseAuth().then(userFromFirebase);
      if (p === "clerk" && hasClerk) return clerk().then(userFromClerk);
      return Promise.resolve(null);
    },

    /* Dipanggil setelah login sukses di halaman masuk. */
    markSignedIn: function (provider) { store.set("provider", provider); },
    setFirebaseCookie: function (user) {
      return user.getIdToken().then(function (t) { setCookie(FB_COOKIE, t, 3600); });
    },

    /* Memaksa token diperbarui (misalnya setelah laptop tidur). */
    refresh: function () {
      const p = api.provider();
      if (p === "firebase" && hasFirebase) {
        return firebaseAuth().then(function (auth) {
          if (!auth.currentUser) return false;
          return auth.currentUser.getIdToken(true).then(function (t) { setCookie(FB_COOKIE, t, 3600); return true; });
        });
      }
      if (p === "clerk" && hasClerk) {
        return clerk().then(function (c) {
          if (!c.session) return false;
          return c.session.getToken({ skipCache: true }).then(function () { return true; });
        });
      }
      return Promise.resolve(false);
    },

    toLogin: function () {
      location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search) + location.hash;
    },

    signOut: function () {
      const jobs = [];
      if (hasFirebase && (fbP || api.provider() === "firebase")) jobs.push(firebaseAuth().then(function (a) { return a.signOut(); }).catch(function () {}));
      if (hasClerk && (clerkP || api.provider() === "clerk")) jobs.push(clerk().then(function (c) { return c.signOut(); }).catch(function () {}));
      return Promise.all(jobs).then(function () {
        setCookie(FB_COOKIE, "", 0);
        store.set("provider", null);
      });
    },
  };
  window.EFQAuth = api;
})();
