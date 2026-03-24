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

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const col = collection(db, 'tasks');

function createTasksStore() {
  const { subscribe, set } = writable([]);

  let unsubscribe = null;

  function init(projectId) {
    if (!projectId) return;
    const q = query(col, where('projectId', '==', projectId));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      set(items);
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
      createdAt: serverTimestamp()
    });
  }

  async function updateTask(id, data) {
    await updateDoc(doc(db, 'tasks', id), data);
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, 'tasks', id));
  }

  return { subscribe, init, destroy, addTask, updateTask, deleteTask };
}

export const tasks = createTasksStore();

export const sortedTasks = derived(tasks, ($tasks) => {
  const statusOrder = { active: 0, pending: 1, done: 2 };

  return [...$tasks].sort((a, b) => {
    const sDiff = statusOrder[a.status] - statusOrder[b.status];
    if (sDiff !== 0) return sDiff;

    const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pDiff !== 0) return pDiff;

    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
});

export function isTaskOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate < today;
}
