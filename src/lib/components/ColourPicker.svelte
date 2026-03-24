<script>
  let { value = $bindable(), onchange } = $props();

  const presets = [
    'var(--color-area-1)',
    'var(--color-area-2)',
    'var(--color-area-3)',
    'var(--color-area-4)',
    'var(--color-area-5)',
    'var(--color-area-6)',
    'var(--color-area-7)',
    'var(--color-area-8)'
  ];

  function selectColor(color) {
    value = color;
    onchange?.(color);
  }
</script>

<div class="color-picker" role="radiogroup" aria-label="Theme Color Picker">
  {#each presets as color}
    <button
      type="button"
      class="swatch"
      class:selected={value === color}
      style="background: {color};"
      onclick={() => selectColor(color)}
      aria-label="Select color"
      role="radio"
      aria-checked={value === color}
    ></button>
  {/each}
</div>

<style>
  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .swatch {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    padding: 0;
    flex-shrink: 0;
  }

  .swatch.selected {
    border-color: #fff;
    transform: scale(1.1);
    box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-border);
  }

  .swatch:active {
    transform: scale(0.95);
  }
</style>
