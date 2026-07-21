"use client";

import { useEffect, useState } from "react";

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional substring of `text` whose characters should render with the
   * project's `text-gradient` class. Lets a heading keep its original
   * "rest + gradient emphasis" design while still animating every char
   * individually. The substring must live within a single line of
   * `text` (no `\n` inside the highlight) — multi-line highlights are
   * not supported and degrade to no highlight.
   */
  highlight?: string;
}

/**
 * AnimatedHeading — splits text by \n into lines, then each line into
 * individual characters. Each character starts at opacity:0 and
 * translateX(-18px), then transitions to opacity:1 and translateX(0).
 * Staggered delay: (lineIndex * lineLength * 30) + (charIndex * 30) + 200ms.
 * Each character transition is 500ms.
 * Spaces render as \u00A0 (non-breaking space).
 *
 * If `highlight` is provided, every char that falls within the substring
 * (matched inside a single line, by code-point index) additionally gets
 * the `text-gradient` class — applied to the char's own span so the
 * gradient reliably renders even though each char is `display: inline-block`.
 */
export function AnimatedHeading({ text, className = "", style, highlight }: AnimatedHeadingProps) {
  const [animate, setAnimate] = useState(false);
  const CHAR_DELAY = 30; // ms per character
  const INITIAL_DELAY = 200; // ms before animation starts
  const CHAR_DURATION = 500; // ms per character transition

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split("\n");

  // Pre-compute, per line, the [start, end) code-point range of the
  // highlight substring (if it appears in that line). A range of
  // [-1, -1] means "no highlight in this line". The match is performed
  // on the line's code-point array (via Array.from) so multi-code-unit
  // characters (e.g. é, ñ, emoji) are matched correctly.
  const highlightChars = highlight ? Array.from(highlight) : null;
  const highlightRangesByLine: { start: number; end: number }[] = lines.map((line) => {
    if (!highlightChars || highlightChars.length === 0) {
      return { start: -1, end: -1 };
    }
    const lineChars = Array.from(line);
    let start = -1;
    outer: for (let i = 0; i <= lineChars.length - highlightChars.length; i++) {
      for (let j = 0; j < highlightChars.length; j++) {
        if (lineChars[i + j] !== highlightChars[j]) continue outer;
      }
      start = i;
      break outer;
    }
    if (start < 0) return { start: -1, end: -1 };
    return { start, end: start + highlightChars.length };
  });

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => {
        const chars = Array.from(line);
        const range = highlightRangesByLine[lineIndex];
        return (
          <span key={lineIndex} style={{ display: "block" }}>
            {chars.map((char, charIndex) => {
              const inHighlight =
                range.start >= 0 &&
                charIndex >= range.start &&
                charIndex < range.end;
              const delay =
                (lineIndex * line.length * CHAR_DELAY) +
                (charIndex * CHAR_DELAY);
              return (
                <span
                  key={charIndex}
                  className={inHighlight ? "text-gradient" : undefined}
                  style={{
                    display: "inline-block",
                    opacity: animate ? 1 : 0,
                    transform: animate ? "translateX(0)" : "translateX(-18px)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: `${CHAR_DURATION}ms`,
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
