<script>
  import { getDayAbbr, getCurrentWeekDates } from '$lib/utils/recurrence.js';

  let { selectedDays = [], completions = {}, ontoggle } = $props();

  const weekDates = getCurrentWeekDates();
  
  // Only show days that are selected in the recurrence rule
  const visibleDates = weekDates.filter(d => {
    const day = new Date(d).getDay();
    return selectedDays.includes(day);
  });
</script>

<div class="multi-checkoff">
  {#each visibleDates as date}
    {@const isDone = !!completions?.[date]}
    <button 
      class="check-btn" 
      class:done={isDone}
      onclick={(e) => { e.stopPropagation(); ontoggle(date); }}
      aria-label="Check off {date}"
    >
      <span class="day-label">{getDayAbbr(date)}</span>
      <div class="check-box">
        {#if isDone}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        {/if}
      </div>
    </button>
  {/each}
</div>

<style>
  .multi-checkoff {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .check-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .check-btn:hover {
    background: var(--color-surface-2);
  }

  .day-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .check-box {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: var(--color-surface);
  }

  .done .check-box {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }

  .check-box svg {
    width: 12px;
    height: 12px;
  }
</style>
