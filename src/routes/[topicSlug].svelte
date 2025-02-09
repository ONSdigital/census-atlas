<script context="module">
  export function load({ page }) {
    return {
      props: {
        topicSlug: page.params.topicSlug,
      },
    };
  }
</script>

<script>
  import BasePage from "../ui/BasePage.svelte";

  import MapWrapper from "../ui/map/MapWrapper.svelte";

  import Topic from "../ui/Topic.svelte";
  import ONSShare from "../ui/ons/ONSShare.svelte";
  import ONSShareItem from "../ui/ons/partials/ONSShareItem.svelte";
  import ONSFacebookIcon from "../ui/ons/svg/ONSFacebookIcon.svelte";
  import ONSTwitterIcon from "../ui/ons/svg/ONSTwitterIcon.svelte";
  import ONSLinkedinIcon from "../ui/ons/svg/ONSLinkedinIcon.svelte";
  import ONSEmailIcon from "../ui/ons/svg/ONSEmailIcon.svelte";
  import ExploreSomethingElseNav from "../ui/ExploreSomethingElseNav/ExploreSomethingElseNav.svelte";
  import Feedback from "../ui/Feedback.svelte";
  import Header from "../ui/Header.svelte";
  import ChangeLocation from "../ui/ChangeLocation/ChangeLocation.svelte";
  import { topicSuggestions } from "../config";
  import slugify from "slugify";
  import { page } from "$app/stores";
  import { getLadName, updateSelectedGeography, selectedGeography } from "../model/geography/geography";
  import { goto } from "$app/navigation";

  export let topicSlug;
  let pageTopic = {};
  let showChangeLocation = false;
  let locationName, locationId, header;

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

  topicSuggestions.forEach((topic) => {
    if (slugify(topic.topicName).toLowerCase() == topicSlug.toLowerCase()) {
      pageTopic = topic;
    }
  });
</script>

<svelte:head>
  <title>2021 Census Data Atlas Topic | {pageTopic.topicName}</title>
</svelte:head>

<BasePage>
  <span slot="header" bind:this={header}>
    {#if showChangeLocation}
      <ChangeLocation
        {locationId}
        changeAreaBaseUrl="/{topicSlug}"
        onClose={() => (showChangeLocation = !showChangeLocation)}
      />
    {:else}
      <Header serviceTitle={pageTopic.topicName} description={`In ${locationName}`} />
    {/if}
  </span>

  <span slot="map">
    <MapWrapper showDataLayer={false} />
  </span>

  <span slot="footer">
    <footer class="ons-footer">
      <div class="ons-footer__body ons-page__footer" data-analytics="footer">
        <div class="ons-container" />
        <Feedback />
      </div>
    </footer>
  </span>

  <Topic topicList={pageTopic.suggestions} cardTitle="{pageTopic.topicName} - Census 2021"
    ><p>
      The 2021 Census tells us a lot about the {pageTopic.topicName} of people living in England and Wales live and work.
    </p>
    <p>
      <a href="/categories/{topicSlug}"> Choose a category from the full list</a>
      or explore one of these suggestions.
    </p>
  </Topic>

  <div class="ons-u-mb-l">
    <ONSShare title="Share this page" pageURL={location.href} pageTitle={document.title} multiRow>
      <ONSShareItem facebook shareText="Facebook"><ONSFacebookIcon /></ONSShareItem>
      <ONSShareItem twitter shareText="Twitter"><ONSTwitterIcon /></ONSShareItem>
      <ONSShareItem linkedin shareText="Linkedin"><ONSLinkedinIcon /></ONSShareItem>
      <ONSShareItem email shareText="Email"><ONSEmailIcon /></ONSShareItem>
    </ONSShare>
  </div>

  <div class="ons-u-mb-l">
    <ExploreSomethingElseNav
      firstLink={{ text: "New topic", url: locationId ? `/topics?location=${locationId}` : "/topics" }}
      secondLink={{ text: locationId ? "New location" : "Choose location", url: "" }}
      on:click={() => ((showChangeLocation = true), header.scrollIntoView())}
    />
  </div>
</BasePage>

<style lang="scss">
  @import "../../node_modules/@ons/design-system/scss/vars/_index.scss";
  @media only screen and (max-width: map-get($grid-bp, s)) {
  }
</style>
