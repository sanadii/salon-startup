/** Format a number as Kuwaiti Dinar display (no currency symbol in locale). */
export function formatKd(amount: number): string {
  return `${amount.toLocaleString()} KD`;
}

export function parseMoneyInput(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
