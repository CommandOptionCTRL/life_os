<script>
  let { title = '', pathContext = '', areaColor = '', priority = '', dueDate = '', isOverdue = false, onnavigate } = $props();

  const priorityLabels = { high: '🔴', medium: '🟡', low: '🟢' };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="card" class:overdue={isOverdue} onclick={onnavigate} style="--area-color: {areaColor || 'var(--color-border)'}">
  <div class="card-content">
    <div class="card-header">
      <span class="path" title={pathContext}>{pathContext}</span>
      {#if dueDate}
        <span class="due-date" class:is-overdue={isOverdue}>{dueDate}</span>
      {/if}
      {#if priority}
        <span class="priority" title="{priority} priority">{priorityLabels[priority]}</span>
      {/if}
    </div>
    <div class="card-title">{title}</div>
  </div>
</div>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--area-color);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .card:active {
    transform: scale(0.98);
  }
  .card.overdue {
    border-color: color-mix(in srgb, #FC5C65 40%, transparent);
    background: color-mix(in srgb, #FC5C65 5%, var(--color-surface));
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .path {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .due-date {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .due-date.is-overdue {
    color: #FC5C65;
    font-weight: 600;
  }

  .priority {
    font-size: 12px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
  }
</style>
