<script>
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import { brainDump } from '$lib/stores/brainDump.js';
  import { 
    collection, 
    addDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../../firebase/database.js';

  let { open = false, item = null, onclose } = $props();

  let targetType = $state('project'); // 'area' | 'project'
  let selectedAreaId = $state('');
  let loading = $state(false);

  $effect(() => {
    if (open && $lifeAreas.length > 0) {
      selectedAreaId = $lifeAreas[0].id;
    }
  });

  async function handleConvert() {
    if (!item || loading) return;
    loading = true;

    try {
      await brainDump.convertItem(item.id, targetType, selectedAreaId);
      onclose();
    } catch (e) {
      console.error('Conversion failed:', e);
    } finally {
      loading = false;
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open && item}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" role="presentation" onclick={handleBackdrop}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Convert Item">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">Convert to...</h2>

      <div class="source-preview">
        <span class="preview-label">Original Thought:</span>
        <p class="preview-text">{item.text}</p>
      </div>

      <div class="type-selector">
        <button 
          class="type-btn" 
          class:active={targetType === 'project'} 
          onclick={() => targetType = 'project'}
        >
          <span class="icon">🚀</span>
          <span class="label">Project</span>
        </button>
        <button 
          class="type-btn" 
          class:active={targetType === 'area'} 
          onclick={() => targetType = 'area'}
        >
          <span class="icon">🌱</span>
          <span class="label">Life Area</span>
        </button>
      </div>

      {#if targetType === 'project'}
        <div class="field">
          <label for="target-area">Select Life Area</label>
          <select id="target-area" bind:value={selectedAreaId}>
            {#each $lifeAreas as area}
              <option value={area.id}>{area.name}</option>
            {     /each}
          </select>
        </div>
      {/if}

      <div class="sheet-actions">
        <button class="btn-secondary" onclick={onclose}>Cancel</button>
        <button class="btn-primary" onclick={handleConvert} disabled={loading || (targetType === 'project' && !selectedAreaId)}>
          {loading ? 'Converting...' : 'Convert Now'}
        </button>
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

  .source-preview {
    background: var(--color-surface-2);
    padding: 14px;
    border-radius: var(--radius-sm);
    margin-bottom: 24px;
    border-left: 3px solid var(--color-primary);
  }

  .preview-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .preview-text {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.4;
  }

  .type-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .type-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .type-btn .icon { font-size: 24px; }
  .type-btn .label { font-size: 14px; font-weight: 600; color: var(--color-text-muted); }

  .type-btn.active {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
  }

  .type-btn.active .label { color: var(--color-primary); }

  .field {
    margin-bottom: 24px;
  }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  select {
    width: 100%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 12px;
    color: var(--color-text);
    font-family: inherit;
    outline: none;
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
