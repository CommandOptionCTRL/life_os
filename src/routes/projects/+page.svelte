<script>
  import { onMount, onDestroy } from 'svelte';
  import { projects, sortedProjects, isOverdue } from '$lib/stores/projects.js';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import ProjectModal from '$lib/components/ProjectModal.svelte';
  import SortFilterBar from '$lib/components/SortFilterBar.svelte';
  import FAB from '$lib/components/FAB.svelte';

  let modalOpen = $state(false);
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
    if (confirm('Delete this project?')) {
      await projects.deleteProject(id);
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

  <SortFilterBar onfilter={handleFilter} />

  {#if filteredProjects.length === 0}
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

<FAB onclick={openCreate} />

<ProjectModal
  open={modalOpen}
  project={editingProject}
  lifeAreas={$lifeAreas}
  onsave={handleSave}
  onclose={() => modalOpen = false}
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
</style>
