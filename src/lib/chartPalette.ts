/**
 * Fixed-order categorical palette + status colors for chart marks. Hues are
 * assigned by slot order (never cycled/reassigned) so a series keeps its
 * color identity across filters. Values mirror the CSS custom properties in
 * index.css; kept here as plain hex because SVG fill/stroke attributes need
 * concrete color values at render time.
 */
export const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#4a3aa7', // 6 violet
  '#008300', // 7 green
  '#e34948', // 8 red
] as const

export const SEQUENTIAL_BLUE = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'] as const

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
} as const

export const CHART_CHROME = {
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  primaryInk: '#0b0b0b',
  secondaryInk: '#52514e',
}

/** Assigns a stable categorical color to each item in a fixed-order list (e.g. production lines). */
export function paletteFor<T extends string>(keys: readonly T[]): Record<T, string> {
  const map = {} as Record<T, string>
  keys.forEach((k, i) => {
    map[k] = CATEGORICAL[i % CATEGORICAL.length]
  })
  return map
}
