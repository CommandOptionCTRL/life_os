import { writable } from 'svelte/store';
import { occurrences } from './occurrenceStore';

/**
 * Schedule Schema:
 * { type: 'none'|'daily'|'weekly'|'monthly'|'custom', days: number[], times: string[], startDate: string|null, endDate: string|null, frequency: number }
 */

function createRecurringStore() {
  const { subscribe } = writable({});

  /**
   * Generates next 30 days of occurrences for a given task.
   * Clears old uncompleted occurrences to rebuild the schedule.
   * @param {any} task
   */
  async function generateOccurrencesForTask(task) {
    if (!task.recurring || !task.schedule || task.schedule.type === 'none') {
      await occurrences.deleteByTaskId(task.id);
      return;
    }
    
    // Delete existing pending occurrences to avoid duplicates if schedule changed
    // In a real prod app, we'd selectively delete/update them.
    await occurrences.deleteByTaskId(task.id);
    
    // @ts-ignore
    const newOccurrences = /** @type {any[]} */ ([]);
    const windowDays = 30; // Pre-generate up to 30 days
    
    const start = task.schedule.startDate ? new Date(task.schedule.startDate) : new Date();
    // Normalize start date to midnight local
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < windowDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dayStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD local format
      const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      
      let shouldGenerate = false;
      
      if (task.schedule.type === 'daily') {
        shouldGenerate = i % task.schedule.frequency === 0;
      } else if (task.schedule.type === 'weekly' || task.schedule.type === 'custom') {
        // Assume days property maps 0-6 to Sun-Sat. 
        if (task.schedule.days && task.schedule.days.includes(dayOfWeek)) {
          // Simplistic frequency logic: only generate on week intervals.
          // True interval math requires week boundaries. For now, true if within constraints.
          shouldGenerate = true;
        }
      }
      
      if (shouldGenerate) {
        const times = task.schedule.times && task.schedule.times.length > 0 
          ? task.schedule.times 
          : [task.dueTime || '12:00'];
          
        /** @param {string} time */
        times.forEach(time => {
            newOccurrences.push({
                taskId: task.id,
                projectId: task.projectId || '',
                date: dayStr,
                time: time,
            });
        });
      }
    }

    if (newOccurrences.length > 0) {
      await occurrences.addOccurrences(newOccurrences);
    }
  }

  return { subscribe, generateOccurrencesForTask };
}

export const recurring = createRecurringStore();
