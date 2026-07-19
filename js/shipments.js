import { db } from './firebase.js';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { generateTrackingNumber } from './utils.js';

const COL = 'shipments';

// ── Create shipment ───────────────────────────
export async function createShipment(data) {
  const trackingNumber = generateTrackingNumber();
  const shipment = {
    trackingNumber,
    senderName:       data.senderName,
    senderAddress:    data.senderAddress,
    senderPhone:      data.senderPhone || '',
    recipientName:    data.recipientName,
    recipientAddress: data.recipientAddress,
    recipientPhone:   data.recipientPhone || '',
    description:      data.description || '',
    weight:           data.weight || '',
    estimatedDelivery: data.estimatedDelivery || '',
    status:           'pending',
    driverId:         null,
    driverName:       null,
    notes:            data.notes || '',
    events: [{
      status:    'pending',
      note:      'Shipment created',
      timestamp: new Date().toISOString()
    }],
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp()
  };
  const ref = await addDoc(collection(db, COL), shipment);
  return { id: ref.id, ...shipment, trackingNumber };
}

// ── Get all shipments ────────────────────────
export async function getShipments({ statusFilter, driverId, search } = {}) {
  let q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(200));
  if (statusFilter && statusFilter !== 'all') q = query(collection(db, COL), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  if (driverId) q = query(collection(db, COL), where('driverId', '==', driverId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r =>
      r.trackingNumber?.toLowerCase().includes(s) ||
      r.recipientName?.toLowerCase().includes(s) ||
      r.senderName?.toLowerCase().includes(s) ||
      r.recipientAddress?.toLowerCase().includes(s)
    );
  }
  return results;
}

// ── Get single shipment ───────────────────────
export async function getShipment(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Get shipment by tracking number ──────────
export async function getShipmentByTracking(trackingNumber) {
  const q = query(collection(db, COL), where('trackingNumber', '==', trackingNumber.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ── Update shipment status ────────────────────
export async function updateShipmentStatus(id, status, note = '') {
  const event = {
    status,
    note:      note || `Status updated to ${status.replace(/_/g, ' ')}`,
    timestamp: new Date().toISOString()
  };
  await updateDoc(doc(db, COL, id), {
    status,
    events:    arrayUnion(event),
    updatedAt: serverTimestamp()
  });
}

// ── Assign driver ────────────────────────────
export async function assignDriver(id, driverId, driverName) {
  const event = {
    status:    'picked_up',
    note:      `Assigned to driver: ${driverName}`,
    timestamp: new Date().toISOString()
  };
  await updateDoc(doc(db, COL, id), {
    driverId,
    driverName,
    status:    'picked_up',
    events:    arrayUnion(event),
    updatedAt: serverTimestamp()
  });
}

// ── Update any field (admin) ──────────────────
export async function updateShipment(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

// ── Delete shipment ───────────────────────────
export async function deleteShipment(id) {
  await deleteDoc(doc(db, COL, id));
}

// ── Dashboard stats ───────────────────────────
export async function getStats() {
  const snap = await getDocs(collection(db, COL));
  const counts = { total: 0, pending: 0, in_transit: 0, delivered: 0, failed: 0, other: 0 };
  snap.docs.forEach(d => {
    const { status } = d.data();
    counts.total++;
    if (status === 'pending') counts.pending++;
    else if (status === 'in_transit' || status === 'picked_up' || status === 'out_for_delivery') counts.in_transit++;
    else if (status === 'delivered') counts.delivered++;
    else if (status === 'failed' || status === 'cancelled') counts.failed++;
    else counts.other++;
  });
  return counts;
}
