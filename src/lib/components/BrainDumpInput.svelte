<script>
  import { brainDump } from '$lib/stores/brainDump.js';

  let text = $state('');
  let tag = $state('idea');
  let loading = $state(false);

  const tags = [
    { id: 'idea', label: 'Idea', icon: '💡' },
    { id: 'task', label: 'Task', icon: '✅' },
    { id: 'note', label: 'Note', icon: '📝' }
  ];

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    loading = true;
    try {
      await brainDump.addItem({ text: text.trim(), tag });
      text = '';
      tag = 'idea';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="input-container">
  <div class="tag-selector">
    {#each tags as t}
      <button 
        class="tag-btn" 
        class:active={tag === t.id} 
        onclick={() => tag = t.id}
      >
        <span class="icon">{t.icon}</span>
        <span class="label">{t.label}</span>
      </button>
    {/each}
  </div>

  <div class="input-wrapper">
    <textarea 
      bind:value={text} 
      onkeydown={handleKeydown}
      placeholder="Capture a thought..." 
      rows="1"
    ></textarea>
    <button class="send-btn" onclick={handleSubmit} disabled={!text.trim() || loading}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    </button>
  </div>
</div>

<style>
  .input-container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }

  .tag-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tag-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 99px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tag-btn.active {
    background: var(--color-primary-soft);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--color-text);
    font-size: 15px;
    font-family: inherit;
    line-height: 1.5;
    padding: 8px 0;
    resize: none;
    outline: none;
    max-height: 120px;
  }

  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    flex-shrink: 0;
    margin-bottom: 4px;
  }

  .send-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .send-btn:not(:disabled):active {
    transform: scale(0.9);
  }

  .send-btn svg {
    width: 18px;
    height: 18px;
    margin-left: -2px;
    margin-top: 1px;
  }
</style>
