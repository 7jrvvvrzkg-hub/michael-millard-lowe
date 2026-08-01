"use client";

import { useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";

// ---------------------------------------------------------------------------
// A small, honest chess bot - not a real chess engine
// ---------------------------------------------------------------------------
// This isn't Stockfish. It's a shallow minimax search (depth 1-3 depending
// on target strength) over simple material counting, plus a "blunder
// chance" - a probability of ignoring the best move it found and playing a
// random legal one instead. Mixing search depth with blunder rate is a
// common, honest way to approximate a wide range of playing strength
// without a real calibrated rating system behind it. Treat the "ELO"
// numbers here as a rough feel, not a certified rating.
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const PIECE_GLYPH = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };

function eloToParams(elo) {
  if (elo < 700) return { depth: 1, blunderChance: 0.55 };
  if (elo < 900) return { depth: 1, blunderChance: 0.35 };
  if (elo < 1100) return { depth: 1, blunderChance: 0.18 };
  if (elo < 1300) return { depth: 2, blunderChance: 0.12 };
  if (elo < 1600) return { depth: 2, blunderChance: 0.05 };
  return { depth: 3, blunderChance: 0.02 };
}

function evaluateBoard(chess) {
  let score = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const value = PIECE_VALUES[cell.type];
      score += cell.color === "w" ? value : -value;
    }
  }
  return score;
}

function minimax(chess, depth, alpha, beta, maximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);
  const moves = chess.moves({ verbose: true });

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
    best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
    chess.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

// Bot always plays Black, so it's minimizing the (White-positive) score.
function pickBotMove(chess, elo) {
  const { depth, blunderChance } = eloToParams(elo);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (Math.random() < blunderChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestScore = Infinity;
  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
    const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
    chess.undo();
    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

// Cookie helpers - guarded for SSR since `document` doesn't exist on the
// server, and Next.js pre-renders "use client" components there too.
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const MIN_ELO = 400;
const MAX_ELO = 2000;
const WIN_INCREMENT = 40;

export default function ChessGame() {
  // gameRef holds the live chess.js instance; fen is a snapshot of it used
  // purely to trigger re-renders whenever the position actually changes.
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(() => gameRef.current.fen());
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [thinking, setThinking] = useState(false);

  // Starts at a fixed default so server and first client render match
  // exactly (avoids a hydration mismatch) - the real cookie-backed value
  // (existing, or a fresh random 500-850) loads a moment later on mount.
  const [elo, setElo] = useState(650);
  const [eloReady, setEloReady] = useState(false);

  if (!eloReady && typeof document !== "undefined") {
    // Runs once on first client render, before paint - reading the cookie
    // synchronously here (rather than in useEffect) avoids a visible
    // "flash" of the placeholder 650 value.
    const saved = getCookie("chessBotElo");
    if (saved && !Number.isNaN(Number(saved))) {
      setElo(Number(saved));
    } else {
      const initial = 500 + Math.floor(Math.random() * 351); // 500-850
      setCookie("chessBotElo", initial, 365);
      setElo(initial);
    }
    setEloReady(true);
  }

  const legalTargets = useMemo(() => {
    if (!selected) return new Set();
    return new Set(
      gameRef.current.moves({ square: selected, verbose: true }).map((m) => m.to)
    );
  }, [selected, fen]);

  function updateEloCookie(next) {
    const clamped = Math.max(MIN_ELO, Math.min(MAX_ELO, next));
    setElo(clamped);
    setCookie("chessBotElo", clamped, 365);
  }

  function describeGameOver() {
    const chess = gameRef.current;
    if (chess.isCheckmate()) {
      const loserColor = chess.turn(); // side to move is the one in checkmate
      if (loserColor === "b") {
        updateEloCookie(elo + WIN_INCREMENT);
        setStatus("Checkmate — you win.");
      } else {
        setStatus("Checkmate — the bot wins.");
      }
    } else if (chess.isStalemate()) {
      setStatus("Stalemate — draw.");
    } else if (chess.isDraw()) {
      setStatus("Draw.");
    } else {
      setStatus("Game over.");
    }
  }

  function afterHumanMove() {
    const chess = gameRef.current;
    if (chess.isGameOver()) {
      setFen(chess.fen());
      describeGameOver();
      return;
    }
    setFen(chess.fen());
    setThinking(true);
    setTimeout(() => {
      const move = pickBotMove(chess, elo);
      if (move) {
        chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
      }
      setFen(chess.fen());
      setThinking(false);
      if (chess.isGameOver()) describeGameOver();
    }, 450 + Math.random() * 400);
  }

  function handleSquareClick(square) {
    const chess = gameRef.current;
    if (thinking || chess.isGameOver() || chess.turn() !== "w") return;

    const piece = chess.get(square);

    if (selected) {
      const isLegal = chess
        .moves({ square: selected, verbose: true })
        .some((m) => m.to === square);
      if (isLegal) {
        chess.move({ from: selected, to: square, promotion: "q" });
        setSelected(null);
        afterHumanMove();
        return;
      }
      setSelected(piece && piece.color === "w" ? square : null);
      return;
    }

    if (piece && piece.color === "w") setSelected(square);
  }

  function newGame() {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setSelected(null);
    setStatus("");
    setThinking(false);
  }

  const board = gameRef.current.board();
  const inCheck = !gameRef.current.isGameOver() && gameRef.current.inCheck();

  return (
    <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center">
      {/* The "window": a rounded-rect clipped viewport, no bordered/boxed
          section wrapped around it - it just sits directly on the page. */}
      <div className="overflow-hidden rounded-[28px] shadow-[0_8px_30px_rgba(18,14,11,0.18)]">
        <div className="grid grid-cols-8">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const file = "abcdefgh"[colIndex];
              const rank = 8 - rowIndex;
              const square = `${file}${rank}`;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selected === square;
              const isTarget = legalTargets.has(square);

              return (
                <button
                  key={square}
                  type="button"
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex h-9 w-9 items-center justify-center text-2xl leading-none transition-colors sm:h-10 sm:w-10 ${
                    isDark ? "bg-espresso-700" : "bg-parchment-100"
                  } ${isSelected ? "ring-2 ring-inset ring-clay-500" : ""}`}
                >
                  {cell && (
                    <span
                      style={
                        cell.color === "w"
                          ? {
                              color: "#f8f1e3",
                              textShadow:
                                "-1px -1px 0 #17130f, 1px -1px 0 #17130f, -1px 1px 0 #17130f, 1px 1px 0 #17130f",
                            }
                          : { color: "#17130f" }
                      }
                    >
                      {PIECE_GLYPH[cell.type]}
                    </span>
                  )}
                  {isTarget && !cell && (
                    <span className="absolute h-2 w-2 rounded-full bg-clay-500/70" />
                  )}
                  {isTarget && cell && (
                    <span className="absolute inset-1 rounded-full ring-2 ring-clay-500/80" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 flex min-h-[20px] items-center gap-2 text-xs text-espresso-600">
        {thinking ? (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-espresso-400" />
            thinking
          </span>
        ) : status ? (
          <span className="font-medium text-espresso-800">{status}</span>
        ) : inCheck ? (
          <span className="font-medium text-clay-600">Check</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      <div className="mt-3 w-full max-w-[280px]">
        <div className="flex items-center justify-between text-[11px] text-espresso-500">
          <span>Bot strength</span>
          <span>{elo} elo</span>
        </div>
        <input
          type="range"
          min={MIN_ELO}
          max={MAX_ELO}
          step={10}
          value={elo}
          onChange={(e) => updateEloCookie(Number(e.target.value))}
          className="mt-1 w-full accent-clay-600"
        />
      </div>

      <button
        type="button"
        onClick={newGame}
        className="mt-4 rounded-full border border-espresso-900/15 px-4 py-1.5 text-xs font-semibold text-espresso-700 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
      >
        New Game
      </button>
    </div>
  );
}
