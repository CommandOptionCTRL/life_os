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
 * @typedef {{
 *   id: string;
 *   text: string;
 *   targetDate: string | null;
 *   completed: boolean;
 *   createdAt: import('firebase/firestore').Timestamp;
 * }} Followup
 */

const col = collection(db, 'followups');

function createFollowupsStore() {
  const { subscribe, set, update } = writable(/** @type {Followup[]} */ ([]));

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  function init(onLoaded = null) {
    const q = query(col, orderBy('createdAt', 'desc'));
    let initial = true;
    unsubscribe = onSnapshot(q, (snapshot) => {
      /** @type {Followup[]} */
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
   * @param {{ text: string; targetDate?: string | null }} data
   */
  async function addFollowup(data) {
    await addDoc(col, {
      text: data.text,
      targetDate: data.targetDate ?? null,
      completed: false,
      createdAt: serverTimestamp()
    });
  }

  /**
   * @param {string} id
   * @param {Partial<Omit<Followup, 'id' | 'createdAt'>>} data
   */
  async function updateFollowup(id, data) {
    // Optimistic update
    update(items => items.map(item => item.id === id ? { ...item, ...data } : item));
    await updateDoc(doc(db, 'followups', id), data);
  }

  /**
   * @param {string} id
   */
  async function deleteFollowup(id) {
    // Optimistic delete
    update(items => items.filter(item => item.id !== id));
    await deleteDoc(doc(db, 'followups', id));
  }

  /**
   * @param {string} id
   * @param {boolean} completed
   */
  async function toggleCompleted(id, completed) {
    await updateFollowup(id, { completed });
  }

  return { subscribe, init, destroy, addFollowup, updateFollowup, deleteFollowup, toggleCompleted };
}

export const followups = createFollowupsStore();
