import { writable, get } from 'svelte/store';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/database.js';

/**
 * @typedef {{
 *   theme: 'dark' | 'light';
 *   primaryColor: string;
 * }} Settings
 */

const DEFAULT_SETTINGS = {
  theme: 'dark',
  primaryColor: '#6C63FF'
};

const SETTINGS_DOC_ID = 'global';

function createSettingsStore() {
  const { subscribe, set, update } = writable(/** @type {Settings} */ ({ ...DEFAULT_SETTINGS }));
  const docRef = doc(db, 'settings', SETTINGS_DOC_ID);

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  function init() {
    if (unsubscribe) return;
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = /** @type {Settings} */ (snapshot.data());
        const merged = { ...DEFAULT_SETTINGS, ...data };
        set(merged);
        applyThemeStyles(merged);
      } else {
        // Create initial if missing
        setDoc(docRef, DEFAULT_SETTINGS);
      }
    });
  }

  function destroy() {
    if (unsubscribe) unsubscribe();
  }

  /**
   * @param {Partial<Settings>} data
   */
  async function updateSettings(data) {
    update(s => ({ ...s, ...data }));
    await setDoc(docRef, data, { merge: true });
  }

  /**
   * Helper to apply settings to CSS vars on the document root
   * @param {Settings} settings 
   */
  function applyThemeStyles(settings) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.style.setProperty('--color-primary', settings.primaryColor);
    
    // Generate soft variant for soft backgrounds
    root.style.setProperty('--color-primary-soft', `color-mix(in srgb, ${settings.primaryColor} 12%, transparent)`);
  }

  async function exportData() {
    const [
      { lifeAreas },
      { projects },
      { brainDump },
      { followups }
    ] = await Promise.all([
      import('./lifeAreas.js'),
      import('./projects.js'),
      import('./brainDump.js'),
      import('./followups.js')
    ]);

    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      collections: {
        settings: [get({ subscribe })],
        lifeAreas: get(lifeAreas),
        projects: get(projects),
        brainDump: get(brainDump),
        followups: get(followups)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * @param {File} file 
   */
  async function importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') throw new Error('Invalid file');
          
          const data = JSON.parse(content);
          if (!data.collections) throw new Error('Invalid backup format');

          const batch = writeBatch(db);

          // Iterate all collections
          for (const [colName, items] of Object.entries(data.collections)) {
            const arr = /** @type {any[]} */ (items);
            for (const item of arr) {
              // Extract ID or generate one or use hardcoded settings ID
              const id = colName === 'settings' ? SETTINGS_DOC_ID : item.id;
              
              // Remove id from payload if it exists
              const { id: _, ...payload } = item;
              
              const ref = doc(db, colName, id);
              batch.set(ref, payload);
            }
          }

          await batch.commit();
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return { 
    subscribe, 
    init, 
    destroy, 
    updateSettings,
    exportData,
    importData
  };
}

export const settings = createSettingsStore();
