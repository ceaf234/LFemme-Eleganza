/**
 * Shared timezone utility for L'Femme Eleganza.
 *
 * Guatemala (America/Guatemala) is always UTC-6 — no DST.
 * All timestamps are stored as `timestamptz` in Supabase and
 * explicitly tagged with the -06:00 offset so PostgreSQL
 * interprets them correctly regardless of server timezone.
 */

const GT_OFFSET = '-06:00';
const GT_TIMEZONE = 'America/Guatemala';

// ─── Timestamp construction ──────────────────────────────────

/**
 * Build an ISO-8601 string representing Guatemala local time.
 * @param date  "YYYY-MM-DD"
 * @param time  "HH:mm"
 * @returns     "YYYY-MM-DDTHH:mm:00-06:00"
 */
export function buildGuatemalaISO(date: string, time: string): string {
  return `${date}T${time}:00${GT_OFFSET}`;
}

/**
 * Build an end-time ISO string by adding a duration to a start time.
 */
export function buildGuatemalaEndISO(
  date: string,
  time: string,
  durationMinutes: number,
): string {
  const start = new Date(`${date}T${time}:00${GT_OFFSET}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return formatISOWithGTOffset(end);
}

/**
 * Convert a `datetime-local` input value ("YYYY-MM-DDTHH:mm") to an
 * ISO string with the Guatemala offset. Used by BlockedTimeForm.
 */
export function localInputToGTISO(datetimeLocalValue: string): string {
  return `${datetimeLocalValue}:00${GT_OFFSET}`;
}

// ─── Query boundaries ────────────────────────────────────────

/**
 * Start/end boundaries for a single Guatemala day.
 * Use with `.gte('col', start).lt('col', end)`.
 */
export function gtDayBoundaries(dateStr: string): { start: string; end: string } {
  return {
    start: `${dateStr}T00:00:00${GT_OFFSET}`,
    end: `${nextDay(dateStr)}T00:00:00${GT_OFFSET}`,
  };
}

/**
 * Start/end boundaries for the current Guatemala week (Sun → Sat).
 */
export function gtWeekBoundaries(): { start: string; end: string } {
  const todayStr = formatGTDate(new Date());
  const [y, m, d] = todayStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return {
    start: `${formatLocalDate(startOfWeek)}T00:00:00${GT_OFFSET}`,
    end: `${formatLocalDate(endOfWeek)}T00:00:00${GT_OFFSET}`,
  };
}

/**
 * Start/end boundaries for the current Guatemala month.
 */
export function gtMonthBoundaries(): { start: string; end: string } {
  const todayStr = formatGTDate(new Date());
  const [y, m] = todayStr.split('-').map(Number);
  const startOfMonth = new Date(y, m - 1, 1);
  const endOfMonth = new Date(y, m, 1);

  return {
    start: `${formatLocalDate(startOfMonth)}T00:00:00${GT_OFFSET}`,
    end: `${formatLocalDate(endOfMonth)}T00:00:00${GT_OFFSET}`,
  };
}

// ─── Display formatters ──────────────────────────────────────

/**
 * Format today's date (or any Date) as "YYYY-MM-DD" in Guatemala timezone.
 */
export function formatGTDate(date: Date): string {
  // 'en-CA' locale outputs YYYY-MM-DD
  return date.toLocaleDateString('en-CA', { timeZone: GT_TIMEZONE });
}

/**
 * Format an ISO timestamp as "HH:mm" in Guatemala timezone.
 */
export function formatGTTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-GT', {
    timeZone: GT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format an ISO timestamp as a full date+time in Guatemala timezone.
 * e.g. "vie, 14 de feb de 2025, 14:30"
 */
export function formatGTDateTime(
  isoString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(isoString).toLocaleString('es-GT', {
    timeZone: GT_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Short date+time for audit history.
 * e.g. "14 feb, 14:30"
 */
export function formatGTShortDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('es-GT', {
    timeZone: GT_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Date-only display for client records.
 * e.g. "14 de feb de 2025"
 */
export function formatGTDisplayDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-GT', {
    timeZone: GT_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Convert an ISO timestamp to a `datetime-local` input value
 * in Guatemala timezone. Used by BlockedTimeForm when editing.
 */
export function isoToDatetimeLocal(isoString: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: GT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(isoString));

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

// ─── Multi-day range helpers ─────────────────────────────────

/**
 * Add N days to a YYYY-MM-DD string, returning a YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return formatLocalDate(date);
}

/**
 * Get an array of YYYY-MM-DD strings for `count` consecutive days.
 */
export function getDateRange(startDateStr: string, count: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addDays(startDateStr, i));
  }
  return dates;
}

/**
 * Start/end boundaries for a multi-day range in Guatemala timezone.
 * `start` = midnight of `dateStr`, `end` = midnight of `dateStr + days`.
 */
export function gtRangeBoundaries(
  dateStr: string,
  days: number,
): { start: string; end: string } {
  return {
    start: `${dateStr}T00:00:00${GT_OFFSET}`,
    end: `${addDays(dateStr, days)}T00:00:00${GT_OFFSET}`,
  };
}

/**
 * Extract hour as a decimal in Guatemala timezone from an ISO timestamp.
 * e.g., "2026-02-06T14:30:00-06:00" → 14.5
 */
export function getGTHourDecimal(isoString: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: GT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(isoString));
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour + minute / 60;
}

/**
 * Extract the YYYY-MM-DD date portion in Guatemala timezone from an ISO timestamp.
 */
export function getGTDateStr(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-CA', { timeZone: GT_TIMEZONE });
}

/**
 * Given a YYYY-MM-DD, return the Sunday of that week (Sun-start).
 */
export function getWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0=Sun
  const weekStart = new Date(y, m - 1, d - dayOfWeek);
  return formatLocalDate(weekStart);
}

/**
 * Format a short day header for timeline columns.
 * e.g., "lun 6" from "2026-02-06"
 */
export function formatShortDayHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00-06:00');
  const weekday = date.toLocaleDateString('es-GT', {
    timeZone: GT_TIMEZONE,
    weekday: 'short',
  });
  const day = date.toLocaleDateString('es-GT', {
    timeZone: GT_TIMEZONE,
    day: 'numeric',
  });
  return `${weekday} ${day}`;
}

// ─── Internal helpers ────────────────────────────────────────

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  return formatLocalDate(next);
}

function formatISOWithGTOffset(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: GT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}${GT_OFFSET}`;
}
