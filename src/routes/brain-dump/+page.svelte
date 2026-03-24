<script>
  import { onMount, onDestroy } from 'svelte';
  import { brainDump } from '$lib/stores/brainDump.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import BrainDumpInput from '$lib/components/BrainDumpInput.svelte';
  import BrainDumpItem from '$lib/components/BrainDumpItem.svelte';
  import ConvertModal from '$lib/components/ConvertModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';

  let convertModalOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let itemToConvert = $state(null);

  onMount(() => {
    brainDump.init();
    lifeAreas.init();
  });

  onDestroy(() => {
    brainDump.destroy();
    lifeAreas.destroy();
  });

  function openConvert(item) {
    itemToConvert = item;
    convertModalOpen = true;
  }

  async function handleDelete(id) {
    itemToDelete = id;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (itemToDelete) {
      await brainDump.deleteItem(itemToDelete);
      confirmOpen = false;
      itemToDelete = null;
    }
  }
</script>

<svelte:head>
  <title>Brain Dump — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <h1 class="page-title">Brain Dump</h1>
    <p class="page-subtitle">Capture anything, sort it later</p>
  </header>

  <BrainDumpInput />

  {#if $brainDump.length === 0}
    <div class="empty-state">
      <div class="empty-icon">💭</div>
      <h2>Your mind is clear</h2>
      <p>Empty your thoughts here to process them into projects or life areas later.</p>
    </div>
  {:else}
    <div class="items-list">
      {#each $brainDump as item (item.id)}
        <BrainDumpItem 
          {item} 
          ondelete={handleDelete} 
          onconvert={openConvert} 
        />
      {/each}
    </div>
  {/if}
</main>

<ConvertModal 
  open={convertModalOpen} 
  item={itemToConvert} 
  onclose={() => convertModalOpen = false} 
/>

<ConfirmSheet
  open={confirmOpen}
  message="Delete this item?"
  onconfirm={handleConfirmDelete}
  oncancel={() => confirmOpen = false}
/>

<style>
  .page {
    padding: 24px 20px calc(var(--nav-height) + var(--safe-bottom) + 80px);
    max-width: 600px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 24px;
    padding-top: 12px;
  }

  .page-title {
    font-size: 30px;
    font-weight: 700;
    color: var(--color-text);
  }

  .page-subtitle {
    font-size: 14px;
    color: var(--color-text-muted);
    margin-top: 4px;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-muted);
    gap: 10px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .empty-state h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
  }

  .empty-state p {
    font-size: 14px;
    line-height: 1.6;
  }
</style>
