<script>
  import { onMount, onDestroy } from 'svelte';
  import { projects, sortedProjects, isOverdue } from '$lib/stores/projects.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import ProjectModal from '$lib/components/ProjectModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';
  import FilterSheet from '$lib/components/FilterSheet.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';
  import FAB from '$lib/components/FAB.svelte';

  let modalOpen = $state(false);
  let filterOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let editingProject = $state(null);
  let filterPriority = $state('');
  let filterStatus = $state('');
  let loading = $state(true);

  onMount(() => {
    let pLoaded = false;
    let aLoaded = false;
    function check() { if (pLoaded && aLoaded) loading = false; }
    
    projects.init(() => { pLoaded = true; check(); });
    lifeAreas.init(() => { aLoaded = true; check(); });
  });

  onDestroy(() => {
    projects.destroy();
    lifeAreas.destroy();
  });

  /** @param {string} areaId */
  function getArea(areaId) {
    return $lifeAreas.find((a) => a.id === areaId) ?? null;
  }

  let filteredProjects = $derived(
    $sortedProjects.filter((p) => {
      if (filterPriority && p.priority !== filterPriority) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    })
  );

  let overdueCount = $derived($sortedProjects.filter(isOverdue).length);

  function handleFilter({ priority, status }) {
    filterPriority = priority;
    filterStatus = status;
  }

  function openCreate() {
    editingProject = null;
    modalOpen = true;
  }

  function openEdit(project) {
    editingProject = project;
    modalOpen = true;
  }

  async function handleSave(data) {
    if (editingProject) {
      await projects.updateProject(editingProject.id, data);
    } else {
      await projects.addProject(data);
    }
    modalOpen = false;
  }

  async function handleDelete(id) {
    itemToDelete = id;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (itemToDelete) {
      await projects.deleteProject(itemToDelete);
      confirmOpen = false;
      itemToDelete = null;
    }
  }
</script>

<svelte:head>
  <title>Projects — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <div class="title-row">
      <h1 class="page-title">Projects</h1>
      {#if overdueCount > 0}
        <span class="overdue-count">{overdueCount} overdue</span>
      {/if}
    </div>
    <p class="page-subtitle">What you're working towards</p>
  </header>

  {#if loading}
    <div class="projects-list">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if filteredProjects.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🚀</div>
      <h2>{$sortedProjects.length === 0 ? 'No projects yet' : 'No matches'}</h2>
      <p>
        {$sortedProjects.length === 0
          ? 'Tap + to create a project, or convert a Brain Dump thought.'
          : 'Try different filters.'}
      </p>
    </div>
  {:else}
    <div class="projects-list">
      {#each filteredProjects as project (project.id)}
        <ProjectCard
          {project}
          lifeArea={getArea(project.lifeAreaId)}
          onedit={openEdit}
          ondelete={handleDelete}
        />
      {/each}
    </div>
  {/if}
</main>

<button class="filter-fab" onclick={() => filterOpen = true} aria-label="Filter options">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
</button>

<FAB onclick={openCreate} />

<FilterSheet
  open={filterOpen}
  onfilter={handleFilter}
  onclose={() => filterOpen = false}
/>

<ProjectModal
  open={modalOpen}
  project={editingProject}
  lifeAreas={$lifeAreas}
  onsave={handleSave}
  onclose={() => modalOpen = false}
/>

<ConfirmSheet
  open={confirmOpen}
  message="Delete this project?"
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

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }

  .overdue-count {
    font-size: 12px;
    font-weight: 700;
    color: #FC5C65;
    background: color-mix(in srgb, #FC5C65 15%, transparent);
    border: 1px solid color-mix(in srgb, #FC5C65 30%, transparent);
    padding: 4px 10px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    align-self: center;
  }

  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }

  .projects-list { display: flex; flex-direction: column; gap: 12px; }

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

  .filter-fab {
    position: fixed;
    bottom: calc(var(--nav-height) + var(--safe-bottom) + 90px);
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 90;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s, background 0.2s;
  }
  .filter-fab:active { transform: scale(0.92); }
  .filter-fab svg { width: 18px; height: 18px; }
</style>
