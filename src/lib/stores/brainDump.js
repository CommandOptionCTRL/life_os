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

  function init() {
    const q = query(col, orderBy('createdAt', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      /** @type {BrainDumpItem[]} */
      const items = snapshot.docs.map((d) => ({ id: d.id, .../** @type {any} */ (d.data()) }));
      set(items);
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
   * @param {'area' | 'project'} targetType
   * @param {string} [selectedAreaId]
   */
  async function convertItem(id, targetType, selectedAreaId) {
    const item = (await import('svelte/store')).get(brainDump).find(i => i.id === id);
    if (!item) return;

    if (targetType === 'area') {
      const col = collection(db, 'lifeAreas');
      await addDoc(col, {
        name: item.text,
        description: '',
        color: '#6C63FF',
        createdAt: serverTimestamp()
      });
    } else if (targetType === 'project') {
      const col = collection(db, 'projects');
      await addDoc(col, {
        name: item.text,
        lifeAreaId: selectedAreaId,
        status: 'active',
        priority: 'medium',
        createdAt: serverTimestamp()
      });
    }

    await deleteItem(id);
  }

  return { subscribe, init, destroy, addItem, deleteItem, convertItem };
}

export const brainDump = createBrainDumpStore();
