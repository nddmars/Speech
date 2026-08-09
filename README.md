# ⭐ Star Readers

A free, ad-free **speaking, writing, reading, and language app** for kids — built
for a game-motivated 7-year-old who already knows the basics and needs to work on
**clear speaking** and **writing**. It runs in any browser, installs onto an iPad
home screen like a real app, and works **offline** after the first load. No
accounts on a server, no cost. Everything is stored **on the device**. Open
source (MIT).

## 👦👩 Players & Parent area (login)

- **"Who's playing?"** picker on launch. Each child has their own avatar, stars,
  and progress. Add as many players as you like.
- **🔒 Parent area** behind a 4-digit **PIN**: see each child's progress and the
  speech report, rename/reset/remove players, and change the PIN.
- It's all **local to the device** — no child's data is sent to any server. (The
  only features that reach the internet are the optional speech *Auto-check* and
  *Internet look-ups*, both parent-controlled and described below.)
- **🌐 Internet look-ups (off by default):** a Parent-area toggle. When on,
  Vocabulary can fetch a **photo + short info from Wikipedia** and **pronunciation
  from a dictionary API** — safe, well-known sources. There is deliberately **no
  open-ended internet image search** (which can surface content you don't want a
  child to see). With it off, everything works offline with built-in pictures and
  definitions.

## 🎯 What it focuses on

Since he already knows letters and simple words, the app leans into the two goals
you named — **clear speaking** and **writing** — with games for motivation.

### 🎤 Say It Clearly (speaking)
- **Words** and **full sentences** ("The red car is fast.").
- **🔒 Private mode (default):** he listens to a model, records himself, plays it
  back, and a grown-up taps **⭐ Clear / 👍 Good / 🔁 Try again**. Nothing leaves
  the iPad, and it never mis-judges a child's speech.
- **✨ Auto-check (optional):** the app listens and scores it automatically (more
  game-like). This one **needs internet and sends audio to the browser's speech
  service** (Apple/Google) to transcribe — switch back to Private any time.
- Every attempt is logged **by target sound** to build the speech report.

### ✍️ Writing
- **Tracing:** trace letters and words with a finger or stylus over a guide
  (handwriting + fine motor).
- **Dictation:** hear a **word or sentence** and **write what you hear** (spelling
  + listening + writing), with a "🐢 Slower" replay.

### 📖 Reading (words · levels · stories)
- **Vocabulary** — each word has a **picture, a kid-friendly definition, an
  example sentence, and pronunciation** ("Say it" / "Slow"). If a parent turns on
  **Internet look-ups** (below), a **🌐 Look it up** button also pulls a real
  **photo + one-line info from Wikipedia** and **pronunciation from a dictionary
  API**. Off by default, and it falls back to the built-in content offline.
- **Reading Levels** — Level 1 (words), Level 2 (sentences), Level 3 (short
  passages). **Tap any word to hear it**, or "Read to me" for read-along.
- **Stories** — short, original, decodable picture stories with read-along and a
  couple of **comprehension questions** at the end.

### 🧩 Language games (reinforcement)
- **WH Questions** — Who / Where / Why / When with picture scenes.
- **What's Missing** — items shown, one disappears, he names/picks it (vocabulary
  + visual memory).
- **Sequencing** — put picture steps in the right order (routines, simple stories).

### 🎮 Reading + typing, Game or Study
- Toggle **🎮 Game** (quick rounds, streaks, stars) or **📚 Study** (calm practice).
- **Letter Pop**, **Word Match**, plus letter/word flashcards and typing.

### 🎨 Themes
Earn stars to unlock buddies (🐶 Pets, 🚀 Space, 🦖 Dinosaurs, 🏎️ Racing) that
recolor the app and grow a mascot as stars pile up.

## 📊 Speech report (in the Parent area)

Every speaking attempt is logged by **target sound** (S, R, L, F, SH, CH, TH, K,
G, plus Sentences) and charted as a success rate, **worst sound first**, with a
plain-language tip. It helps you spot patterns over time.

> This is a **practice log to guide practice — not a medical or clinical
> assessment.** For a real evaluation, see a speech-language pathologist. The
> report is most useful **shared with your child's therapist.**

## About your existing repos

- **`nddmars/Speech`** is the default CodeSandbox "React Native for Web" starter
  (boilerplate only) — nothing to reuse, so this app supersedes it.
- **`nddmars/SpeechTherapy`** is a set of therapy **worksheets** (WH-questions,
  sequencing, what's-missing, letter mazes, fine-motor). Those PDFs are
  published/copyrighted, so this app implements **interactive activities of the
  same types** rather than copying the sheets — same skills, more engaging, and
  freely shareable.

## Try it on a computer (30 seconds)

```bash
cd speech-reading-app
python3 -m http.server 8000
```

Open <http://localhost:8000>. Microphone/recording need a **secure context** —
`localhost` or any `https://` URL.

## Put it on your child's iPad

1. Host the `speech-reading-app` folder on **HTTPS** (free: drag it onto
   <https://app.netlify.com/drop>, or enable **GitHub Pages** for this folder).
2. Open the URL in **Safari** → **Share → Add to Home Screen**.
3. Open it from the home screen (full-screen, offline). First time he taps Record
   / My turn / Auto-check, tap **Allow** for the microphone.

## Customizing it (all in `content.js`, no build step)

- **`SENTENCES`** and **`SPEECH_WORDS`** — speaking practice; each carries a target
  `sound` so it feeds the report. Add the exact words/sounds his therapist targets.
- **`TRACE_WORDS`**, **`DICTATION_SENTENCES`** — writing practice.
- **`WH_QUESTIONS`**, **`MISSING_POOLS`**, **`SEQUENCES`** — language games.
- **`WORD_SETS`**, **`LETTERS`**, **`THEMES`**, **`AVATARS`** — the rest.

## Safe pictures (built-in, offline)

The app ships with clean **SVG illustrations** in `pictures.js` (sun, star, apple,
cat, dog, rocket, rainbow, and more). They're used automatically wherever a word
has a matching picture; any word without one falls back to a friendly emoji. Both
are **100% offline and always safe** — no internet, no image search. To add your
own, draw a simple SVG and add it to `PICTURES` with the word (lowercase) as the
key. (The optional Wikipedia photo look-up is a separate, parent-gated extra.)

## Files

- `index.html` · `styles.css` · `pictures.js` (safe SVG pictures) · `content.js`
  (all editable content) · `app.js` (engine) · `manifest.webmanifest` +
  `service-worker.js` (installable/offline) · `icons/` · `LICENSE` (MIT).
