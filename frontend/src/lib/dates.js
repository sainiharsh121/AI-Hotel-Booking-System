// Local-time date helpers. toISOString() converts to UTC, which returns
// yesterday's date for guests in India between midnight and 05:30.

const pad = (n) => String(n).padStart(2, '0');

export const toLocalISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + Number(days));
  return d;
};

export const formatDay = (date) =>
  date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
