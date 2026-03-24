<script>
  import { settings } from '$lib/stores/settings.js';

  function toggleTheme() {
    const newTheme = $settings.theme === 'dark' ? 'light' : 'dark';
    settings.updateSettings({ theme: newTheme });
  }
</script>

<button class="toggle-btn" class:is-light={$settings.theme === 'light'} onclick={toggleTheme} aria-label="Toggle Theme">
  <div class="toggle-track">
    <div class="toggle-thumb">
      {#if $settings.theme === 'dark'}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon moon">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon sun">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {/if}
    </div>
  </div>
  <span class="label">{$settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
</button>

<style>
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 12px 0;
    width: 100%;
    margin: 0;
  }

  .toggle-track {
    width: 50px;
    height: 28px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: 99px;
    position: relative;
    transition: background-color 0.3s ease;
  }

  .is-light .toggle-track {
    background: #FFD166;
    border-color: #F7B731;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a1a1a;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .is-light .toggle-thumb {
    transform: translateX(22px);
  }

  .icon { width: 14px; height: 14px; }
  .icon.sun { color: #F5A623; }
  .icon.moon { color: #6C63FF; }

  .label {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }
</style>
