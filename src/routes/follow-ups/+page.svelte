<script>
  import { onMount, onDestroy } from 'svelte';
  import { followups } from '$lib/stores/followups.js';
  import FollowupItem from '$lib/components/FollowupItem.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';

  let text = $state('');
  let targetDate = $state('');
  let loading = $state(true);

  onMount(() => followups.init(() => loading = false));
  onDestroy(() => followups.destroy());

  async function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    
    await followups.addFollowup({ 
      text: text.trim(), 
      targetDate: targetDate || null 
    });
    
    text = '';
    targetDate = '';
  }

  function handleToggle(id, completed) {
    followups.toggleCompleted(id, completed);
  }

  function handleDelete(id) {
    followups.deleteFollowup(id);
  }

  let activeFollowups = $derived($followups.filter(f => !f.completed));
  let completedFollowups = $derived($followups.filter(f => f.completed));
</script>

<svelte:head>
  <title>Follow-ups — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <div class="title-row">
      <h1 class="page-title">Follow-ups</h1>
      {#if activeFollowups.length > 0}
        <span class="count-badge">{activeFollowups.length} active</span>
      {/if}
    </div>
    <p class="page-subtitle">People to email, things to check on.</p>
  </header>

  <form class="input-card" onsubmit={handleAdd}>
    <input 
      type="text" 
      class="text-input" 
      bind:value={text} 
      placeholder="e.g. Follow up with Alice about venue..." 
      required
    />
    <div class="input-actions">
      <input 
        type="date" 
        class="date-input" 
        bind:value={targetDate} 
        title="Target Date (optional)"
      />
      <button type="submit" class="add-btn" disabled={!text.trim()}>Add</button>
    </div>
  </form>

  {#if loading}
    <div class="list">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if $followups.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📨</div>
      <h2>No follow-ups needed</h2>
      <p>Add people or tasks you need to circle back on above.</p>
    </div>
  {:else}
    <div class="list">
      {#each activeFollowups as f (f.id)}
        <FollowupItem followup={f} ontoggle={handleToggle} ondelete={handleDelete} />
      {/each}

      {#if completedFollowups.length > 0}
        <div class="divider">
          <span>Completed ({completedFollowups.length})</span>
        </div>
        {#each completedFollowups as f (f.id)}
          <FollowupItem followup={f} ontoggle={handleToggle} ondelete={handleDelete} />
        {/each}
      {/if}
    </div>
  {/if}
</main>

<style>
  .page {
    padding: 24px 20px calc(var(--nav-height) + var(--safe-bottom) + 20px);
    max-width: 600px;
    margin: 0 auto;
  }

  .page-header { margin-bottom: 24px; padding-top: 12px; }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }

  .count-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 4px 10px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }

  .input-card {
    background: var(--color-surface);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius);
    padding: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.1);
  }

  .text-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    margin-bottom: 12px;
    padding: 4px;
  }

  .input-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .date-input {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 13px;
    border-radius: 6px;
    padding: 6px 10px;
    outline: none;
    font-family: inherit;
  }
  input[type="date"] { color-scheme: dark; }

  .add-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 16px 0 8px;
    color: var(--color-text-muted);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-border);
  }
  .divider::before { margin-right: 12px; }
  .divider::after { margin-left: 12px; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-muted);
    gap: 10px;
  }

  .empty-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--color-text); }
  .empty-state p { font-size: 14px; line-height: 1.6; }
</style>
