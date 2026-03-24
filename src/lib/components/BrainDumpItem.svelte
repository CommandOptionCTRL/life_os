<script>
  let { item, ondelete, onconvert } = $props();

  const tagConfig = {
    idea: { icon: '💡', label: 'Idea', color: 'var(--color-primary)' },
    task: { icon: '✅', label: 'Task', color: 'var(--color-area-3)' },
    note: { icon: '📝', label: 'Note', color: 'var(--color-area-2)' }
  };

  const config = tagConfig[item.tag] || tagConfig.idea;

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }
</script>

<div class="item-card">
  <div class="item-header">
    <div class="tag-badge" style="--tag-color: {config.color}">
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
    <span class="date">{formatDate(item.createdAt)}</span>
  </div>
  
  <p class="text">{item.text}</p>
  
  <div class="item-footer">
    <button class="action-btn convert" onclick={() => onconvert(item)}>
      <span>Convert</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 8l4 4-4 4M3 12h18" />
      </svg>
    </button>
    <button class="action-btn delete" onclick={() => ondelete(item.id)} aria-label="Delete">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    </button>
  </div>
</div>

<style>
  .item-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.2s ease;
  }

  .item-card:active {
    transform: scale(0.99);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--tag-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .date {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .text {
    font-size: 15px;
    color: var(--color-text);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .item-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    transition: all 0.2s ease;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .action-btn.convert:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .action-btn.delete:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>
