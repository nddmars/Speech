/* ============================================================
   Star Readers — SAFE PICTURES
   Built-in flat SVG illustrations. 100% offline, always safe,
   no internet needed. Any word not listed here falls back to a
   friendly emoji. To add your own, draw a simple SVG and add it
   with the word as the key (lowercase).
   ============================================================ */
const PICTURES = {
  sun: `<svg viewBox="0 0 120 120"><g stroke="#ffb300" stroke-width="7" stroke-linecap="round">
    <line x1="60" y1="8" x2="60" y2="24"/><line x1="60" y1="96" x2="60" y2="112"/>
    <line x1="8" y1="60" x2="24" y2="60"/><line x1="96" y1="60" x2="112" y2="60"/>
    <line x1="24" y1="24" x2="36" y2="36"/><line x1="84" y1="84" x2="96" y2="96"/>
    <line x1="96" y1="24" x2="84" y2="36"/><line x1="36" y1="84" x2="24" y2="96"/></g>
    <circle cx="60" cy="60" r="26" fill="#ffd54a" stroke="#ffb300" stroke-width="4"/></svg>`,

  star: `<svg viewBox="0 0 120 120"><path d="M60 16 L70.6 45.4 L101.8 46.4 L77.1 65.6 L85.9 95.6 L60 78 L34.1 95.6 L42.9 65.6 L18.2 46.4 L49.4 45.4 Z"
    fill="#ffd54a" stroke="#ffb300" stroke-width="4" stroke-linejoin="round"/></svg>`,

  moon: `<svg viewBox="0 0 120 120"><path d="M78 20 a42 42 0 1 0 22 70 a33 33 0 1 1 -22 -70 z"
    fill="#ffd54a" stroke="#ffb300" stroke-width="4" stroke-linejoin="round"/></svg>`,

  cloud: `<svg viewBox="0 0 120 120"><path d="M36 84 a20 20 0 0 1 1 -40 a24 24 0 0 1 46 -4 a17 17 0 0 1 3 44 z"
    fill="#dfefff" stroke="#9cc9ef" stroke-width="4" stroke-linejoin="round"/></svg>`,

  rainbow: `<svg viewBox="0 0 120 120"><g fill="none" stroke-width="9" stroke-linecap="round">
    <path d="M14 94 a46 46 0 0 1 92 0" stroke="#e5484d"/><path d="M23 94 a37 37 0 0 1 74 0" stroke="#ff9f43"/>
    <path d="M32 94 a28 28 0 0 1 56 0" stroke="#ffd54a"/><path d="M41 94 a19 19 0 0 1 38 0" stroke="#35c76a"/></g></svg>`,

  apple: `<svg viewBox="0 0 120 120"><path d="M62 42 C 60 30 66 24 76 24" fill="none" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="84" cy="22" rx="12" ry="7" fill="#4caf50" transform="rotate(20 84 22)"/>
    <path d="M60 44 C 40 30 20 48 24 70 C 27 90 44 100 60 92 C 76 100 93 90 96 70 C 100 48 80 30 60 44 Z" fill="#e5484d"/>
    <ellipse cx="46" cy="60" rx="7" ry="12" fill="#ff8a80" opacity="0.55"/></svg>`,

  tree: `<svg viewBox="0 0 120 120"><rect x="54" y="66" width="12" height="36" rx="4" fill="#a9744f"/>
    <circle cx="60" cy="46" r="30" fill="#35c76a"/><circle cx="40" cy="58" r="19" fill="#3fb46a"/><circle cx="80" cy="58" r="19" fill="#3fb46a"/></svg>`,

  flower: `<svg viewBox="0 0 120 120"><rect x="57" y="58" width="6" height="46" fill="#35c76a"/>
    <g fill="#ff6b9d"><circle cx="60" cy="34" r="13"/><circle cx="41" cy="47" r="13"/><circle cx="79" cy="47" r="13"/><circle cx="48" cy="66" r="13"/><circle cx="72" cy="66" r="13"/></g>
    <circle cx="60" cy="50" r="12" fill="#ffd54a"/></svg>`,

  heart: `<svg viewBox="0 0 120 120"><path d="M60 98 C 18 70 22 34 47 34 C 58 34 60 45 60 49 C 60 45 62 34 73 34 C 98 34 102 70 60 98 Z" fill="#ff6b9d"/></svg>`,

  balloon: `<svg viewBox="0 0 120 120"><path d="M60 84 q-5 8 0 14" fill="none" stroke="#9aa" stroke-width="2"/>
    <ellipse cx="60" cy="48" rx="28" ry="34" fill="#a66cff"/><path d="M55 80 h10 l-5 9 z" fill="#8a53e0"/>
    <ellipse cx="50" cy="38" rx="7" ry="10" fill="#fff" opacity="0.4"/></svg>`,

  fish: `<svg viewBox="0 0 120 120"><path d="M28 60 C 40 34 86 34 98 60 C 86 86 40 86 28 60 Z" fill="#5b7cfa"/>
    <path d="M28 60 L12 44 L17 60 L12 76 Z" fill="#3f5fe0"/>
    <circle cx="82" cy="52" r="5" fill="#fff"/><circle cx="82" cy="52" r="2.5" fill="#253053"/></svg>`,

  ball: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="34" fill="#fff" stroke="#253053" stroke-width="4"/>
    <path d="M60 44 l14 10 -5 17 -18 0 -5 -17 z" fill="#253053"/></svg>`,

  house: `<svg viewBox="0 0 120 120"><path d="M26 56 L60 26 L94 56 Z" fill="#e5484d"/>
    <rect x="36" y="54" width="48" height="42" fill="#ffd54a"/><rect x="54" y="72" width="16" height="24" fill="#a9744f"/>
    <rect x="44" y="62" width="10" height="10" fill="#bfe3ff"/></svg>`,

  car: `<svg viewBox="0 0 120 120"><rect x="18" y="56" width="84" height="22" rx="9" fill="#5b7cfa"/>
    <path d="M36 56 l10 -15 h28 l10 15 z" fill="#7b95ff"/><circle cx="40" cy="82" r="10" fill="#253053"/><circle cx="80" cy="82" r="10" fill="#253053"/>
    <circle cx="40" cy="82" r="4" fill="#9aa"/><circle cx="80" cy="82" r="4" fill="#9aa"/></svg>`,

  boat: `<svg viewBox="0 0 120 120"><rect x="58" y="28" width="5" height="44" fill="#8a5a2b"/>
    <path d="M63 32 l24 32 h-24 z" fill="#fff" stroke="#cfd6e8" stroke-width="2"/>
    <path d="M22 74 h76 l-13 20 h-50 z" fill="#e5484d"/></svg>`,

  rocket: `<svg viewBox="0 0 120 120"><path d="M60 14 C 77 30 79 54 74 74 H46 C 41 54 43 30 60 14 Z" fill="#eef2ff" stroke="#5b7cfa" stroke-width="3"/>
    <circle cx="60" cy="46" r="9" fill="#5b7cfa"/><path d="M46 66 l-13 17 13 -5 z" fill="#ff9f43"/><path d="M74 66 l13 17 -13 -5 z" fill="#ff9f43"/>
    <path d="M52 74 h16 l-8 20 z" fill="#ff6b9d"/></svg>`,

  egg: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="64" rx="28" ry="36" fill="#fff5e6" stroke="#e8d8b8" stroke-width="3"/>
    <ellipse cx="50" cy="50" rx="7" ry="11" fill="#fff" opacity="0.6"/></svg>`,

  butterfly: `<svg viewBox="0 0 120 120"><rect x="58" y="40" width="4" height="42" rx="2" fill="#253053"/>
    <g fill="#a66cff" stroke="#8a53e0" stroke-width="2"><circle cx="42" cy="48" r="16"/><circle cx="42" cy="73" r="13"/><circle cx="78" cy="48" r="16"/><circle cx="78" cy="73" r="13"/></g>
    <circle cx="60" cy="40" r="4" fill="#253053"/></svg>`,

  cat: `<svg viewBox="0 0 120 120"><path d="M36 42 l9 20 -18 0 z" fill="#ff9f43"/><path d="M84 42 l-9 20 18 0 z" fill="#ff9f43"/>
    <circle cx="60" cy="66" r="30" fill="#ff9f43"/><circle cx="50" cy="62" r="4" fill="#253053"/><circle cx="70" cy="62" r="4" fill="#253053"/>
    <path d="M60 70 l-4 5 h8 z" fill="#ff6b9d"/></svg>`,

  dog: `<svg viewBox="0 0 120 120"><ellipse cx="34" cy="52" rx="10" ry="18" fill="#a9744f"/><ellipse cx="86" cy="52" rx="10" ry="18" fill="#a9744f"/>
    <circle cx="60" cy="64" r="28" fill="#c98a5a"/><circle cx="50" cy="60" r="4" fill="#253053"/><circle cx="70" cy="60" r="4" fill="#253053"/>
    <ellipse cx="60" cy="74" rx="7" ry="5" fill="#253053"/></svg>`,

  frog: `<svg viewBox="0 0 120 120"><circle cx="42" cy="42" r="13" fill="#35c76a"/><circle cx="78" cy="42" r="13" fill="#35c76a"/>
    <circle cx="42" cy="40" r="5" fill="#fff"/><circle cx="78" cy="40" r="5" fill="#fff"/><circle cx="42" cy="40" r="2.5" fill="#253053"/><circle cx="78" cy="40" r="2.5" fill="#253053"/>
    <path d="M30 56 a30 30 0 0 0 60 0 z" fill="#35c76a"/><path d="M46 74 q14 10 28 0" fill="none" stroke="#1f8a54" stroke-width="4" stroke-linecap="round"/></svg>`,

  umbrella: `<svg viewBox="0 0 120 120"><path d="M60 38 a34 34 0 0 0 -34 22 h68 a34 34 0 0 0 -34 -22 z" fill="#ff6b9d"/>
    <rect x="57" y="38" width="5" height="42" fill="#8a5a2b"/><path d="M62 80 a8 8 0 0 0 12 0" fill="none" stroke="#8a5a2b" stroke-width="4"/></svg>`,

  planet: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="62" rx="42" ry="13" fill="none" stroke="#ffb300" stroke-width="6" transform="rotate(-20 60 62)"/>
    <circle cx="60" cy="58" r="24" fill="#a66cff"/><circle cx="52" cy="52" r="6" fill="#c39bff"/></svg>`,

  book: `<svg viewBox="0 0 120 120"><path d="M60 34 C 48 26 30 26 22 30 V88 C 30 84 48 84 60 92 Z" fill="#5b7cfa"/>
    <path d="M60 34 C 72 26 90 26 98 30 V88 C 90 84 72 84 60 92 Z" fill="#7b95ff"/><line x1="60" y1="34" x2="60" y2="92" stroke="#3f5fe0" stroke-width="3"/></svg>`,

  cake: `<svg viewBox="0 0 120 120"><rect x="30" y="60" width="60" height="34" rx="6" fill="#ffd1e0"/>
    <path d="M30 66 q15 10 30 0 t30 0 v6 h-60 z" fill="#fff"/><rect x="57" y="40" width="6" height="16" fill="#5b7cfa"/><circle cx="60" cy="36" r="5" fill="#ff9f43"/></svg>`,
};
