/** Deterministic pseudo-random jitter so dots in the same country spread out. */
export function jitterForId(
  id: string,
  cx: number,
  cy: number,
  minRadius = 12,
  maxRadius = 28,
): [number, number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const angle = ((hash & 0xffff) / 0xffff) * Math.PI * 2;
  const t = ((hash >>> 16) & 0xff) / 255;
  const radius = minRadius + t * (maxRadius - minRadius);
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}
