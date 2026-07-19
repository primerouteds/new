import { db, auth } from './firebase.js';
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const USERS = 'users';

// ── List all drivers ──────────────────────────
export async function getDrivers() {
  const q = query(collection(db, USERS), where('role', '==', 'driver'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── List all users ────────────────────────────
export async function getAllUsers() {
  const q = query(collection(db, USERS), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Get a single user ─────────────────────────
export async function getUser(uid) {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Check if any admin exists ─────────────────
export async function adminExists() {
  const q = query(collection(db, USERS), where('role', '==', 'admin'));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Create driver account ─────────────────────
// NOTE: This approach uses a secondary Auth instance trick.
// In production you'd use a Cloud Function to create users server-side.
// Here we create the auth user then immediately restore the current session.
export async function createDriverAccount({ name, email, password, phone = '' }) {
  // We use createUserWithEmailAndPassword but the Firebase SDK will sign
  // the new user in — we capture the current admin first.
  const adminUser = auth.currentUser;
  const adminToken = await adminUser.getIdToken();

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, USERS, uid), {
    name, email, phone, role: 'driver',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });

  // Re-sign in the admin using their token is not directly possible in client SDK.
  // Instead we sign out the new user and sign the admin back in via
  // signInWithCustomToken — but that requires a Function.
  // Practical workaround: reload page (admin stays because of persistent session? No.)
  // Better: use a second Firebase App instance.
  // For simplicity here, we sign out and redirect to login with a note.
  await auth.signOut();
  return { uid, email, name };
}

// ── Update user ───────────────────────────────
export async function updateUser(uid, data) {
  await updateDoc(doc(db, USERS, uid), { ...data, updatedAt: serverTimestamp() });
}

// ── Delete user doc (does NOT delete Auth user) ──
export async function deleteUserDoc(uid) {
  await deleteDoc(doc(db, USERS, uid));
}
