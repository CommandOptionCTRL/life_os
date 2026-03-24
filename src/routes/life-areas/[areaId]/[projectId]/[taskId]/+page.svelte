<script>
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
  import { actions, sortedActions } from '$lib/stores/actions.js';
  import { tasks } from '$lib/stores/tasks.js';
  import { projects } from '$lib/stores/projects.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import ActionCard from '$lib/components/ActionCard.svelte';
  import ActionModal from '$lib/components/ActionModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';
  import FAB from '$lib/components/FAB.svelte';

  let areaId = $derived(page.params.areaId);
  let projectId = $derived(page.params.projectId);
  let taskId = $derived(page.params.taskId);

  let modalOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let editingAction = $state(null);

  let loadingAreas = $state(true);
  let loadingProjects = $state(true);
  let loadingTasks = $state(true);
  let loadingActions = $state(true);
  let loading = $derived(loadingAreas || loadingProjects || loadingTasks || loadingActions);

  onMount(() => {
    lifeAreas.init(() => loadingAreas = false);
    projects.init(() => loadingProjects = false);
    
    $effect(() => {
      if (projectId) {
        loadingTasks = true;
        tasks.init(projectId, () => loadingTasks = false);
      }
      if (taskId) {
        loadingActions = true;
        actions.init(taskId, () => loadingActions = false);
      }
    });
  });

  onDestroy(() => {
    lifeAreas.destroy();
    projects.destroy();
    tasks.destroy();
    actions.destroy();
  });

  let currentArea = $derived($lifeAreas.find(a => a.id === areaId));
  let currentProject = $derived($projects.find(p => p.id === projectId));
  let currentTask = $derived($tasks.find(t => t.id === taskId));

  let breadcrumbs = $derived((currentArea && currentProject && currentTask) ? [
    { label: 'Areas', href: '/life-areas' },
    { label: currentArea.name, href: `/life-areas/${areaId}` },
    { label: currentProject.name, href: `/life-areas/${areaId}/${projectId}` },
    { label: currentTask.name, href: '' }
  ] : []);

  let filteredActions = $derived($sortedActions);

  function openCreate() {
    editingAction = null;
    modalOpen = true;
  }

  function openEdit(action) {
    editingAction = action;
    modalOpen = true;
  }

  async function handleToggleStatus(action) {
    const newStatus = action.status === 'done' ? 'todo' : 'done';
    await actions.updateAction(action.id, { status: newStatus });
  }

  async function handleToggleFlag(action) {
    await actions.updateAction(action.id, { flagged: !action.flagged });
  }

  async function handleSave(data) {
    if (editingAction) {
      await actions.updateAction(editingAction.id, data);
    } else {
      await actions.addAction({ ...data, taskId });
    }
    modalOpen = false;
  }

  async function handleDelete(id) {
    itemToDelete = id;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (itemToDelete) {
      await actions.deleteAction(itemToDelete);
      confirmOpen = false;
      itemToDelete = null;
    }
  }
</script>

<svelte:head>
  <title>{currentTask ? currentTask.name + ' — LifeOS' : 'Actions — LifeOS'}</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <div class="title-row">
      <h1 class="page-title">{currentTask ? currentTask.name : 'Actions'}</h1>
    </div>
    <p class="page-subtitle">The next step</p>
  </header>

  {#if loading}
    <div class="actions-list">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if filteredActions.length === 0}
    <div class="empty-state">
      <div class="empty-icon">⚡</div>
      <h2>No actions yet</h2>
      <p>Tap + to define the next physical step.</p>
    </div>
  {:else}
    <div class="actions-list">
      {#each filteredActions as action, i (action.id)}
        <ActionCard
          {action}
          onedit={openEdit}
          ondelete={handleDelete}
          ontoggleflag={handleToggleFlag}
          ontogglestatus={handleToggleStatus}
        />
      {/each}
    </div>
  {/if}
</main>

{#if currentArea && currentProject && currentTask}
  <Breadcrumb crumbs={breadcrumbs} />
{/if}

<FAB onclick={openCreate} />

<ActionModal
  open={modalOpen}
  action={editingAction}
  onsave={handleSave}
  onclose={() => modalOpen = false}
/>

<ConfirmSheet
  open={confirmOpen}
  message="Delete this action?"
  onconfirm={handleConfirmDelete}
  oncancel={() => confirmOpen = false}
/>

<style>
  .page {
    padding: 24px 20px calc(var(--nav-height) + var(--safe-bottom) + 80px);
    max-width: 600px;
    margin: 0 auto;
  }
  .page-header { margin-bottom: 20px; padding-top: 12px; }
  .title-row { display: flex; align-items: center; gap: 12px; }
  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }
  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }
  .actions-list { display: flex; flex-direction: column; gap: 8px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 60px 20px; color: var(--color-text-muted); gap: 10px; }
  .empty-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--color-text); }
  .empty-state p { font-size: 14px; line-height: 1.6; }
</style>
