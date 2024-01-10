export function isNumeric(num: string): boolean {
  return !isNaN(parseInt(num));
}

export function normalizeString(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  return Math.min(
    levenshteinDistance(a.slice(1), b.slice(1)) + Number((a[0] !== b[0])),
    levenshteinDistance(a.slice(1), b) + 1,
    levenshteinDistance(a, b.slice(1)) + 1,
  );
}

export function findSimilarStrings(searchString: string, text: string) {
  let threshold = searchString.length - text.length;
  threshold = threshold < 0 ? threshold * -1 : threshold;
  const distance = levenshteinDistance(searchString, text);
  return distance <= threshold;
}
