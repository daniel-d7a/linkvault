export function parseTags(tagsString) {
  if (!tagsString) return [];
  const seen = new Set();
  return tagsString
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => {
      if (!t || seen.has(t)) return false;
      seen.add(t);
      return true;
    });
}
