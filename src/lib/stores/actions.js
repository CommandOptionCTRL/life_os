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

  function init(taskId, onLoaded = null) {
    const q = taskId 
      ? query(col, where('taskId', '==', taskId))
      : query(col);
    let initial = true;
    unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.toMillis() - b.createdAt.toMillis();
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

  async function toggleFlag(id) {
    let currentFlag = false;
    const unsub = subscribe(items => {
      const item = items.find(i => i.id === id);
      if (item) currentFlag = !!item.flagged;
    });
    unsub();
    await updateAction(id, { flagged: !currentFlag });
  }

  return { subscribe, init, destroy, addAction, updateAction, deleteAction, toggleFlag };
}

export const actions = createActionsStore();

export const sortedActions = derived(actions, ($actions) => {
  const statusOrder = { todo: 0, done: 1 };
  
  return [...$actions].sort((a, b) => {
    return statusOrder[a.status] - statusOrder[b.status];
  });
});
