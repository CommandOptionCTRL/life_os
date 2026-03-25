<script>
  import { tasks, isTaskOverdue } from '$lib/stores/tasks.js';
  import MultiDayCheckoff from '$lib/components/MultiDayCheckoff.svelte';

  let { task, onedit, ondelete, ontoggleflag, onnavigate } = $props();

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

  const priority = priorityConfig[task.priority] ?? priorityConfig.medium;
  const status = statusConfig[task.status] ?? statusConfig.active;
  const overdue = isTaskOverdue(task);

  function formatDate(isoDate) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(isoDate + 'T12:00:00'));
  }

  let translateX = $state(0);
  let isSwiping = $state(false);
  let startX = 0;
  let ignoreClick = false;

  function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isSwiping = true;
  }

  function handleTouchMove(e) {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    
    // Allow closing a swiped card smoothly or opening it
    if (translateX < 0 && diff > 0) {
      translateX = Math.min(-80 + diff, 0);
    } else if (translateX === 0 && diff < 0) {
      translateX = Math.max(diff, -80);
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;

    const diff = e.changedTouches[0].clientX - startX;
    
    // Tap detection
    if (Math.abs(diff) < 5) {
      if (translateX < 0) {
        translateX = 0;
        ignoreClick = true;
        setTimeout(() => ignoreClick = false, 300);
      }
      return;
    }

    if (translateX < -40) {
      translateX = -80;
      ignoreClick = true; // prevent the resulting click
      setTimeout(() => ignoreClick = false, 300);
    } else {
      translateX = 0;
    }
  }

  function handleClick(e) {
    if (ignoreClick) return;
    onnavigate(task);
  }
</script>

<div class="swipe-container" class:overdue>
  <div class="delete-action">
    <button class="delete-btn" onclick={(e) => { e.stopPropagation(); ondelete(task.id); translateX = 0; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div 
    class="card" 
    style="transform: translateX({translateX}px); transition: {isSwiping ? 'none' : 'transform 0.2s ease'};"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onclick={handleClick}
  >
    <div class="card-header">
      <div class="card-meta">
        <span class="status-badge" style="color: {status.color}">{status.label}</span>
      </div>
      <div class="card-actions">
        <button class="icon-btn" class:flagged={task.flagged} onclick={(e) => { e.stopPropagation(); ontoggleflag(task); }} aria-label="Flag">
          <svg viewBox="0 0 24 24" fill={task.flagged ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
        <button class="icon-btn" onclick={(e) => { e.stopPropagation(); onedit(task); }} aria-label="Edit">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="icon-btn delete-icon" onclick={(e) => { e.stopPropagation(); ondelete(task.id); }} aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <h3 class="card-name">{task.name}</h3>
    {#if task.description}
      <p class="card-desc">{task.description}</p>
    {/if}

    {#if task.schedule?.type === 'weekly' && task.schedule?.days?.length > 0}
      <MultiDayCheckoff 
        selectedDays={task.schedule.days} 
        completions={task.completions}
        ontoggle={(date) => tasks.toggleTaskCompletion(task.id, date)}
      />
    {/if}

    {#if task.preparationItems && task.preparationItems.length > 0}
      {@const completedCount = task.preparationItems.filter(i => i.completed).length}
      {@const totalCount = task.preparationItems.length}
      {@const isDone = completedCount === totalCount}
      {@const canComplete = isDone}
      
      <div class="prep-section" class:all-done={isDone}>
        <div class="prep-header">
          <span class="prep-title">Preparation</span>
          <span class="prep-count">{completedCount}/{totalCount}</span>
        </div>
        <div class="prep-progress">
          <div class="prep-bar" style="width: {(completedCount/totalCount)*100}%"></div>
        </div>
        {#if !isDone}
          <div class="prep-list">
            {#each task.preparationItems as item, i (item.id || i)}
              <button class="prep-check" class:checked={item.completed} onclick={(e) => { e.stopPropagation(); tasks.togglePrepItem(task.id, item.id); }}>
                <div class="checkbox"></div>
                <span>{item.text}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if !task.recurring}
      {@const prepIncomplete = task.preparationItems?.length > 0 && task.preparationItems.some(i => !i.completed)}
      <div class="task-completion">
        <button 
          class="complete-btn" 
          class:checked={task.status === 'done'} 
          class:blocked={prepIncomplete}
          onclick={(e) => { 
            e.stopPropagation(); 
            if (!prepIncomplete) {
              tasks.updateTask(task.id, { status: task.status === 'done' ? 'active' : 'done' });
            }
          }}
        >
          <div class="checkbox">
            {#if task.status === 'done'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {/if}
          </div>
          <span>{task.status === 'done' ? 'Completed' : 'Complete Task'}</span>
          {#if prepIncomplete}
            <span class="lock-icon">🔒</span>
          {/if}
        </button>
      </div>
    {/if}

    <div class="card-footer">
      <span class="priority-chip" style="--priority-color: {priority.color}">
        {priority.icon} {priority.label}
      </span>
      {#if task.dueDate}
        <span class="due-date" class:overdue-date={overdue}>
          {#if overdue}⚠️{:else}📅{/if}
          {formatDate(task.dueDate)}
          {#if task.dueTime}
            <span class="due-time">at {task.dueTime}</span>
          {/if}
        </span>
      {/if}
      {#if task.recurring && task.schedule}
        <span class="recurrence-label">
          🔄 {task.schedule.type}
          {#if task.schedule.frequency > 1}(every {task.schedule.frequency}){/if}
        </span>
      {/if}
      {#if overdue}
        <span class="overdue-badge">Overdue</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .swipe-container {
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    background: #FC5C65;
    border: 1px solid var(--color-border);
  }

  .swipe-container.overdue {
    border-color: color-mix(in srgb, #FC5C65 40%, transparent);
  }

  .delete-action {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn svg {
    width: 24px;
    height: 24px;
  }

  .card {
    background: var(--color-surface);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    position: relative;
    z-index: 1;
    min-height: 100%;
  }

  .card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .status-badge { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .card-actions { display: flex; gap: 4px; margin-left: auto; }

  .icon-btn {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: transparent; color: var(--color-text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s;
    padding: 0;
  }
  .icon-btn svg { width: 16px; height: 16px; }
  .icon-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
  .icon-btn.flagged { color: #F7B731; }
  .icon-btn.delete-icon:hover { color: #FC5C65; }

  .card-desc { font-size: 13px; color: var(--color-text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }

  .prep-section {
    background: var(--color-surface-2); border-radius: 12px; padding: 12px;
    display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--color-border);
  }
  .prep-section.all-done { opacity: 0.6; border-style: dashed; }
  .prep-header { display: flex; justify-content: space-between; align-items: center; }
  .prep-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em; }
  .prep-count { font-size: 11px; font-weight: 700; color: var(--color-primary); }
  
  .prep-progress { height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
  .prep-bar { height: 100%; background: var(--color-primary); transition: width 0.3s ease; }
  
  .prep-list { display: flex; flex-direction: column; gap: 4px; }
  .prep-check {
    display: flex; align-items: center; gap: 8px; background: transparent; border: none;
    padding: 4px 0; cursor: pointer; text-align: left; transition: color 0.15s;
  }
  .prep-check span { font-size: 13px; color: var(--color-text); }
  .prep-check.checked span { color: var(--color-text-muted); text-decoration: line-through; }
  .prep-check .checkbox {
    width: 16px; height: 16px; border: 2px solid var(--color-border); border-radius: 4px;
    transition: all 0.15s; flex-shrink: 0; position: relative;
  }
  .prep-check.checked .checkbox { background: var(--color-primary); border-color: var(--color-primary); }
  .prep-check.checked .checkbox::after {
    content: ''; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px;
    border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
  }

  .task-completion { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--color-border); }
  .complete-btn {
    width: 100%; display: flex; align-items: center; gap: 10px; background: var(--color-surface-2);
    border: 1px solid var(--color-border); padding: 12px; border-radius: 12px; cursor: pointer;
    transition: all 0.2s;
  }
  .complete-btn span { font-size: 14px; font-weight: 700; color: var(--color-text); }
  .complete-btn .checkbox { width: 22px; height: 22px; border: 2px solid var(--color-border); border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .complete-btn.checked { background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface)); border-color: var(--color-primary); }
  .complete-btn.checked .checkbox { background: var(--color-primary); border-color: var(--color-primary); color: white; }
  .complete-btn.checked .checkbox svg { width: 14px; height: 14px; }
  .complete-btn.blocked { opacity: 0.5; cursor: not-allowed; }
  .complete-btn.blocked .checkbox { background: var(--color-surface-2); }
  .lock-icon { font-size: 12px; margin-left: auto; }

  .card-footer { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .priority-chip {
    display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
    color: var(--priority-color); background: color-mix(in srgb, var(--priority-color) 12%, transparent);
    padding: 3px 8px; border-radius: 99px; border: 1px solid color-mix(in srgb, var(--priority-color) 25%, transparent);
  }
  .due-date { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
  .due-date.overdue-date { color: #FC5C65; }
  .due-time { opacity: 0.8; margin-left: 2px; }
  .recurrence-label { font-size: 11px; color: var(--color-primary); font-weight: 600; text-transform: capitalize; background: var(--color-primary-soft); padding: 2px 6px; border-radius: 4px; }
  .overdue-badge {
    font-size: 11px; font-weight: 700; color: #FC5C65; background: color-mix(in srgb, #FC5C65 15%, transparent);
    padding: 2px 8px; border-radius: 99px; border: 1px solid color-mix(in srgb, #FC5C65 30%, transparent); text-transform: uppercase; letter-spacing: 0.05em;
  }
</style>
