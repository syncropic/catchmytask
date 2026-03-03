const ID_REGEX = /^([A-Z][A-Z0-9]{0,7})-([0-9]{1,6})$/

export function parseItemId(raw: string): { prefix: string; number: number } | null {
  const match = raw.match(ID_REGEX)
  if (!match) return null
  return { prefix: match[1], number: parseInt(match[2], 10) }
}

export function formatItemId(prefix: string, number: number, padWidth = 4): string {
  return `${prefix}-${String(number).padStart(padWidth, '0')}`
}
