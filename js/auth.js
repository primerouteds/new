import { auth, db }                            from './firebase.js';
import { signInWithEmailAndPassword, signOut,
         onAuthStateChanged }                  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp }
                                                from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Login ────────────────────────────────────
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ───────────────────────────────────
export async function logout() {
  await signOut(auth);
  window.location.href = '/login.html';
}

// ── Get current user ─────────────────────────
export function getCurrentUser() {
  return auth.currentUser;
}

// ── Get user Firestore data ──────────────────
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Create/update user doc ───────────────────
export async function upsertUserDoc(uid, data) {
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Route guard ──────────────────────────────
// requiredRole: 'admin' | 'driver' | null (any authenticated)
export function requireAuth(requiredRole = null) {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user) { window.location.href = '/login.html'; return; }
      const data = await getUserData(user.uid);
      if (!data) { await signOut(auth); window.location.href = '/login.html'; return; }
      if (requiredRole && data.role !== requiredRole) {
        // redirect to correct dashboard
        if (data.role === 'admin')  { window.location.href = '/admin/dashboard.html'; return; }
        if (data.role === 'driver') { window.location.href = '/driver/dashboard.html'; return; }
        window.location.href = '/login.html'; return;
      }
      resolve({ user, userData: data });
    });
  });
}

// ── Auth state helper for public pages ───────
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}
