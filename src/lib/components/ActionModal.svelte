<script>
  let { open = false, action = null, onsave, onclose } = $props();

  let name = $state('');

  $effect(() => {
    if (open) {
      name = action?.name ?? '';
    }
  });

  function handleSave() {
    if (!name.trim()) return;
    onsave({
      name: name.trim()
    });
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={action ? 'Edit Action' : 'New Action'}>
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">{action ? 'Edit Action' : 'New Action'}</h2>

      <div class="field">
        <label for="act-name">Name</label>
        <input id="act-name" type="text" bind:value={name} placeholder="e.g. Reply to email" maxlength="80" />
      </div>

      <div class="sheet-actions">
        <button class="btn-secondary" onclick={onclose}>Cancel</button>
        <button class="btn-primary" onclick={handleSave} disabled={!name.trim()}>
          {action ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    z-index: 200; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sheet {
    background: var(--color-surface); border-radius: 24px 24px 0 0; width: 100%; max-width: 600px;
    padding: 12px 24px calc(24px + var(--safe-bottom)); border: 1px solid var(--color-border);
    border-bottom: none; animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .sheet-handle {
    width: 36px; height: 4px; border-radius: 2px; background: var(--color-border); margin: 0 auto 20px;
  }
  .sheet-title { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 20px; }

  .field { margin-bottom: 18px; }
  .field label {
    display: block; font-size: 12px; font-weight: 600; color: var(--color-text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
  }
  
  .field input {
    width: 100%; background: var(--color-surface-2); border: 1px solid var(--color-border);
    border-radius: var(--radius-sm); padding: 12px 14px; color: var(--color-text);
    font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.15s;
  }
  .field input:focus { border-color: var(--color-primary); }

  .sheet-actions { display: flex; gap: 12px; margin-top: 24px; }
  .btn-primary, .btn-secondary {
    flex: 1; padding: 14px; border-radius: var(--radius-sm); font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer; border: none; transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary { background: var(--color-primary); color: #fff; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary:not(:disabled):active { transform: scale(0.97); }
  .btn-secondary { background: var(--color-surface-2); color: var(--color-text-muted); border: 1px solid var(--color-border); }
  .btn-secondary:active { transform: scale(0.97); }
</style>
