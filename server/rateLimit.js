const buckets = new Map();

function prune(now) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > bucket.windowMs * 2) buckets.delete(key);
  }
}

export function allowRequest(key, { limit, windowMs }) {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now, windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
