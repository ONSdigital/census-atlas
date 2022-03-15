<script>
  import ONSCard from "./ons/ONSCard.svelte";
  import { censusMetadata } from "../model/metadata/metadata";
</script>

{#each $censusMetadata as topic, i}
  <ONSCard title={topic.name} href="topics/{topic.slug}" id="topic-{i}">{topic.desc}</ONSCard>
  {#if i < $censusMetadata.length - 1}
    <hr class="component-margin--2" />
  {/if}
{/each}

<style lang="scss">
  .component-margin--2 {
    margin: 0 0 1rem;
  }
</style>
