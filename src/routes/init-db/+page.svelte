<script>
    import { onMount } from 'svelte';
    import { initializeDatabase } from '../../firebase/init';

    let status = $state('Ready to seed.');
    let error = $state(null);
    let reset = $state(false);
    let loading = $state(false);

    async function runInit() {
        loading = true;
        status = 'Processing...';
        try {
            await initializeDatabase(reset);
            status = 'Database initialized successfully!';
        } catch (e) {
            console.error(e);
            status = 'Initialization failed.';
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="p-8 max-w-lg mx-auto mt-20 bg-surface rounded-xl border border-border shadow-xl">
    <h1 class="text-2xl font-bold mb-4">Database Initialization</h1>
    
    <div class="mb-6 flex items-center gap-3 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg">
        <input type="checkbox" id="reset" bind:checked={reset} class="w-4 h-4" />
        <label for="reset" class="text-sm font-medium text-yellow-500">
            Reset collections before seeding? (Deletes all existing data)
        </label>
    </div>

    <p class="text-lg mb-6" class:text-green-500={status.includes('success')} class:text-red-500={status.includes('failed')}>
        {status}
    </p>

    {#if error}
        <pre class="mt-4 p-4 bg-red-900/20 text-red-400 rounded text-sm overflow-auto max-h-60 mb-6">
            {error}
        </pre>
    {/if}

    <div class="flex gap-4">
        <button 
            onclick={runInit} 
            disabled={loading}
            class="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50"
        >
            {loading ? 'Running...' : 'Run Initialization'}
        </button>
        
        <a href="/life-areas" class="px-6 py-2 bg-surface-2 text-text-muted rounded-lg font-medium border border-border">
            Go to Life Areas
        </a>
    </div>
</div>
