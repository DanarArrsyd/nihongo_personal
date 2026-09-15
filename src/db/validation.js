export function normalizeTimestamp(timestamp) {
  if (timestamp == null) return null

  const date = timestamp instanceof Date
    ? timestamp
    : typeof timestamp === 'string'
      ? new Date(timestamp)
      : null

  if (!date || Number.isNaN(date.getTime())) {
    throw new Error('Invalid timestamp')
  }

  return date.toISOString()
}

export function validateItemIdentifiers(itemType, itemId) {
  if (typeof itemType !== 'string' || typeof itemId !== 'string' || !itemType.trim() || !itemId.trim()) {
    throw new Error('itemType and itemId are required')
  }
}

export function validateBoolean(value, name) {
  if (typeof value !== 'boolean') {
    throw new Error(`${name} must be a boolean`)
  }
}
