/* ============================================================
   Star Readers — CONTENT
   Everything here is easy to edit. Add your child's target
   words, sentences, and questions — no build step needed.
   ============================================================ */

const LETTERS = [
  { L: "a", word: "apple",    emoji: "🍎", sound: "a" },
  { L: "b", word: "ball",     emoji: "⚽", sound: "buh" },
  { L: "c", word: "cat",      emoji: "🐱", sound: "kuh" },
  { L: "d", word: "dog",      emoji: "🐶", sound: "duh" },
  { L: "e", word: "egg",      emoji: "🥚", sound: "eh" },
  { L: "f", word: "fish",     emoji: "🐟", sound: "fff" },
  { L: "g", word: "goat",     emoji: "🐐", sound: "guh" },
  { L: "h", word: "hat",      emoji: "🎩", sound: "hhh" },
  { L: "i", word: "igloo",    emoji: "🧊", sound: "ih" },
  { L: "j", word: "jam",      emoji: "🍓", sound: "juh" },
  { L: "k", word: "kite",     emoji: "🪁", sound: "kuh" },
  { L: "l", word: "leaf",     emoji: "🍃", sound: "lll" },
  { L: "m", word: "moon",     emoji: "🌙", sound: "mmm" },
  { L: "n", word: "nest",     emoji: "🪺", sound: "nnn" },
  { L: "o", word: "octopus",  emoji: "🐙", sound: "o" },
  { L: "p", word: "pig",      emoji: "🐷", sound: "puh" },
  { L: "q", word: "queen",    emoji: "👑", sound: "kwuh" },
  { L: "r", word: "rain",     emoji: "🌧️", sound: "rrr" },
  { L: "s", word: "sun",      emoji: "☀️", sound: "sss" },
  { L: "t", word: "tree",     emoji: "🌳", sound: "tuh" },
  { L: "u", word: "umbrella", emoji: "☂️", sound: "uh" },
  { L: "v", word: "van",      emoji: "🚐", sound: "vvv" },
  { L: "w", word: "web",      emoji: "🕸️", sound: "wuh" },
  { L: "x", word: "box",      emoji: "📦", sound: "ks" },
  { L: "y", word: "yo-yo",    emoji: "🪀", sound: "yuh" },
  { L: "z", word: "zebra",    emoji: "🦓", sound: "zzz" },
];

const WORD_SETS = [
  { id: "animals", title: "Animals", emoji: "🐾", words: [
    { w: "cat", e: "🐱" }, { w: "dog", e: "🐶" }, { w: "pig", e: "🐷" },
    { w: "fox", e: "🦊" }, { w: "hen", e: "🐔" }, { w: "bug", e: "🐛" },
    { w: "ant", e: "🐜" }, { w: "bee", e: "🐝" }, { w: "rat", e: "🐀" },
    { w: "owl", e: "🦉" } ] },
  { id: "things", title: "Things", emoji: "🎒", words: [
    { w: "sun", e: "☀️" }, { w: "hat", e: "🎩" }, { w: "bus", e: "🚌" },
    { w: "cup", e: "☕" }, { w: "bed", e: "🛏️" }, { w: "box", e: "📦" },
    { w: "car", e: "🚗" }, { w: "key", e: "🔑" }, { w: "map", e: "🗺️" },
    { w: "pen", e: "🖊️" } ] },
  { id: "food", title: "Food", emoji: "🍎", words: [
    { w: "egg", e: "🥚" }, { w: "jam", e: "🍓" }, { w: "pie", e: "🥧" },
    { w: "bun", e: "🥐" }, { w: "ham", e: "🍖" }, { w: "cake", e: "🍰" },
    { w: "corn", e: "🌽" }, { w: "milk", e: "🥛" }, { w: "fish", e: "🐟" },
    { w: "nut", e: "🥜" } ] },
  { id: "play", title: "Play", emoji: "🎈", words: [
    { w: "ball", e: "⚽" }, { w: "kite", e: "🪁" }, { w: "drum", e: "🥁" },
    { w: "bike", e: "🚲" }, { w: "star", e: "⭐" }, { w: "duck", e: "🦆" },
    { w: "frog", e: "🐸" }, { w: "boat", e: "⛵" }, { w: "book", e: "📖" },
    { w: "sock", e: "🧦" } ] },
];
const ALL_WORDS = WORD_SETS.flatMap(s => s.words);

/* Single-word speech practice, tagged with a target SOUND for the report. */
const SPEECH_WORDS = [
  { w: "sun",    e: "☀️", sound: "s" },  { w: "sock",   e: "🧦", sound: "s" },
  { w: "star",   e: "⭐", sound: "s" },  { w: "snake",  e: "🐍", sound: "s" },
  { w: "red",    e: "🔴", sound: "r" },  { w: "rain",   e: "🌧️", sound: "r" },
  { w: "rabbit", e: "🐰", sound: "r" },  { w: "ring",   e: "💍", sound: "r" },
  { w: "leaf",   e: "🍃", sound: "l" },  { w: "lion",   e: "🦁", sound: "l" },
  { w: "lamp",   e: "💡", sound: "l" },  { w: "leg",    e: "🦵", sound: "l" },
  { w: "fish",   e: "🐟", sound: "f" },  { w: "fox",    e: "🦊", sound: "f" },
  { w: "fan",    e: "🪭", sound: "f" },  { w: "ship",   e: "🚢", sound: "sh" },
  { w: "shoe",   e: "👟", sound: "sh" }, { w: "sheep",  e: "🐑", sound: "sh" },
  { w: "chair",  e: "🪑", sound: "ch" }, { w: "cheese", e: "🧀", sound: "ch" },
  { w: "thumb",  e: "👍", sound: "th" }, { w: "three",  e: "3️⃣", sound: "th" },
  { w: "king",   e: "🤴", sound: "k" },  { w: "cake",   e: "🍰", sound: "k" },
  { w: "goat",   e: "🐐", sound: "g" },  { w: "gate",   e: "🚪", sound: "g" },
];
const SOUND_LABELS = {
  s: "S", r: "R", l: "L", f: "F", sh: "SH", ch: "CH", th: "TH", k: "K", g: "G",
  sentence: "Sent.",
};

/* Short SENTENCES for clear connected speech + dictation.
   Keep them short and decodable; many stress a target sound. */
const SENTENCES = [
  { text: "The sun is up.",        e: "☀️", sound: "s" },
  { text: "I see a big star.",     e: "⭐", sound: "s" },
  { text: "The red car is fast.",  e: "🚗", sound: "r" },
  { text: "A frog is on the log.", e: "🐸", sound: "g" },
  { text: "The dog ran to me.",    e: "🐶", sound: "r" },
  { text: "I like to read books.", e: "📖", sound: "r" },
  { text: "The fish can swim.",    e: "🐟", sound: "f" },
  { text: "My cat is on the mat.", e: "🐱", sound: "k" },
  { text: "We had cake and milk.", e: "🍰", sound: "k" },
  { text: "The ship is at sea.",   e: "🚢", sound: "sh" },
  { text: "I can jump up high.",   e: "🤸", sound: "j" },
  { text: "The lion is in the zoo.", e: "🦁", sound: "l" },
];

/* Words to TRACE (handwriting). Letters come from LETTERS above. */
const TRACE_WORDS = ["cat", "dog", "sun", "red", "run", "big", "hop", "top",
  "man", "map", "fish", "star", "book", "milk", "jump", "play"];

/* Words + short sentences for DICTATION ("write what you hear"). */
const DICTATION_WORDS = ALL_WORDS.map(w => w.w);
const DICTATION_SENTENCES = [
  "the cat is red", "i see a dog", "the sun is hot", "we can run",
  "a big fish", "my red car", "i like cake", "the frog can hop",
];

/* WH-QUESTIONS: who / where / why / when. Tap the right answer. */
const WH_QUESTIONS = [
  { type: "who",   scene: "🐶", q: "Who says woof?",            options: ["Dog", "Cat", "Cow"], answer: "Dog" },
  { type: "who",   scene: "👨‍🍳", q: "Who cooks our food?",       options: ["Chef", "Pilot", "Nurse"], answer: "Chef" },
  { type: "who",   scene: "👩‍⚕️", q: "Who helps you when you are sick?", options: ["Doctor", "Farmer", "Driver"], answer: "Doctor" },
  { type: "where", scene: "🐟", q: "Where does a fish live?",    options: ["Water", "Tree", "Sky"], answer: "Water" },
  { type: "where", scene: "🚗", q: "Where do we drive a car?",   options: ["Road", "Ocean", "Roof"], answer: "Road" },
  { type: "where", scene: "🛏️", q: "Where do you sleep?",        options: ["Bed", "Bath", "Bus"], answer: "Bed" },
  { type: "why",   scene: "☂️", q: "Why do we use an umbrella?", options: ["It rains", "It is sunny", "We are hungry"], answer: "It rains" },
  { type: "why",   scene: "🧥", q: "Why do we wear a coat?",     options: ["It is cold", "It is hot", "We are sleepy"], answer: "It is cold" },
  { type: "when",  scene: "🌙", q: "When do we sleep?",          options: ["Night", "Lunch", "Morning"], answer: "Night" },
  { type: "when",  scene: "🎂", q: "When do we eat cake?",       options: ["Birthday", "Bath time", "Bedtime"], answer: "Birthday" },
];

/* WHAT'S MISSING pools — a few items shown, one disappears. */
const MISSING_POOLS = [
  { title: "Fruit",   items: [ {w:"apple",e:"🍎"},{w:"banana",e:"🍌"},{w:"grapes",e:"🍇"},{w:"orange",e:"🍊"},{w:"pear",e:"🍐"} ] },
  { title: "Animals", items: [ {w:"dog",e:"🐶"},{w:"cat",e:"🐱"},{w:"fish",e:"🐟"},{w:"bird",e:"🐦"},{w:"frog",e:"🐸"} ] },
  { title: "Toys",    items: [ {w:"ball",e:"⚽"},{w:"kite",e:"🪁"},{w:"drum",e:"🥁"},{w:"car",e:"🚗"},{w:"blocks",e:"🧱"} ] },
  { title: "Clothes", items: [ {w:"hat",e:"🎩"},{w:"sock",e:"🧦"},{w:"shoe",e:"👟"},{w:"shirt",e:"👕"},{w:"coat",e:"🧥"} ] },
];

/* SEQUENCING: put the steps in order (they're stored in correct order). */
const SEQUENCES = [
  { title: "Morning",       steps: [ {e:"😴",l:"wake up"},{e:"🪥",l:"brush teeth"},{e:"🍽️",l:"eat breakfast"},{e:"🎒",l:"go to school"} ] },
  { title: "Grow a plant",  steps: [ {e:"🌱",l:"plant seed"},{e:"💧",l:"add water"},{e:"☀️",l:"give sun"},{e:"🌻",l:"flower grows"} ] },
  { title: "Make a snack",  steps: [ {e:"🍞",l:"get bread"},{e:"🧈",l:"spread it"},{e:"🥪",l:"make sandwich"},{e:"😋",l:"eat it"} ] },
  { title: "Wash hands",    steps: [ {e:"🚰",l:"turn on tap"},{e:"🧼",l:"use soap"},{e:"🙌",l:"rub hands"},{e:"🧻",l:"dry them"} ] },
];

/* Unlockable themes: swap colours + a mascot that grows with stars. */
const THEMES = [
  { id: "default", name: "Stars",     unlockAt: 0,  stages: ["⭐","🌟","✨","💫","🌠"] },
  { id: "pets",    name: "Pets",      unlockAt: 5,  stages: ["🥚","🐣","🐤","🐕","🐕‍🦺"] },
  { id: "space",   name: "Space",     unlockAt: 15, stages: ["🌑","🌘","🪐","🚀","🌌"] },
  { id: "dino",    name: "Dinosaurs", unlockAt: 30, stages: ["🥚","🦎","🦕","🦖","🌋"] },
  { id: "racing",  name: "Racing",    unlockAt: 50, stages: ["🚗","🏁","🏎️","🏆","🥇"] },
];

/* Avatars offered when creating a student profile. */
const AVATARS = ["🦊","🐱","🐶","🦖","🚀","🐰","🐼","🦁","🐸","🦄","🐯","🐵"];

/* ============================================================
   VOCABULARY — word, kid-friendly definition, example, picture.
   Pronunciation is spoken by the app (free/offline). If a parent
   turns on "internet look-ups", the app can also fetch a real
   photo + audio from safe sources (Wikipedia / a dictionary API).
   ============================================================ */
const VOCAB = [
  { w: "apple",     e: "🍎", def: "A round fruit that is red or green. It is sweet and crunchy.", ex: "I ate a red apple." },
  { w: "ocean",     e: "🌊", def: "A very big area of salty water. Fish and whales live there.", ex: "The ocean is deep and blue." },
  { w: "forest",    e: "🌲", def: "A place with many, many trees.", ex: "A deer runs in the forest." },
  { w: "planet",    e: "🪐", def: "A big round world in space. Earth is our planet.", ex: "Saturn is a planet with rings." },
  { w: "dinosaur",  e: "🦕", def: "A huge animal that lived long, long ago.", ex: "The dinosaur had a long neck." },
  { w: "rocket",    e: "🚀", def: "A machine that flies up into space.", ex: "The rocket zoomed to the moon." },
  { w: "castle",    e: "🏰", def: "A very big stone home where kings and queens lived.", ex: "The castle has tall towers." },
  { w: "volcano",   e: "🌋", def: "A mountain that can shoot out hot melted rock.", ex: "The volcano made a loud boom." },
  { w: "rainbow",   e: "🌈", def: "Colored curves in the sky after rain.", ex: "The rainbow has seven colors." },
  { w: "butterfly", e: "🦋", def: "A bug with big, pretty wings.", ex: "The butterfly landed on a flower." },
  { w: "elephant",  e: "🐘", def: "A huge gray animal with a long nose called a trunk.", ex: "The elephant sprayed water." },
  { w: "mountain",  e: "⛰️", def: "A very tall, high hill of rock.", ex: "Snow is on top of the mountain." },
  { w: "island",    e: "🏝️", def: "Land with water all around it.", ex: "We sailed to a small island." },
  { w: "kangaroo",  e: "🦘", def: "An animal that hops and holds its baby in a pouch.", ex: "The kangaroo can jump far." },
  { w: "telescope", e: "🔭", def: "A tube you look through to see far away things.", ex: "I saw the moon with a telescope." },
  { w: "penguin",   e: "🐧", def: "A black and white bird that swims but cannot fly.", ex: "The penguin slid on the ice." },
  { w: "turtle",    e: "🐢", def: "A slow animal with a hard shell.", ex: "The turtle hid in its shell." },
  { w: "cactus",    e: "🌵", def: "A green plant with sharp points. It grows where it is dry.", ex: "The cactus lives in the desert." },
  { w: "guitar",    e: "🎸", def: "A music toy you play with strings.", ex: "She plays a song on her guitar." },
  { w: "anchor",    e: "⚓", def: "A heavy hook that keeps a boat from moving.", ex: "The ship dropped its anchor." },
  { w: "train",     e: "🚂", def: "A long line of cars that go on tracks.", ex: "The train went choo-choo." },
  { w: "tractor",   e: "🚜", def: "A strong machine that a farmer drives.", ex: "The tractor pulls the plow." },
  { w: "bridge",    e: "🌉", def: "A road that goes over water or a road.", ex: "We walked across the bridge." },
  { w: "helicopter",e: "🚁", def: "A flying machine with spinning blades on top.", ex: "The helicopter landed softly." },
];

/* ============================================================
   READING with LEVELS
   Level 1: single words with a picture (easiest)
   Level 2: short sentences
   Level 3: short passages (a few sentences)
   ============================================================ */
const READING = {
  level1: [
    { text: "cat", e: "🐱" }, { text: "dog", e: "🐶" }, { text: "sun", e: "☀️" },
    { text: "ball", e: "⚽" }, { text: "fish", e: "🐟" }, { text: "star", e: "⭐" },
    { text: "book", e: "📖" }, { text: "cake", e: "🍰" }, { text: "frog", e: "🐸" },
    { text: "milk", e: "🥛" },
  ],
  level2: [
    { text: "The cat is on the mat.", e: "🐱" },
    { text: "I can see the big sun.", e: "☀️" },
    { text: "A red frog can hop.", e: "🐸" },
    { text: "My dog likes to run.", e: "🐶" },
    { text: "We read a fun book.", e: "📖" },
    { text: "The fish swims in the pond.", e: "🐟" },
  ],
  level3: [
    { title: "The Red Hen", e: "🐔",
      text: "A red hen sat on a big egg. The egg went crack. Out came a soft, small chick. The hen was very happy." },
    { title: "At the Pond", e: "🐸",
      text: "Sam ran to the pond. He saw a green frog. The frog can hop and jump. Sam had lots of fun." },
    { title: "My Dog Max", e: "🐶",
      text: "Max is my dog. Max likes to run and dig. At night, Max sleeps on my warm bed." },
  ],
};

/* ============================================================
   STORIES — original, simple, decodable, with picture pages
   and a couple of questions at the end.
   ============================================================ */
const STORIES = [
  { title: "The Lost Kite", cover: "🪁",
    pages: [
      { e: "🪁", text: "Mia had a bright red kite." },
      { e: "🌬️", text: "The wind took the kite up, up, high." },
      { e: "🌳", text: "Oh no! It got stuck in a big tree." },
      { e: "😊", text: "Dad helped Mia get it down. Mia was so glad!" },
    ],
    questions: [
      { q: "What color was the kite?", options: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "Where did the kite get stuck?", options: ["In a tree", "In a pond", "On a car"], answer: "In a tree" },
    ] },
  { title: "Ben's Big Cake", cover: "🎂",
    pages: [
      { e: "🎉", text: "It was Ben's birthday today." },
      { e: "🎂", text: "Mom made a big, tall cake." },
      { e: "🕯️", text: "Ben blew out all the candles." },
      { e: "😋", text: "Everyone had a slice. Yum, yum!" },
    ],
    questions: [
      { q: "Whose birthday was it?", options: ["Ben", "Mom", "Mia"], answer: "Ben" },
      { q: "What did Mom make?", options: ["A cake", "A kite", "A hat"], answer: "A cake" },
    ] },
  { title: "The Little Seed", cover: "🌱",
    pages: [
      { e: "🌱", text: "Lily put a tiny seed in a pot." },
      { e: "💧", text: "She gave it water every day." },
      { e: "🌿", text: "A little green plant began to grow." },
      { e: "🌻", text: "Soon it had a big yellow flower!" },
    ],
    questions: [
      { q: "What did Lily plant?", options: ["A seed", "A rock", "A ball"], answer: "A seed" },
      { q: "What grew at the end?", options: ["A flower", "A tree", "A cake"], answer: "A flower" },
    ] },
  { title: "The Wet Puppy", cover: "🐶",
    pages: [
      { e: "🐶", text: "Pip the puppy went out to play." },
      { e: "🌧️", text: "Then it began to rain and rain." },
      { e: "💧", text: "Pip got very wet and cold." },
      { e: "🧺", text: "Mom dried him with a soft towel. Warm at last!" },
    ],
    questions: [
      { q: "Who went out to play?", options: ["Pip the puppy", "A fish", "A cat"], answer: "Pip the puppy" },
      { q: "What made Pip wet?", options: ["The rain", "The sun", "A ball"], answer: "The rain" },
    ] },
  { title: "Ten Red Ants", cover: "🐜",
    pages: [
      { e: "🐜", text: "Ten red ants went for a walk." },
      { e: "🍰", text: "They found a big yellow cake." },
      { e: "🙌", text: "The ants took it bit by bit." },
      { e: "🎉", text: "Back home they had a feast. Yum!" },
    ],
    questions: [
      { q: "What color were the ants?", options: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "What did the ants find?", options: ["A cake", "A hat", "A car"], answer: "A cake" },
    ] },
  { title: "The Fox in the Box", cover: "🦊",
    pages: [
      { e: "🦊", text: "A little fox sat in a box." },
      { e: "📦", text: "The box began to slide and slide." },
      { e: "⛰️", text: "It went down the hill so fast!" },
      { e: "😄", text: "The fox got out and said, “Again!”" },
    ],
    questions: [
      { q: "Where did the fox sit?", options: ["In a box", "In a bed", "In a bus"], answer: "In a box" },
      { q: "What did the box do?", options: ["Slide down a hill", "Fly away", "Sink"], answer: "Slide down a hill" },
    ] },
  { title: "Nina's Bike", cover: "🚲",
    pages: [
      { e: "🚲", text: "Nina got a shiny red bike." },
      { e: "😟", text: "At first she was a bit scared." },
      { e: "👨‍👧", text: "Dad held on as she began to ride." },
      { e: "🎉", text: "Soon she rode all by herself. Yay!" },
    ],
    questions: [
      { q: "What did Nina get?", options: ["A bike", "A kite", "A dog"], answer: "A bike" },
      { q: "Who helped her?", options: ["Dad", "Mom", "A cat"], answer: "Dad" },
    ] },
  { title: "Max the Cat", cover: "🐱",
    pages: [
      { e: "🎩", text: "Max the cat found a big hat." },
      { e: "😴", text: "He hid inside it for a nap." },
      { e: "👀", text: "The kids looked all around." },
      { e: "🐱", text: "Then the hat gave a little “Meow!”" },
    ],
    questions: [
      { q: "What did Max find?", options: ["A hat", "A box", "A ball"], answer: "A hat" },
      { q: "What did Max do in the hat?", options: ["Take a nap", "Eat lunch", "Go swimming"], answer: "Take a nap" },
    ] },
  { title: "Fred the Frog", cover: "🐸",
    pages: [
      { e: "🐸", text: "Fred the frog sat on a log." },
      { e: "🪰", text: "He saw a little fly zoom by." },
      { e: "⬆️", text: "Fred jumped up high to catch it." },
      { e: "😋", text: "Snap! Lunch for Fred. Yum!" },
    ],
    questions: [
      { q: "Where did Fred sit?", options: ["On a log", "On a bed", "In a cup"], answer: "On a log" },
      { q: "What did Fred want to catch?", options: ["A fly", "A cake", "A hat"], answer: "A fly" },
    ] },
  { title: "The Snowman", cover: "⛄",
    pages: [
      { e: "⛄", text: "Sam made a big white snowman." },
      { e: "🧣", text: "He gave it a scarf and a hat." },
      { e: "☀️", text: "The sun came out and it got warm." },
      { e: "😊", text: "The snowman got small, but Sam still smiled." },
    ],
    questions: [
      { q: "What did Sam make?", options: ["A snowman", "A sandcastle", "A cake"], answer: "A snowman" },
      { q: "What made the snowman small?", options: ["The sun", "The rain", "The wind"], answer: "The sun" },
    ] },
];
