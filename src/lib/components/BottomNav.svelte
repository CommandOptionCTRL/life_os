<script>
  import { page } from '$app/state';

  const tabs = [
    { label: 'Life Areas', href: '/life-areas', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Brain Dump', href: '/brain-dump', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  let currentPath = $derived(page.url.pathname);
</script>

<nav class="bottom-nav">
  {#each tabs as tab}
    <a href={tab.href} class="nav-tab" class:active={currentPath.startsWith(tab.href)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d={tab.icon} />
      </svg>
      <span>{tab.label}</span>
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(var(--nav-height) + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 100;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 20px;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  .nav-tab svg {
    width: 22px;
    height: 22px;
    transition: transform 0.2s ease;
  }

  .nav-tab:active svg {
    transform: scale(0.88);
  }

  .nav-tab.active {
    color: var(--color-primary);
  }
</style>
