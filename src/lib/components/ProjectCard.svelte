<script>
  import { isOverdue } from '$lib/stores/projects.js';

  let { project, lifeArea = null, onedit, ondelete, onnavigate } = $props();

  const priorityConfig = {
    high:   { label: 'High',   color: '#FC5C65', icon: '🔴' },
    medium: { label: 'Medium', color: '#F7B731', icon: '🟡' },
    low:    { label: 'Low',    color: '#26de81', icon: '🟢' }
  };

  const statusConfig = {
    active:  { label: 'Active',  color: 'var(--color-primary)' },
    pending: { label: 'Pending', color: 'var(--color-text-muted)' },
    done:    { label: 'Done',    color: '#26de81' }
  };

  const priority = priorityConfig[project.priority] ?? priorityConfig.medium;
  const status = statusConfig[project.status] ?? statusConfig.active;
  const overdue = isOverdue(project);

  function formatDate(isoDate) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(isoDate + 'T12:00:00'));
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="card" class:overdue style="--project-color: {project.color ?? 'var(--color-primary)'};" onclick={() => onnavigate?.(project)}>
  <div class="card-header">
    <div class="card-meta">
      {#if lifeArea}
        <span class="area-badge" style="--area-color: {lifeArea.color ?? '#6C63FF'}">
          {lifeArea.name}
        </span>
      {/if}
      <span class="status-badge" style="color: {status.color}">{status.label}</span>
    </div>
    <div class="card-actions">
      <button class="icon-btn" onclick={(e) => { e.stopPropagation(); onedit(project); }} aria-label="Edit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="icon-btn danger" onclick={(e) => { e.stopPropagation(); ondelete(project.id); }} aria-label="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>

  <h3 class="card-name">{project.name}</h3>

  <div class="card-footer">
    <span class="priority-chip" style="--priority-color: {priority.color}">
      {priority.icon} {priority.label}
    </span>
    {#if project.dueDate}
      <span class="due-date" class:overdue-date={overdue}>
        {#if overdue}⚠️{:else}📅{/if}
        {formatDate(project.dueDate)}
      </span>
    {/if}
    {#if overdue}
      <span class="overdue-badge">Overdue</span>
    {/if}
  </div>
</div>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--project-color);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .card.overdue {
    border-color: color-mix(in srgb, #FC5C65 40%, transparent);
    background: color-mix(in srgb, #FC5C65 4%, var(--color-surface));
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .area-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    background: color-mix(in srgb, var(--area-color) 15%, transparent);
    color: var(--area-color);
    border: 1px solid color-mix(in srgb, var(--area-color) 30%, transparent);
  }

  .status-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  .icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }

  .icon-btn svg { width: 15px; height: 15px; }
  .icon-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
  .icon-btn.danger:hover { color: #FC5C65; }

  .card-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .priority-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: var(--priority-color);
    background: color-mix(in srgb, var(--priority-color) 12%, transparent);
    padding: 3px 8px;
    border-radius: 99px;
    border: 1px solid color-mix(in srgb, var(--priority-color) 25%, transparent);
  }

  .due-date {
    font-size: 12px;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .due-date.overdue-date {
    color: #FC5C65;
  }

  .overdue-badge {
    font-size: 11px;
    font-weight: 700;
    color: #FC5C65;
    background: color-mix(in srgb, #FC5C65 15%, transparent);
    padding: 2px 8px;
    border-radius: 99px;
    border: 1px solid color-mix(in srgb, #FC5C65 30%, transparent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
