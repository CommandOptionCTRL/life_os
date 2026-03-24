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
 * @typedef {{
 *   id: string;
 *   name: string;
 *   lifeAreaId: string;
 *   status: Status;
 *   priority: Priority;
 *   flagged: boolean;
 *   dueDate: string | null;
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
   * @param {{ name: string; lifeAreaId: string; priority?: Priority; status?: Status; dueDate?: string | null }} data
   */
  async function addProject(data) {
    await addDoc(col, {
      name: data.name,
      lifeAreaId: data.lifeAreaId,
      priority: data.priority ?? 'medium',
      status: data.status ?? 'active',
      flagged: data.flagged ?? false,
      dueDate: data.dueDate ?? null,
      createdAt: serverTimestamp()
    });
  }

  /**
   * @param {string} id
   * @param {Partial<Omit<Project, 'id' | 'createdAt'>>} data
   */
  async function updateProject(id, data) {
    await updateDoc(doc(db, 'projects', id), data);
  }

  /**
   * @param {string} id
   */
  async function deleteProject(id) {
    await deleteDoc(doc(db, 'projects', id));
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

  return { subscribe, init, destroy, addProject, updateProject, deleteProject, toggleFlag };
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
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
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
  return project.dueDate < today;
}
