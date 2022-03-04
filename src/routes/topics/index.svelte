<script>
  import BasePage from "../../ui/BasePage.svelte";
  import MapWrapper from "../../ui/map/MapWrapper.svelte";
  import config from "../../config";
  import Header from "../../ui/Header.svelte";
  import TopicList from "../../ui/TopicList.svelte";
</script>

<svelte:head>
  <title>2021 Census Data Atlas</title>
  <meta name="description" content="Explore 2021 census data for England and Wales at a neighbourhood level." />
</svelte:head>

<BasePage mobileMap={false}>
  <span slot="header">
    <Header
      serviceTitle="Explore Census"
      description="Use our interactive map to find out what people's lives are like across England and Wales."
    />
  </span>

  <TopicList />

  <span slot="map">
    <MapWrapper showDataLayer={false} bounds={config.ux.map.englandAndWalesBounds} {redirectOnSelect} />
  </span>
</BasePage>

<style lang="scss">
  @import "./../../node_modules/@ons/design-system/scss/vars/_index.scss";
  @media only screen and (max-width: map-get($grid-bp, s)) {
  }
  .component-margin--2 {
    margin-bottom: 2rem;
  }
</style>
