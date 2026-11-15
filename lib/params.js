/** Route params can arrive percent-encoded when they hold Persian text. */
export function decodeParam(v) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}
