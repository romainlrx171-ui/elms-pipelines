// Shared dashboard helpers loaded by all 4 pages.

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function badge(value, klass) {
  return `<span class="badge ${klass || value}">${value}</span>`;
}

function flag(b) {
  return b ? '<span class="flag-yes">✓</span>' : '<span class="flag-no">—</span>';
}

function fmtNum(n) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

async function loadJSON(path) {
  // Cache-bust so the latest export shows immediately after a push.
  const r = await fetch(path + '?t=' + Date.now());
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

function renderProspectRow(p) {
  const last = p.last_sent_at
    ? `<span title="touch #${p.last_touch_n}">${fmtDate(p.last_sent_at)}</span>`
    : '<span class="flag-no">—</span>';
  const next = p.next_scheduled
    ? `<span title="touch #${p.next_touch_n}">${fmtDate(p.next_scheduled)}</span>`
    : '<span class="flag-no">—</span>';
  const reply = p.last_reply_at
    ? `${fmtDate(p.last_reply_at)}${p.last_sentiment ? ' · ' + p.last_sentiment : ''}`
    : '<span class="flag-no">—</span>';
  return `
    <tr data-status="${p.status}" data-tier="${p.tier}">
      <td><strong>${p.company || '—'}</strong>
          <div style="color:var(--dim);font-size:11px;margin-top:2px">${p.role || ''}</div></td>
      <td>${badge(p.tier, 'tier-' + p.tier)}</td>
      <td>${badge(p.status)}</td>
      <td style="text-align:center">${flag(p.has_email)}</td>
      <td style="text-align:center">${flag(p.has_linkedin)}</td>
      <td>${p.geo || '<span class="flag-no">—</span>'}</td>
      <td style="text-align:center">${p.sends_total || 0}</td>
      <td>${last}</td>
      <td>${next}</td>
      <td>${reply}</td>
    </tr>
  `;
}

function attachFilters(tableSelector, statusBtnSelector, tierBtnSelector) {
  const table = document.querySelector(tableSelector);
  if (!table) return;
  const state = { status: 'all', tier: 'all' };
  function apply() {
    table.querySelectorAll('tbody tr').forEach(tr => {
      const okStatus = state.status === 'all' || tr.dataset.status === state.status;
      const okTier = state.tier === 'all' || tr.dataset.tier === state.tier;
      tr.style.display = (okStatus && okTier) ? '' : 'none';
    });
  }
  document.querySelectorAll(statusBtnSelector).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(statusBtnSelector).forEach(b => b.classList.remove('active', 'neutral'));
      btn.classList.add('active', 'neutral');
      state.status = btn.dataset.status;
      apply();
    });
  });
  document.querySelectorAll(tierBtnSelector).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(tierBtnSelector).forEach(b => b.classList.remove('active', 'neutral'));
      btn.classList.add('active', 'neutral');
      state.tier = btn.dataset.tier;
      apply();
    });
  });
}
