/**
 * Converts the typed text into a number.
 * @returns null when the input is empty or is not a non-negative integer
 */
export function parseAnswer(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d+$/.test(trimmed)) {
    return null
  }
  return Number(trimmed)
}
