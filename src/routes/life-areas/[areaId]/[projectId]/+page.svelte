<script>
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
  import { tasks, sortedTasks, isTaskOverdue } from '$lib/stores/tasks.js';
  import { projects } from '$lib/stores/projects.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import TaskCard from '$lib/components/TaskCard.svelte';
  import TaskModal from '$lib/components/TaskModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';
  import FAB from '$lib/components/FAB.svelte';
  import { goto } from '$app/navigation';

  let areaId = $derived(page.params.areaId);
  let projectId = $derived(page.params.projectId);

  let modalOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let editingTask = $state(null);

  let loadingTasks = $state(true);
  let loadingAreas = $state(true);
  let loadingProjects = $state(true);
  let loading = $derived(loadingTasks || loadingAreas || loadingProjects);

  onMount(() => {
    lifeAreas.init(() => loadingAreas = false);
    projects.init(() => loadingProjects = false);
    
    $effect(() => {
      if (projectId) {
        loadingTasks = true;
        tasks.init(projectId, () => loadingTasks = false);
      }
    });
  });

  onDestroy(() => {
    lifeAreas.destroy();
    projects.destroy();
    tasks.destroy();
  });

  let currentArea = $derived($lifeAreas.find(a => a.id === areaId));
  let currentProject = $derived($projects.find(p => p.id === projectId));

  let breadcrumbs = $derived((currentArea && currentProject) ? [
    { label: 'Areas', href: '/life-areas' },
    { label: currentArea.name, href: `/life-areas/${areaId}` },
    { label: currentProject.name, href: '' }
  ] : []);

  let filteredTasks = $derived($sortedTasks);

  function openCreate() {
    editingTask = null;
    modalOpen = true;
  }

  function openEdit(task) {
    editingTask = task;
    modalOpen = true;
  }

  function handleNavigate(task) {
    goto(`/life-areas/${areaId}/${projectId}/${task.id}`);
  }

  async function handleToggleFlag(task) {
    await tasks.updateTask(task.id, { flagged: !task.flagged });
  }

  async function handleSave(data) {
    if (editingTask) {
      await tasks.updateTask(editingTask.id, data);
    } else {
      await tasks.addTask({ ...data, projectId });
    }
    modalOpen = false;
  }

  async function handleDelete(id) {
    itemToDelete = id;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (itemToDelete) {
      await tasks.deleteTask(itemToDelete);
      confirmOpen = false;
      itemToDelete = null;
    }
  }
</script>

<svelte:head>
  <title>{currentProject ? currentProject.name + ' — LifeOS' : 'Tasks — LifeOS'}</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <div class="title-row">
      <h1 class="page-title">{currentProject ? currentProject.name : 'Tasks'}</h1>
    </div>
    <p class="page-subtitle">What needs to be done</p>
  </header>

  {#if loading}
    <div class="tasks-list">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if filteredTasks.length === 0}
    <div class="empty-state">
      <div class="empty-icon">✅</div>
      <h2>No tasks in this project</h2>
      <p>Tap + to break down this project.</p>
    </div>
  {:else}
    <div class="tasks-list">
      {#each filteredTasks as task (task.id)}
        <TaskCard
          {task}
          onedit={openEdit}
          ondelete={handleDelete}
          ontoggleflag={handleToggleFlag}
          onnavigate={handleNavigate}
        />
      {/each}
    </div>
  {/if}
</main>

{#if currentArea && currentProject}
  <Breadcrumb crumbs={breadcrumbs} />
{/if}

<FAB onclick={openCreate} />

<TaskModal
  open={modalOpen}
  task={editingTask}
  onsave={handleSave}
  onclose={() => modalOpen = false}
/>

<ConfirmSheet
  open={confirmOpen}
  message="Delete this task?"
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
  .tasks-list { display: flex; flex-direction: column; gap: 12px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 60px 20px; color: var(--color-text-muted); gap: 10px; }
  .empty-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--color-text); }
  .empty-state p { font-size: 14px; line-height: 1.6; }
</style>
