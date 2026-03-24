<div class="skeleton-card" aria-hidden="true">
  <div class="skeleton-line title"></div>
  <div class="skeleton-line detail"></div>
</div>

<style>
  .skeleton-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 90px;
    position: relative;
    overflow: hidden;
    margin-bottom: 2px;
  }

  .skeleton-card::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255, 0.04) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    animation: shimmer 1.5s infinite;
  }

  :global([data-theme="light"]) .skeleton-card::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0,0,0, 0.04) 50%,
      transparent 100%
    );
  }

  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }

  .skeleton-line {
    background: var(--color-surface-2);
    border-radius: 4px;
    height: 18px;
  }

  .skeleton-line.title {
    width: 60%;
  }

  .skeleton-line.detail {
    width: 40%;
    margin-top: 8px;
  }
</style>
