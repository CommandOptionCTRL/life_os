<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings.js';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ConfirmSheet from '$lib/components/ConfirmSheet.svelte';

  onMount(() => settings.init());
  onDestroy(() => settings.destroy());

  let fileInput;
  let confirmOpen = $state(false);
  let pendingImportFile = $state(null);

  function handleExport() {
    settings.exportData();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    pendingImportFile = file;
    confirmOpen = true;
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!pendingImportFile) return;
    confirmOpen = false;
    try {
      await settings.importData(pendingImportFile);
      alert('Import successful! The app will now reload.');
      window.location.reload();
    } catch (err) {
      alert('Failed to import data: ' + err.message);
    }
    pendingImportFile = null;
  }

  function handleCancelImport() {
    confirmOpen = false;
    pendingImportFile = null;
  }
</script>

<svelte:head>
  <title>Settings — LifeOS</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <h1 class="page-title">Settings</h1>
    <p class="page-subtitle">Configure your LifeOS instance</p>
  </header>

  <section class="settings-section">
    <h2 class="section-title">Appearance</h2>
    <div class="settings-card">
      <ThemeToggle />
    </div>
  </section>

  <section class="settings-section">
    <h2 class="section-title">Data Management</h2>
    <div class="settings-card">
      <div class="settings-row">
        <div>
          <h3>Export Backup</h3>
          <p>Download your entire OS as a JSON file.</p>
        </div>
        <button class="action-btn" onclick={handleExport}>Export</button>
      </div>

      <div class="divider"></div>

      <div class="settings-row">
        <div>
          <h3>Import Backup</h3>
          <p>Restore your OS from a previous JSON backup.</p>
        </div>
        <button class="action-btn danger" onclick={() => fileInput.click()}>Import</button>
        <input 
          type="file" 
          accept=".json" 
          bind:this={fileInput} 
          onchange={handleImport} 
          style="display: none;" 
        />
      </div>
    </div>
  </section>

  <section class="settings-section version-info">
    <p>LifeOS v1.0.0 (Agentic Build)</p>
  </section>
</main>

<ConfirmSheet
  open={confirmOpen}
  message="Warning: This will overwrite all current LifeOS data. Continue?"
  confirmLabel="Import"
  onconfirm={handleConfirmImport}
  oncancel={handleCancelImport}
/>

<style>
  .page {
    padding: 24px 20px calc(var(--nav-height) + var(--safe-bottom) + 80px);
    max-width: 600px;
    margin: 0 auto;
  }

  .page-header { margin-bottom: 32px; padding-top: 12px; }
  .page-title { font-size: 30px; font-weight: 700; color: var(--color-text); }
  .page-subtitle { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; }

  .settings-section { margin-bottom: 32px; }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
    padding-left: 4px;
  }

  .settings-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 8px 20px;
  }

  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    gap: 16px;
  }

  .settings-row h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 4px;
  }

  .settings-row p {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .divider {
    height: 1px;
    background: var(--color-border);
    margin: 0 -20px;
  }

  .action-btn {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn.danger { color: #FC5C65; }
  .action-btn:hover { background: var(--color-border); }
  .action-btn.danger:hover { background: color-mix(in srgb, #FC5C65 15%, transparent); border-color: color-mix(in srgb, #FC5C65 30%, transparent); }

  .version-info {
    text-align: center;
    font-size: 13px;
    color: var(--color-text-muted);
    opacity: 0.6;
    margin-top: 40px;
  }
</style>
