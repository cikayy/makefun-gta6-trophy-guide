// Leonida Legend — tracker logic.
// Everything runs locally: the trophy data is fetched from a relative path,
// progress lives in localStorage, and nothing leaves the browser.

const STORAGE_KEY = 'leonida-legend-earned-v1';

const state = {
  trophies: [],
  earned: loadEarned(),
  query: '',
  kind: 'all',
  grade: 'all',
  status: 'all',
  spoiler: true,
};

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.earned));
}

const els = {
  list: document.getElementById('trophy-list'),
  progressText: document.getElementById('progress-text'),
  progressBar: document.getElementById('progress-bar'),
  search: document.getElementById('search'),
  chips: document.getElementById('kind-chips'),
  grade: document.getElementById('grade-filter'),
  status: document.getElementById('status-filter'),
  spoiler: document.getElementById('spoiler-toggle'),
  resultCount: document.getElementById('result-count'),
  emptyNote: document.getElementById('empty-note'),
  dialog: document.getElementById('guide-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogMeta: document.getElementById('dialog-meta'),
  dialogDescription: document.getElementById('dialog-description'),
  dialogGuide: document.getElementById('dialog-guide'),
};

function isEarned(t) {
  return state.earned[t.id] === true;
}

// A story trophy's text is hidden while spoiler mode is on and the player
// has not earned it yet — the description itself would give the story away.
function isHidden(t) {
  return state.spoiler && t.kind === 'story' && !isEarned(t);
}

function matches(t) {
  if (state.kind !== 'all' && t.kind !== state.kind) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.status === 'earned' && !isEarned(t)) return false;
  if (state.status === 'unearned' && isEarned(t)) return false;
  if (state.status === 'watchout' && !t.missable) return false;
  if (state.query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(state.query.toLowerCase())) return false;
  }
  return true;
}

function render() {
  const visible = state.trophies.filter(matches);
  els.list.innerHTML = '';
  for (const t of visible) els.list.appendChild(cardFor(t));
  els.emptyNote.hidden = visible.length !== 0;
  els.resultCount.textContent = `Showing ${visible.length} of ${state.trophies.length} trophies`;

  const done = state.trophies.filter(isEarned).length;
  els.progressText.textContent = `${done} / ${state.trophies.length} earned`;
  els.progressBar.style.width = `${state.trophies.length ? (done / state.trophies.length) * 100 : 0}%`;
}

function cardFor(t) {
  const card = document.createElement('article');
  card.className = 'card' + (isEarned(t) ? ' earned' : '');
  card.dataset.id = String(t.id);

  const top = document.createElement('div');
  top.className = 'card-top';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned[t.id] = true;
    else delete state.earned[t.id];
    saveEarned();
    render();
  });

  const name = document.createElement('p');
  name.className = 'card-name';
  name.textContent = t.name;

  top.append(box, name);
  card.appendChild(top);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const grade = document.createElement('span');
  grade.className = `badge grade-${t.grade}`;
  grade.textContent = t.grade;
  const kind = document.createElement('span');
  kind.className = 'badge';
  kind.textContent = t.kind;
  badges.append(grade, kind);
  if (t.missable) {
    const w = document.createElement('span');
    w.className = 'badge watchout';
    w.textContent = 'Watch-out';
    badges.appendChild(w);
  }
  card.appendChild(badges);

  const desc = document.createElement('p');
  if (isHidden(t)) {
    desc.className = 'card-desc hidden-desc';
    desc.textContent = 'Story trophy — hidden by spoiler setting';
  } else {
    desc.className = 'card-desc';
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
  els.dialogTitle.textContent = t.name;
  const bits = [`${t.grade} · ${t.kind}`];
  if (t.missable) bits.push('watch-out');
  bits.push(isEarned(t) ? 'earned' : 'not earned');
  els.dialogMeta.textContent = bits.join(' · ');
  els.dialogDescription.textContent = isHidden(t)
    ? 'Story trophy — hidden by spoiler setting'
    : t.description;
  els.dialogGuide.textContent = t.guide;
  if (typeof els.dialog.showModal === 'function') els.dialog.showModal();
  else els.dialog.setAttribute('open', '');
}

document.getElementById('dialog-close').addEventListener('click', () => els.dialog.close());

// ---- Controls ------------------------------------------------------------

els.search.addEventListener('input', () => {
  state.query = els.search.value.trim();
  render();
});

els.chips.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.chip');
  if (!btn) return;
  setKind(btn.dataset.kind);
});

function setKind(kind) {
  state.kind = kind;
  for (const chip of els.chips.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.kind === kind);
  }
  render();
}

els.grade.addEventListener('change', () => {
  state.grade = els.grade.value;
  render();
});

els.status.addEventListener('change', () => {
  state.status = els.status.value;
  render();
});

els.spoiler.addEventListener('change', () => {
  state.spoiler = els.spoiler.checked;
  render();
});

// ---- Export / import / reset ----------------------------------------------

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state.earned, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(url);
});

const importFile = document.getElementById('import-file');
document.getElementById('import-btn').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad file');
    const clean = {};
    for (const [k, v] of Object.entries(parsed)) if (v === true) clean[k] = true;
    state.earned = clean;
    saveEarned();
    render();
  } catch {
    alert('That file is not a Leonida Legend progress export.');
  }
  importFile.value = '';
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies and start over?')) return;
  state.earned = {};
  saveEarned();
  render();
});

// ---- Screenshot / deep-link parameters -------------------------------------
// ?view=roadmap, ?kind=<kind>, ?open=<id>, ?focus=<id>, ?spoiler=off,
// ?earned=<comma ids>, ?q=<text>

function applyParams() {
  const p = new URLSearchParams(location.search);

  if (p.get('spoiler') === 'off') {
    state.spoiler = false;
    els.spoiler.checked = false;
  }
  if (p.has('earned')) {
    for (const part of p.get('earned').split(',')) {
      const id = Number(part.trim());
      if (Number.isInteger(id) && id > 0) state.earned[id] = true;
    }
    saveEarned();
  }
  if (p.has('q')) {
    state.query = p.get('q');
    els.search.value = state.query;
  }
  if (p.has('kind')) setKind(p.get('kind'));
  render();

  if (p.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
  if (p.has('focus')) {
    const card = els.list.querySelector(`.card[data-id="${p.get('focus')}"]`);
    if (card) {
      card.classList.add('focused');
      card.scrollIntoView({ block: 'center' });
    }
  }
  if (p.has('open')) {
    const t = state.trophies.find((x) => x.id === Number(p.get('open')));
    if (t) openGuide(t);
  }
}

// ---- Boot -------------------------------------------------------------------

fetch('data/trophies.json')
  .then((r) => {
    if (!r.ok) throw new Error(`trophies.json: HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    state.trophies = data;
    render();
    applyParams();
  })
  .catch((err) => {
    els.resultCount.textContent = `Could not load the trophy data (${err.message}). Serve this folder over HTTP — file:// blocks the data fetch.`;
  });
