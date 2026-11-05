export function toLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

export function startOfWeek(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const offset = (d.getDay() + 6) % 7;
  return addDays(date, 0 - offset);
}
