/* ============================================================
   Star Readers — app engine
   Content lives in content.js. This file has the login
   (student profiles + parent PIN), all activity screens, and
   the parent dashboard with progress + speech report.
   Everything is stored on-device (localStorage). Private by
   default; only the optional speech Auto-check sends audio out.
   ============================================================ */

/* ============================================================
   1. STORAGE: root (profiles + PIN) and per-profile progress
   ============================================================ */
const ROOT_KEY = "starReaders.root";
let root = loadRoot();
let activeId = null;
let store = null; // active profile's progress (set on login)

function profileKey(id) { return "starReaders.p." + id; }
function freshStore() {
  return {
    stars: 0, mode: "game", speechMode: "private", theme: "default",
    doneLetters: {}, doneWords: {}, doneSpeech: {}, themeProgress: {},
    typing: { bestWpm: 0, bestAcc: 0, rounds: 0 },
    games: { played: 0, bestStreak: 0 },
    speechLog: [],
    writing: { traced: {}, dictOk: 0, dictTries: 0 },
    lang: { wh: 0, missing: 0, seq: 0 },
    vocab: {}, reading: {},
  };
}
function loadRoot() {
  try { const r = JSON.parse(localStorage.getItem(ROOT_KEY)); if (r && r.profiles) return r; } catch (e) {}
  // Migrate a pre-profiles save into a first profile so progress isn't lost.
  const rootObj = { pin: "", profiles: [], activeId: null };
  try {
    const legacy = localStorage.getItem("starReaders.v2");
    if (legacy) {
      const id = "p1";
      rootObj.profiles.push({ id, name: "Star", avatar: "⭐" });
      if (!localStorage.getItem(profileKey(id))) localStorage.setItem(profileKey(id), legacy);
    }
  } catch (e) {}
  return rootObj;
}
function saveRoot() { try { localStorage.setItem(ROOT_KEY, JSON.stringify(root)); } catch (e) {} }
function loadProfileStore(id) {
  try { const s = JSON.parse(localStorage.getItem(profileKey(id))); if (s) return Object.assign(freshStore(), s); } catch (e) {}
  return freshStore();
}
function saveStore() { if (activeId) { try { localStorage.setItem(profileKey(activeId), JSON.stringify(store)); } catch (e) {} } }
function nextProfileId() {
  const nums = root.profiles.map(p => parseInt(String(p.id).replace(/\D/g, ""), 10) || 0);
  return "p" + ((nums.length ? Math.max(...nums) : 0) + 1);
}
function addStar(n = 1) {
  store.stars += n;
  const t = store.theme || "default";
  store.themeProgress[t] = (store.themeProgress[t] || 0) + n;
  saveStore(); renderStarCount();
}

/* ============================================================
   2. VOICE: text-to-speech + optional recognition
   ============================================================ */
let voice = null;
function pickVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  voice = voices.find(v => /^en/i.test(v.lang) && /female|samantha|karen|moira|tessa|kids?/i.test(v.name)) ||
          voices.find(v => /^en/i.test(v.lang)) || voices[0] || null;
}
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice; u.rate = rate; u.pitch = 1.05;
  speechSynthesis.speak(u);
}
function soundOut(word) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  word.split("").forEach(ch => {
    const info = LETTERS.find(x => x.L === ch.toLowerCase());
    const u = new SpeechSynthesisUtterance(info ? info.sound : ch);
    if (voice) u.voice = voice; u.rate = 0.7; speechSynthesis.speak(u);
  });
  const whole = new SpeechSynthesisUtterance(word);
  if (voice) whole.voice = voice; whole.rate = 0.8; speechSynthesis.speak(whole);
}
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const AUTO_SPEECH_SUPPORTED = !!SpeechRec;

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return d[m][n];
}
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim(); }

/* ============================================================
   3. ROUTER + TOP BAR
   ============================================================ */
const screenEl = document.getElementById("screen");
const backBtn = document.getElementById("backBtn");
const titleEl = document.getElementById("title");
const profileChip = document.getElementById("profileChip");
const parentBtn = document.getElementById("parentBtn");
const starCountEl = document.getElementById("starCount");
let backTarget = null;

backBtn.addEventListener("click", () => { stopEverything(); if (backTarget) backTarget(); });
parentBtn.addEventListener("click", () => { stopEverything(); parentGate(); });
profileChip.addEventListener("click", () => { stopEverything(); showProfilePicker(); });

function setBack(fn) { backTarget = fn; backBtn.hidden = !fn; }
function renderStarCount() { document.getElementById("starNum").textContent = store ? store.stars : 0; }
function applyTheme() { document.documentElement.setAttribute("data-theme", (store && store.theme) || "default"); }

/* Show login chrome vs in-app chrome. */
function showLoginChrome() {
  titleEl.hidden = false; profileChip.hidden = true;
  starCountEl.hidden = true; parentBtn.hidden = true; backBtn.hidden = true;
  document.documentElement.setAttribute("data-theme", "default");
}
function showAppChrome() {
  const p = root.profiles.find(x => x.id === activeId);
  titleEl.hidden = true; profileChip.hidden = false;
  document.getElementById("pfAvatar").textContent = p ? p.avatar : "🙂";
  document.getElementById("pfName").textContent = p ? p.name : "";
  starCountEl.hidden = false; parentBtn.hidden = false;
  renderStarCount(); applyTheme();
}

let mediaRecorder = null, recChunks = [], recordedUrl = null, recordedBlob = null, activeRecognition = null, roundTimer = null;
function stopEverything() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  stopRecorderTracks();
  if (activeRecognition) { try { activeRecognition.abort(); } catch (e) {} activeRecognition = null; }
  if (roundTimer) { clearInterval(roundTimer); roundTimer = null; }
}

/* ============================================================
   4. LOGIN — profile picker + create profile
   ============================================================ */
function start() {
  if (!root.profiles.length) return showCreateProfile(true);
  showProfilePicker();
}
function showProfilePicker() {
  activeId = null; store = null;
  showLoginChrome();
  setBack(null);
  const cards = root.profiles.map(p => `
    <div class="profile-card" data-id="${p.id}">
      <div class="pa">${p.avatar}</div>
      <div class="pn">${escapeHtml(p.name)}</div>
    </div>`).join("");
  screenEl.innerHTML = `
    <h2 class="section-title center">Who's playing? 👋</h2>
    <div class="profile-grid">
      ${cards}
      <div class="profile-card add" id="addProfile">
        <div class="pa">➕</div><div class="pn">Add</div>
      </div>
    </div>
    <div class="btn-row" style="margin-top:26px">
      <button class="btn grey" id="parentEntry">🔒 Parent area</button>
    </div>
    <p class="note">Each player has their own stars and progress, saved on this device.</p>`;
  screenEl.querySelectorAll(".profile-card[data-id]").forEach(c =>
    c.addEventListener("click", () => selectProfile(c.dataset.id)));
  document.getElementById("addProfile").onclick = () => showCreateProfile(false);
  document.getElementById("parentEntry").onclick = () => parentGate();
}
function selectProfile(id) {
  activeId = id; root.activeId = id; saveRoot();
  store = loadProfileStore(id);
  showAppChrome();
  showHome();
}
function showCreateProfile(first) {
  showLoginChrome();
  setBack(first ? null : showProfilePicker);
  let chosen = AVATARS[0];
  screenEl.innerHTML = `
    <h2 class="section-title center">${first ? "Welcome! Make a player 🎉" : "New player"}</h2>
    <div class="stage">
      <div class="big-emoji" id="avPreview">${chosen}</div>
      <input id="pName" class="type-in" maxlength="14" placeholder="name" autocomplete="off" />
      <p class="section-sub center" style="margin-top:14px">Pick a buddy:</p>
      <div class="avatar-grid">
        ${AVATARS.map(a => `<button class="av ${a === chosen ? "on" : ""}" data-a="${a}">${a}</button>`).join("")}
      </div>
      <div class="btn-row">
        <button class="btn green" id="createBtn">✅ Start playing</button>
      </div>
    </div>`;
  const preview = document.getElementById("avPreview");
  screenEl.querySelectorAll(".av").forEach(b => b.onclick = () => {
    chosen = b.dataset.a; preview.textContent = chosen;
    screenEl.querySelectorAll(".av").forEach(x => x.classList.toggle("on", x === b));
  });
  document.getElementById("createBtn").onclick = () => {
    const name = document.getElementById("pName").value.trim() || "Player";
    const id = nextProfileId();
    root.profiles.push({ id, name, avatar: chosen });
    saveRoot();
    localStorage.setItem(profileKey(id), JSON.stringify(freshStore()));
    selectProfile(id);
  };
  document.getElementById("pName").focus();
}

/* ============================================================
   5. HOME (per player)
   ============================================================ */
function themeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
function mascotStage(themeId) {
  const t = themeById(themeId);
  const p = (store.themeProgress && store.themeProgress[themeId]) || 0;
  return t.stages[Math.min(t.stages.length - 1, Math.floor(p / 8))];
}
function showHome() {
  stopEverything(); setBack(null); showAppChrome();
  const t = themeById(store.theme);
  const isGame = store.mode === "game";
  screenEl.innerHTML = `
    <div class="mode-switch" role="tablist">
      <button class="ms ${isGame ? "on" : ""}" data-mode="game">🎮 Game</button>
      <button class="ms ${!isGame ? "on" : ""}" data-mode="study">📚 Study</button>
    </div>
    <div class="pet-banner">
      <div class="pet">${mascotStage(store.theme)}</div>
      <div class="pet-info">
        <div class="pet-name">${t.name} buddy</div>
        <div class="pet-sub">Earn ⭐ to help it grow!</div>
      </div>
      <div class="pet-stars">⭐ ${store.stars}</div>
    </div>
    <div class="menu-grid">
      <div class="menu-card c4" data-go="speak">
        <div class="emoji">🎤</div><div class="label">Say It Clearly</div>
        <div class="sub">Words &amp; sentences</div></div>
      <div class="menu-card c3" data-go="write">
        <div class="emoji">✍️</div><div class="label">Writing</div>
        <div class="sub">Trace &amp; spell</div></div>
      <div class="menu-card c1" data-go="letters">
        <div class="emoji">${isGame ? "🎯" : "🔤"}</div>
        <div class="label">${isGame ? "Letter Pop" : "Letters"}</div>
        <div class="sub">${isGame ? "Hear it, tap it!" : "Sounds"}</div></div>
      <div class="menu-card c2" data-go="words">
        <div class="emoji">${isGame ? "🃏" : "📖"}</div>
        <div class="label">${isGame ? "Word Match" : "Read Words"}</div>
        <div class="sub">${isGame ? "Pick the word" : "Sound out"}</div></div>
      <div class="menu-card c6" data-go="read">
        <div class="emoji">📖</div><div class="label">Reading</div>
        <div class="sub">Words · levels · stories</div></div>
      <div class="menu-card c5" data-go="lang">
        <div class="emoji">🧩</div><div class="label">Language</div>
        <div class="sub">Questions &amp; more</div></div>
      <div class="menu-card c6" data-go="themes">
        <div class="emoji">🎨</div><div class="label">Themes</div>
        <div class="sub">Unlock buddies</div></div>
    </div>
    <p class="note">${isGame
      ? "Game mode: quick rounds and stars. Tap Study to slow down."
      : "Study mode: calm practice with audio and hints."}</p>`;
  screenEl.querySelectorAll(".ms").forEach(b => b.addEventListener("click", () => {
    store.mode = b.dataset.mode; saveStore(); showHome();
  }));
  screenEl.querySelectorAll(".menu-card").forEach(c => c.addEventListener("click", () => {
    const go = c.dataset.go;
    if (go === "speak")   speakMenu();
    if (go === "write")   writeMenu();
    if (go === "letters") isGame ? gameLetterPop() : showLetterPicker();
    if (go === "words")   isGame ? gameWordMatch() : showWordSetPicker();
    if (go === "read")    readingHub();
    if (go === "lang")    langMenu();
    if (go === "themes")  showThemes();
  }));
}

/* Generic submenu builder */
function submenu(title, sub, items, back) {
  setBack(back);
  screenEl.innerHTML = `
    <h2 class="section-title">${title}</h2>
    <p class="section-sub">${sub}</p>
    <div class="menu-grid">
      ${items.map((it, i) => `<div class="menu-card c${(i % 6) + 1}" data-i="${i}">
        <div class="emoji">${it.emoji}</div><div class="label">${it.label}</div>
        <div class="sub">${it.sub || ""}</div></div>`).join("")}
    </div>`;
  screenEl.querySelectorAll(".menu-card").forEach(c =>
    c.addEventListener("click", () => items[Number(c.dataset.i)].go()));
}
function speakMenu() {
  submenu("Say It Clearly 🎤", "Practice speaking, then check how it sounds.", [
    { emoji: "🔤", label: "Words", sub: "One word at a time", go: () => speechList(SPEECH_WORDS, false, 0) },
    { emoji: "💬", label: "Sentences", sub: "Speak in full", go: () => speechList(SENTENCES, true, 0) },
  ], showHome);
}
function writeMenu() {
  submenu("Writing ✍️", "Trace letters and words, then spell what you hear.", [
    { emoji: "✏️", label: "Tracing", sub: "Letters & words", go: () => traceScreen(0) },
    { emoji: "👂", label: "Dictation", sub: "Write what you hear", go: () => dictation(0) },
  ], showHome);
}
function langMenu() {
  submenu("Language 🧩", "Questions, memory, and putting things in order.", [
    { emoji: "❓", label: "WH Questions", sub: "Who / Where / Why / When", go: whGame },
    { emoji: "🔍", label: "What's Missing", sub: "Spot the missing one", go: missingGame },
    { emoji: "🔢", label: "Sequencing", sub: "Put it in order", go: () => seqGame(0) },
  ], showHome);
}

/* ============================================================
   6. LETTERS (study + game) and WORDS (study + game)
   ============================================================ */
function colourWord(word) { return word.split("").map((ch, i) => `<span class="l${i % 5}">${ch}</span>`).join(""); }

function showLetterPicker() {
  setBack(showHome);
  const cells = LETTERS.map((it, i) => `
    <div class="pick ${store.doneLetters[it.L] ? "done" : ""}" data-i="${i}">
      <div class="pe">${it.emoji}</div><div class="pl">${it.L.toUpperCase()}${it.L}</div>
      <div class="star">${store.doneLetters[it.L] ? "⭐" : "&nbsp;"}</div></div>`).join("");
  screenEl.innerHTML = `<h2 class="section-title">Letters &amp; Sounds</h2>
    <p class="section-sub">Pick a letter.</p><div class="pick-grid">${cells}</div>`;
  screenEl.querySelectorAll(".pick").forEach(p => p.addEventListener("click", () => showLetter(Number(p.dataset.i))));
}
function showLetter(i) {
  setBack(showLetterPicker);
  const it = LETTERS[i];
  screenEl.innerHTML = `
    <div class="stage">
      <div class="big-letter">${it.L.toUpperCase()}${it.L}</div>
      <div class="big-emoji">${it.emoji}</div>
      <div class="hint"><b>${it.L}</b> says “${it.sound}” — like <b>${it.word}</b></div>
      <div class="btn-row">
        <button class="btn blue" id="saySound">🔊 Sound</button>
        <button class="btn green" id="sayWord">🔊 ${it.word}</button>
        <button class="btn orange" id="gotIt">⭐ I got it!</button></div></div>
    <div class="nav-row">
      <button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${i + 1} / ${LETTERS.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  document.getElementById("saySound").onclick = () => speak(it.sound, 0.7);
  document.getElementById("sayWord").onclick = () => speak(it.word);
  document.getElementById("gotIt").onclick = () => {
    if (!store.doneLetters[it.L]) { store.doneLetters[it.L] = true; addStar(1); } saveStore(); celebrate();
  };
  document.getElementById("prev").onclick = () => showLetter((i - 1 + LETTERS.length) % LETTERS.length);
  document.getElementById("next").onclick = () => showLetter((i + 1) % LETTERS.length);
  speak(it.sound, 0.7);
}
function showWordSetPicker() {
  setBack(showHome);
  const cards = WORD_SETS.map(s => {
    const done = s.words.filter(w => store.doneWords[s.id + ":" + w.w]).length;
    return `<div class="menu-card c2" data-id="${s.id}"><div class="emoji">${s.emoji}</div>
      <div class="label">${s.title}</div><div class="sub">${done}/${s.words.length} ⭐</div></div>`;
  }).join("");
  screenEl.innerHTML = `<h2 class="section-title">Read Words</h2>
    <p class="section-sub">Pick a group.</p><div class="menu-grid">${cards}</div>`;
  screenEl.querySelectorAll(".menu-card").forEach(c => c.addEventListener("click", () => showWord(c.dataset.id, 0)));
}
function showWord(setId, i) {
  const set = WORD_SETS.find(s => s.id === setId);
  setBack(showWordSetPicker);
  const it = set.words[i], key = setId + ":" + it.w;
  screenEl.innerHTML = `
    <div class="stage"><div class="big-emoji">${pictureHTML(it.w, it.e)}</div>
      <div class="big-word">${colourWord(it.w)}</div>
      <div class="hint">${store.doneWords[key] ? "⭐ You read this!" : "Can you read it?"}</div>
      <div class="btn-row">
        <button class="btn blue" id="sound">🐢 Sound it out</button>
        <button class="btn green" id="whole">🔊 Say it</button>
        <button class="btn orange" id="gotIt">⭐ I read it!</button></div></div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${i + 1} / ${set.words.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  document.getElementById("sound").onclick = () => soundOut(it.w);
  document.getElementById("whole").onclick = () => speak(it.w);
  document.getElementById("gotIt").onclick = () => {
    if (!store.doneWords[key]) { store.doneWords[key] = true; addStar(1); } saveStore(); celebrate();
  };
  document.getElementById("prev").onclick = () => showWord(setId, (i - 1 + set.words.length) % set.words.length);
  document.getElementById("next").onclick = () => showWord(setId, (i + 1) % set.words.length);
}

/* ============================================================
   7. GAME rounds: Letter Pop, Word Match
   ============================================================ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function finishRound({ title, correct, total, starsEarned, streak, extra = "", again }) {
  stopEverything();
  store.games.played += 1;
  if (streak > (store.games.bestStreak || 0)) store.games.bestStreak = streak;
  addStar(starsEarned); saveStore();
  screenEl.innerHTML = `
    <div class="stage"><div class="big-emoji">🏁</div>
      <div class="big-letter" style="font-size:64px">${starsEarned} ⭐</div>
      <div class="hint">${title}: ${correct} / ${total} correct${streak ? ` · best streak ${streak}` : ""}</div>
      ${extra}
      <div class="btn-row">
        <button class="btn green" id="again">🔁 Play again</button>
        <button class="btn grey" id="home">🏠 Home</button></div></div>`;
  document.getElementById("home").onclick = showHome;
  document.getElementById("again").onclick = again;
}
function choiceRound({ items, prompt, render, back, again, title, label }) {
  setBack(back);
  const rounds = shuffle(items).slice(0, 8);
  let idx = 0, correct = 0, streak = 0, best = 0;
  function step() {
    if (idx >= rounds.length)
      return finishRound({ title, correct, total: rounds.length, starsEarned: correct, streak: best, again });
    const target = rounds[idx];
    const opts = render(target, rounds);
    screenEl.innerHTML = `
      <div class="game-top"><div class="chip">Q ${idx + 1}/${rounds.length}</div>
        <div class="chip">🔥 ${streak}</div><div class="chip">⭐ ${correct}</div></div>
      <div class="stage">${opts.head}
        <div class="hint">${prompt}</div>
        ${opts.replayBtn || ""}
        <div class="choice-grid ${opts.wide ? "words" : ""}">
          ${opts.choices.map(o => `<button class="choice" data-k="${escapeHtml(o.key)}">${o.text}</button>`).join("")}
        </div></div>`;
    if (opts.onShow) opts.onShow(target);
    screenEl.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
      const right = btn.dataset.k === String(opts.answer);
      btn.classList.add(right ? "right" : "wrong");
      if (right) { correct++; streak++; best = Math.max(best, streak); dingGood(); if (opts.sayOnRight) speak(opts.sayOnRight); }
      else { streak = 0; dingBad();
        const rb = screenEl.querySelector(`.choice[data-k="${cssEsc(String(opts.answer))}"]`); if (rb) rb.classList.add("right"); }
      screenEl.querySelectorAll(".choice").forEach(b => b.disabled = true);
      setTimeout(() => { idx++; step(); }, right ? 650 : 1150);
    });
  }
  step();
}
function gameLetterPop() {
  choiceRound({
    items: LETTERS, prompt: "Which letter makes this sound?", title: "Letter Pop", back: showHome, again: gameLetterPop,
    render: (target) => ({
      head: "", replayBtn: `<div class="btn-row"><button class="btn blue" id="hear">🔊 Hear again</button></div>`,
      choices: shuffle([target, ...shuffle(LETTERS.filter(l => l.L !== target.L)).slice(0, 3)])
                 .map(o => ({ key: o.L, text: o.L.toUpperCase() + o.L })),
      answer: target.L,
      onShow: (t) => { const h = document.getElementById("hear"); if (h) h.onclick = () => speak(t.sound, 0.7); speak(t.sound, 0.7); },
    }),
  });
}
function gameWordMatch() {
  choiceRound({
    items: ALL_WORDS, prompt: "Which word matches the picture?", title: "Word Match", back: showHome, again: gameWordMatch,
    render: (target) => ({
      head: `<div class="big-emoji">${pictureHTML(target.w, target.e)}</div>`, wide: true, sayOnRight: target.w,
      choices: shuffle([target, ...shuffle(ALL_WORDS.filter(w => w.w !== target.w)).slice(0, 3)])
                 .map(o => ({ key: o.w, text: o.w })),
      answer: target.w,
    }),
  });
}

/* ============================================================
   8. SPEAKING — words & sentences (Private / Auto-check)
   ============================================================ */
const recSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
function stopRecorderTracks() { if (mediaRecorder && mediaRecorder.stream) mediaRecorder.stream.getTracks().forEach(t => t.stop()); mediaRecorder = null; }
function todayKey() { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function logSpeech(text, sound, result, mode, isSentence) {
  store.speechLog.push({ word: text, sound: isSentence ? "sentence" : sound, result, mode, day: todayKey() });
  if (store.speechLog.length > 800) store.speechLog = store.speechLog.slice(-800);
  if ((result === "great" || result === "good") && !isSentence && !store.doneSpeech[text]) {
    store.doneSpeech[text] = true; addStar(1);
  } else if (result === "great" || result === "good") { addStar(1); }
  saveStore();
}
function speechList(items, isSentence, i) {
  stopEverything();
  if (recordedUrl) { URL.revokeObjectURL(recordedUrl); recordedUrl = null; }
  recordedBlob = null;
  setBack(() => speakMenu());
  const it = items[i];
  const auto = store.speechMode === "auto" && AUTO_SPEECH_SUPPORTED;
  const text = isSentence ? it.text : it.w;
  screenEl.innerHTML = `
    <div class="mode-switch small">
      <button class="ms ${!auto ? "on" : ""}" data-sm="private">🔒 Private</button>
      <button class="ms ${auto ? "on" : ""}" data-sm="auto">✨ Auto-check</button>
    </div>
    <div class="stage">
      <div class="big-emoji">${isSentence ? it.e : pictureHTML(it.w, it.e)}</div>
      ${isSentence ? `<div class="sentence">${escapeHtml(text)}</div>` : `<div class="big-word">${colourWord(text)}</div>`}
      <div class="hint" id="sHint">Tap <b>Listen</b>, then say it ${isSentence ? "clearly" : ""}.</div>
      <div class="btn-row">
        <button class="btn green" id="listen">🔊 Listen</button>
        ${auto ? `<button class="btn pink" id="tryBtn">🎤 My turn</button>`
               : (recSupported ? `<button class="btn pink" id="recBtn">🎤 Record</button>
                    <button class="btn purple" id="playBtn" disabled>▶︎ My voice</button>`
                  : `<div class="note">Recording needs Safari on iPad.</div>`)}
      </div>
      <div id="rateRow" class="rate-row hidden">
        <div class="ct">How did it sound?</div>
        <div class="btn-row">
          <button class="btn green" data-r="great">⭐ Clear</button>
          <button class="btn blue" data-r="good">👍 Good</button>
          <button class="btn orange" data-r="try">🔁 Try again</button></div></div>
    </div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${i + 1} / ${items.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  screenEl.querySelectorAll(".ms").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.sm === "auto" && !AUTO_SPEECH_SUPPORTED) { alert("Auto-check isn't available here. Safari on iPad supports it."); return; }
    store.speechMode = b.dataset.sm; saveStore(); speechList(items, isSentence, i);
  }));
  document.getElementById("listen").onclick = () => speak(text, isSentence ? 0.85 : 0.8);
  document.getElementById("prev").onclick = () => speechList(items, isSentence, (i - 1 + items.length) % items.length);
  document.getElementById("next").onclick = () => speechList(items, isSentence, (i + 1) % items.length);
  const rateRow = document.getElementById("rateRow");
  const showRating = () => {
    rateRow.classList.remove("hidden");
    rateRow.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
      logSpeech(text, it.sound, b.dataset.r, "private", isSentence);
      if (b.dataset.r !== "try") celebrate(); else speak(text, 0.8);
      rateRow.classList.add("hidden");
    });
  };
  if (auto) document.getElementById("tryBtn").onclick = () => autoCheck(it, isSentence, text);
  else if (recSupported) wireRecorder(showRating);
  speak(text, isSentence ? 0.85 : 0.8);
}
/* Choose a recording format the browser actually supports. iOS Safari
   records audio/mp4 (AAC); Chrome/Firefox record webm/opus. */
function pickRecMime() {
  const cands = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/aac", "audio/ogg"];
  if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
    for (const c of cands) if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}
/* Decode + play the recording via the Web Audio API. This is far more
   reliable than an <audio> element on iOS Safari, whose MediaRecorder
   output (fragmented MP4) often won't play in <audio> for lack of a
   duration. Falls back to <audio> if decoding isn't available. */
async function playRecording(hintEl) {
  if (!recordedBlob || !recordedBlob.size) { if (hintEl) hintEl.textContent = "No recording yet — tap 🎤 Record first."; return false; }
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const arr = await recordedBlob.arrayBuffer();
    const audioBuf = await new Promise((res, rej) => {
      const p = audioCtx.decodeAudioData(arr.slice(0), res, rej);
      if (p && p.then) p.then(res, rej);
    });
    const src = audioCtx.createBufferSource();
    src.buffer = audioBuf; src.connect(audioCtx.destination); src.start(0);
    return true;
  } catch (e) {}
  try {
    const a = new Audio(); a.src = recordedUrl || URL.createObjectURL(recordedBlob);
    await a.play(); return true;
  } catch (e) {}
  if (hintEl) hintEl.textContent = "Hmm, couldn't play that back. Try recording again. 🎙️";
  return false;
}
function wireRecorder(onRecorded) {
  const recBtn = document.getElementById("recBtn"), playBtn = document.getElementById("playBtn");
  let recording = false;
  recBtn.onclick = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recChunks = [];
        const mime = pickRecMime();
        mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => { if (e.data && e.data.size) recChunks.push(e.data); };
        mediaRecorder.onstop = () => {
          // Stop the mic tracks only now — after the final chunk has arrived.
          stream.getTracks().forEach(t => t.stop());
          const type = mediaRecorder.mimeType || mime || "audio/mp4";
          recordedBlob = new Blob(recChunks, { type });
          if (recordedUrl) URL.revokeObjectURL(recordedUrl);
          recordedUrl = recordedBlob.size ? URL.createObjectURL(recordedBlob) : null;
          playBtn.disabled = !recordedBlob.size;
          onRecorded();
        };
        // Timeslice makes dataavailable fire periodically — more reliable on iOS.
        mediaRecorder.start(200);
        recording = true; recBtn.textContent = "⏹ Stop"; recBtn.classList.add("rec-on");
      } catch (err) { alert("Please allow the microphone so we can record. 🎙️"); }
    } else {
      recording = false; recBtn.textContent = "🎤 Record"; recBtn.classList.remove("rec-on");
      try { if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop(); } catch (e) {}
    }
  };
  playBtn.onclick = async () => {
    const prev = playBtn.textContent; playBtn.textContent = "▶︎ Playing…";
    await playRecording(document.getElementById("sHint"));
    playBtn.textContent = prev;
  };
}
function autoCheck(it, isSentence, text) {
  const hint = document.getElementById("sHint"), btn = document.getElementById("tryBtn");
  try {
    const rec = new SpeechRec(); activeRecognition = rec;
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 3;
    hint.textContent = "Listening… say it! 🎤"; btn.classList.add("rec-on"); btn.textContent = "🎤 Listening…";
    rec.onresult = e => {
      const alts = Array.from(e.results[0]).map(a => norm(a.transcript));
      const target = norm(text);
      let result;
      if (isSentence) {
        const tw = target.split(" ");
        const score = Math.max(...alts.map(a => { const aw = a.split(" "); const hit = tw.filter(w => aw.includes(w)).length; return hit / tw.length; }));
        result = score >= 0.8 ? "great" : score >= 0.5 ? "good" : "try";
      } else {
        const dist = Math.min(...alts.map(a => levenshtein(a.replace(/ /g, ""), target)));
        result = dist === 0 ? "great" : dist <= 1 ? "good" : "try";
      }
      hint.innerHTML = result === "try" ? `I heard “<b>${alts[0] || "…"}</b>”. Let's try again!` : `Nice — I heard “<b>${alts[0]}</b>”! ⭐`;
      logSpeech(text, it.sound, result, "auto", isSentence);
      if (result !== "try") celebrate(); else speak(text, 0.8);
    };
    rec.onerror = () => { hint.textContent = "Didn't catch that — tap My turn to try again."; };
    rec.onend = () => { btn.classList.remove("rec-on"); btn.textContent = "🎤 My turn"; activeRecognition = null; };
    rec.start();
  } catch (e) { hint.textContent = "Auto-check isn't available here. Try Private mode."; }
}

/* ============================================================
   9. WRITING — tracing (canvas) + dictation
   ============================================================ */
function traceTargets() {
  return LETTERS.map(l => ({ text: l.L, kind: "letter", say: l.sound, word: l.word }))
    .concat(TRACE_WORDS.map(w => ({ text: w, kind: "word", say: w })));
}
function traceScreen(i) {
  const targets = traceTargets();
  setBack(writeMenu);
  const it = targets[i];
  const isLetter = it.kind === "letter";
  const key = it.kind + ":" + it.text;
  screenEl.innerHTML = `
    <div class="stage">
      <div class="hint">Trace the ${isLetter ? "letter" : "word"} with your finger ✏️</div>
      <div class="pad-wrap"><canvas id="pad"></canvas></div>
      <div class="btn-row">
        <button class="btn green" id="say">🔊 ${isLetter ? "Sound" : it.text}</button>
        <button class="btn blue" id="clear">🧹 Clear</button>
        <button class="btn orange" id="done" disabled>⭐ Done</button>
      </div>
    </div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${it.text.toUpperCase()} · ${i + 1}/${targets.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  const canvas = document.getElementById("pad");
  const doneBtn = document.getElementById("done");
  let drew = 0;
  const ctx = setupCanvas(canvas);
  function drawGuide() {
    const w = canvas.width / (window.devicePixelRatio || 1), h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#e5e9f5";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fs = isLetter ? h * 0.8 : Math.min(h * 0.7, w / (it.text.length * 0.62));
    ctx.font = "800 " + fs + "px 'Comic Sans MS', 'Baloo 2', system-ui, sans-serif";
    ctx.fillText(isLetter ? it.text.toUpperCase() + it.text : it.text, w / 2, h / 2);
  }
  drawGuide();
  let drawing = false, lastX = 0, lastY = 0;
  function pos(e) { const r = canvas.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
  function down(e) { e.preventDefault(); drawing = true; const p = pos(e); lastX = p.x; lastY = p.y; }
  function move(e) {
    if (!drawing) return; e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = "var(--blue)"; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#5b7cfa";
    ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
    lastX = p.x; lastY = p.y; drew++;
    if (drew > 12) doneBtn.disabled = false;
  }
  function up() { drawing = false; }
  canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  canvas.addEventListener("touchstart", down, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  document.getElementById("say").onclick = () => isLetter ? speak(it.say, 0.7) : speak(it.text);
  document.getElementById("clear").onclick = () => { drew = 0; doneBtn.disabled = true; drawGuide(); };
  doneBtn.onclick = () => {
    if (!store.writing.traced[key]) { store.writing.traced[key] = true; addStar(1); }
    saveStore(); celebrate();
  };
  document.getElementById("prev").onclick = () => traceScreen((i - 1 + targets.length) % targets.length);
  document.getElementById("next").onclick = () => traceScreen((i + 1) % targets.length);
  if (isLetter) speak(it.say, 0.7); else speak(it.text);
}
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const cssW = Math.min(wrap.clientWidth || 480, 520), cssH = 260;
  canvas.style.width = cssW + "px"; canvas.style.height = cssH + "px";
  canvas.width = cssW * dpr; canvas.height = cssH * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
function dictation(i) {
  setBack(writeMenu);
  const useSentences = i >= DICTATION_WORDS.length;
  const list = DICTATION_WORDS.concat(DICTATION_SENTENCES);
  const target = list[i];
  const isSentence = useSentences;
  screenEl.innerHTML = `
    <div class="mode-switch small">
      <button class="ms ${!isSentence ? "on" : ""}" id="toWords">🔤 Words</button>
      <button class="ms ${isSentence ? "on" : ""}" id="toSent">💬 Sentences</button>
    </div>
    <div class="stage">
      <div class="big-emoji">👂</div>
      <div class="hint">Listen, then write what you hear.</div>
      <div class="btn-row"><button class="btn green" id="hear">🔊 Hear it</button>
        <button class="btn blue" id="slow">🐢 Slower</button></div>
      <input id="dictIn" class="type-in" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="write here…" />
      <div id="dfb" class="type-fb">&nbsp;</div>
      <div class="btn-row"><button class="btn orange" id="check">✅ Check</button></div>
    </div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${(isSentence ? i - DICTATION_WORDS.length + 1 : i + 1)} / ${isSentence ? DICTATION_SENTENCES.length : DICTATION_WORDS.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  document.getElementById("toWords").onclick = () => dictation(0);
  document.getElementById("toSent").onclick = () => dictation(DICTATION_WORDS.length);
  const input = document.getElementById("dictIn"), fb = document.getElementById("dfb");
  input.focus();
  document.getElementById("hear").onclick = () => speak(target, isSentence ? 0.85 : 0.8);
  document.getElementById("slow").onclick = () => speak(target, 0.55);
  const check = () => {
    store.writing.dictTries++;
    const val = norm(input.value);
    if (val === norm(target)) {
      fb.textContent = "⭐ Perfect!"; fb.className = "type-fb good";
      store.writing.dictOk++; addStar(1); saveStore(); speak(target); celebrate();
    } else if (val && levenshtein(val, norm(target)) <= 2) {
      fb.textContent = "So close! Check your spelling."; fb.className = "type-fb near"; saveStore();
    } else { fb.textContent = "Try again — tap Hear it. 🙂"; fb.className = "type-fb bad"; saveStore(); }
  };
  document.getElementById("check").onclick = check;
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  const bound = isSentence ? DICTATION_SENTENCES.length : DICTATION_WORDS.length;
  const base = isSentence ? DICTATION_WORDS.length : 0;
  document.getElementById("prev").onclick = () => dictation(base + ((i - base - 1 + bound) % bound));
  document.getElementById("next").onclick = () => dictation(base + ((i - base + 1) % bound));
  speak(target, isSentence ? 0.85 : 0.8);
}

/* ============================================================
   10. LANGUAGE — WH questions, What's Missing, Sequencing
   ============================================================ */
function whGame() {
  choiceRound({
    items: WH_QUESTIONS, prompt: "", title: "WH Questions", back: langMenu, again: whGame,
    render: (target) => ({
      head: `<div class="big-emoji">${target.scene}</div><div class="q-text">${escapeHtml(target.q)}</div>`,
      wide: true, sayOnRight: target.answer,
      choices: shuffle(target.options.map(o => ({ key: o, text: o }))),
      answer: target.answer,
      onShow: (t) => speak(t.q, 0.9),
    }),
  });
  store.lang.wh++; saveStore();
}
function missingGame() {
  setBack(langMenu);
  let correct = 0, streak = 0, best = 0, round = 0;
  const totalRounds = 6;
  function step() {
    if (round >= totalRounds)
      return finishRound({ title: "What's Missing", correct, total: totalRounds, starsEarned: correct, streak: best, again: missingGame });
    const pool = shuffle(MISSING_POOLS)[0];
    const chosen = shuffle(pool.items).slice(0, 4);
    const missing = chosen[Math.floor(Math.random() * chosen.length)];
    // Phase 1: look
    screenEl.innerHTML = `
      <div class="game-top"><div class="chip">Round ${round + 1}/${totalRounds}</div>
        <div class="chip">🔥 ${streak}</div><div class="chip">⭐ ${correct}</div></div>
      <div class="stage"><div class="hint">Look and remember! 👀</div>
        <div class="item-row">${chosen.map(c => `<div class="item">${c.e}</div>`).join("")}</div>
        <div class="hint" id="count">Ready…</div></div>`;
    chosen.forEach((c, k) => setTimeout(() => speak(c.w), k * 650));
    let n = 3; const cd = document.getElementById("count");
    roundTimer = setInterval(() => { n--; if (cd) cd.textContent = n > 0 ? "Hiding in " + n + "…" : "Which one is gone?"; if (n <= 0) { clearInterval(roundTimer); roundTimer = null; ask(); } }, 900);
    function ask() {
      const shownItems = chosen.map(c => c === missing ? { e: "❓", gone: true } : c);
      const distractors = shuffle(pool.items.filter(x => !chosen.includes(x))).slice(0, 2);
      const options = shuffle([missing, ...distractors]);
      screenEl.innerHTML = `
        <div class="game-top"><div class="chip">Round ${round + 1}/${totalRounds}</div>
          <div class="chip">🔥 ${streak}</div><div class="chip">⭐ ${correct}</div></div>
        <div class="stage"><div class="hint">Which one is missing?</div>
          <div class="item-row">${shownItems.map(c => `<div class="item ${c.gone ? "gone" : ""}">${c.e}</div>`).join("")}</div>
          <div class="choice-grid words">
            ${options.map(o => `<button class="choice" data-k="${escapeHtml(o.w)}">${o.e} ${o.w}</button>`).join("")}</div></div>`;
      screenEl.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
        const right = btn.dataset.k === missing.w;
        btn.classList.add(right ? "right" : "wrong");
        if (right) { correct++; streak++; best = Math.max(best, streak); speak(missing.w); dingGood(); }
        else { streak = 0; dingBad(); const rb = screenEl.querySelector(`.choice[data-k="${cssEsc(missing.w)}"]`); if (rb) rb.classList.add("right"); }
        screenEl.querySelectorAll(".choice").forEach(b => b.disabled = true);
        setTimeout(() => { round++; step(); }, right ? 700 : 1150);
      });
    }
  }
  step();
}
function seqGame(i) {
  setBack(langMenu);
  const seq = SEQUENCES[i % SEQUENCES.length];
  const shuffled = shuffle(seq.steps.map((s, idx) => ({ ...s, idx })));
  let expect = 0;
  screenEl.innerHTML = `
    <h2 class="section-title">${seq.title}</h2>
    <p class="section-sub">Tap the pictures in the right order. What happens first?</p>
    <div class="seq-grid">
      ${shuffled.map(s => `<button class="seq-card" data-idx="${s.idx}">
        <div class="se">${s.e}</div><div class="sl">${s.l}</div><div class="sn"></div></button>`).join("")}
    </div>
    <div class="nav-row"><button class="btn grey" id="skip">Skip ›</button>
      <div class="progress-pill">${(i % SEQUENCES.length) + 1} / ${SEQUENCES.length}</div>
      <button class="btn green" id="hear">🔊 Read steps</button></div>`;
  document.getElementById("hear").onclick = () => seq.steps.forEach((s, k) => setTimeout(() => speak(s.l), k * 900));
  document.getElementById("skip").onclick = () => seqGame(i + 1);
  screenEl.querySelectorAll(".seq-card").forEach(card => card.onclick = () => {
    if (card.classList.contains("placed")) return;
    if (Number(card.dataset.idx) === expect) {
      card.classList.add("placed"); card.querySelector(".sn").textContent = expect + 1;
      speak(card.querySelector(".sl").textContent); dingGood(); expect++;
      if (expect === seq.steps.length) {
        store.lang.seq++; addStar(1); saveStore();
        setTimeout(() => { celebrate(); setTimeout(() => seqGame(i + 1), 900); }, 300);
      }
    } else { card.classList.add("shake"); dingBad(); speak("Try the first one"); setTimeout(() => card.classList.remove("shake"), 500); }
  });
}

/* ============================================================
   10b. READING HUB — vocabulary, leveled reading, stories
   ============================================================ */
function readingHub() {
  submenu("Reading 📖", "Grow words, read by level, and enjoy stories.", [
    { emoji: "📚", label: "Vocabulary", sub: "Words & meanings", go: vocabPicker },
    { emoji: "📈", label: "Reading Levels", sub: "1 · 2 · 3", go: readingLevelsMenu },
    { emoji: "📕", label: "Stories", sub: "Read along", go: storyList },
  ], showHome);
}

/* Tappable, read-aloud text ------------------------------------ */
function renderReadable(text) {
  return text.split(/(\s+)/).map(tok => {
    if (/^\s+$/.test(tok) || !tok) return tok;
    const clean = tok.replace(/[^A-Za-z']/g, "");
    return `<span class="rw" data-w="${escapeHtml(clean)}">${escapeHtml(tok)}</span>`;
  }).join("");
}
function wireReadable(container) {
  if (!container) return;
  container.querySelectorAll(".rw").forEach(s => s.onclick = () => { if (s.dataset.w) speak(s.dataset.w); });
}
function speakAlong(text, container) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const spans = container ? Array.from(container.querySelectorAll(".rw")) : [];
  const offsets = []; let idx = 0;
  spans.forEach(s => { const w = s.textContent; const at = text.indexOf(w, idx); offsets.push(at < 0 ? idx : at); idx = (at < 0 ? idx : at) + w.length; });
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice; u.rate = 0.82;
  u.onboundary = e => {
    if (e.charIndex == null) return;
    let hi = -1; for (let i = 0; i < offsets.length; i++) { if (offsets[i] <= e.charIndex) hi = i; else break; }
    spans.forEach((s, i) => s.classList.toggle("hi", i === hi));
  };
  u.onend = () => spans.forEach(s => s.classList.remove("hi"));
  speechSynthesis.speak(u);
}

/* Vocabulary ---------------------------------------------------- */
function vocabPicker() {
  setBack(readingHub);
  const cells = VOCAB.map((it, i) => `
    <div class="pick ${store.vocab[it.w] ? "done" : ""}" data-i="${i}">
      <div class="pe">${pictureHTML(it.w, it.e)}</div><div class="pl" style="font-size:14px">${it.w}</div>
      <div class="star">${store.vocab[it.w] ? "⭐" : "&nbsp;"}</div></div>`).join("");
  screenEl.innerHTML = `<h2 class="section-title">Vocabulary 📚</h2>
    <p class="section-sub">Tap a word to learn what it means.</p><div class="pick-grid">${cells}</div>`;
  screenEl.querySelectorAll(".pick").forEach(p => p.addEventListener("click", () => vocabCard(Number(p.dataset.i))));
}
function vocabCard(i) {
  setBack(vocabPicker);
  const it = VOCAB[i];
  const online = !!root.onlineExtras;
  screenEl.innerHTML = `
    <div class="stage">
      <div class="big-emoji" id="vpic">${pictureHTML(it.w, it.e)}</div>
      <div class="big-word">${colourWord(it.w)}</div>
      <div class="btn-row">
        <button class="btn green" id="say">🔊 Say it</button>
        <button class="btn blue" id="slow">🐢 Slow</button></div>
      <div class="def">${escapeHtml(it.def)}</div>
      <div class="ex">“${escapeHtml(it.ex)}”</div>
      ${online ? `<div class="btn-row"><button class="btn purple" id="lookup">🌐 Look it up</button></div>
                  <div id="onl" class="onl"></div>` : ``}
      <div class="btn-row"><button class="btn orange" id="got">⭐ I learned it!</button></div>
    </div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">${i + 1} / ${VOCAB.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  document.getElementById("say").onclick = () => speak(it.w);
  document.getElementById("slow").onclick = () => speak(it.w, 0.55);
  document.getElementById("got").onclick = () => {
    if (!store.vocab[it.w]) { store.vocab[it.w] = true; addStar(1); } saveStore(); celebrate();
  };
  document.getElementById("prev").onclick = () => vocabCard((i - 1 + VOCAB.length) % VOCAB.length);
  document.getElementById("next").onclick = () => vocabCard((i + 1) % VOCAB.length);
  if (online) document.getElementById("lookup").onclick = () => onlineLookup(it);
  speak(it.w);
}
/* Safe online enrichment (parent-enabled): Wikipedia picture/info +
   dictionary phonetics/audio. Only these two known hosts are used. */
async function onlineLookup(it) {
  const box = document.getElementById("onl"); if (!box) return;
  box.innerHTML = `<div class="hint">Looking it up… 🌐</div>`;
  let html = "";
  try {
    const r = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(it.w));
    if (r.ok) {
      const d = await r.json();
      if (d.thumbnail && d.thumbnail.source) {
        const pic = document.getElementById("vpic");
        if (pic) pic.innerHTML = `<img class="vimg" src="${escapeHtml(d.thumbnail.source)}" alt="${escapeHtml(it.w)}" referrerpolicy="no-referrer">`;
      }
      if (d.extract) html += `<div class="onl-ex">${escapeHtml(d.extract.split(". ")[0])}.</div>`;
    }
  } catch (e) {}
  try {
    const r2 = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(it.w));
    if (r2.ok) {
      const arr = await r2.json(); const entry = arr[0] || {};
      const phs = entry.phonetics || [];
      const ph = entry.phonetic || (phs.find(p => p.text) || {}).text || "";
      const au = (phs.find(p => p.audio) || {}).audio || "";
      if (ph) html += `<div class="onl-ph">Say it: <b>${escapeHtml(ph)}</b></div>`;
      if (au) {
        html += `<div class="btn-row"><button class="btn green" id="playAudio">🔊 Real voice</button></div>`;
        setTimeout(() => { const b = document.getElementById("playAudio"); if (b) b.onclick = () => new Audio(au.startsWith("http") ? au : "https:" + au).play(); }, 0);
      }
    }
  } catch (e) {}
  box.innerHTML = html || `<div class="hint">No extra info online right now — that's okay! Use 🔊 Say it.</div>`;
}

/* Reading levels ------------------------------------------------ */
function readingLevelsMenu() {
  submenu("Reading Levels 📈", "Start easy, then level up.", [
    { emoji: "1️⃣", label: "Level 1", sub: "Words", go: () => readWords(0) },
    { emoji: "2️⃣", label: "Level 2", sub: "Sentences", go: () => readSentence(0) },
    { emoji: "3️⃣", label: "Level 3", sub: "Short stories", go: () => readPassage(0) },
  ], readingHub);
}
function readWords(i) {
  setBack(readingLevelsMenu);
  const it = READING.level1[i], key = "l1:" + it.text;
  screenEl.innerHTML = `
    <div class="stage"><div class="big-emoji">${pictureHTML(it.text, it.e)}</div>
      <div class="big-word">${colourWord(it.text)}</div>
      <div class="hint">${store.reading[key] ? "⭐ You read this!" : "Read the word."}</div>
      <div class="btn-row">
        <button class="btn blue" id="sound">🐢 Sound out</button>
        <button class="btn green" id="say">🔊 Say it</button>
        <button class="btn orange" id="got">⭐ I read it!</button></div></div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">Level 1 · ${i + 1}/${READING.level1.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  document.getElementById("sound").onclick = () => soundOut(it.text);
  document.getElementById("say").onclick = () => speak(it.text);
  document.getElementById("got").onclick = () => { if (!store.reading[key]) { store.reading[key] = true; addStar(1); } saveStore(); celebrate(); };
  document.getElementById("prev").onclick = () => readWords((i - 1 + READING.level1.length) % READING.level1.length);
  document.getElementById("next").onclick = () => readWords((i + 1) % READING.level1.length);
}
function readSentence(i) {
  setBack(readingLevelsMenu);
  const it = READING.level2[i], key = "l2:" + i;
  screenEl.innerHTML = `
    <div class="stage"><div class="big-emoji">${it.e}</div>
      <div class="sentence read" id="sent">${renderReadable(it.text)}</div>
      <div class="hint">Tap any word to hear it.</div>
      <div class="btn-row">
        <button class="btn green" id="read">🔊 Read to me</button>
        <button class="btn orange" id="got">⭐ I read it!</button></div></div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">Level 2 · ${i + 1}/${READING.level2.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  const sent = document.getElementById("sent"); wireReadable(sent);
  document.getElementById("read").onclick = () => speakAlong(it.text, sent);
  document.getElementById("got").onclick = () => { if (!store.reading[key]) { store.reading[key] = true; addStar(1); } saveStore(); celebrate(); };
  document.getElementById("prev").onclick = () => readSentence((i - 1 + READING.level2.length) % READING.level2.length);
  document.getElementById("next").onclick = () => readSentence((i + 1) % READING.level2.length);
  speakAlong(it.text, sent);
}
function readPassage(i) {
  setBack(readingLevelsMenu);
  const it = READING.level3[i], key = "l3:" + i;
  screenEl.innerHTML = `
    <h2 class="section-title center">${escapeHtml(it.title)}</h2>
    <div class="stage"><div class="big-emoji">${it.e}</div>
      <div class="passage" id="pass">${renderReadable(it.text)}</div>
      <div class="btn-row">
        <button class="btn green" id="read">🔊 Read to me</button>
        <button class="btn orange" id="got">⭐ I read it!</button></div></div>
    <div class="nav-row"><button class="btn grey" id="prev">‹ Prev</button>
      <div class="progress-pill">Level 3 · ${i + 1}/${READING.level3.length}</div>
      <button class="btn grey" id="next">Next ›</button></div>`;
  const pass = document.getElementById("pass"); wireReadable(pass);
  document.getElementById("read").onclick = () => speakAlong(it.text, pass);
  document.getElementById("got").onclick = () => { if (!store.reading[key]) { store.reading[key] = true; addStar(1); } saveStore(); celebrate(); };
  document.getElementById("prev").onclick = () => readPassage((i - 1 + READING.level3.length) % READING.level3.length);
  document.getElementById("next").onclick = () => readPassage((i + 1) % READING.level3.length);
}

/* Stories ------------------------------------------------------- */
function storyList() {
  setBack(readingHub);
  const cards = STORIES.map((s, i) => `
    <div class="menu-card c${(i % 6) + 1}" data-i="${i}"><div class="emoji">${s.cover}</div>
      <div class="label">${escapeHtml(s.title)}</div>
      <div class="sub">${store.reading["story:" + i] ? "⭐ read" : s.pages.length + " pages"}</div></div>`).join("");
  screenEl.innerHTML = `<h2 class="section-title">Stories 📕</h2>
    <p class="section-sub">Pick a story to read along.</p><div class="menu-grid">${cards}</div>`;
  screenEl.querySelectorAll(".menu-card").forEach(c => c.addEventListener("click", () => storyReader(Number(c.dataset.i), 0)));
}
function storyReader(si, pi) {
  const s = STORIES[si];
  setBack(storyList);
  if (pi < s.pages.length) {
    const pg = s.pages[pi];
    screenEl.innerHTML = `
      <h2 class="section-title center">${escapeHtml(s.title)}</h2>
      <div class="stage"><div class="big-emoji">${pg.e}</div>
        <div class="passage" id="pass">${renderReadable(pg.text)}</div>
        <div class="btn-row"><button class="btn green" id="read">🔊 Read</button></div></div>
      <div class="nav-row"><button class="btn grey" id="prev">‹ Back</button>
        <div class="progress-pill">Page ${pi + 1}/${s.pages.length}</div>
        <button class="btn blue" id="next">${pi === s.pages.length - 1 ? "Questions ›" : "Next ›"}</button></div>`;
    const pass = document.getElementById("pass"); wireReadable(pass);
    document.getElementById("read").onclick = () => speakAlong(pg.text, pass);
    document.getElementById("prev").onclick = () => pi > 0 ? storyReader(si, pi - 1) : storyList();
    document.getElementById("next").onclick = () => storyReader(si, pi + 1);
    speakAlong(pg.text, pass);
  } else {
    storyQuestions(si, 0, 0);
  }
}
function storyQuestions(si, qi, correct) {
  const s = STORIES[si];
  setBack(() => storyReader(si, 0));
  if (qi >= s.questions.length) {
    store.reading["story:" + si] = true; addStar(correct); saveStore();
    screenEl.innerHTML = `
      <div class="stage"><div class="big-emoji">🏆</div>
        <div class="big-letter" style="font-size:56px">${correct} ⭐</div>
        <div class="hint">You finished “${escapeHtml(s.title)}”! ${correct}/${s.questions.length} right.</div>
        <div class="btn-row">
          <button class="btn green" id="again">🔁 Read again</button>
          <button class="btn grey" id="more">📕 More stories</button></div></div>`;
    document.getElementById("again").onclick = () => storyReader(si, 0);
    document.getElementById("more").onclick = storyList;
    celebrate();
    return;
  }
  const q = s.questions[qi];
  screenEl.innerHTML = `
    <div class="game-top"><div class="chip">Q ${qi + 1}/${s.questions.length}</div><div class="chip">⭐ ${correct}</div></div>
    <div class="stage"><div class="q-text">${escapeHtml(q.q)}</div>
      <div class="choice-grid words">
        ${shuffle(q.options).map(o => `<button class="choice" data-k="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div></div>`;
  speak(q.q, 0.9);
  screenEl.querySelectorAll(".choice").forEach(b => b.onclick = () => {
    const right = b.dataset.k === q.answer;
    b.classList.add(right ? "right" : "wrong");
    if (right) { dingGood(); speak(q.answer); }
    else { dingBad(); const rb = screenEl.querySelector(`.choice[data-k="${cssEsc(q.answer)}"]`); if (rb) rb.classList.add("right"); }
    screenEl.querySelectorAll(".choice").forEach(x => x.disabled = true);
    setTimeout(() => storyQuestions(si, qi + 1, correct + (right ? 1 : 0)), right ? 700 : 1150);
  });
}

/* ============================================================
   11. THEMES
   ============================================================ */
function showThemes() {
  setBack(showHome);
  const cards = THEMES.map(t => {
    const unlocked = store.stars >= t.unlockAt, active = store.theme === t.id;
    return `<div class="theme-card ${unlocked ? "" : "locked"} ${active ? "active" : ""}" data-id="${t.id}">
      <div class="emoji">${unlocked ? mascotStage(t.id) : "🔒"}</div>
      <div class="label">${t.name}</div>
      <div class="sub">${unlocked ? (active ? "Playing now" : "Tap to use") : "Earn " + t.unlockAt + " ⭐"}</div></div>`;
  }).join("");
  screenEl.innerHTML = `<h2 class="section-title">Themes 🎨</h2>
    <p class="section-sub">Earn stars to unlock buddies.</p><div class="menu-grid">${cards}</div>`;
  screenEl.querySelectorAll(".theme-card").forEach(c => c.addEventListener("click", () => {
    const t = THEMES.find(x => x.id === c.dataset.id);
    if (store.stars < t.unlockAt) { speak("Keep earning stars!"); return; }
    store.theme = t.id; saveStore(); applyTheme(); celebrate(); showThemes();
  }));
}

/* ============================================================
   12. PARENT AREA — PIN gate + dashboard + reports
   ============================================================ */
function pinPad({ title, sub, onDone }) {
  let entered = "";
  function render() {
    screenEl.innerHTML = `
      <h2 class="section-title center">${title}</h2>
      <p class="section-sub center">${sub}</p>
      <div class="pin-dots">${[0,1,2,3].map(k => `<span class="pd ${k < entered.length ? "f" : ""}"></span>`).join("")}</div>
      <div class="pin-pad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-k" data-n="${n}">${n}</button>`).join("")}
        <button class="pin-k ghost" id="pinDel">⌫</button>
        <button class="pin-k" data-n="0">0</button>
        <button class="pin-k ghost" id="pinCancel">✕</button>
      </div>`;
    screenEl.querySelectorAll(".pin-k[data-n]").forEach(b => b.onclick = () => {
      if (entered.length < 4) entered += b.dataset.n;
      if (entered.length === 4) { const v = entered; setTimeout(() => onDone(v), 120); }
      render();
    });
    document.getElementById("pinDel").onclick = () => { entered = entered.slice(0, -1); render(); };
    document.getElementById("pinCancel").onclick = () => { const back = activeId ? showHome : showProfilePicker; if (activeId) showAppChrome(); else showLoginChrome(); back(); };
  }
  showLoginChrome(); setBack(null); render();
}
function parentGate() {
  if (!root.pin) {
    // First time: set a PIN (or let them into the dashboard to set one).
    pinPad({ title: "Create a Parent PIN 🔒", sub: "Pick a 4-digit code just for grown-ups.", onDone: (v) => {
      pinPad({ title: "Confirm PIN", sub: "Type it again.", onDone: (v2) => {
        if (v2 === v) { root.pin = v; saveRoot(); parentDashboard(); }
        else parentGate();
      }});
    }});
    return;
  }
  pinPad({ title: "Parent PIN 🔒", sub: "Enter your 4-digit code.", onDone: (v) => {
    if (v === root.pin) parentDashboard();
    else pinPad({ title: "Try again", sub: "That code didn't match.", onDone: () => parentGate() });
  }});
}
function parentDashboard() {
  if (activeId) showAppChrome(); else showLoginChrome();
  setBack(activeId ? showHome : showProfilePicker);
  titleEl.hidden = true; profileChip.hidden = true; parentBtn.hidden = true;
  const children = root.profiles.map(p => {
    const s = loadProfileStore(p.id);
    return `<div class="child-row" data-id="${p.id}">
      <div class="ca">${p.avatar}</div>
      <div class="ci"><div class="cn">${escapeHtml(p.name)}</div>
        <div class="cs">⭐ ${s.stars} · 🎤 ${s.speechLog.length} speech tries</div></div>
      <div class="cgo">›</div></div>`;
  }).join("");
  screenEl.innerHTML = `
    <h2 class="section-title">Parent area 👋</h2>
    <p class="section-sub">Progress, the speech report, and settings.</p>
    <h3 class="section-title" style="font-size:18px">Players</h3>
    <div class="child-list">${children}</div>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn blue" id="addChild">➕ Add player</button>
      <button class="btn grey" id="changePin">🔑 Change PIN</button>
    </div>
    <div class="setting-row">
      <div class="sr-text"><b>🌐 Internet look-ups</b><br>
        <span class="sr-sub">Let Vocabulary fetch a picture &amp; pronunciation from Wikipedia and a dictionary. Off = fully offline.</span></div>
      <button class="toggle ${root.onlineExtras ? "on" : ""}" id="onlineToggle">${root.onlineExtras ? "On" : "Off"}</button>
    </div>
    <p class="note">Data stays on this device. Internet look-ups (if on) and the optional speech Auto-check are the only features that reach the internet. This is a practice log, not a clinical assessment.</p>
    <div class="btn-row"><button class="btn grey" id="exit">Done</button></div>`;
  screenEl.querySelectorAll(".child-row").forEach(r => r.addEventListener("click", () => childReport(r.dataset.id)));
  document.getElementById("addChild").onclick = () => showCreateProfile(false);
  document.getElementById("onlineToggle").onclick = () => { root.onlineExtras = !root.onlineExtras; saveRoot(); parentDashboard(); };
  document.getElementById("changePin").onclick = () => {
    pinPad({ title: "New Parent PIN", sub: "Pick a new 4-digit code.", onDone: (v) => {
      pinPad({ title: "Confirm PIN", sub: "Type it again.", onDone: (v2) => { if (v2 === v) { root.pin = v; saveRoot(); } parentDashboard(); } });
    }});
  };
  document.getElementById("exit").onclick = () => { if (activeId) { showAppChrome(); showHome(); } else showProfilePicker(); };
}
function childReport(id) {
  const p = root.profiles.find(x => x.id === id);
  const s = loadProfileStore(id);
  setBack(parentDashboard);
  titleEl.hidden = true; profileChip.hidden = true; parentBtn.hidden = true; starCountEl.hidden = true;
  const letters = Object.keys(s.doneLetters).length;
  const wordsRead = Object.keys(s.doneWords).length;
  const spoke = Object.keys(s.doneSpeech).length;
  const traced = Object.keys(s.writing.traced || {}).length;
  const dictPct = s.writing.dictTries ? Math.round(s.writing.dictOk / s.writing.dictTries * 100) : 0;

  const bySound = {};
  s.speechLog.forEach(r => { const g = bySound[r.sound] || (bySound[r.sound] = { n: 0, ok: 0 }); g.n++; if (r.result === "great" || r.result === "good") g.ok++; });
  const rows = Object.keys(bySound).map(k => ({ k, ...bySound[k], pct: Math.round(bySound[k].ok / bySound[k].n * 100) })).sort((a, b) => a.pct - b.pct);
  const report = rows.length ? rows.map(r => `
    <div class="bar-row"><div class="bar-label">${SOUND_LABELS[r.k] || r.k.toUpperCase()}</div>
      <div class="bar-track"><div class="bar-fill ${r.pct < 50 ? "low" : r.pct < 80 ? "mid" : "high"}" style="width:${Math.max(6, r.pct)}%"></div></div>
      <div class="bar-num">${r.pct}%</div></div>`).join("")
    : `<p class="section-sub">No speech practice logged yet.</p>`;
  const worst = rows.find(r => r.pct < 80);

  screenEl.innerHTML = `
    <h2 class="section-title">${p.avatar} ${escapeHtml(p.name)}</h2>
    <div class="compare">
      <div class="cbox"><div class="ct">Stars</div><div class="cv">⭐ ${s.stars}</div></div>
      <div class="cbox"><div class="ct">Letters</div><div class="cv">🔤 ${letters}</div></div>
      <div class="cbox"><div class="ct">Words read</div><div class="cv">📖 ${wordsRead}</div></div>
      <div class="cbox"><div class="ct">Traced</div><div class="cv">✍️ ${traced}</div></div>
      <div class="cbox"><div class="ct">Spelling</div><div class="cv">📝 ${dictPct}%</div></div>
      <div class="cbox"><div class="ct">Best typing</div><div class="cv">🚀 ${s.typing.bestWpm || 0}</div></div>
    </div>
    <h3 class="section-title" style="font-size:18px;margin-top:18px">🗣️ Speech report</h3>
    <p class="section-sub">${s.speechLog.length} tries. Lowest bars = sounds to practice most.</p>
    ${report}
    ${worst ? `<p class="note">Tip: “${SOUND_LABELS[worst.k] || worst.k}” looks trickiest — practice those words/sentences slowly together.</p>` : ""}
    <div class="btn-row" style="margin-top:14px">
      <button class="btn blue" id="rename">✏️ Rename</button>
      <button class="btn orange" id="reset">♻️ Reset progress</button>
      ${root.profiles.length > 1 ? `<button class="btn grey" id="del">🗑️ Remove</button>` : ""}
    </div>`;
  document.getElementById("rename").onclick = () => {
    const nn = prompt("New name for this player:", p.name);
    if (nn && nn.trim()) { p.name = nn.trim(); saveRoot(); if (id === activeId) showAppChrome(); childReport(id); }
  };
  document.getElementById("reset").onclick = () => {
    if (confirm("Reset all progress for " + p.name + "?")) {
      localStorage.setItem(profileKey(id), JSON.stringify(freshStore()));
      if (id === activeId) { store = loadProfileStore(id); renderStarCount(); applyTheme(); }
      childReport(id);
    }
  };
  const delBtn = document.getElementById("del");
  if (delBtn) delBtn.onclick = () => {
    if (confirm("Remove " + p.name + " and their progress? This can't be undone.")) {
      root.profiles = root.profiles.filter(x => x.id !== id);
      if (root.activeId === id) root.activeId = null;
      saveRoot(); localStorage.removeItem(profileKey(id));
      if (id === activeId) { activeId = null; store = null; }
      parentDashboard();
    }
  };
}

/* ============================================================
   13. FEEDBACK
   ============================================================ */
const celebrateEl = document.getElementById("celebrate");
const PRAISE = ["Great job!", "Awesome!", "You did it!", "Super star!", "Well done!", "Amazing!"];
function celebrate() {
  document.getElementById("celebrateText").textContent = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  celebrateEl.classList.remove("hidden"); speak("Great job!", 0.95); confettiBurst();
  setTimeout(() => celebrateEl.classList.add("hidden"), 1100);
}
function confettiBurst() {
  const colors = ["#ff6b9d", "#ffd54a", "#35c76a", "#5b7cfa", "#a66cff", "#ff9f43"];
  for (let i = 0; i < 26; i++) {
    const d = document.createElement("div"); d.className = "confetti";
    d.style.left = Math.random() * 100 + "vw"; d.style.background = colors[i % colors.length];
    d.style.animationDuration = 1 + Math.random() * 0.8 + "s";
    document.body.appendChild(d); setTimeout(() => d.remove(), 2000);
  }
}
let audioCtx = null;
function tone(freq, dur, type = "sine") {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}
function dingGood() { tone(660, 0.12); setTimeout(() => tone(880, 0.14), 90); }
function dingBad() { tone(200, 0.18, "triangle"); }

/* ============================================================
   14. helpers + START
   ============================================================ */
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
/* Safe built-in picture for a word (SVG), or the emoji if none. */
function pictureHTML(word, emoji) {
  const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (typeof PICTURES !== "undefined" && PICTURES[w]) return `<span class="pic">${PICTURES[w]}</span>`;
  return emoji || "";
}
function cssEsc(s) { return String(s).replace(/["\\]/g, "\\$&"); }

start();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
}
