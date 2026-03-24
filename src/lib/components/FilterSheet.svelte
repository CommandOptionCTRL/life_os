<script>
  let { open = false, onfilter, onclose } = $props();

  const priorities = [
    { id: '', label: 'All' },
    { id: 'high', label: '🔴 High' },
    { id: 'medium', label: '🟡 Medium' },
    { id: 'low', label: '🟢 Low' }
  ];

  const statuses = [
    { id: '', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'done', label: 'Done' }
  ];

  let activePriority = $state('');
  let activeStatus = $state('');

  function selectPriority(id) {
    activePriority = id;
    onfilter({ priority: id, status: activeStatus });
    onclose();
  }

  function selectStatus(id) {
    activeStatus = id;
    onfilter({ priority: activePriority, status: id });
    onclose();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Filter Options">
      <div class="sheet-handle"></div>
      
      <div class="sheet-header">
        <h2 class="sheet-title">Filter & Sort</h2>
        <button class="close-btn" onclick={onclose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="filter-section">
        <h3 class="section-label">Status</h3>
        <div class="filter-group">
          {#each statuses as s}
            <button class="chip" class:active={activeStatus === s.id} onclick={() => selectStatus(s.id)}>
              {s.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="filter-section">
        <h3 class="section-label">Priority</h3>
        <div class="filter-group">
          {#each priorities as p}
            <button class="chip" class:active={activePriority === p.id} onclick={() => selectPriority(p.id)}>
              {p.label}
            </button>
          {/each}
        </div>
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
  .close-btn { background: transparent; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .close-btn svg { width: 24px; height: 24px; }

  .filter-section { margin-bottom: 24px; }
  .section-label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
  
  .chip {
    padding: 10px 16px; border-radius: 99px; background: var(--color-surface-2); border: 1px solid var(--color-border);
    color: var(--color-text-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
    white-space: nowrap; flex: 1; min-width: calc(50% - 8px); text-align: center;
  }
  .chip.active { background: var(--color-primary-soft); border-color: var(--color-primary); color: var(--color-primary); }
</style>
