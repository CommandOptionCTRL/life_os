<script>
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
  import { projects, sortedProjects, isOverdue } from '$lib/stores/projects.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import ProjectModal from '$lib/components/ProjectModal.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import SortFilterBar from '$lib/components/SortFilterBar.svelte';
  import FAB from '$lib/components/FAB.svelte';
  import { goto } from '$app/navigation';

  let areaId = $derived(page.params.areaId);

  let modalOpen = $state(false);
  let confirmOpen = $state(false);
  let itemToDelete = $state(null);
  let editingProject = $state(null);
  let filterPriority = $state('');
  let filterStatus = $state('');

  onMount(() => {
    projects.init();
    lifeAreas.init();
  });

  onDestroy(() => {
    projects.destroy();
    lifeAreas.destroy();
  });

  let currentArea = $derived($lifeAreas.find(a => a.id === areaId));

  let breadcrumbs = $derived(currentArea ? [
    { label: 'Areas', href: '/life-areas' },
    { label: currentArea.name, href: '' }
  ] : []);

  let filteredProjects = $derived(
    $sortedProjects.filter((p) => {
      if (p.lifeAreaId !== areaId) return false;
      if (filterPriority && p.priority !== filterPriority) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    })
  );

  let overdueCount = $derived($sortedProjects.filter(p => p.lifeAreaId === areaId && isOverdue(p)).length);

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

  function handleNavigate(project) {
    goto(`/life-areas/${areaId}/${project.id}`);
  }

  async function handleSave(data) {
    if (editingProject) {
      await projects.updateProject(editingProject.id, data);
    } else {
      await projects.addProject({ ...data, lifeAreaId: data.lifeAreaId || areaId });
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
  <title>{currentArea ? currentArea.name + ' — LifeOS' : 'Projects — LifeOS'}</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <div class="title-row">
      <h1 class="page-title">{currentArea ? currentArea.name : 'Projects'}</h1>
      {#if overdueCount > 0}
        <span class="overdue-count">{overdueCount} overdue</span>
      {/if}
    </div>
    <p class="page-subtitle">What you're working towards</p>
  </header>

  <SortFilterBar onfilter={handleFilter} />

  {#if filteredProjects.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🚀</div>
      <h2>No projects in this area</h2>
      <p>Tap + to create a project, or convert a Brain Dump thought.</p>
    </div>
  {:else}
    <div class="projects-list">
      {#each filteredProjects as project (project.id)}
        <ProjectCard
          {project}
          lifeArea={currentArea}
          onedit={openEdit}
          ondelete={handleDelete}
          onnavigate={handleNavigate}
        />
      {/each}
    </div>
  {/if}
</main>

{#if currentArea}
  <Breadcrumb crumbs={breadcrumbs} />
{/if}

<FAB onclick={openCreate} />

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
  .title-row { display: flex; align-items: center; gap: 12px; }
  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }
  .overdue-count {
    font-size: 12px; font-weight: 700; color: #FC5C65; background: color-mix(in srgb, #FC5C65 15%, transparent);
    border: 1px solid color-mix(in srgb, #FC5C65 30%, transparent); padding: 4px 10px; border-radius: 99px;
    text-transform: uppercase; letter-spacing: 0.05em; align-self: center;
  }
  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }
  .projects-list { display: flex; flex-direction: column; gap: 12px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 60px 20px; color: var(--color-text-muted); gap: 10px; }
  .empty-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--color-text); }
  .empty-state p { font-size: 14px; line-height: 1.6; }
</style>
