export function summarize(value: number, confidence?: number): string {
  return confidence ? `${value} ± ${confidence}` : `${value}`;
}
