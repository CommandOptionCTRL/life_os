import { writable } from 'svelte/store';
import { db } from '../../firebase/database.js';
import { collection, doc, onSnapshot, updateDoc, serverTimestamp, getDocs, query, where, writeBatch } from 'firebase/firestore';

/**
 * @typedef {Object} Occurrence
 * @property {string} id
 * @property {string} taskId
 * @property {string} projectId
 * @property {string} date
 * @property {string} time
 * @property {boolean} completed
 * @property {string} status
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

const col = collection(db, 'taskOccurrences');

function createOccurrenceStore() {
  const { subscribe, set, update } = writable(/** @type {Occurrence[]} */ ([]));
  /** @type {import('firebase/firestore').Unsubscribe | null} */
  let unsubscribe = null;

  /**
   * @param {(() => void) | null} onLoaded
   */
  function init(onLoaded = null) {
    let initial = true;
    unsubscribe = onSnapshot(col, (snapshot) => {
      const occs = /** @type {Occurrence[]} */ ([]);
      snapshot.forEach(doc => occs.push(/** @type {Occurrence} */ ({ id: doc.id, ...doc.data() })));
      set(occs);
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
   * @param {any[]} occurrenceDataList
   */
  async function addOccurrences(occurrenceDataList) {
    const batch = writeBatch(db);
    occurrenceDataList.forEach(data => {
      const newRef = doc(col);
      batch.set(newRef, {
        ...data,
        completed: false,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    });
    await batch.commit();
  }

  /**
   * @param {string} id
   * @param {boolean} currentState
   */
  async function toggleCompletion(id, currentState) {
    const docRef = doc(db, 'taskOccurrences', id);
    await updateDoc(docRef, { completed: !currentState, status: !currentState ? 'done' : 'pending' });
  }

  /**
   * @param {string} taskId
   */
  async function deleteByTaskId(taskId) {
    const q = query(col, where('taskId', '==', taskId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  return { subscribe, init, destroy, addOccurrences, toggleCompletion, deleteByTaskId };
}

export const occurrences = createOccurrenceStore();
