<script>
  import DesignSystemCode from "./DesignSystemCode.svelte";
  export let title;
  export let code;
</script>

<div class="design-system-panel">
  {#if title}<h2 class="design-system-header">{title}</h2>{/if}
  <div class="design-system-component-panel">
    <slot />
  </div>
  {#if code}<DesignSystemCode {code} />{/if}
</div>

<style>
  .design-system-panel {
    background-color: #f8f8f8;
    border-radius: 0.5rem;
    padding: 0.5rem 0.5rem;
    margin-bottom: 2rem;
  }

  .design-system-header {
    margin-top: 0;
    margin-block-start: 0;
  }
  .design-system-component-panel {
    background-color: #fff;
    border-radius: 0.2rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
</style>
