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
    /* aria-label con el texto completo + \u00E1rbol visual aria-hidden: los
       lectores de pantalla leen la frase entera de una vez en lugar de
       letra a letra (cada char vive en su propio span). */
    <h1 className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => {
          const range = highlightRangesByLine[lineIndex];
          /* Agrupar por PALABRAS: cada palabra es un span inline-block
             con white-space:nowrap y los espacios son nodos de texto
             normales. As\u00ED el navegador solo puede partir la l\u00EDnea en los
             espacios \u2014 antes, con cada car\u00E1cter como inline-block
             independiente, el salto pod\u00EDa caer en mitad de una palabra
             ("pa|ra") sin guion. La animaci\u00F3n char-a-char no cambia:
             los delays siguen contados por \u00EDndice global de car\u00E1cter. */
          const words = line.split(" ");
          let charCursor = 0; // \u00EDndice de car\u00E1cter dentro de la l\u00EDnea
          return (
            <span key={lineIndex} style={{ display: "block" }}>
              {words.map((word, wordIndex) => {
                const wordStart = charCursor;
                const chars = Array.from(word);
                charCursor += chars.length + 1; // +1 por el espacio
                return (
                  <span key={wordIndex}>
                    {wordIndex > 0 && " "}
                    <span
                      style={{ display: "inline-block", whiteSpace: "nowrap" }}
                    >
                      {chars.map((char, ci) => {
                        const charIndex = wordStart + ci;
                        const inHighlight =
                          range.start >= 0 &&
                          charIndex >= range.start &&
                          charIndex < range.end;
                        const delay =
                          (lineIndex * line.length * CHAR_DELAY) +
                          (charIndex * CHAR_DELAY);
                        return (
                          <span
                            key={ci}
                            className={inHighlight ? "text-gradient" : undefined}
                            style={{
                              display: "inline-block",
                              opacity: animate ? 1 : 0,
                              transform: animate
                                ? "translateX(0)"
                                : "translateX(-18px)",
                              transitionProperty: "opacity, transform",
                              transitionDuration: `${CHAR_DURATION}ms`,
                              transitionTimingFunction:
                                "cubic-bezier(0.22, 1, 0.36, 1)",
                              transitionDelay: `${delay}ms`,
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
