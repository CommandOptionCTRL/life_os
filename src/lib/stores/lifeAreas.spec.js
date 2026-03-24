import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mock Firebase modules ---
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  onSnapshot: vi.fn((_, cb) => {
    cb({ docs: [] });
    return vi.fn(); // unsubscribe
  }),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => new Date()),
  query: vi.fn((...args) => args[0]),
  orderBy: vi.fn()
}));

vi.mock('../../firebase/database.js', () => ({ db: {} }));

// --- Actual store ---
import { lifeAreas } from './lifeAreas.js';
import { addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

describe('lifeAreas store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lifeAreas.init();
  });

  afterEach(() => {
    lifeAreas.destroy();
  });

  it('initialises with an empty array', () => {
    let value;
    const unsub = lifeAreas.subscribe((v) => (value = v));
    expect(value).toEqual([]);
    unsub();
  });

  it('addLifeArea calls addDoc with correct fields', async () => {
    await lifeAreas.addLifeArea({ name: 'Health', color: '#26de81' });
    expect(addDoc).toHaveBeenCalledOnce();
    const [, data] = addDoc.mock.calls[0];
    expect(data.name).toBe('Health');
    expect(data.color).toBe('#26de81');
    expect(data.description).toBe('');
  });

  it('addLifeArea passes description when provided', async () => {
    await lifeAreas.addLifeArea({ name: 'Work', description: 'Career', color: '#F7B731' });
    const [, data] = addDoc.mock.calls[0];
    expect(data.description).toBe('Career');
  });

  it('updateLifeArea calls updateDoc with correct fields', async () => {
    await lifeAreas.updateLifeArea('abc123', { name: 'Finance', description: 'Money', color: '#FC5C65' });
    expect(updateDoc).toHaveBeenCalledOnce();
    const [, data] = updateDoc.mock.calls[0];
    expect(data.name).toBe('Finance');
    expect(data.color).toBe('#FC5C65');
  });

  it('deleteLifeArea calls deleteDoc', async () => {
    await lifeAreas.deleteLifeArea('abc123');
    expect(deleteDoc).toHaveBeenCalledOnce();
  });
});
