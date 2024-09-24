<script>
  import TraceLogo from "../../Assets/TraceLogo.svelte";

  export let source, link;
  export let notes = null;
</script>

<div class="viz-footer">
  {#if notes}<div class="notes">{@html notes}</div>{/if}
  <TraceLogo />
  <div class="caption">
    <span class="credit">Chip Brownlee / </span>Source:
    <a href={link} target="_blank">{source}</a>
  </div>
</div>

<style lang="scss">
  .viz-footer {
    display: flex;
    justify-content: space-between;
    container-type: inline-size;
    flex-wrap: wrap;
    gap: 0.5rem;

    .caption {
      font-family: "Spezia Mono", "monospace";
      font-size: clamp(0.45rem, 1.25cqi, 1rem);
      margin: auto 0 0 0;
      text-align: right;
      line-height: normal;
      @container (width < 350px) {
        .credit {
          display: none;
        }
      }
    }
    .notes {
      margin: 0.5em 0;
      width: 100%;
      font-size: clamp(0.7rem, 1.25cqi, 1rem);
    }
  }
</style>
