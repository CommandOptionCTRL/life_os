/**
 * Recurrence Utilities for LifeOS
 */

/**
 * @typedef {Object} RecurrenceRule
 * @property {'none' | 'daily' | 'weekly' | 'monthly'} frequency
 * @property {number} interval
 * @property {number[]} [daysOfWeek] - 0-6 (Sun-Sat)
 * @property {string} [time] - "HH:mm"
 * @property {'completion' | 'calendar'} type
 */

/**
 * Returns the dates for the current week (Mon-Sun)
 * @returns {string[]} ISO dates YYYY-MM-DD
 */
export function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(now.setDate(diff));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Returns the abbreviated day name for a date string
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string} M, T, W, T, F, S, S
 */
export function getDayAbbr(dateStr) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[new Date(dateStr).getDay()];
}

/**
 * Checks if a date matches a recurrence rule's daysOfWeek
 * @param {string} dateStr 
 * @param {RecurrenceRule} rule 
 */
export function matchesDayOfWeek(dateStr, rule) {
  if (rule.frequency !== 'weekly' || !rule.daysOfWeek?.length) return true;
  const day = new Date(dateStr).getDay();
  return rule.daysOfWeek.includes(day);
}

/**
 * Calculates the next occurrence date after a given date
 * @param {string} dateStr 
 * @param {RecurrenceRule} rule 
 * @returns {string} YYYY-MM-DD
 */
export function getNextDate(dateStr, rule) {
  const date = new Date(dateStr);
  const interval = rule.interval || 1;

  if (rule.frequency === 'daily') {
    date.setDate(date.getDate() + interval);
  } else if (rule.frequency === 'weekly') {
    const days = rule.daysOfWeek || [];
    if (days.length > 0) {
      // Find the next day in the selected daysOfWeek
      const currentDay = date.getDay();
      const sortedDays = [...days].sort((a, b) => a - b);
      const nextDay = sortedDays.find(d => d > currentDay);
      
      if (nextDay !== undefined) {
        date.setDate(date.getDate() + (nextDay - currentDay));
      } else {
        // Jump to the first day of the next interval week
        const daysUntilFirst = (7 - currentDay) + sortedDays[0];
        date.setDate(date.getDate() + daysUntilFirst + (7 * (interval - 1)));
      }
    } else {
      date.setDate(date.getDate() + (7 * interval));
    }
  } else if (rule.frequency === 'monthly') {
    date.setMonth(date.getMonth() + interval);
  }
  
  return date.toISOString().split('T')[0];
}
