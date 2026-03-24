<script>
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import { projects } from '$lib/stores/projects.js';
  import { tasks } from '$lib/stores/tasks.js';
  import { brainDump } from '$lib/stores/brainDump.js';

  let { open = false, item = null, onclose } = $props();

  let step = $state(1); // 1: type, 2: parent, 3: confirm
  let targetType = $state('task'); // 'area' | 'project' | 'task' | 'action'
  
  let selectedAreaId = $state('');
  let selectedProjectId = $state('');
  let selectedTaskId = $state('');
  let newName = $state('');
  
  let loading = $state(false);

  // Reset state when opened
  $effect(() => {
    if (open && item) {
      if (item.tag === 'task') {
        targetType = 'task';
        step = 2;
      } else {
        targetType = 'project';
        step = 1;
      }
      newName = item.text;
      selectedAreaId = $lifeAreas.length > 0 ? $lifeAreas[0].id : '';
      selectedProjectId = '';
      selectedTaskId = '';
    }
  });

  // Cascade dropdowns
  $effect(() => {
    if (selectedAreaId) {
      const areaProjects = $projects.filter(p => p.lifeAreaId === selectedAreaId);
      if (areaProjects.length > 0 && !areaProjects.some(p => p.id === selectedProjectId)) {
        selectedProjectId = areaProjects[0].id;
      } else if (areaProjects.length === 0) {
        selectedProjectId = '';
      }
    }
  });

  $effect(() => {
    if (selectedProjectId) {
      const projTasks = $tasks.filter(t => t.projectId === selectedProjectId);
      if (projTasks.length > 0 && !projTasks.some(t => t.id === selectedTaskId)) {
        selectedTaskId = projTasks[0].id;
      } else if (projTasks.length === 0) {
        selectedTaskId = '';
      }
    }
  });

  let validHierarchy = $derived(() => {
    if (targetType === 'area') return true;
    if (targetType === 'project') return !!selectedAreaId;
    if (targetType === 'task') return !!selectedAreaId && !!selectedProjectId;
    if (targetType === 'action') return !!selectedAreaId && !!selectedProjectId && !!selectedTaskId;
    return false;
  });

  function goNext() {
    if (step === 1) {
      if (targetType === 'area') step = 3;
      else step = 2;
    } else if (step === 2) {
      step = 3;
    }
  }

  function goBack() {
    if (step === 3) {
      if (targetType === 'area') step = 1;
      else step = 2;
    } else if (step === 2) {
      step = 1;
    }
  }

  async function handleConvert() {
    if (!item || loading || !validHierarchy()) return;
    loading = true;

    try {
      let parentId = null;
      if (targetType === 'project') parentId = selectedAreaId;
      else if (targetType === 'task') parentId = selectedProjectId;
      else if (targetType === 'action') parentId = selectedTaskId;

      await brainDump.convertItem(item.id, targetType, parentId, newName);
      onclose();
    } catch (e) {
      console.error('Conversion failed:', e);
    } finally {
      loading = false;
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open && item}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-handle"></div>
      
      <header class="sheet-header">
        {#if step > 1}
          <button class="back-btn" onclick={goBack} aria-label="Go back">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        {:else}
          <div class="spacer"></div>
        {/if}
        <h2 class="sheet-title">Convert to... (Step {step}/3)</h2>
        <div class="spacer"></div>
      </header>

      <div class="sheet-body">
        {#if step === 1}
          <div class="type-grid">
            <button class="type-btn" class:active={targetType === 'area'} onclick={() => targetType = 'area'}>
              <span class="icon">🌱</span>
              <span class="label">Life Area</span>
            </button>
            <button class="type-btn" class:active={targetType === 'project'} onclick={() => targetType = 'project'}>
              <span class="icon">🚀</span>
              <span class="label">Project</span>
            </button>
            <button class="type-btn" class:active={targetType === 'task'} onclick={() => targetType = 'task'}>
              <span class="icon">✅</span>
              <span class="label">Task</span>
            </button>
            <button class="type-btn" class:active={targetType === 'action'} onclick={() => targetType = 'action'}>
              <span class="icon">⚡</span>
              <span class="label">Action</span>
            </button>
          </div>
        {:else if step === 2}
          <div class="cascading-selects">
            <div class="field">
              <label for="area-select">Life Area</label>
              <select id="area-select" bind:value={selectedAreaId}>
                {#each $lifeAreas as area}
                  <option value={area.id}>{area.name}</option>
                {/each}
              </select>
            </div>

            {#if targetType === 'task' || targetType === 'action'}
              <div class="field">
                <label for="project-select">Project</label>
                <select id="project-select" bind:value={selectedProjectId} disabled={!selectedAreaId}>
                  {#each $projects.filter(p => p.lifeAreaId === selectedAreaId) as p}
                    <option value={p.id}>{p.name}</option>
                  {/each}
                </select>
              </div>
            {/if}

            {#if targetType === 'action'}
              <div class="field">
                <label for="task-select">Task</label>
                <select id="task-select" bind:value={selectedTaskId} disabled={!selectedProjectId}>
                  {#each $tasks.filter(t => t.projectId === selectedProjectId) as t}
                    <option value={t.id}>{t.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
          </div>
        {:else if step === 3}
          <div class="confirm-step">
            <div class="field">
              <label for="name-input">Name</label>
              <textarea id="name-input" bind:value={newName} rows="3"></textarea>
            </div>
            <div class="summary">
              Converting Brain Dump into a new <strong>{targetType}</strong>.
            </div>
          </div>
        {/if}
      </div>

      <div class="sheet-actions">
        {#if step < 3}
          <button class="btn-primary" onclick={goNext} disabled={step === 2 && !validHierarchy()}>Next</button>
        {:else}
          <button class="btn-primary" onclick={handleConvert} disabled={loading || !newName.trim()}>
            {loading ? 'Converting...' : 'Convert Now'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200;
    display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sheet {
    background: var(--color-surface); border-radius: 24px 24px 0 0; width: 100%; max-width: 600px;
    padding: 12px 24px calc(24px + var(--safe-bottom)); border: 1px solid var(--color-border); border-bottom: none;
    animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--color-border); margin: 0 auto 16px; }

  .sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .sheet-title { font-size: 18px; font-weight: 700; color: var(--color-text); margin: 0; }
  
  .back-btn { background: transparent; border: none; color: var(--color-text-muted); padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: -8px;}
  .spacer { width: 40px; }

  .sheet-body { margin-bottom: 24px; min-height: 180px; }

  .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .type-btn {
    display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px;
    background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius);
    cursor: pointer; transition: all 0.2s ease;
  }
  .type-btn .icon { font-size: 28px; }
  .type-btn .label { font-size: 14px; font-weight: 600; color: var(--color-text-muted); }
  .type-btn.active { background: var(--color-primary-soft); border-color: var(--color-primary); }
  .type-btn.active .label { color: var(--color-primary); }

  .cascading-selects { display: flex; flex-direction: column; gap: 16px; }

  .field label { display: block; font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 8px; }
  select, textarea { width: 100%; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 12px; color: var(--color-text); font-family: inherit; outline: none; resize: none; }
  select:disabled { opacity: 0.5; cursor: not-allowed; }
  textarea:focus { border-color: var(--color-primary); }

  .confirm-step .summary { margin-top: 16px; font-size: 14px; color: var(--color-text-muted); text-align: center; background: var(--color-surface-2); padding: 12px; border-radius: var(--radius-sm); }
  .confirm-step strong { color: var(--color-text); text-transform: capitalize; }

  .sheet-actions { display: flex; gap: 12px; }
  .btn-primary { flex: 1; padding: 14px; border-radius: var(--radius-sm); font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; border: none; background: var(--color-primary); color: #fff; transition: opacity 0.15s, transform 0.15s; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary:not(:disabled):active { transform: scale(0.97); }
</style>
