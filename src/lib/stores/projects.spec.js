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
import { projects, isOverdue, sortedProjects } from './projects.js';
import { addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

describe('projects store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projects.init();
  });

  afterEach(() => {
    projects.destroy();
  });

  it('addProject calls addDoc with defaults', async () => {
    await projects.addProject({ name: 'Buy groceries', lifeAreaId: 'area1' });
    expect(addDoc).toHaveBeenCalledOnce();
    const mockAddDoc = /** @type {import('vitest').Mock} */ (addDoc);
    const [, data] = mockAddDoc.mock.calls[0];
    
    expect(data.name).toBe('Buy groceries');
    expect(data.lifeAreaId).toBe('area1');
    expect(data.priority).toBe('medium');
    expect(data.status).toBe('active');
    expect(data.dueDate).toBeNull();
  });

  it('updateProject calls updateDoc', async () => {
    await projects.updateProject('proj123', { status: 'done' });
    expect(updateDoc).toHaveBeenCalledOnce();
    const mockUpdateDoc = /** @type {import('vitest').Mock} */ (updateDoc);
    const [, data] = mockUpdateDoc.mock.calls[0];
    
    expect(data.status).toBe('done');
  });

  it('deleteProject calls deleteDoc', async () => {
    await projects.deleteProject('proj123');
    expect(deleteDoc).toHaveBeenCalledOnce();
  });
});

describe('projects helpers & derived stores', () => {
  it('isOverdue correctly identifies overdue projects', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Past date (Overdue)
    expect(isOverdue(/** @type {any} */({ dueDate: '2000-01-01', status: 'active' }))).toBe(true);
    
    // Past date but done (Not Overdue)
    expect(isOverdue(/** @type {any} */({ dueDate: '2000-01-01', status: 'done' }))).toBe(false);
    
    // Future date (Not overdue)
    expect(isOverdue(/** @type {any} */({ dueDate: '2099-01-01', status: 'active' }))).toBe(false);
    
    // Today (Not overdue)
    expect(isOverdue(/** @type {any} */({ dueDate: today, status: 'active' }))).toBe(false);
    
    // No due date (Not overdue)
    expect(isOverdue(/** @type {any} */({ dueDate: null, status: 'active' }))).toBe(false);
  });

  it('sortedProjects derives correctly based on status, priority, and due date', () => {
     let getVal = () => {
       let val;
       sortedProjects.subscribe(v => val = v)();
       return val;
     };

     // Initialize the projects store so onSnapshot is called
     projects.init();

     // Use the onSnapshot mock to feed the data directly
     const mockOnSnapshot = /** @type {import('vitest').Mock} */ (onSnapshot);
     const callback = mockOnSnapshot.mock.calls[0][1];

     // Unsorted mix
     callback({
       docs: [
        { id: '1', data: () => ({ name: 'Low Active', status: 'active', priority: 'low', dueDate: null }) },
        { id: '2', data: () => ({ name: 'Done', status: 'done', priority: 'high', dueDate: null }) },
        { id: '3', data: () => ({ name: 'High Pending', status: 'pending', priority: 'high', dueDate: null }) },
        { id: '4', data: () => ({ name: 'High Active 1', status: 'active', priority: 'high', dueDate: '2025-01-01' }) },
        { id: '5', data: () => ({ name: 'High Active 2', status: 'active', priority: 'high', dueDate: '2024-01-01' }) },
        { id: '6', data: () => ({ name: 'Med Active', status: 'active', priority: 'medium', dueDate: null }) }
       ]
     });

     const sorted = /** @type {any[]} */ (/** @type {unknown} */ (getVal()));

     expect(sorted.map((p) => p.name)).toEqual([
       'High Active 2', // Active > High > Earlier Date
       'High Active 1', // Active > High > Later Date
       'Med Active',    // Active > Med
       'Low Active',    // Active > Low
       'High Pending',  // Pending
       'Done'           // Done
     ]);
  });
});
