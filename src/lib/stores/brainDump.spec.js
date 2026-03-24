import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mock Firebase modules ---
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  onSnapshot: vi.fn((_, cb) => {
    cb({ docs: [] });
    return vi.fn(); // unsubscribe
  }),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => new Date()),
  query: vi.fn((...args) => args[0]),
  orderBy: vi.fn()
}));

vi.mock('../../firebase/database.js', () => ({ db: {} }));

// Mock svelte/store get
vi.mock('svelte/store', () => ({
  get: vi.fn((/** @type {any} */ store) => {
     let value;
     store.subscribe((/** @type {any} */ v) => value = v)();
     return value;
  }),
  writable: (/** @type {any} */ val) => {
    let _val = val;
    /** @type {any[]} */
    const subs = [];
    return {
      subscribe: (/** @type {any} */ cb) => {
        subs.push(cb);
        cb(_val);
        return () => {};
      },
      set: (/** @type {any} */ v) => {
        _val = v;
        subs.forEach(cb => cb(v));
      }
    }
  }
}));

// --- Actual store ---
import { brainDump } from './brainDump.js';
import { addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

describe('brainDump store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    brainDump.init();
  });

  afterEach(() => {
    brainDump.destroy();
  });

  it('initialises with an empty array', () => {
    let value;
    const unsub = brainDump.subscribe((v) => (value = v));
    expect(value).toEqual([]);
    unsub();
  });

  it('addItem calls addDoc with correct fields', async () => {
    await brainDump.addItem({ text: 'Find new guitar strings', tag: 'task' });
    expect(addDoc).toHaveBeenCalledOnce();
    const mockAddDoc = /** @type {import('vitest').Mock} */ (addDoc);
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data.text).toBe('Find new guitar strings');
    expect(data.tag).toBe('task');
  });

  it('deleteItem calls deleteDoc', async () => {
    await brainDump.deleteItem('abc123');
    expect(deleteDoc).toHaveBeenCalledOnce();
  });

  it('convertItem creates new doc and deletes old one', async () => {
    // Mock snapshot callback to seed the store
    const mockOnSnapshot = /** @type {import('vitest').Mock} */ (onSnapshot);
    const callback = mockOnSnapshot.mock.calls[0][1];
    
    // Seed the store with a dump item
    callback({
      docs: [{ 
        id: 'dump1', 
        data: () => ({ text: 'New Project', tag: 'idea' }) 
      }]
    });
    
    await brainDump.convertItem('dump1', 'project', 'area1');
    
    // Should call addDoc for the new project
    expect(addDoc).toHaveBeenCalledOnce();
    const mockAddDoc = /** @type {import('vitest').Mock} */ (addDoc);
    expect(mockAddDoc.mock.calls[0][1].lifeAreaId).toBe('area1');
    
    // Should call deleteDoc for the original item
    expect(deleteDoc).toHaveBeenCalledOnce();
  });
});
