import type { DateStatus } from './types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Local calendar date of a Date, as YYYY-MM-DD. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Civil day ordinal. Comparing ordinals instead of dividing elapsed
 * milliseconds keeps day counts correct across daylight-saving changes.
 */
export function dayOrdinal(iso: string): number {
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function daysUntil(iso: string, today: string): number {
  return dayOrdinal(iso) - dayOrdinal(today);
}

export function addDays(iso: string, days: number): string {
  const parts = iso.split('-');
  const base = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  base.setDate(base.getDate() + days);
  return toISODate(base);
}

export function statusOf(bestBefore: string | null, today: string): DateStatus {
  if (!bestBefore) {
    return 'none';
  }
  const diff = daysUntil(bestBefore, today);
  if (diff < 0) {
    return 'past';
  }
  if (diff === 0) {
    return 'today';
  }
  if (diff <= 7) {
    return 'soon';
  }
  return 'later';
}

/** "18 Nov" — the current year is left off the short form. */
export function formatShort(iso: string): string {
  const parts = iso.split('-');
  const month = MONTHS[Number(parts[1]) - 1] || '';
  return `${Number(parts[2])} ${month}`;
}

export function formatFull(iso: string): string {
  const parts = iso.split('-');
  return `${formatShort(iso)} ${parts[0]}`;
}

/** Explicit wording — never implies the food is safe or unsafe to eat. */
export function dateLabel(bestBefore: string | null, today: string): string {
  if (!bestBefore) {
    return 'No date set';
  }
  const diff = daysUntil(bestBefore, today);
  if (diff < 0) {
    const n = Math.abs(diff);
    return `${n} ${n === 1 ? 'day' : 'days'} past best before`;
  }
  if (diff === 0) {
    return 'Best before today';
  }
  if (diff === 1) {
    return 'Best before tomorrow';
  }
  if (diff <= 7) {
    return `In ${diff} days`;
  }
  return `Best before ${formatShort(bestBefore)}`;
}
