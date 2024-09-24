<script>
  export let tooltipRef, arrowRef;
  export let tooltipData = [];
  export let victims = false;

  $: console.log(tooltipData);
</script>

{#if tooltipData && tooltipData.length > 0}
  {#if !victims}
    <div class="tooltip" bind:this={tooltipRef}>
      <div class="tooltip-body">
        <div class="tooltip-item">
          {tooltipData[0].year}:
          <div class="tooltip-value" style="color: var(--blue100)">
            {tooltipData[0].percent.toFixed(1)}%
          </div>
        </div>
      </div>

      <div class="tooltip-arrow" bind:this={arrowRef}></div>
    </div>
  {/if}
  {#if victims}
    <div class="tooltip" bind:this={tooltipRef}>
      <div class="tooltip-body">
        <div class="tooltip-item">
          <!-- {tooltipData[0].year}: -->
          <div class="tooltip-value" style="color: var(--blue100)">
            {tooltipData[0].fatal.toLocaleString()} fatal
          </div>
          <div>/</div>
          <div class="tooltip-value" style="color: var(--blue50)">
            {(tooltipData[0].total - tooltipData[0].fatal).toLocaleString()} nonfatal
          </div>
        </div>
      </div>

      <div class="tooltip-arrow" bind:this={arrowRef}></div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .tooltip {
    visibility: hidden;
    width: max-content;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    font-size: 12px;
    border: 1px solid var(--charcoal10);
    padding-inline: clamp(5px, 1cqi, 15px);
    padding-block: clamp(3.5px, 0.75cqi, 7.5px);
    border-radius: 0.5cqi;
    background: white;

    .tooltip-body {
      display: flex;
      flex-direction: column;

      .tooltip-item {
        display: flex;
        justify-content: space-between;
        gap: 0.25em;
      }

      .tooltip-value {
        font-weight: bold;
      }
    }
    .tooltip-arrow {
      position: absolute;
      border-bottom: 1px solid var(--charcoal10);
      border-right: 1px solid var(--charcoal10);
      background-color: white;
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
      z-index: 50;
    }
  }

  @container (width > 600px) {
    .tooltip {
      font-size: 14px;
    }
  }
</style>
