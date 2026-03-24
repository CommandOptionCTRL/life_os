<script>
  let { action, onedit, ondelete, ontoggleflag, ontogglestatus } = $props();

  let translateX = $state(0);
  let isSwiping = $state(false);
  let startX = 0;

  function handleTouchStart(e) { startX = e.touches[0].clientX; isSwiping = true; }
  function handleTouchMove(e) {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    if (diff < 0) translateX = Math.max(diff, -80);
    else translateX = 0;
  }
  function handleTouchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;
    if (translateX < -40) translateX = -80;
    else translateX = 0;
  }
</script>

<div class="swipe-container">
  <div class="delete-action">
    <button class="delete-btn" onclick={(e) => { e.stopPropagation(); ondelete(action.id); translateX = 0; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div 
    class="card" 
    class:done={action.status === 'done'}
    style="transform: translateX({translateX}px); transition: {isSwiping ? 'none' : 'transform 0.2s ease'};"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <div class="card-left">
      <button class="checkbox" onclick={(e) => { e.stopPropagation(); ontogglestatus(action); }}>
        {#if action.status === 'done'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {/if}
      </button>
      <span class="card-name" class:strikethrough={action.status === 'done'}>{action.name}</span>
    </div>
    <div class="card-actions">
      <button class="icon-btn" class:flagged={action.flagged} onclick={(e) => { e.stopPropagation(); ontoggleflag(action); }} aria-label="Flag">
        <svg viewBox="0 0 24 24" fill={action.flagged ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>
      <button class="icon-btn" onclick={(e) => { e.stopPropagation(); onedit(action); }} aria-label="Edit">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="icon-btn delete-icon" onclick={(e) => { e.stopPropagation(); ondelete(action.id); }} aria-label="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .swipe-container {
    position: relative; border-radius: var(--radius); overflow: hidden;
    background: #FC5C65; border: 1px solid var(--color-border);
  }
  .delete-action {
    position: absolute; top: 0; right: 0; bottom: 0; width: 80px;
    display: flex; align-items: center; justify-content: center;
  }
  .delete-btn {
    background: transparent; border: none; color: white; cursor: pointer;
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0;
  }
  .delete-btn svg { width: 24px; height: 24px; }
  
  .card {
    background: var(--color-surface); padding: 16px; display: flex; align-items: center; justify-content: space-between;
    gap: 12px; position: relative; z-index: 1; min-height: 100%;
  }

  .card.done {
    background: var(--color-surface-2);
  }
  
  .card-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; overflow: hidden; }
  
  .checkbox {
    width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--color-border);
    background: var(--color-surface); cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--color-primary); transition: all 0.2s; flex-shrink: 0; padding: 0; margin-top: 1px;
  }
  .card.done .checkbox {
    background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    border-color: var(--color-primary);
  }
  .checkbox svg { width: 14px; height: 14px; }
  
  .card-name { font-size: 15px; font-weight: 500; color: var(--color-text); line-height: 1.4; word-break: break-word; }
  .strikethrough { text-decoration: line-through; color: var(--color-text-muted); opacity: 0.8; }

  .card-actions { display: flex; gap: 4px; flex-shrink: 0; align-items: flex-start; }
  .icon-btn {
    width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: var(--color-text-muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; padding: 0;
  }
  .icon-btn svg { width: 16px; height: 16px; }
  .icon-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
  .icon-btn.flagged { color: #F7B731; }
  .icon-btn.delete-icon:hover { color: #FC5C65; }
</style>
