function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function cleanPoints(points) {
  return points
    .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
    .filter((point, index, items) => index === 0 || distance(point, items[index - 1]) > 0.2)
}

export function getPolylineLength(points) {
  const cleaned = cleanPoints(points)
  let total = 0
  for (let index = 1; index < cleaned.length; index += 1) {
    total += distance(cleaned[index - 1], cleaned[index])
  }
  return total
}

export function resamplePolyline(points, sampleCount = 24) {
  const cleaned = cleanPoints(points)
  if (!cleaned.length) return []
  if (cleaned.length === 1 || sampleCount <= 1) return [cleaned[0]]

  const cumulative = [0]
  for (let index = 1; index < cleaned.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distance(cleaned[index - 1], cleaned[index]))
  }

  const totalLength = cumulative.at(-1)
  if (totalLength === 0) return Array.from({ length: sampleCount }, () => cleaned[0])

  return Array.from({ length: sampleCount }, (_, sampleIndex) => {
    const target = (totalLength * sampleIndex) / (sampleCount - 1)
    let segment = 1
    while (segment < cumulative.length - 1 && cumulative[segment] < target) segment += 1

    const start = cleaned[segment - 1]
    const end = cleaned[segment]
    const segmentLength = cumulative[segment] - cumulative[segment - 1]
    const ratio = segmentLength === 0 ? 0 : (target - cumulative[segment - 1]) / segmentLength

    return {
      x: start.x + ((end.x - start.x) * ratio),
      y: start.y + ((end.y - start.y) * ratio),
    }
  })
}

function averageDistance(first, second) {
  return first.reduce((total, point, index) => total + distance(point, second[index]), 0) / first.length
}

export function evaluateStroke(userPoints, referencePoints) {
  const userLength = getPolylineLength(userPoints)
  const referenceLength = getPolylineLength(referencePoints)

  if (userPoints.length < 3 || userLength < Math.min(10, referenceLength * 0.3)) {
    return { accepted: false, code: 'too-short', message: 'Goresannya terlalu pendek. Coba tarik sampai titik akhir.' }
  }

  const user = resamplePolyline(userPoints)
  const reference = resamplePolyline(referencePoints)
  if (!reference.length) {
    return { accepted: false, code: 'missing-reference', message: 'Panduan stroke belum tersedia.' }
  }

  const startDistance = distance(user[0], reference[0])
  const endDistance = distance(user.at(-1), reference.at(-1))
  const forwardDistance = averageDistance(user, reference)
  const reverseDistance = averageDistance(user, [...reference].reverse())
  const lengthRatio = userLength / referenceLength

  if (startDistance > 22) {
    return { accepted: false, code: 'wrong-start', message: 'Mulai lebih dekat ke titik nomor stroke.' }
  }

  if (reverseDistance + 3 < forwardDistance) {
    return { accepted: false, code: 'wrong-direction', message: 'Arah goresannya terbalik. Ikuti arah dari nomor stroke.' }
  }

  if (lengthRatio < 0.45 || endDistance > 25) {
    return { accepted: false, code: 'too-short', message: 'Teruskan goresan sampai mendekati ujung panduan.' }
  }

  if (lengthRatio > 2.4 || forwardDistance > 16) {
    return { accepted: false, code: 'off-path', message: 'Goresan terlalu jauh dari pola. Ikuti garis panduan dengan santai.' }
  }

  return {
    accepted: true,
    code: 'accepted',
    message: 'Bagus. Lanjut ke stroke berikutnya.',
    score: Math.max(0, Math.round(100 - (forwardDistance * 4))),
  }
}
