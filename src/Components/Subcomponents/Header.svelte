<script>
  export let hed, dek;
</script>

<div class="header">
  <h3 class="hed">
    {@html hed}
  </h3>
  <div class="dek">
    {@html dek}
  </div>
</div>

<style lang="scss">
  .header {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: 0.5em;

    .hed {
      font-weight: 900;
      margin: 0;
    }

    .dek {
      font-size: clamp(0.9rem, 2.3cqi, 1.25rem);
      margin: 0;
    }
  }
</style>
