/* ============================================================
   Star Readers — CHESS (A+ UIL Chess Puzzle practice)
   Multiple-choice puzzles on board diagrams, in the style of the
   UIL A+ Chess Puzzle contest (grades 2-8). Each answer has been
   checked for correctness. Board squares use algebraic notation
   (files a-h, ranks 1-8). Piece codes: "wN" = white knight, etc.
   Add your own puzzles by copying an entry below.
   ============================================================ */
const CHESS_PUZZLES = [
  { board: { e4: "wN" }, highlight: ["e4"],
    ask: "What is this white chess piece?",
    options: ["Knight", "Bishop", "Rook"], answer: "Knight",
    tip: "The piece shaped like a horse is the Knight." },

  { board: { d2: "wP" }, highlight: ["d2"],
    ask: "Which square is the pawn on? (file letter, then rank number)",
    options: ["d2", "d4", "b2"], answer: "d2",
    tip: "Read the file letter (d) first, then the rank number (2)." },

  { board: { d4: "wN" }, highlight: ["d4"],
    ask: "The knight is on d4. Which square can it jump to?",
    options: ["f5", "e5", "d6"], answer: "f5",
    tip: "A knight moves in an L: two squares one way, then one to the side (d4 → f5)." },

  { board: { a1: "wR", a6: "bP" }, highlight: ["a1", "a6"],
    ask: "Can the white Rook capture the black pawn?",
    options: ["Yes", "No"], answer: "Yes",
    tip: "A rook moves in straight lines. The a-file is open, so it can capture the pawn." },

  { board: { c1: "wB" }, highlight: ["c1"],
    ask: "A bishop moves on diagonals. Which square can this bishop reach?",
    options: ["a3", "c3", "d1"], answer: "a3",
    tip: "Bishops move diagonally: c1 → b2 → a3." },

  { board: { e8: "bK", e1: "wR" }, highlight: ["e8", "e1"],
    ask: "Is the black King in check?",
    options: ["Yes", "No"], answer: "Yes",
    tip: "The rook attacks up the open e-file all the way to the king — that is check." },

  { board: { h8: "bK", h7: "bP", g7: "bP", a8: "wR" }, highlight: ["h8", "a8"],
    ask: "Black King is on h8. Is this checkmate?",
    options: ["Yes", "No"], answer: "Yes",
    tip: "The rook checks along rank 8, and the king's escape squares are blocked by its own pawns. That's a back-rank mate!" },

  { board: { e5: "wP", d5: "bP" }, highlight: ["e5", "d5"],
    ask: "Black's pawn just moved d7 → d5. Can the white e5 pawn capture it 'en passant'?",
    options: ["Yes", "No"], answer: "Yes",
    tip: "En passant: right after a pawn jumps two squares, a pawn next to it may capture to the square behind it (d6)." },

  { board: { d4: "wR" }, highlight: ["d4"],
    ask: "Which piece moves only in straight lines (never diagonally)?",
    options: ["Rook", "Bishop", "Pawn"], answer: "Rook",
    tip: "Rooks move straight (up/down/side). Bishops move diagonally." },

  { board: { e1: "wK", e8: "bK", d1: "wQ" }, highlight: ["d1"],
    ask: "How many points is the Queen worth?",
    options: ["9", "5", "3"], answer: "9",
    tip: "Piece values: Pawn 1, Knight 3, Bishop 3, Rook 5, Queen 9." },

  { board: { g1: "wN" }, highlight: ["g1"],
    ask: "A knight can jump over other pieces. True or false?",
    options: ["True", "False"], answer: "True",
    tip: "The knight is the only piece that can jump over other pieces." },

  { board: { f7: "bP", f8: "bK", e1: "wR", h1: "wB" }, highlight: ["h1"],
    ask: "Which white piece moves on diagonals?",
    options: ["Bishop", "Rook", "King"], answer: "Bishop",
    tip: "The Bishop (on h1 here) travels along diagonals of one color." },
];

/* Official / recommended practice links (open in a new tab). */
const CHESS_LINKS = [
  { emoji: "🏆", label: "A+ Chess Puzzle (UIL event page)", url: "https://www.uiltexas.org/aplus/events/a-chess-puzzle" },
  { emoji: "📝", label: "A+ Chess Sample Test, Key & Answer Sheet (PDF)", url: "https://www.uiltexas.org/files/academics/aplus/A+_Chess_Sample_Ansswer_Sheet,_Test,_and_Key.pdf" },
  { emoji: "📄", label: "Sample Questions 2016 (PDF)", url: "https://www.uiltexas.org/files/academics/aplus/UIL_Sample_2016.pdf" },
  { emoji: "📚", label: "How to Study for A+ Chess Puzzle (PDF)", url: "https://www.uiltexas.org/files/academics/aplus/Studying_for_Chess_Puzzlenew2016.pdf" },
  { emoji: "🗂️", label: "Previous years' A+ tests", url: "https://www.uiltexas.org/aplus/resources/home" },
  { emoji: "🧩", label: "Kid Chess — puzzles", url: "http://www.kidchess.com/puzzles/puzzles.html" },
  { emoji: "♟️", label: "ChessKid.com", url: "https://www.chesskid.com/" },
  { emoji: "↔️", label: "Learn En Passant (chess.com)", url: "https://www.chess.com/terms/en-passant" },
  { emoji: "🎓", label: "Texas Tech Chess", url: "http://www.depts.ttu.edu/ttuchess/" },
];
