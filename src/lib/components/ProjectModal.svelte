<script>
  import ColourPicker from '$lib/components/ColourPicker.svelte';
  import DayPicker from '$lib/components/DayPicker.svelte';

  let { open = false, project = null, lifeAreas = [], onsave, onclose } = $props();

  const priorities = ['high', 'medium', 'low'];
  const statuses = ['active', 'pending', 'done'];
  const frequencies = ['none', 'daily', 'weekly', 'monthly'];

  let name = $state('');
  let lifeAreaId = $state('');
  let color = $state('var(--color-area-1)');
  let priority = $state('medium');
  let status = $state('active');
  let dueDate = $state('');
  let dueTime = $state('');
  let recurring = $state(false);
  let scheduleType = $state('none');
  let scheduleDays = $state([]);
  let scheduleTimes = $state(['']);
  let scheduleStartDate = $state('');
  let scheduleEndDate = $state('');
  let scheduleFrequency = $state(1);

  $effect(() => {
    if (open) {
      name = project?.name ?? '';
      lifeAreaId = project?.lifeAreaId ?? (lifeAreas[0]?.id ?? '');
      color = project?.color ?? 'var(--color-area-1)';
      priority = project?.priority ?? 'medium';
      status = project?.status ?? 'active';
      dueDate = project?.dueDate ?? '';
      dueTime = project?.dueTime ?? '';
      recurring = project?.recurring ?? false;
      const s = project?.schedule ?? { type: 'none', days: [], times: [''], startDate: '', endDate: '', frequency: 1 };
      scheduleType = s.type;
      scheduleDays = s.days ?? [];
      scheduleTimes = s.times?.length > 0 ? [...s.times] : [''];
      scheduleStartDate = s.startDate ?? '';
      scheduleEndDate = s.endDate ?? '';
      scheduleFrequency = s.frequency ?? 1;
    }
  });

  function handleSave() {
    if (!name.trim()) return;
    onsave({
      name: name.trim(),
      lifeAreaId,
      color,
      priority,
      status,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      recurring,
      schedule: {
        type: scheduleType,
        days: scheduleDays,
        times: scheduleTimes.filter(t => t !== ''),
        startDate: scheduleStartDate || null,
        endDate: scheduleEndDate || null,
        frequency: scheduleFrequency
      }
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
    <div class="sheet" role="dialog" aria-modal="true" aria-label={project ? 'Edit Project' : 'New Project'}>
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">{project ? 'Edit Project' : 'New Project'}</h2>

      <div class="field">
        <label for="proj-name">Name</label>
        <input id="proj-name" type="text" bind:value={name} placeholder="e.g. Launch new website" maxlength="80" />
      </div>

      <div class="field">
        <label for="proj-area">Life Area</label>
        <select id="proj-area" bind:value={lifeAreaId}>
          {#each lifeAreas as area}
            <option value={area.id}>{area.name}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <span class="field-label">Theme Colour</span>
        <div style="margin-top: 8px;">
          <ColourPicker bind:value={color} />
        </div>
      </div>

      <div class="field">
        <span class="field-label" id="proj-priority-label">Priority</span>
        <div class="seg-control" role="group" aria-labelledby="proj-priority-label">
          {#each priorities as p}
            <button class="seg-btn" class:active={priority === p} onclick={() => priority = p}>
              {priorityLabels[p]}
            </button>
          {/each}
        </div>
      </div>

      <div class="field">
        <span class="field-label" id="proj-status-label">Status</span>
        <div class="seg-control" role="group" aria-labelledby="proj-status-label">
          {#each statuses as s}
            <button class="seg-btn" class:active={status === s} onclick={() => status = s}>
              {statusLabels[s]}
            </button>
          {/each}
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="proj-due">Due Date</label>
          <input id="proj-due" type="date" bind:value={dueDate} />
        </div>
        <div class="field">
          <label for="proj-time">Time</label>
          <input id="proj-time" type="time" bind:value={dueTime} />
        </div>
      </div>

      <div class="field">
        <label class="check-label">
          <input type="checkbox" bind:checked={recurring} />
          <span>Recurring Project</span>
        </label>
      </div>

      {#if recurring}
        <div class="recurring-section">
          <div class="field">
            <label for="proj-freq">Frequency</label>
            <select id="proj-freq" bind:value={scheduleType}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {#if scheduleType === 'weekly' || scheduleType === 'custom'}
            <div class="field">
              <span class="field-label">On Days</span>
              <DayPicker selected={scheduleDays} onchange={(d) => scheduleDays = d} />
            </div>
          {/if}

          <div class="field">
            <div class="field-header">
                <span class="field-label">Time Slots</span>
                <button class="add-btn" onclick={() => scheduleTimes = [...scheduleTimes, '']}>+ Add Time</button>
            </div>
            {#each scheduleTimes as time, i}
                <div class="time-item">
                    <input type="time" bind:value={scheduleTimes[i]} />
                    {#if scheduleTimes.length > 1}
                        <button class="remove-btn" onclick={() => scheduleTimes = scheduleTimes.filter((_, idx) => idx !== i)}>×</button>
                    {/if}
                </div>
            {/each}
          </div>

          <div class="field-row">
            <div class="field">
              <label for="proj-start">Start Date</label>
              <input id="proj-start" type="date" bind:value={scheduleStartDate} />
            </div>
            <div class="field">
              <label for="proj-end">End Date</label>
              <input id="proj-end" type="date" bind:value={scheduleEndDate} />
            </div>
          </div>

          <div class="field">
            <label for="proj-interval">Every {scheduleFrequency} {scheduleType === 'daily' ? 'day' : scheduleType === 'weekly' ? 'week' : 'month'}{scheduleFrequency > 1 ? 's' : ''}</label>
            <input id="proj-interval" type="range" min="1" max="12" bind:value={scheduleFrequency} />
          </div>
        </div>
      {/if}

      <div class="sheet-actions">
        <button class="btn-secondary" onclick={onclose}>Cancel</button>
        <button class="btn-primary" onclick={handleSave} disabled={!name.trim()}>
          {project ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sheet {
    background: var(--color-surface);
    border-radius: 24px 24px 0 0;
    width: 100%;
    max-width: 600px;
    padding: 12px 24px calc(24px + var(--safe-bottom));
    border: 1px solid var(--color-border);
    border-bottom: none;
    animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    max-height: 90dvh;
    overflow-y: auto;
  }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet-handle {
    width: 36px; height: 4px;
    border-radius: 2px;
    background: var(--color-border);
    margin: 0 auto 20px;
  }

  .sheet-title {
    font-size: 18px; font-weight: 700;
    color: var(--color-text);
    margin-bottom: 20px;
  }

  .field { margin-bottom: 18px; }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field label, .field-label {
    display: block;
    font-size: 12px; font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .optional { font-weight: 400; text-transform: none; letter-spacing: 0; }

  .field input, .field select {
    width: 100%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--color-text);
    font-size: 15px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .field input:focus, .field select:focus {
    border-color: var(--color-primary);
  }

  input[type="date"] { color-scheme: dark; }

  .seg-control {
    display: flex;
    gap: 6px;
  }

  .seg-btn {
    flex: 1;
    padding: 9px 4px;
    border-radius: var(--radius-sm);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    text-align: center;
  }

  .seg-btn.active {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .sheet-actions {
    display: flex; gap: 12px;
    margin-top: 24px;
  }

  .btn-primary, .btn-secondary {
    flex: 1; padding: 14px;
    border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.15s;
  }

  .btn-primary { background: var(--color-primary); color: #fff; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary:not(:disabled):active { transform: scale(0.97); }

  .btn-secondary {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }
  .btn-secondary:active { transform: scale(0.97); }

  .check-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .check-label input { width: auto; margin: 0; }
  .check-label span { font-size: 14px; font-weight: 600; color: var(--color-text); }

  .recurring-section {
    background: var(--color-surface-2); border-radius: 12px; padding: 16px; margin-bottom: 20px;
    border: 1px solid var(--color-border);
  }

  .field-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .add-btn {
    background: transparent; border: none; color: var(--color-primary);
    font-size: 13px; font-weight: 600; cursor: pointer; padding: 4px 8px;
    border-radius: 4px; transition: background 0.15s;
  }
  .add-btn:hover { background: var(--color-primary-soft); }

  .time-item { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  .time-item input { flex: 1; }
  .remove-btn {
    background: transparent; border: none; color: var(--color-text-muted);
    font-size: 20px; cursor: pointer; padding: 4px 8px; line-height: 1;
  }
  .remove-btn:hover { color: #FC5C65; }

  input[type="range"] {
    accent-color: var(--color-primary);
    padding: 0;
    height: 30px;
  }
</style>
