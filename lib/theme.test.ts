import { describe, expect, it } from "vitest";
import { ColorToken, colors, textOn, tileColors } from "./theme";

// WCAG 2 relative luminance and contrast ratio.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const pairs = Object.entries(textOn).flatMap(([text, backgrounds]) =>
  backgrounds.map((background) => [text as ColorToken, background] as const),
);

describe("playlist tiles", () => {
  it.each(tileColors)("on-accent initial on %s meets WCAG AA", (tile) => {
    expect(contrast(colors["on-accent"], tile)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("theme contrast", () => {
  it.each(pairs)("%s text on %s meets WCAG AA (4.5:1)", (text, background) => {
    expect(contrast(colors[text], colors[background])).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
