<script>
  let { onfilter } = $props();

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
  }

  function selectStatus(id) {
    activeStatus = id;
    onfilter({ priority: activePriority, status: id });
  }
</script>

<div class="filter-bar">
  <div class="filter-group" role="group" aria-label="Filter by status">
    {#each statuses as s}
      <button 
        class="chip" 
        class:active={activeStatus === s.id} 
        onclick={() => selectStatus(s.id)}
      >
        {s.label}
      </button>
    {/each}
  </div>

  <div class="divider"></div>

  <div class="filter-group" role="group" aria-label="Filter by priority">
    {#each priorities as p}
      <button 
        class="chip" 
        class:active={activePriority === p.id} 
        onclick={() => selectPriority(p.id)}
      >
        {p.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .filter-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .filter-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .chip {
    padding: 6px 12px;
    border-radius: 99px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .chip.active {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .divider {
    height: 1px;
    background: var(--color-border);
  }
</style>
