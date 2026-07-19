import { db }     from './firebase.js';
import {
  collection, query, where, orderBy, getDocs, updateDoc, doc,
  serverTimestamp, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const COL = 'shipments';

// ── Get driver's assigned shipments ───────────
export async function getDriverShipments(driverId, statusFilter = 'all') {
  let q = query(collection(db, COL), where('driverId', '==', driverId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (statusFilter && statusFilter !== 'all') {
    results = results.filter(r => r.status === statusFilter);
  }
  return results;
}

// ── Driver updates delivery status ────────────
export async function updateDeliveryStatus(shipmentId, driverId, newStatus, note = '') {
  const event = {
    status:    newStatus,
    note:      note || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
    timestamp: new Date().toISOString()
  };
  await updateDoc(doc(db, COL, shipmentId), {
    status:    newStatus,
    events:    arrayUnion(event),
    updatedAt: serverTimestamp()
  });
}

// ── Driver stats ──────────────────────────────
export async function getDriverStats(driverId) {
  const snap = await getDocs(query(collection(db, COL), where('driverId', '==', driverId)));
  const counts = { total: 0, active: 0, delivered: 0, failed: 0 };
  snap.docs.forEach(d => {
    const { status } = d.data();
    counts.total++;
    if (status === 'delivered') counts.delivered++;
    else if (status === 'failed' || status === 'cancelled') counts.failed++;
    else counts.active++;
  });
  return counts;
}
