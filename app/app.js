'use strict';

/* Leonida Legend — GTA VI trophy guide & platinum tracker.
   Loads the official 55-trophy set from data/trophies.json, renders a
   checklist that persists in localStorage, and offers filters, a spoiler
   shield for story trophies, per-trophy guides and export/import. */

const STORAGE_KEY = 'leonida-legend-earned-v1';
const KIND_LABELS = {
  story: 'Story',
  activities: 'Activities',
  world: 'World',
  collectibles: 'Collectibles',
  money: 'Money',
  platinum: 'Platinum'
};

let trophies = [];
let earned = loadEarned();
let activeKind = 'all';

const els = {
  list: document.getElementById('list'),
  emptyMsg: document.getElementById('emptyMsg'),
  progressText: document.getElementById('progressText'),
  progressBar: document.getElementById('progressBar'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('gradeFilter'),
  statusFilter: document.getElementById('statusFilter'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  kindChips: document.getElementById('kindChips'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  resetBtn: document.getElementById('resetBtn'),
  dialog: document.getElementById('guideDialog'),
  dlgName: document.getElementById('dlgName'),
  dlgBadges: document.getElementById('dlgBadges'),
  dlgDesc: document.getElementById('dlgDesc'),
  dlgGuide: document.getElementById('dlgGuide'),
  dlgClose: document.getElementById('dlgClose')
};

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
}

function earnedCount() {
  return trophies.filter(t => earned[t.id]).length;
}

function updateProgress() {
  const n = earnedCount();
  els.progressText.textContent = n + ' / ' + trophies.length + ' earned';
  els.progressBar.style.width = (trophies.length ? (n / trophies.length) * 100 : 0) + '%';
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function storyHidden(t) {
  return els.spoilerToggle.checked && t.kind === 'story' && !earned[t.id];
}

function matchesFilters(t) {
  if (activeKind !== 'all' && t.kind !== activeKind) return false;
  if (els.gradeFilter.value !== 'all' && t.grade !== els.gradeFilter.value) return false;
  const status = els.statusFilter.value;
  if (status === 'earned' && !earned[t.id]) return false;
  if (status === 'unearned' && earned[t.id]) return false;
  if (status === 'watch' && !t.missable) return false;
  const q = els.search.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  return true;
}

function render() {
  els.list.innerHTML = '';
  let visible = 0;
  for (const t of trophies) {
    if (!matchesFilters(t)) continue;
    visible++;
    els.list.appendChild(cardFor(t));
  }
  els.emptyMsg.style.display = visible ? 'none' : 'block';
  updateProgress();
}

function cardFor(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned[t.id] ? ' earned' : '');
  card.id = 'trophy-' + t.id;

  const top = document.createElement('div');
  top.className = 'top';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = !!earned[t.id];
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned[t.id] = true; else delete earned[t.id];
    saveEarned();
    render();
  });

  const title = document.createElement('h3');
  title.textContent = t.name;

  top.appendChild(box);
  top.appendChild(title);
  card.appendChild(top);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.appendChild(badge(t.grade, t.grade));
  badges.appendChild(badge(KIND_LABELS[t.kind] || t.kind, ''));
  if (t.missable) badges.appendChild(badge('Watch-out', 'watch'));
  card.appendChild(badges);

  const desc = document.createElement('p');
  if (storyHidden(t)) {
    desc.className = 'hidden-note';
    desc.textContent = 'Story trophy — hidden by spoiler setting';
  } else {
    desc.className = 'desc';
    desc.textContent = t.description;
  }
  card.appendChild(desc);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'guide-btn';
  btn.textContent = 'Guide';
  btn.addEventListener('click', () => openGuide(t));
  card.appendChild(btn);

  return card;
}

function openGuide(t) {
  els.dlgName.textContent = t.name;
  els.dlgBadges.innerHTML = '';
  els.dlgBadges.appendChild(badge(t.grade, t.grade));
  els.dlgBadges.appendChild(badge(KIND_LABELS[t.kind] || t.kind, ''));
  if (t.missable) els.dlgBadges.appendChild(badge('Watch-out', 'watch'));
  els.dlgDesc.textContent = t.description;
  els.dlgGuide.textContent = t.guide;
  if (typeof els.dialog.showModal === 'function') els.dialog.showModal();
  else els.dialog.setAttribute('open', '');
}

function closeGuide() {
  if (typeof els.dialog.close === 'function') els.dialog.close();
  else els.dialog.removeAttribute('open');
}

/* ---- URL parameters (used for deep links and screenshots) ---- */

function applyParams() {
  const params = new URLSearchParams(window.location.search);

  const earnedParam = params.get('earned');
  if (earnedParam) {
    earned = {};
    for (const part of earnedParam.split(',')) {
      const id = parseInt(part, 10);
      if (!Number.isNaN(id)) earned[id] = true;
    }
    saveEarned();
  }

  if (params.get('spoiler') === 'off') els.spoilerToggle.checked = false;

  const kind = params.get('kind');
  if (kind && (kind === 'all' || KIND_LABELS[kind])) {
    activeKind = kind;
    for (const chip of els.kindChips.querySelectorAll('.chip')) {
      chip.classList.toggle('active', chip.dataset.kind === kind);
    }
  }

  const q = params.get('q');
  if (q) els.search.value = q;

  render();

  if (params.get('view') === 'roadmap') {
    const rm = document.getElementById('roadmap');
    if (rm) rm.scrollIntoView();
  }

  const focus = params.get('focus');
  if (focus) {
    const el = document.getElementById('trophy-' + focus);
    if (el) {
      el.classList.add('focused');
      el.scrollIntoView({ block: 'center' });
    }
  }

  const open = params.get('open');
  if (open) {
    const t = trophies.find(x => x.id === parseInt(open, 10));
    if (t) openGuide(t);
  }
}

/* ---- Wiring ---- */

els.search.addEventListener('input', render);
els.gradeFilter.addEventListener('change', render);
els.statusFilter.addEventListener('change', render);
els.spoilerToggle.addEventListener('change', render);

els.kindChips.addEventListener('click', ev => {
  const chip = ev.target.closest('.chip');
  if (!chip) return;
  activeKind = chip.dataset.kind;
  for (const c of els.kindChips.querySelectorAll('.chip')) {
    c.classList.toggle('active', c === chip);
  }
  render();
});

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(earned, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

els.importFile.addEventListener('change', () => {
  const file = els.importFile.files && els.importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (parsed && typeof parsed === 'object') {
        earned = parsed;
        saveEarned();
        render();
      }
    } catch (err) {
      alert('That file could not be read as a progress file.');
    }
    els.importFile.value = '';
  };
  reader.readAsText(file);
});

els.resetBtn.addEventListener('click', () => {
  if (confirm('Reset the checklist? All earned marks will be cleared.')) {
    earned = {};
    saveEarned();
    render();
  }
});

els.dlgClose.addEventListener('click', closeGuide);
els.dialog.addEventListener('click', ev => {
  if (ev.target === els.dialog) closeGuide();
});

/* ---- Boot ---- */

fetch('data/trophies.json')
  .then(res => res.json())
  .then(data => {
    trophies = Array.isArray(data) ? data : [];
    applyParams();
  })
  .catch(() => {
    els.emptyMsg.textContent = 'The trophy data could not be loaded.';
    els.emptyMsg.style.display = 'block';
  });
