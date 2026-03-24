<script>
  let { 
    open = false, 
    message, 
    confirmLabel = 'Delete', 
    onconfirm, 
    oncancel 
  } = $props();

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) oncancel();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Confirm Action">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">Confirm</h2>
      <p class="sheet-message">{message}</p>
      
      <div class="sheet-actions">
        <button class="btn-secondary" onclick={oncancel}>Cancel</button>
        <button class="btn-primary danger" onclick={onconfirm}>{confirmLabel}</button>
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
  }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet-handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--color-border);
    margin: 0 auto 20px;
  }

  .sheet-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 12px;
  }

  .sheet-message {
    font-size: 15px;
    color: var(--color-text);
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .sheet-actions {
    display: flex;
    gap: 12px;
  }

  .btn-primary, .btn-secondary {
    flex: 1;
    padding: 14px;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.15s;
  }

  .btn-primary.danger {
    background: #FC5C65;
    color: #fff;
  }

  .btn-primary:active { transform: scale(0.97); }

  .btn-secondary {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:active { transform: scale(0.97); }
</style>
