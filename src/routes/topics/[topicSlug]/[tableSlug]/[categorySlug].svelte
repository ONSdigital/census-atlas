<script>
  import BasePage from "../../../../ui/BasePage.svelte";
  import ExploreSomethingElseNav from "../../../../ui/ExploreSomethingElseNav/ExploreSomethingElseNav.svelte";
  import Return from "../../../../ui/Return.svelte";
  import ChangeLocation from "../../../../ui/ChangeLocation/ChangeLocation.svelte";
  import Header from "../../../../ui/Header.svelte";
  import MapWrapper from "../../../../ui/map/MapWrapper.svelte";
  import TopicExplorer from "../../../../ui/TopicExplorer.svelte";
  import Feedback from "../../../../ui/Feedback.svelte";
  import { appIsInitialised } from "../../../../model/appstate";
  import { getLadName, updateSelectedGeography, selectedGeography } from "../../../../model/geography/geography";
  import { censusTableStructureIsLoaded, getCategoryBySlug } from "../../../../model/censusdata/censusdata";
  import { pageUrl } from "../../../../stores";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { returnCorrectArticle } from "../../../../utils";
  let { topicSlug, tableSlug, categorySlug } = $page.params;
  let locationId = $page.query.get("location");
  let locationName, header;
  let showChangeLocation = false;
  $: category = getCategoryBySlug(tableSlug, categorySlug);

  $: {
    locationId = $page.query.get("location");
    updateSelectedGeography(locationId);
    locationName = getLadName(locationId) ? getLadName(locationId) : "England and Wales";
  }

  $: {
    if ($selectedGeography.lad) {
      if ($selectedGeography.lad != locationId) {
        $page.query.set("location", $selectedGeography.lad);
        goto(`?${$page.query.toString()}`);
        locationId = $page.query.get("location");
        locationName = getLadName(locationId);
      }
    }
  }

  $: appIsInitialised, $appIsInitialised && initialisePage();
  function initialisePage() {
    if (locationId) {
      locationName = getLadName(locationId);
      updateSelectedGeography(locationId);
    }
  }
  let topicName = topicSlug.replace("-", " ");
</script>

<svelte:window />
<svelte:head>
  <title>2021 Census Data Atlas Categories</title>
</svelte:head>

<BasePage mobileMap={false} withoutBackground>
  <span slot="return">
    {#if $pageUrl}
      <Return href={$pageUrl} inverted />
    {/if}
  </span>
  <span slot="header" bind:this={header}>
    {#if showChangeLocation}
      <ChangeLocation
        {locationId}
        changeAreaBaseUrl="/topics/{topicSlug}/{tableSlug}/{categorySlug}"
        onClose={() => (showChangeLocation = !showChangeLocation)}
      />
    {:else}
      <Header
        serviceTitle={`Select ${returnCorrectArticle(topicName)} ${topicName} category to explore in ${
          locationId ? locationName : "England and Wales"
        }`}
      />
    {/if}
  </span>

  <span slot="map">
    <MapWrapper {category} showDataLayer={true} />
  </span>
  <p>
    Change to a
    <a href="/topics{locationId ? `?location=${locationId}` : ''}">new topic</a>
  </p>
  <hr />
  {#if $appIsInitialised && $censusTableStructureIsLoaded}
    <TopicExplorer {locationId} selectedTopic={topicSlug} visitedTable={tableSlug} />
  {/if}

  <div class="ons-u-mb-l">
    <ExploreSomethingElseNav
      firstLink={{ text: "New topic", url: locationId ? `/topics?location=${locationId}` : "/topics" }}
      secondLink={{ text: locationId ? "New location" : "Choose location", url: "" }}
      on:click={() => ((showChangeLocation = true), header.scrollIntoView())}
    />
  </div>

  <span slot="footer">
    <footer class="ons-footer">
      <div class="ons-footer__body ons-page__footer" data-analytics="footer">
        <div class="ons-container">
          <Feedback />
        </div>
      </div>
    </footer>
  </span>
</BasePage>

<style lang="scss">
  @import "./../../node_modules/@ons/design-system/scss/vars/_index.scss";
</style>
