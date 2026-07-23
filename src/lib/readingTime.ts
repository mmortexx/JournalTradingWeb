/**
 * estimateReadingTime — compute an estimated reading time in minutes
 * from a word count.
 *
 * Uses 220 words/minute as the reading speed (slightly above the
 * industry-standard 200-230 wpm for technical/instrumental content —
 * trading journal readers are skimming dense material, not reading a
 * novel). Rounds up to the nearest minute so a 1.2-min page reads as
 * "2 min" (never "0 min" or "1 min" for anything with real content).
 *
 * @param wordCount - the number of words in the page's body content
 * @returns whole minutes (minimum 1)
 */
export function estimateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / 220));
}

/**
 * countWords — count words in a text string. Splits on whitespace and
 * filters empty tokens. Handles ES + EN text equally (both are
 * whitespace-delimited languages).
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
