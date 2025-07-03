export function extractIdFromUrl(url: string): number | undefined {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? +match[1] : undefined;
}