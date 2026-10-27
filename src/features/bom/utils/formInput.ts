/**
 * Coerces a `<input type="number">` string value into a number, treating an
 * emptied field as 0 instead of NaN. Shared by every numeric field in the
 * BOM node editor so the "empty input" behavior is consistent everywhere.
 */
export function parseNumericInput(value: string): number {
  return value === '' ? 0 : Number(value)
}
