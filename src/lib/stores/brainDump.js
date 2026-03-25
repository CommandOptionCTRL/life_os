import { writable } from 'svelte/store';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/database.js';

/**
 * @typedef {{ id: string; text: string; tag: 'idea' | 'task' | 'note'; createdAt: import('firebase/firestore').Timestamp }} BrainDumpItem
 */

const col = collection(db, 'brainDump');

function createBrainDumpStore() {
  const { subscribe, set } = writable(/** @type {BrainDumpItem[]} */ ([]));

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  function init(onLoaded = null) {
    const q = query(col, orderBy('createdAt', 'desc'));
    let initial = true;
    unsubscribe = onSnapshot(q, (snapshot) => {
      /** @type {BrainDumpItem[]} */
      const items = snapshot.docs.map((d) => ({ id: d.id, .../** @type {any} */ (d.data()) }));
      set(items);
      if (initial && typeof onLoaded === 'function') {
        initial = false;
        onLoaded();
      }
    });
  }

  function destroy() {
    if (unsubscribe) unsubscribe();
  }

  /**
   * @param {{ text: string; tag: 'idea' | 'task' | 'note' }} item
   */
  async function addItem({ text, tag }) {
    if (!text.trim()) return;
    await addDoc(col, { text, tag, createdAt: serverTimestamp() });
  }

  /**
   * @param {string} id
   */
  async function deleteItem(id) {
    await deleteDoc(doc(db, 'brainDump', id));
  }

  /**
   * @param {string} id
   * @param {'area' | 'project' | 'task' | 'action'} targetType
   * @param {string | null} parentId
   * @param {string} newName
   */
  async function convertItem(id, targetType, parentId, newName) {
    const item = (await import('svelte/store')).get(brainDump).find(i => i.id === id);
    if (!item) return;

    const nameToUse = newName.trim() || item.text;

    if (targetType === 'area') {
      const col = collection(db, 'lifeAreas');
      await addDoc(col, {
        name: nameToUse,
        description: '',
        color: '#6C63FF',
        createdAt: serverTimestamp()
      });
    } else if (targetType === 'project') {
      const col = collection(db, 'projects');
      await addDoc(col, {
        name: nameToUse,
        lifeAreaId: parentId,
        status: 'active',
        priority: 'medium',
        flagged: false,
        dueDate: null,
        recurring: false,
        schedule: { type: 'none', days: [], times: [''], startDate: null, endDate: null, frequency: 1 },
        createdAt: serverTimestamp()
      });
    } else if (targetType === 'task') {
      const col = collection(db, 'tasks');
      await addDoc(col, {
        name: nameToUse,
        description: '',
        projectId: parentId,
        status: 'active',
        priority: 'medium',
        flagged: false,
        dueDate: null,
        recurring: false,
        schedule: { type: 'none', days: [], times: [''], startDate: null, endDate: null, frequency: 1 },
        preparationItems: [],
        createdAt: serverTimestamp()
      });
    } else if (targetType === 'action') {
      const col = collection(db, 'actions');
      await addDoc(col, {
        name: nameToUse,
        taskId: parentId,
        status: 'todo',
        flagged: false,
        createdAt: serverTimestamp()
      });
    }

    await deleteItem(id);
  }

  return { subscribe, init, destroy, addItem, deleteItem, convertItem };
}

export const brainDump = createBrainDumpStore();
