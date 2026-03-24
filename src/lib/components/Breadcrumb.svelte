<script>
  let { crumbs = [] } = $props();
</script>

<div class="breadcrumb-container">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    {#each crumbs as crumb, i}
      {#if i < crumbs.length - 1}
        <a href={crumb.href} class="crumb-link">{crumb.label}</a>
        <span class="separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      {:else}
        <span class="crumb-current">{crumb.label}</span>
      {/if}
    {/each}
  </nav>
</div>

<style>
  .breadcrumb-container {
    position: sticky;
    bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
    background: color-mix(in srgb, var(--color-surface) 90%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--color-border);
    border-radius: 99px;
    padding: 10px 16px;
    z-index: 50;
    margin: 0 auto;
    margin-bottom: -16px; /* offset visual flow */
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    max-width: fit-content;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .breadcrumb-container::-webkit-scrollbar { display: none; }
  .breadcrumb-container { -ms-overflow-style: none; scrollbar-width: none; }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .crumb-link {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    display: inline-block;
    vertical-align: bottom;
  }

  .crumb-link:hover { color: var(--color-primary); }

  .separator {
    color: var(--color-border);
    display: flex;
    align-items: center;
  }
  .separator svg { width: 14px; height: 14px; opacity: 0.6; }

  .crumb-current {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
    display: inline-block;
    vertical-align: bottom;
  }
</style>
