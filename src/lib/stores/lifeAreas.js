import { writable } from 'svelte/store';
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
 * @typedef {{ id: string; name: string; description: string; color: string; createdAt: import('firebase/firestore').Timestamp }} LifeArea
 */

const col = collection(db, 'lifeAreas');

function createLifeAreasStore() {
  const { subscribe, set } = writable(/** @type {LifeArea[]} */ ([]));

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  function init() {
    const q = query(col, orderBy('createdAt', 'asc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      /** @type {LifeArea[]} */
      const areas = snapshot.docs.map((d) => ({ id: d.id, .../** @type {any} */ (d.data()) }));
      set(areas);
    });
  }

  function destroy() {
    if (unsubscribe) unsubscribe();
  }

  /**
   * @param {{ name: string; description?: string; color: string }} area
   */
  async function addLifeArea({ name, description = '', color }) {
    await addDoc(col, { name, description, color, createdAt: serverTimestamp() });
  }

  /**
   * @param {string} id
   * @param {{ name: string; description: string; color: string }} data
   */
  async function updateLifeArea(id, { name, description, color }) {
    await updateDoc(doc(db, 'lifeAreas', id), { name, description, color });
  }

  /**
   * @param {string} id
   */
  async function deleteLifeArea(id) {
    await deleteDoc(doc(db, 'lifeAreas', id));
  }

  return { subscribe, init, destroy, addLifeArea, updateLifeArea, deleteLifeArea };
}

export const lifeAreas = createLifeAreasStore();
