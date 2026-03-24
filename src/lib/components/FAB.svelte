<script>
  let { onclick } = $props();
</script>

<button class="fab" onclick={onclick} aria-label="Add new">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
</button>

<style>
  .fab {
    position: fixed;
    bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
    right: 20px;
    width: var(--fab-size);
    height: var(--fab-size);
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px rgba(108, 99, 255, 0.45);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    z-index: 99;
  }

  .fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 32px rgba(108, 99, 255, 0.6);
  }

  .fab:active {
    transform: scale(0.93);
  }

  .fab svg {
    width: 24px;
    height: 24px;
  }
</style>
