import { writable } from 'svelte/store';
import { db } from '../../firebase/database.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function createPreparationStore() {
  const { subscribe } = writable({});

  /**
   * Toggles the completion state of a specific preparation item on a task.
   * @param {string} taskId
   * @param {string} itemId
   */
  async function togglePrepItem(taskId, itemId) {
    const docRef = doc(db, 'tasks', taskId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    
    const task = snap.data();
    const items = /** @type {any[]} */ (task?.preparationItems || []);
    const updated = items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await updateDoc(docRef, { preparationItems: updated });
  }

  return { subscribe, togglePrepItem };
}

export const preparation = createPreparationStore();
