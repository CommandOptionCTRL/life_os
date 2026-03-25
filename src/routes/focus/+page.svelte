<script>
  import { onMount, onDestroy } from 'svelte';
  import { lifeAreas } from '$lib/stores/lifeAreas.js';
  import { projects } from '$lib/stores/projects.js';
  import { tasks } from '$lib/stores/tasks.js';
  import { actions } from '$lib/stores/actions.js';
  import { goto } from '$app/navigation';
  import TogglePill from '$lib/components/TogglePill.svelte';
  import FocusItemCard from '$lib/components/FocusItemCard.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';

  let mode = $state('Priority');
  const options = ['Priority', 'Pending'];
  let loading = $state(true);

  onMount(() => {
    let lLoaded = false;
    let pLoaded = false;
    let tLoaded = false;
    let aLoaded = false;
    function check() { if (lLoaded && pLoaded && tLoaded && aLoaded) loading = false; }
    
    lifeAreas.init(() => { lLoaded = true; check(); });
    projects.init(() => { pLoaded = true; check(); });
    tasks.init(null, () => { tLoaded = true; check(); });
    actions.init(null, () => { aLoaded = true; check(); });
  });

  onDestroy(() => {
    lifeAreas.destroy();
    projects.destroy();
    tasks.destroy();
    actions.destroy();
  });

  // Derived filtered arrays for Priority
  let flaggedProjects = $derived($projects.filter(p => p.flagged));
  let flaggedTasks = $derived($tasks.filter(t => t.flagged));
  let flaggedActions = $derived($actions.filter(a => a.flagged));

  // Derived filtered arrays for Pending
  let pendingProjects = $derived($projects.filter(p => p.status === 'active' || p.status === 'pending'));
  let pendingTasks = $derived($tasks.filter(t => t.status === 'active' || t.status === 'pending'));

  function getArea(id) { return $lifeAreas.find(a => a.id === id); }
  function getProject(id) { return $projects.find(p => p.id === id); }
  function getTask(id) { return $tasks.find(a => a.id === id); }

  function getAreaColor(areaId) {
    const area = getArea(areaId);
    return area ? `var(--color-area-${area.color})` : 'var(--color-border)';
  }

  function getProjectPath(project) {
    const area = getArea(project.lifeAreaId);
    return area ? `${area.name} › ${project.name}` : project.name;
  }
  
  function getTaskPath(task) {
    const project = getProject(task.projectId);
    if (!project) return task.name;
    const area = getArea(project.lifeAreaId);
    return area ? `${area.name} › ${project.name} › ${task.name}` : `${project.name} › ${task.name}`;
  }

  function getActionPath(action) {
    const task = getTask(action.taskId);
    if (!task) return action.name;
    const proj = getProject(task.projectId);
    if (!proj) return `${task.name} › ${action.name}`;
    const area = getArea(proj.lifeAreaId);
    return area 
      ? `${area.name} › ${proj.name} › ${task.name} › ${action.name}`
      : `${proj.name} › ${task.name} › ${action.name}`;
  }

  function isOverdue(dueDate, status) {
    if (!dueDate || status === 'done') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  let pendingGroupsArr = $derived.by(() => {
    const groups = {};
    for (const p of pendingProjects) {
      const aId = p.lifeAreaId;
      if (!groups[aId]) groups[aId] = { area: getArea(aId), items: [] };
      groups[aId].items.push({ type: 'project', data: p });
    }
    for (const t of pendingTasks) {
      const p = getProject(t.projectId);
      if (p) {
        const aId = p.lifeAreaId;
        if (!groups[aId]) groups[aId] = { area: getArea(aId), items: [] };
        groups[aId].items.push({ type: 'task', data: t });
      }
    }
    return Object.values(groups).sort((a, b) => {
      if (!a.area || !b.area) return 0;
      return a.area.name.localeCompare(b.area.name);
    });
  });
</script>

<svelte:head>
  <title>Focus — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <h1 class="page-title">Focus</h1>
    <p class="page-subtitle">Your daily command centre</p>
  </header>

  <TogglePill {options} bind:value={mode} onchange={(v) => mode = v} />

  {#if loading}
    <div class="focus-content">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if mode === 'Priority'}
    <div class="focus-content">
      {#if flaggedProjects.length > 0}
        <section class="group-section">
          <h2>🚀 Projects</h2>
          <div class="items-list">
            {#each flaggedProjects as p (p.id)}
              <FocusItemCard 
                title={p.name}
                pathContext={getProjectPath(p)}
                areaColor={getAreaColor(p.lifeAreaId)}
                priority={p.priority}
                dueDate={p.dueDate}
                onnavigate={() => goto(`/life-areas/${p.lifeAreaId}/${p.id}`)}
              />
            {/each}
          </div>
        </section>
      {/if}

      {#if flaggedTasks.length > 0}
        <section class="group-section">
          <h2>✅ Tasks</h2>
          <div class="items-list">
            {#each flaggedTasks as t (t.id)}
              {@const proj = getProject(t.projectId)}
              <FocusItemCard 
                title={t.name}
                pathContext={getTaskPath(t)}
                areaColor={proj ? getAreaColor(proj.lifeAreaId) : ''}
                priority={t.priority}
                dueDate={t.dueDate}
                onnavigate={() => proj ? goto(`/life-areas/${proj.lifeAreaId}/${t.projectId}/${t.id}`) : null}
              />
            {/each}
          </div>
        </section>
      {/if}

      {#if flaggedActions.length > 0}
        <section class="group-section">
          <h2>⚡ Actions</h2>
          <div class="items-list">
            {#each flaggedActions as a (a.id)}
              {@const task = getTask(a.taskId)}
              {@const proj = task ? getProject(task.projectId) : null}
              <FocusItemCard 
                title={a.name}
                pathContext={getActionPath(a)}
                areaColor={proj ? getAreaColor(proj.lifeAreaId) : ''}
                onnavigate={() => proj && task ? goto(`/life-areas/${proj.lifeAreaId}/${task.projectId}/${a.taskId}`) : null}
              />
            {/each}
          </div>
        </section>
      {/if}

      {#if flaggedProjects.length === 0 && flaggedTasks.length === 0 && flaggedActions.length === 0}
        <div class="empty-state">
          <h2>No priority items</h2>
          <p>Flag items across your system to surface them here.</p>
        </div>
      {/if}
    </div>
  {:else}
    <div class="focus-content">
      {#each pendingGroupsArr as group (group.area?.id || 'unknown')}
        <section class="group-section">
          <h2>{group.area ? group.area.name : 'Unknown Area'}</h2>
          <div class="items-list">
            {#each group.items as item (item.type + item.data.id)}
              {#if item.type === 'project'}
                <FocusItemCard 
                  title={item.data.name}
                  pathContext={getProjectPath(item.data)}
                  areaColor={getAreaColor(item.data.lifeAreaId)}
                  dueDate={item.data.dueDate}
                  isOverdue={isOverdue(item.data.dueDate, item.data.status)}
                  onnavigate={() => goto(`/life-areas/${item.data.lifeAreaId}/${item.data.id}`)}
                />
              {:else}
                {@const proj = getProject(item.data.projectId)}
                <FocusItemCard 
                  title={item.data.name}
                  pathContext={getTaskPath(item.data)}
                  areaColor={proj ? getAreaColor(proj.lifeAreaId) : ''}
                  dueDate={item.data.dueDate}
                  isOverdue={isOverdue(item.data.dueDate, item.data.status)}
                  onnavigate={() => proj ? goto(`/life-areas/${proj.lifeAreaId}/${item.data.projectId}/${item.data.id}`) : null}
                />
              {/if}
            {/each}
          </div>
        </section>
      {/each}

      {#if pendingGroupsArr.length === 0}
        <div class="empty-state">
          <h2>All caught up</h2>
          <p>No active or pending items found.</p>
        </div>
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
  .page-header { margin-bottom: 20px; padding-top: 12px; }
  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }
  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; border-bottom: 1px solid var(--color-border); padding-bottom: 16px;}
  
  .focus-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .group-section h2 {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-state { 
    text-align: center; 
    padding: 60px 20px; 
    color: var(--color-text-muted); 
  }
  .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 8px;}
  .empty-state p { font-size: 14px; line-height: 1.6; }
</style>
