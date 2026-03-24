<script>
  let { open = false, area = null, onsave, onclose, readOnly = false } = $props();

  const colorOptions = [
    '#6C63FF','#F7B731','#26de81','#FC5C65',
    '#45AAF2','#FD9644','#A55EEA','#2BCBBA'
  ];

  let name = $state('');
  let description = $state('');
  let selectedColor = $state(colorOptions[0]);

  $effect(() => {
    if (open) {
      name = area?.name ?? '';
      description = area?.description ?? '';
      selectedColor = area?.color ?? colorOptions[0];
    }
  });

  function handleSave() {
    if (readOnly || !name.trim()) return;
    onsave({ name: name.trim(), description: description.trim(), color: selectedColor });
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={readOnly ? 'View Life Area' : (area ? 'Edit Life Area' : 'New Life Area')}>
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">{readOnly ? 'Life Area Details' : (area ? 'Edit Life Area' : 'New Life Area')}</h2>

      <div class="field">
        <label for="la-name">Name</label>
        <input id="la-name" type="text" bind:value={name} placeholder="e.g. Health & Fitness" maxlength="40" readonly={readOnly} />
      </div>

      <div class="field">
        <label for="la-desc">Description <span class="optional">(optional)</span></label>
        <input id="la-desc" type="text" bind:value={description} placeholder="What does this area cover?" maxlength="100" readonly={readOnly} />
      </div>

      <div class="field">
        <span class="field-label" id="la-color-label">Color</span>
        <div class="color-grid" role="group" aria-labelledby="la-color-label">
          {#each colorOptions as c}
            <button
              class="color-dot"
              class:selected={selectedColor === c}
              class:disabled-dot={readOnly}
              style="background: {c}; box-shadow: 0 4px 12px color-mix(in srgb, {c} 45%, transparent);"
              onclick={() => { if (!readOnly) selectedColor = c; }}
              aria-label="Select color {c}"
              disabled={readOnly}
            ></button>
          {/each}
        </div>
      </div>

      <div class="sheet-actions">
        {#if readOnly}
          <button class="btn-primary" onclick={onclose}>Close</button>
        {:else}
          <button class="btn-secondary" onclick={onclose}>Cancel</button>
          <button class="btn-primary" onclick={handleSave} disabled={!name.trim()}>
            {area ? 'Save Changes' : 'Create'}
          </button>
        {/if}
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
    margin-bottom: 20px;
  }

  .field {
    margin-bottom: 16px;
  }

  .field label, .field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .optional {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }

  .field input {
    width: 100%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--color-text);
    font-size: 15px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .field input:focus {
    border-color: var(--color-primary);
  }

  .color-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .color-dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
  }

  .color-dot:hover:not(.disabled-dot) { transform: scale(1.12); }

  .color-dot.selected {
    border-color: #fff;
    transform: scale(1.15);
  }

  .color-dot.disabled-dot {
    cursor: default;
  }

  .sheet-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
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

  .btn-primary {
    background: var(--color-primary);
    color: #fff;
  }

  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary:not(:disabled):active { transform: scale(0.97); }

  .btn-secondary {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:active { transform: scale(0.97); }
</style>
