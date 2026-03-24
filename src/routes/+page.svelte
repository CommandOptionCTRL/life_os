<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => goto('/life-areas', { replaceState: true }));
</script>
