<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import LifeAreaCard from '$lib/components/LifeAreaCard.svelte';
  import LifeAreaModal from '$lib/components/LifeAreaModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';
  import FAB from '$lib/components/FAB.svelte';

  let modalOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let editingArea = $state(null);
  let readOnly = $state(false);

  onMount(() => lifeAreas.init());
  onDestroy(() => lifeAreas.destroy());

  function openCreate() {
    editingArea = null;
    readOnly = false;
    modalOpen = true;
  }

  function openEdit(area) {
    editingArea = area;
    readOnly = false;
    modalOpen = true;
  }

  function handleNavigate(area) {
    goto(`/life-areas/${area.id}`);
  }

  async function handleSave(data) {
    if (editingArea) {
      await lifeAreas.updateLifeArea(editingArea.id, data);
    } else {
      await lifeAreas.addLifeArea(data);
    }
    modalOpen = false;
  }

  async function handleDelete(id) {
    itemToDelete = id;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (itemToDelete) {
      await lifeAreas.deleteLifeArea(itemToDelete);
      confirmOpen = false;
      itemToDelete = null;
    }
  }
</script>

<svelte:head>
  <title>Life Areas — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <h1 class="page-title">Life Areas</h1>
    <p class="page-subtitle">The pillars of your life</p>
  </header>

  {#if $lifeAreas.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🌱</div>
      <h2>No life areas yet</h2>
      <p>Tap <strong>+</strong> to define the pillars of your life.</p>
    </div>
  {:else}
    <div class="areas-list">
      {#each $lifeAreas as area (area.id)}
        <LifeAreaCard 
          {area} 
          onedit={openEdit} 
          ondelete={handleDelete} 
          onnavigate={handleNavigate} 
        />
      {/each}
    </div>
  {/if}
</main>

<FAB onclick={openCreate} />

<LifeAreaModal
  open={modalOpen}
  area={editingArea}
  onsave={handleSave}
  onclose={() => modalOpen = false}
/>

<ConfirmSheet
  open={confirmOpen}
  message="Delete this Life Area?"
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
    margin-bottom: 28px;
    padding-top: 12px;
  }

  .page-title {
    font-size: 30px;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: 14px;
    color: var(--color-text-muted);
    margin-top: 4px;
  }

  .areas-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
