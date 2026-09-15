function isNonBlankString(value) {
  return typeof value === 'string' && Boolean(value.trim())
}

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

export function normalizeRequiredTimestamp(timestamp, name = 'timestamp') {
  const normalizedTimestamp = normalizeTimestamp(timestamp)

  if (normalizedTimestamp == null) {
    throw new Error(`${name} is required`)
  }

  return normalizedTimestamp
}

export function validateNonBlankString(value, name) {
  if (!isNonBlankString(value)) {
    throw new Error(`${name} must be a non-blank string`)
  }
}

export function validateItemIdentifiers(itemType, itemId) {
  if (!isNonBlankString(itemType) || !isNonBlankString(itemId)) {
    throw new Error('itemType and itemId are required')
  }
}

export function validateBoolean(value, name) {
  if (typeof value !== 'boolean') {
    throw new Error(`${name} must be a boolean`)
  }
}

export function validateScalarValue(value, name) {
  const isScalar = value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'

  if (!isScalar) {
    throw new Error(`${name} must be a scalar value`)
  }
}

export function validateNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }
}

export function validateFiniteNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`)
  }
}

export function validateScore(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('score must be between 0 and 100')
  }
}

export function validateStudySessionKind(kind) {
  if (kind !== 'quiz' && kind !== 'flashcard') {
    throw new Error('Unsupported study session kind')
  }
}
