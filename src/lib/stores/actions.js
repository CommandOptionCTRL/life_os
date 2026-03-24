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

const col = collection(db, 'actions');

function createActionsStore() {
  const { subscribe, set } = writable([]);

  let unsubscribe = null;

  function init(taskId) {
    if (!taskId) return;
    const q = query(col, where('taskId', '==', taskId));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      });
      set(items);
    });
  }

  function destroy() {
    if (unsubscribe) unsubscribe();
  }

  async function addAction(data) {
    await addDoc(col, {
      name: data.name,
      taskId: data.taskId,
      status: data.status ?? 'todo',
      flagged: data.flagged ?? false,
      createdAt: serverTimestamp()
    });
  }

  async function updateAction(id, data) {
    await updateDoc(doc(db, 'actions', id), data);
  }

  async function deleteAction(id) {
    await deleteDoc(doc(db, 'actions', id));
  }

  return { subscribe, init, destroy, addAction, updateAction, deleteAction };
}

export const actions = createActionsStore();

export const sortedActions = derived(actions, ($actions) => {
  const statusOrder = { todo: 0, done: 1 };
  
  return [...$actions].sort((a, b) => {
    return statusOrder[a.status] - statusOrder[b.status];
  });
});
