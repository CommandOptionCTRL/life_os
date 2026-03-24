<script>
  let { followup, ontoggle, ondelete } = $props();

  function formatDate(isoDate) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
      .format(new Date(isoDate + 'T12:00:00'));
  }
</script>

<div class="item" class:completed={followup.completed}>
  <label class="checkbox-wrapper">
    <input 
      type="checkbox" 
      class="checkbox" 
      checked={followup.completed}
      onchange={(e) => ontoggle(followup.id, e.currentTarget.checked)}
    />
    <span class="checkmark"></span>
  </label>
  
  <div class="content">
    <span class="text">{followup.text}</span>
    {#if followup.targetDate}
      <span class="date">🎯 {formatDate(followup.targetDate)}</span>
    {/if}
  </div>

  <button 
    class="delete-btn" 
    onclick={() => ondelete(followup.id)}
    aria-label="Delete Follow-up"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  </button>
</div>

<style>
  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
  }

  .item.completed {
    opacity: 0.6;
    background: var(--color-surface-2);
  }

  .item.completed .text {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }

  .checkbox-wrapper {
    position: relative;
    display: inline-block;
    width: 22px;
    height: 22px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 22px;
    width: 22px;
    background-color: var(--color-surface-2);
    border: 2px solid var(--color-border);
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .checkbox-wrapper:hover input ~ .checkmark {
    border-color: var(--color-primary);
  }

  .checkbox:checked ~ .checkmark {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox:checked ~ .checkmark:after {
    display: block;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .text {
    font-size: 15px;
    color: var(--color-text);
    line-height: 1.4;
    word-break: break-word;
    transition: color 0.2s ease;
  }

  .date {
    font-size: 12px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .delete-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;
  }

  /* Show delete button on hover (desktop) or always visible on empty fields (touch) */
  @media (hover: hover) {
    .item:hover .delete-btn { opacity: 1; }
  }
  @media (hover: none) {
    .delete-btn { opacity: 1; }
  }

  .delete-btn svg { width: 16px; height: 16px; }
  .delete-btn:hover {
    color: #FC5C65;
    background: color-mix(in srgb, #FC5C65 10%, transparent);
  }
</style>
