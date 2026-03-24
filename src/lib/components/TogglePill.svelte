<script>
  let { options = [], value = '', onchange } = $props();
</script>

<div class="toggle-pill" role="tablist">
  {#each options as option}
    <button 
      class="pill-btn" 
      class:active={value === option}
      role="tab"
      aria-selected={value === option}
      onclick={() => onchange(option)}
    >
      {option}
    </button>
  {/each}
</div>

<style>
  .toggle-pill {
    display: flex;
    background: var(--color-surface-2);
    border-radius: 99px;
    padding: 4px;
    gap: 4px;
    width: 100%;
    margin: 0 auto 20px;
  }

  .pill-btn {
    flex: 1;
    border: none;
    background: transparent;
    border-radius: 99px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-muted);
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pill-btn.active {
    background: var(--color-primary);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
