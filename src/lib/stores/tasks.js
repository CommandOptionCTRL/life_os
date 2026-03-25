import { writable, derived } from 'svelte/store';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/database.js';

/**
 * @typedef {Object} Recurrence
 * @property {'none' | 'daily' | 'weekly' | 'monthly'} frequency
 * @property {number} interval
 * @property {number[]} [daysOfWeek]
 * @property {string} [time]
 * @property {'completion' | 'calendar'} type
 * 
 * @typedef {{
 *   id: string;
 *   name: string;
 *   description: string;
 *   projectId: string;
 *   status: 'active' | 'pending' | 'done';
 *   priority: 'high' | 'medium' | 'low';
 *   flagged: boolean;
 *   dueDate: string | null;
 *   dueTime: string | null;
 *   recurrence: Recurrence;
 *   completions: Record<string, boolean>;
 *   preparationItems: { id: string; text: string; completed: boolean }[];
 *   createdAt: import('firebase/firestore').Timestamp;
 * }} Task
 */

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const col = collection(db, 'tasks');

function createTasksStore() {
  const { subscribe, set, update } = writable(/** @type {Task[]} */ ([]));

  /** @type {import('firebase/firestore').Unsubscribe | null} */
  let unsubscribe = null;

  /**
   * @param {string | null} projectId
   * @param {(() => void) | null} onLoaded
   */
  function init(projectId, onLoaded = null) {
    const q = projectId 
      ? query(col, where('projectId', '==', projectId))
      : query(col);
    let initial = true;
    unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => (/** @type {Task} */ ({ id: d.id, ...d.data() })));
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      set(items);
      if (initial) {
        initial = false;
        onLoaded?.();
      }
    });
  }

  function destroy() {
    if (unsubscribe) unsubscribe();
  }

  async function addTask(data) {
    await addDoc(col, {
      name: data.name,
      description: data.description ?? '',
      projectId: data.projectId,
      priority: data.priority ?? 'medium',
      status: data.status ?? 'active',
      flagged: data.flagged ?? false,
      dueDate: data.dueDate ?? null,
      dueTime: data.dueTime ?? null,
      recurrence: data.recurrence ?? { frequency: 'none', interval: 1, daysOfWeek: [], type: 'calendar' },
      completions: data.completions ?? {},
      preparationItems: data.preparationItems ?? [],
      createdAt: serverTimestamp()
    });
  }

  /**
   * @param {string} id
   * @param {Partial<Task>} data
   */
  async function updateTask(id, data) {
    await updateDoc(doc(db, 'tasks', id), data);

    // If marked as done and has recurrence, check if we need to create the next instance
    if (data.status === 'done') {
      const unsub = subscribe(items => {
        const item = items.find(i => i.id === id);
        if (item && item.recurrence?.frequency !== 'none') {
          handleRecurrenceCompletion(item);
        }
      });
      unsub();
    }
  }

  /**
   * @param {Task} task
   */
  async function handleRecurrenceCompletion(task) {
    const { getNextDate } = await import('$lib/utils/recurrence.js');
    const nextDueDate = getNextDate(task.dueDate || new Date().toISOString().split('T')[0], task.recurrence);
    
    await addTask({
      ...task,
      status: 'active',
      dueDate: nextDueDate,
      completions: {}
    });
  }

  /**
   * @param {string} id
   * @param {string} date
   */
  async function toggleTaskCompletion(id, date) {
    const docRef = doc(db, 'tasks', id);
    let currentCompletions = /** @type {Record<string, boolean>} */ ({});
    const unsub = subscribe(items => {
      const item = items.find(i => i.id === id);
      if (item) currentCompletions = item.completions || {};
    });
    unsub();

    const next = { ...currentCompletions };
    if (next[date]) delete next[date];
    else next[date] = true;

    await updateDoc(docRef, { completions: next });
  }

  /**
   * @param {string} taskId
   * @param {string} itemId
   */
  async function togglePrepItem(taskId, itemId) {
    const docRef = doc(db, 'tasks', taskId);
    let items = /** @type {{id: string, text: string, completed: boolean}[]} */ ([]);
    const unsub = subscribe(list => {
      const t = list.find(x => x.id === taskId);
      if (t) items = [...(t.preparationItems || [])];
    });
    unsub();

    const updated = items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await updateDoc(docRef, { preparationItems: updated });
  }

  /**
   * @param {string} id
   */
  async function deleteTask(id) {
    await deleteDoc(doc(db, 'tasks', id));
  }

  /**
   * @param {string} id
   */
  async function toggleFlag(id) {
    let currentFlag = false;
    const unsub = subscribe(items => {
      const item = items.find(i => i.id === id);
      if (item) currentFlag = !!item.flagged;
    });
    unsub();
    await updateTask(id, { flagged: !currentFlag });
  }

  return { subscribe, init, destroy, addTask, updateTask, toggleTaskCompletion, deleteTask, toggleFlag };
}

export const tasks = createTasksStore();

export const sortedTasks = derived(tasks, ($tasks) => {
  const statusOrder = { active: 0, pending: 1, done: 2 };

  return [...$tasks].sort((a, b) => {
    const sDiff = statusOrder[a.status] - statusOrder[b.status];
    if (sDiff !== 0) return sDiff;

    const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pDiff !== 0) return pDiff;

    if (a.dueDate && b.dueDate) {
      if (a.dueDate === b.dueDate && a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
});

/**
 * @param {Task | null} task
 */
export function isTaskOverdue(task) {
  if (!task || !task.dueDate || task.status === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  if (task.dueDate < today) return true;
  if (task.dueDate === today && task.dueTime) {
    const now = new Date().toTimeString().slice(0, 5);
    return task.dueTime < now;
  }
  return false;
}
