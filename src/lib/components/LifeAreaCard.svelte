<script>
  let { area, onedit, ondelete, onnavigate } = $props();

  const colorPalette = [
    '#6C63FF','#F7B731','#26de81','#FC5C65',
    '#45AAF2','#FD9644','#A55EEA','#2BCBBA'
  ];

  function getColor(color) {
    return colorPalette.includes(color) ? color : colorPalette[0];
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="card" onclick={() => onnavigate(area)} style="--area-color: {getColor(area.color)}">
  <div class="card-left">
    <div class="color-swatch"></div>
    <div class="card-info">
      <h3 class="card-name">{area.name}</h3>
      {#if area.description}
        <p class="card-desc">{area.description}</p>
      {/if}
    </div>
  </div>
  <div class="card-actions">
    <button class="icon-btn" onclick={(e) => { e.stopPropagation(); onedit(area); }} aria-label="Edit">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
    <button class="icon-btn danger" onclick={(e) => { e.stopPropagation(); ondelete(area.id); }} aria-label="Delete">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 16px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    cursor: pointer;
  }

  .card:hover {
    background: var(--color-surface-2);
  }

  .card:active {
    transform: scale(0.98);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .color-swatch {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--area-color);
    flex-shrink: 0;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--area-color) 40%, transparent);
  }

  .card-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
  }

  .card-desc {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .card-actions {
    display: flex;
    gap: 4px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .icon-btn:hover { color: var(--color-text); }
  .icon-btn.danger:hover { color: #FC5C65; }

  .icon-btn svg {
    width: 16px;
    height: 16px;
  }
</style>
