const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const formatWeddingDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, the ${ordinal(d.getDate())} of ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

export const formatEventDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatTime = (timeStr: string): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
