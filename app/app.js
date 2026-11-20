// Leonida Legend — offline GTA VI trophy tracker and guide.
// Progress is a set of earned trophy ids in localStorage; guides come from data/trophies.json.
const STORAGE_KEY = 'leonida-legend-earned-v1';
const params = new URLSearchParams(location.search);
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilerEl = document.getElementById('spoiler');

function loadSavedEarnedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function parseIdList(text) {
  return String(text ?? '').split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
}
// Screenshot-only state from the URL: shown as earned, never written to localStorage.
const paramEarnedIds = new Set(parseIdList(params.get('earned')));
const savedEarnedIds = loadSavedEarnedIds();
const displayEarnedIds = new Set([...savedEarnedIds, ...paramEarnedIds]);
const openGuideIds = new Set(parseIdList(params.get('open')));
const focusId = Number(params.get('focus') ?? 0) || null;

function saveEarnedIds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedEarnedIds]));
}
function trophyMatchesFilters(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !`${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase().includes(q)) return false;
  if (kindEl.value === 'missable' && !trophy.missable) return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && trophy.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !displayEarnedIds.has(trophy.id)) return false;
  if (statusEl.value === 'not' && displayEarnedIds.has(trophy.id)) return false;
  return true;
}
function isHiddenBySpoiler(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !displayEarnedIds.has(trophy.id);
}
function buildSourceLine(trophy) {
  const wrap = document.createElement('p');
  wrap.className = 'sources';
  wrap.textContent = `Sources: ${trophy.sources.join(' · ')} — list sites: `;
  const exo = document.createElement('a');
  exo.href = 'https://www.exophase.com'; exo.textContent = 'exophase.com';
  const psn = document.createElement('a');
  psn.href = 'https://psnprofiles.com'; psn.textContent = 'psnprofiles.com';
  wrap.append(exo, document.createTextNode(' · '), psn);
  return wrap;
}
function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card';
  card.id = `trophy-${trophy.id}`;
  const hidden = isHiddenBySpoiler(trophy);
  const top = document.createElement('div');
  top.className = 'card-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earned-box';
  box.checked = displayEarnedIds.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) { displayEarnedIds.add(trophy.id); savedEarnedIds.add(trophy.id); }
    else { displayEarnedIds.delete(trophy.id); savedEarnedIds.delete(trophy.id); paramEarnedIds.delete(trophy.id); }
    saveEarnedIds();
    renderTrophyList();
  });
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden trophy — complete the story to reveal' : trophy.name;
  const badge = document.createElement('span');
  badge.className = `badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade.toUpperCase();
  top.append(box, title, badge);
  card.append(top);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Hidden trophy — its name and description stay concealed while spoiler mode is on, until you earn it.' : trophy.description;
  card.append(desc);
  const tags = document.createElement('p');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag missable';
    flag.textContent = '⚑ WATCH-OUT — do it when you see it';
    tags.append(flag);
  }
  card.append(tags);
  if (!hidden) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    const guideBox = document.createElement('div');
    guideBox.className = 'guide';
    const expanded = openGuideIds.has(trophy.id);
    guideBox.hidden = !expanded;
    toggle.textContent = expanded ? 'Hide guide' : 'Guide & sources';
    toggle.addEventListener('click', () => {
      guideBox.hidden = !guideBox.hidden;
      toggle.textContent = guideBox.hidden ? 'Guide & sources' : 'Hide guide';
    });
    const guideText = document.createElement('p');
    guideText.textContent = trophy.guide;
    guideBox.append(guideText);
    if (trophy.missable && trophy.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-note';
      note.textContent = trophy.missableNote;
      guideBox.append(note);
    }
    guideBox.append(buildSourceLine(trophy));
    card.append(toggle, guideBox);
  }
  return card;
}
function renderProgress(trophies) {
  const total = trophies.length;
  const done = trophies.filter((t) => displayEarnedIds.has(t.id)).length;
  document.getElementById('progress').textContent = `${done} of ${total} earned — ${Math.round((done / total) * 100)}% of the way to the platinum`;
  document.getElementById('bar-fill').style.width = `${(done / total) * 100}%`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('grade-counts').textContent = grades.map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => displayEarnedIds.has(t.id)).length;
    return `${g}: ${got}/${all.length}`;
  }).join('  ·  ');
}
let allTrophies = [];
function renderTrophyList() {
  const shown = allTrophies.filter(trophyMatchesFilters);
  listEl.replaceChildren(...shown.map(buildTrophyCard));
  document.getElementById('showing').textContent = `Showing ${shown.length} of ${allTrophies.length} trophies`;
  renderProgress(allTrophies);
}
function exportProgress() {
  const blob = new Blob([JSON.stringify([...savedEarnedIds].sort((a, b) => a - b))], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
async function importProgress(file) {
  const data = JSON.parse(await file.text());
  const ids = Array.isArray(data) ? data : data.earned ?? data.ids ?? [];
  savedEarnedIds.clear(); displayEarnedIds.clear();
  for (const item of ids) {
    const trophy = typeof item === 'number' ? allTrophies.find((t) => t.id === item) : allTrophies.find((t) => t.name === item);
    if (trophy) { savedEarnedIds.add(trophy.id); displayEarnedIds.add(trophy.id); }
  }
  saveEarnedIds();
  renderTrophyList();
}
function applyUrlParams() {
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('q')) searchEl.value = params.get('q');
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (params.get('view') === 'roadmap') document.body.classList.add('roadmap-view');
}
function scrollToRequestedView() {
  if (params.get('view') === 'roadmap') document.getElementById('roadmap').scrollIntoView();
  else if (focusId) document.getElementById(`trophy-${focusId}`)?.scrollIntoView();
}

const trophyData = await (await fetch('data/trophies.json')).json();
allTrophies = trophyData.trophies;
applyUrlParams();
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
document.getElementById('reset').addEventListener('click', () => {
  savedEarnedIds.clear(); displayEarnedIds.clear(); paramEarnedIds.clear();
  saveEarnedIds(); renderTrophyList();
});
for (const el of [searchEl, kindEl, gradeEl, statusEl, spoilerEl]) el.addEventListener('change', renderTrophyList);
searchEl.addEventListener('input', renderTrophyList);
renderTrophyList();
scrollToRequestedView();
