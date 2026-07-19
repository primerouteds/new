import { getShipmentByTracking } from './shipments.js';
import { STATUS_LABELS, STATUS_FLOW, formatDateTime, statusBadge } from './utils.js';

export async function trackShipment(trackingNumber) {
  return await getShipmentByTracking(trackingNumber.trim().toUpperCase());
}

export function renderTrackingResult(shipment, container) {
  if (!shipment) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:48px 24px">
        <div style="font-size:36px;margin-bottom:12px">📦</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:6px">Shipment not found</div>
        <div style="color:var(--text-muted);font-size:13px">Please check your tracking number and try again.</div>
      </div>`;
    return;
  }

  const statusIdx = STATUS_FLOW.indexOf(shipment.status);

  const stepsHtml = STATUS_FLOW.map((s, i) => {
    let cls = 'timeline-dot';
    if (i < statusIdx) cls += ' done';
    else if (i === statusIdx) cls += ' current';
    const event = [...(shipment.events || [])].reverse().find(e => e.status === s);
    return `
      <div class="timeline-item">
        <div class="timeline-indicator">
          <div class="${cls}"></div>
          ${i < STATUS_FLOW.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <div class="timeline-title" style="${i === statusIdx ? 'color:var(--accent);font-weight:600' : i < statusIdx ? '' : 'color:var(--text-faint)'}">${STATUS_LABELS[s]}</div>
          ${event ? `<div class="timeline-meta">${formatDateTime(event.timestamp)} · ${event.note}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const events = [...(shipment.events || [])].reverse().map(e => `
    <div class="detail-row">
      <div class="detail-label">${formatDateTime(e.timestamp)}</div>
      <div class="detail-value">
        ${statusBadge(e.status)}
        <span style="margin-left:6px;color:var(--text-muted);font-size:12px">${e.note || ''}</span>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Tracking Number</div>
          <div style="font-size:20px;font-weight:700;color:var(--accent);font-family:monospace">${shipment.trackingNumber}</div>
        </div>
        ${statusBadge(shipment.status)}
      </div>

      <div class="form-row cols-2" style="margin-bottom:20px">
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">From</div>
          <div style="font-size:13px;font-weight:500">${shipment.senderName}</div>
          <div style="font-size:12px;color:var(--text-muted)">${shipment.senderAddress}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">To</div>
          <div style="font-size:13px;font-weight:500">${shipment.recipientName}</div>
          <div style="font-size:12px;color:var(--text-muted)">${shipment.recipientAddress}</div>
          ${shipment.recipientPhone ? `<div style="font-size:12px;color:var(--text-muted)">${shipment.recipientPhone}</div>` : ''}
        </div>
      </div>

      ${shipment.estimatedDelivery ? `
      <div style="background:var(--accent-dim);border:1px solid var(--accent-dim-2);border-radius:var(--radius);padding:10px 14px;margin-bottom:20px;font-size:13px">
        <span style="color:var(--accent);font-weight:500">⏱ Estimated Delivery:</span>
        <span style="margin-left:6px">${shipment.estimatedDelivery}</span>
      </div>` : ''}

      <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px">Shipment Progress</div>
      <div class="timeline">${stepsHtml}</div>
    </div>

    ${events ? `
    <div class="card">
      <div class="card-header"><div class="card-title">Activity Log</div></div>
      <div class="detail-panel">${events}</div>
    </div>` : ''}`;
}
