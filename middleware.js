// Vercel Routing Middleware: semua halaman & data kitab hanya untuk pengguna yang sudah login.
// Sesi = cookie "fb_session" berisi Firebase ID token (JWT RS256, diperbarui oleh auth-client.js).
// Verifikasi memakai kunci publik (JWKS) Google, jadi tidak ada kunci rahasia di sini.
import { FIREBASE_PROJECT_ID } from "./auth-settings.js";

export const config = {
  matcher: ["/((?!login|auth-config\\.js|auth-client\\.js|favicon\\.ico|robots\\.txt).*)"],
};

const FIREBASE_JWKS = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const enc = new TextEncoder();
const jwksCache = new Map();

function b64uToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const decodeJson = (s) => JSON.parse(new TextDecoder().decode(b64uToBytes(s)));

async function getKeys(url, force) {
  const hit = jwksCache.get(url);
  if (!force && hit && hit.exp > Date.now()) return hit.keys;
  const r = await fetch(url);
  if (!r.ok) throw new Error("JWKS " + r.status);
  const j = await r.json();
  const keys = Array.isArray(j.keys) ? j.keys : [];
  jwksCache.set(url, { keys, exp: Date.now() + 60 * 60 * 1000 });
  return keys;
}

export async function verifyJwt(token, jwksUrl, check) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  let h, p;
  try {
    h = decodeJson(parts[0]);
    p = decodeJson(parts[1]);
  } catch {
    return null;
  }
  if (h.alg !== "RS256" || !h.kid) return null;
  let jwk = (await getKeys(jwksUrl)).find((k) => k.kid === h.kid);
  if (!jwk) jwk = (await getKeys(jwksUrl, true)).find((k) => k.kid === h.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64uToBytes(parts[2]), enc.encode(parts[0] + "." + parts[1]));
  if (!ok) return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof p.exp !== "number" || p.exp < now - 10) return null;
  if (typeof p.nbf === "number" && p.nbf > now + 10) return null;
  return check(p) ? p : null;
}

function parseCookies(header) {
  const out = [];
  for (const part of String(header || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out.push([part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim())]);
  }
  return out;
}

export async function sessionFrom(cookieHeader, settings = { projectId: FIREBASE_PROJECT_ID, firebaseJwks: FIREBASE_JWKS }) {
  if (!settings.projectId) return null;
  const iss = "https://securetoken.google.com/" + settings.projectId;
  for (const [name, value] of parseCookies(cookieHeader)) {
    if (name !== "fb_session") continue;
    try {
      const p = await verifyJwt(value, settings.firebaseJwks, (c) => c.iss === iss && c.aud === settings.projectId && !!c.sub);
      if (p) return { provider: "firebase", sub: p.sub };
    } catch {}
  }
  return null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const session = await sessionFrom(request.headers.get("cookie"));
  if (session) {
    // Lanjutkan ke file statis (setara next() dari @vercel/functions).
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }
  if (url.pathname.startsWith("/data/")) {
    return new Response(JSON.stringify({ error: "login_required" }), {
      status: 401,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  const login = new URL("/login", url);
  login.searchParams.set("next", url.pathname + url.search);
  return new Response(null, { status: 302, headers: { location: login.toString(), "cache-control": "no-store" } });
}
