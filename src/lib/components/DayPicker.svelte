<script>
  let { selected = [], onchange } = $props();

  const days = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 }
  ];

  function toggleDay(value) {
    let next;
    if (selected.includes(value)) {
      next = selected.filter(v => v !== value);
    } else {
      next = [...selected, value].sort((a, b) => a - b);
    }
    onchange(next);
  }
</script>

<div class="day-picker">
  {#each days as day}
    <button 
      class="day-btn" 
      class:active={selected.includes(day.value)}
      onclick={() => toggleDay(day.value)}
      type="button"
    >
      {day.label}
    </button>
  {/each}
</div>

<style>
  .day-picker {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    margin-top: 8px;
  }

  .day-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .day-btn.active {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
    transform: scale(1.1);
    box-shadow: 0 4px 12px var(--color-primary-soft);
  }

  .day-btn:active {
    transform: scale(0.9);
  }
</style>
