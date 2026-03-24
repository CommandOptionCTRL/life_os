<script>
  let { open = false, task = null, onsave, onclose } = $props();

  const priorities = ['high', 'medium', 'low'];
  const statuses = ['active', 'pending', 'done'];

  let name = $state('');
  let description = $state('');
  let priority = $state('medium');
  let status = $state('active');
  let dueDate = $state('');

  $effect(() => {
    if (open) {
      name = task?.name ?? '';
      description = task?.description ?? '';
      priority = task?.priority ?? 'medium';
      status = task?.status ?? 'active';
      dueDate = task?.dueDate ?? '';
    }
  });

  function handleSave() {
    if (!name.trim()) return;
    onsave({
      name: name.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || null
    });
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }

  const priorityLabels = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
  const statusLabels = { active: 'Active', pending: 'Pending', done: 'Done' };
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={task ? 'Edit Task' : 'New Task'}>
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">{task ? 'Edit Task' : 'New Task'}</h2>

      <div class="field">
        <label for="task-name">Name</label>
        <input id="task-name" type="text" bind:value={name} placeholder="e.g. Write project proposal" maxlength="80" />
      </div>

      <div class="field">
        <label for="task-desc">Description <span class="optional">(optional)</span></label>
        <textarea id="task-desc" bind:value={description} placeholder="Add details..." rows="2"></textarea>
      </div>

      <div class="field">
        <span class="field-label" id="task-priority-label">Priority</span>
        <div class="seg-control" role="group" aria-labelledby="task-priority-label">
          {#each priorities as p}
            <button class="seg-btn" class:active={priority === p} onclick={() => priority = p}>
              {priorityLabels[p]}
            </button>
          {/each}
        </div>
      </div>

      <div class="field">
        <span class="field-label" id="task-status-label">Status</span>
        <div class="seg-control" role="group" aria-labelledby="task-status-label">
          {#each statuses as s}
            <button class="seg-btn" class:active={status === s} onclick={() => status = s}>
              {statusLabels[s]}
            </button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label for="task-due">Due Date <span class="optional">(optional)</span></label>
        <input id="task-due" type="date" bind:value={dueDate} />
      </div>

      <div class="sheet-actions">
        <button class="btn-secondary" onclick={onclose}>Cancel</button>
        <button class="btn-primary" onclick={handleSave} disabled={!name.trim()}>
          {task ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    z-index: 200; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sheet {
    background: var(--color-surface); border-radius: 24px 24px 0 0; width: 100%; max-width: 600px;
    padding: 12px 24px calc(24px + var(--safe-bottom)); border: 1px solid var(--color-border);
    border-bottom: none; animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    max-height: 90dvh; overflow-y: auto;
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet-handle {
    width: 36px; height: 4px; border-radius: 2px; background: var(--color-border); margin: 0 auto 20px;
  }
  .sheet-title { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 20px; }

  .field { margin-bottom: 18px; }
  .field label, .field-label {
    display: block; font-size: 12px; font-weight: 600; color: var(--color-text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
  }
  .optional { font-weight: 400; text-transform: none; letter-spacing: 0; }
  
  .field input, .field textarea, .field select {
    width: 100%; background: var(--color-surface-2); border: 1px solid var(--color-border);
    border-radius: var(--radius-sm); padding: 12px 14px; color: var(--color-text);
    font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical;
  }
  .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--color-primary); }
  input[type="date"] { color-scheme: dark; }

  .seg-control { display: flex; gap: 6px; }
  .seg-btn {
    flex: 1; padding: 9px 4px; border-radius: var(--radius-sm); background: var(--color-surface-2);
    border: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 12px;
    font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s;
    white-space: nowrap; text-align: center;
  }
  .seg-btn.active { background: var(--color-primary-soft); border-color: var(--color-primary); color: var(--color-primary); }

  .sheet-actions { display: flex; gap: 12px; margin-top: 24px; }
  .btn-primary, .btn-secondary {
    flex: 1; padding: 14px; border-radius: var(--radius-sm); font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer; border: none; transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary { background: var(--color-primary); color: #fff; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary:not(:disabled):active { transform: scale(0.97); }
  .btn-secondary { background: var(--color-surface-2); color: var(--color-text-muted); border: 1px solid var(--color-border); }
  .btn-secondary:active { transform: scale(0.97); }
</style>
