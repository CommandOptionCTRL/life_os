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
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/database.js';

/**
 * @typedef {'high' | 'medium' | 'low'} Priority
 * @typedef {'active' | 'pending' | 'done'} Status
 * @typedef {Object} Schedule
 * @property {'none' | 'daily' | 'weekly' | 'monthly' | 'custom'} type
 * @property {number[]} days
 * @property {string[]} times
 * @property {string | null} startDate
 * @property {string | null} endDate
 * @property {number} frequency
 * 
 * @typedef {{
 *   id: string;
 *   name: string;
 *   lifeAreaId: string;
 *   status: Status;
 *   priority: Priority;
 *   flagged: boolean;
 *   dueDate: string | null;
 *   dueTime: string | null;
 *   recurring: boolean;
 *   schedule: Schedule;
 *   createdAt: import('firebase/firestore').Timestamp;
 * }} Project
 */

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

const col = collection(db, 'projects');

function createProjectsStore() {
  const { subscribe, set } = writable(/** @type {Project[]} */ ([]));

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  function init(onLoaded = null) {
    const q = query(col, orderBy('createdAt', 'desc'));
    let initial = true;
    unsubscribe = onSnapshot(q, (snapshot) => {
      /** @type {Project[]} */
      const items = snapshot.docs.map((d) => ({ id: d.id, .../** @type {any} */ (d.data()) }));
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

  /**
   * @param {{ name: string; lifeAreaId: string; priority?: Priority; status?: Status; flagged?: boolean; dueDate?: string | null; dueTime?: string | null; recurring?: boolean; schedule?: any }} data
   */
  async function addProject(data) {
    const docRef = await addDoc(col, {
      name: data.name,
      lifeAreaId: data.lifeAreaId,
      priority: data.priority ?? 'medium',
      status: data.status ?? 'active',
      flagged: data.flagged ?? false,
      dueDate: data.dueDate ?? null,
      dueTime: data.dueTime ?? null,
      recurring: data.recurring ?? false,
      schedule: data.schedule ?? { type: 'none', days: [], times: [], startDate: null, endDate: null, frequency: 1 },
      createdAt: serverTimestamp()
    });

    if (data.recurring && data.schedule) {
      const { recurring } = await import('./recurringStore.js');
      await recurring.generateOccurrencesForTask({
        id: docRef.id,
        ...data
      });
    }
  }

  /**
   * @param {string} id
   * @param {Partial<Project>} data
   */
  async function updateProject(id, data) {
    await updateDoc(doc(db, 'projects', id), data);

    const { recurring } = await import('./recurringStore.js');
    let fullProject = /** @type {Project | undefined} */ (undefined);
    const unsub = subscribe(items => {
      fullProject = items.find(i => i.id === id);
    });
    unsub();

    if (fullProject && fullProject.recurring) {
      await recurring.generateOccurrencesForTask(fullProject);
    }
  }

  /**
   * @param {string} id
   * @param {string} date
   */
  async function toggleProjectCompletion(id, date) {
    const docRef = doc(db, 'projects', id);
    let currentCompletions = /** @type {Record<string, boolean>} */ ({});
    const unsub = subscribe(items => {
      const item = items.find(i => i.id === id);
      // @ts-ignore - completions might be missing in new schema
      if (item) currentCompletions = item.completions || {};
    });
    unsub();

    const next = { ...currentCompletions };
    if (next[date]) delete next[date];
    else next[date] = true;

    await updateDoc(docRef, { completions: next });
  }

  /**
   * @param {string} id
   */
  async function deleteProject(id) {
    await deleteDoc(doc(db, 'projects', id));
    const { occurrences } = await import('./occurrenceStore.js');
    await occurrences.deleteByTaskId(id);
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
    await updateProject(id, { flagged: !currentFlag });
  }

  return { subscribe, init, destroy, addProject, updateProject, toggleProjectCompletion, deleteProject, toggleFlag };
}

export const projects = createProjectsStore();

/** Projects sorted: active first, then pending, then done. Within each group, by priority then dueDate */
export const sortedProjects = derived(projects, ($projects) => {
  const statusOrder = { active: 0, pending: 1, done: 2 };

  return [...$projects].sort((a, b) => {
    const sDiff = statusOrder[a.status] - statusOrder[b.status];
    if (sDiff !== 0) return sDiff;

    const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pDiff !== 0) return pDiff;

    // Earlier due dates first; nulls last
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
 * Returns true if the project is overdue
 * @param {Project} project
 */
export function isOverdue(project) {
  if (!project.dueDate || project.status === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  if (project.dueDate < today) return true;
  if (project.dueDate === today && project.dueTime) {
    const now = new Date().toTimeString().slice(0, 5);
    return project.dueTime < now;
  }
  return false;
}
