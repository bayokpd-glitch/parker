import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import type { WhisperWord } from "../types";

const { fontFamily } = loadFont("normal", {
  weights: ["600"],
});

// Phrase chunking limits — tuned for news readability.
const MAX_WORDS_PER_CHUNK = 5;
const MAX_CHUNK_DURATION_SEC = 2.5;
const PAUSE_GAP_SEC = 0.4;

interface FixedWord {
  word: string;
  start: number;
  end: number;
}

interface Chunk {
  text: string;
  start: number;
  end: number;
}

/**
 * Fix Whisper zero-duration words so they actually show on screen.
 * When a word has end <= start, we extend it to the next word's start
 * (if there's room) or give it a hard minimum of 0.15 s.
 */
function fixWords(words: WhisperWord[]): FixedWord[] {
  const result: FixedWord[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const text = w.word.trim();
    if (!text) continue; // skip empty-string artifacts

    const start = w.start;
    let end = w.end;

    if (end <= start) {
      const nextStart = words[i + 1]?.start;
      if (nextStart !== undefined && nextStart > start + 0.15) {
        end = nextStart;
      } else {
        end = start + 0.15;
      }
    }

    result.push({ word: text, start, end });
  }
  return result;
}

/**
 * Group words into readable phrases (chunks) breaking on:
 *   • hard punctuation (. ! ?)
 *   • soft punctuation (, ; :) when we already have 3+ words
 *   • long pauses between words
 *   • max words per chunk
 *   • max chunk duration
 *
 * Every word is guaranteed to land in exactly one chunk.
 */
function chunkWords(words: FixedWord[]): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords: FixedWord[] = [words[i]];
    let j = i + 1;

    while (j < words.length) {
      const prev = words[j - 1];
      const curr = words[j];
      const prevText = prev.word;
      const gap = curr.start - prev.end;
      const chunkDur = curr.end - chunkWords[0].start;

      const shouldBreak =
        /[.!?]$/.test(prevText) || // hard punctuation
        gap > PAUSE_GAP_SEC || // long pause
        chunkDur > MAX_CHUNK_DURATION_SEC || // too long
        (chunkWords.length >= 3 && /[,;:]$/.test(prevText)) || // soft punct
        chunkWords.length >= MAX_WORDS_PER_CHUNK; // max words

      if (shouldBreak) break;

      chunkWords.push(curr);
      j++;
    }

    chunks.push({
      text: chunkWords.map((w) => w.word).join(" "),
      start: chunkWords[0].start,
      end: chunkWords[chunkWords.length - 1].end,
    });

    i = j;
  }

  return chunks;
}

interface Props {
  words: WhisperWord[];
}

/**
 * Professional phrase-level news subtitles.
 *
 * • Words are grouped into 2–5 word phrases for readability
 * • Zero-duration Whisper words are fixed so they never drop
 * • Empty-string artifacts are filtered out
 * • Phrases appear exactly when their first word starts
 * • When chunks overlap (e.g. from zero-duration fixes), the most
 *   recently-started chunk is shown so sync stays as tight as possible
 * • No animation — text cuts cleanly at natural boundaries
 */
export const Subtitles: React.FC<Props> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const fixedWords = React.useMemo(() => fixWords(words), [words]);
  const chunks = React.useMemo(() => chunkWords(fixedWords), [fixedWords]);

  // Find the active chunk with the LATEST start time.
  // This gracefully handles overlapping chunks by preferring the
  // chunk that started most recently.
  let active: Chunk | null = null;
  for (const c of chunks) {
    if (t >= c.start && t <= c.end) {
      if (!active || c.start > active.start) {
        active = c;
      }
    }
  }
  if (!active) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "8%",
          transform: "translateX(-50%)",
          fontFamily,
          fontSize: 44,
          fontWeight: 600,
          color: "#ffffff",
          textTransform: "none",
          letterSpacing: "0.02em",
          lineHeight: 1.35,
          textAlign: "center",
          maxWidth: "85%",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "14px 32px",
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            borderRadius: 6,
            boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}
        >
          {active.text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
