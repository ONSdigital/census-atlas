<script>
  import {
    geographicCodes,
    selectedCategoryTotals,
    selectedCategory,
  } from "../stores.js";
  import { onMount } from "svelte";
  import MapComponent, {
    map,
    bounds,
    latlon,
    mapZoom,
  } from "../MapComponent.svelte";
  import MapSource from "../MapSource.svelte";
  import MapLayer from "../MapLayer.svelte";
  import ColChart from "../charts/Histogram.svelte";
  import Loader from "../ui/Loader.svelte";
  import Select from "../ui/Select.svelte";
  import Panel from "../ui/Panel.svelte";
  import { default as PanelSection } from "../ui/CustomAccordionPanel.svelte";
  import { default as Indicate2L } from "../ui/groupselect_2layer.svelte";
  import { default as Geolocate } from "../geolocate.svelte";
  import { getNomis, storeNewCategoryAndTotals, populateColors,
      addLadDataToDataset,
      setColors,
      updateURL,
      replaceURL, } from "../utils.js";
  import { json } from "d3-fetch";
  const showmap = true; //debug tool
  import {
    lsoaurl,
    tabledata,
    lsoabldg,
    lsoabounds,
    ladvector,
    data,
    lad_dta,
    location,
    lsoa,
    lad,
    selectData,
    selectItem,
    get_data,
  } from "../datastore.js";
  import { colors } from "../constants.js";
  import { get } from "svelte/store";
  import LocalDataService from "../dataService";

  // OBJECTS
  // DATA
  let indicators;
  let lsoalookup;
  // STATE
  let selectCode = "QS119EW005";
  let mapLocation = null;
  let selectMeta = { code: "" };
  let loading = true;
  $: $selectItem, console.warn("sitem", $selectItem);
  $: selectMeta, console.warn("smeta", selectMeta);

  const localDataService = new LocalDataService();

  async function initialise() {
    // await connect()
    // timer_as(get_data)
    await get_data();
    mapLocation = {
      zoom: 11,
      lon: +location.lon,
      lat: +location.lat,
    };
    // no need to be blocking
    json(lsoaurl).then((data) => {
      lsoalookup = data;
    });
    json(tabledata).then((json) => {
      indicators = json;
      setIndicator(indicators, selectCode);
      if (!$selectItem) {
        $selectItem = indicators[0].children[0].children[0];
      }
      setIndicator(indicators, selectCode);
    });
  }
  /// END "INIT"
  function setIndicator(indicators, code) {
    // nest to find indicator with code  - do we need childen or is it a name ref
    indicators.forEach((indicator) => {
      if (indicator.code && indicator.code == code) {
        $selectItem = indicator;
      } else if (indicator.children) {
        setIndicator(indicator.children, code);
      }
    });
  }
  selectItem.subscribe(function setSelectedDataset() {
    if ($selectItem) {
      // & selectMeta.code != $selectItem.code) {
      let code = (selectCode = $selectItem.code);
      const c3 = code.slice(0, 3);
      const c7 = code.slice(0, 7);
      const group = indicators.find((d) => d.code === c3);
      selectMeta = {
        code: code,
        group: group,
        table: group.children.find((d) => d.code === c7),
        cell: +code.slice(7, 10),
      };
      loadData();
      // changeURL();
    }
  });

  async function loadData() {
    loading = true;
    // let url = `${apiurl}${selectMeta.table.nomis}${selectMeta.cell}&geography=${geography}&uid=${apikey}`;
    let url = `https://bothness.github.io/census-atlas/data/lsoa/${selectMeta.code}.csv`;
    let currentCategoryCode = get(selectedCategory);
    if (currentCategoryCode != selectMeta.code) {
      storeNewCategoryAndTotals(
        selectedCategory,
        selectedCategoryTotals,
        selectMeta,
        localDataService,
        url
      );
    }
    let nomisData = await getNomis(
      url,
      localDataService,
      geographicCodes,
      selectedCategoryTotals,
      selectMeta.cell
    );
    let dataset = populateColors(nomisData, colors);
    addLadDataToDataset(dataset, lsoalookup, nomisData);
    $data[$selectItem.code] = dataset;
    $selectData = dataset;
    if ($lad.selected) {
      setColors(
        lsoalookup,
        $data,
        $selectData,
        $selectItem,
        $lad,
        $lad_dta,
        $lsoa,
        $bounds
      );
    }
    loading = false;
  }

  function doSelect() {
    if ($lad.selected != $lad.selectedPrev) {
      $lad.selectedPrev = $lad.selected;
      if (
        $lad.selected &&
        $lsoa.selected &&
        !$lad_dta.get($lad.selected).children.includes($lsoa.selected)
      ) {
        $lsoa.selected = null;
      }
      setColors(
        lsoalookup,
        $data,
        $selectData,
        $selectItem,
        $lad,
        $lad_dta,
        $lsoa,
        $bounds
      );
    }
  }

  function getSib(type, diff) {
    console.log(type)
    console.log(diff)
    if (type == "lad") {
      let index =
        $selectData.lad.data.findIndex((d) => d.code == $lad.selected) + diff;
      if (index >= 0 && index < $selectData.lad.data.length) {
        $lsoa.selected = null;
        $lad.selected = $selectData.lad.data[index].code;
      }
    } else if (type == "lsoa") {
      let filtered = $selectData.lsoa.data.filter((d) =>
        $lad_dta.get($lad.selected).children.includes(d.code)
      );
      let index = filtered.findIndex((d) => d.code == $lsoa.selected) + diff;
      if (index >= 0 && index < filtered.length) {
        $lsoa.selected = filtered[index].code;
        // Fit to parent LAD
        $bounds = $lad_dta.get($lad.selected);
        // map.fitBounds($bounds, { padding: 20 });
      }
    }
  }
  // REACT
  $: $map, console.warn("maap", $map);
  // $: selectItem && setSelect(); // Update meta when selection updates
  $: $lad.highlighted =
    lsoalookup && $lsoa.hovered ? lsoalookup[$lsoa.hovered].parent : null;
  $: $lad.selected =
    lsoalookup && $lsoa.selected
      ? lsoalookup[$lsoa.selected].parent
      : $lad.selected;
  //
  $: if ($lad_dta & $lad.name)
    $lad.name = $lad_dta.get($lad.selected).AREANM || null;
  $: $data[selectCode] &&
    ($lad.selected || $lad.selected == null) &&
    doSelect();
  // geolocate
  latlon.subscribe(() => {
    if ($latlon) {
      var ll = $latlon;
      console.warn("trigger update", ll);
      let dist = [99999, null];
      for (let [key, val] of $lad_dta) {
        let dt = Math.sqrt(
          (ll.latitude - val.lat) ** 2 + (ll.longitude - val.lon) ** 2
        );
        if (dt < dist[0]) dist = [dt, val];
      }
      $bounds = [dist[1].minx, dist[1].miny, dist[1].maxx, dist[1].maxy];
      //$latlon = false;
    }
  });

  onMount(initialise);
</script>

<main>
  <meta name="theme-color" content="currentcolor" />

  {#if loading}
    <Loader
      height="100vh"
      width="100vw"
      position="fixed"
      bgcolor="rgba(255, 255, 255, 0.7)"
    />
  {/if}

  <Panel desc="summary panel">
    <!-- <a id="logo-link" href="/"> -->

    <div slot="head">
      <img
        class="logo"
        style="width:50%"
        src="https://cdn.ons.gov.uk/assets/images/ons-logo/v2/ons-logo.svg"
        alt="Office for National Statistics logo - Homepage"
      />
      <!-- </a> -->
      <h1>2011 Census Atlas Demo</h1>
      <!-- <h1 style='border-bottom: 1px solid rgb(100, 120, 140);'/> -->
    </div>
    {#if indicators && $selectItem}
      {#if $selectData}
        <PanelSection key="chart">
          <ColChart
            data={$selectData.lsoa.data}
            dataIndex={$selectData.lsoa.index}
            breaks={$selectData.lsoa.breaks}
            avg={$selectData.englandAndWales.data}
            selected={$lsoa.hovered ? $lsoa.hovered : $lsoa.selected}
            parent={$lad.hovered
              ? $selectData.lad.index[$lad.hovered].median.code
              : $lad.highlighted
              ? $selectData.lad.index[$lad.highlighted].median.code
              : $lad.selected
              ? $selectData.lad.index[$lad.selected].median.code
              : null}
            siblings={$lad.selected
              ? $lad_dta.get($lad.selected).children
              : null}
            key="perc"
          />
        </PanelSection>
      {/if}

      <PanelSection key="infobox">
        <div id="infobox">
          {selectMeta.table.name}
          <small>({selectMeta.table.code})</small><br />
          <strong class="text-med">{$selectItem.name}</strong>
          <div class="grid">
            {#if $selectData}
              <div>
                <hr style="border-top-color: #871A5B" />
                <strong>England & Wales</strong><br />
                <strong class="text-lrg"
                  >{$selectData.englandAndWales.data.perc.toFixed(1)}%</strong
                ><br />
                <small
                  >{$selectData.englandAndWales.data.value.toLocaleString()}
                  of
                  {$selectData.englandAndWales.data.count.toLocaleString()}
                  {$selectItem.unit.toLowerCase()}s</small
                >
              </div>
              {#if $lad.hovered || $lad.highlighted || $lad.selected}
                <div>
                  <hr style="border-top-color: #27A0CC" />
                  <strong
                    >{$lad.hovered
                      ? $lad_dta.get($lad.hovered).name
                      : $lad.highlighted
                      ? $lad_dta.get($lad.highlighted).name
                      : $lad_dta.get($lad.selected).name}</strong
                  ><br />
                  <strong class="text-lrg">
                    {#if $lad.selected}<img
                        src="./icons/chevron-left.svg"
                        class="next"
                        on:click={() => getSib("lad", -1)}
                      />{/if}
                    {$lad.hovered
                      ? $selectData.lad.index[$lad.hovered].perc.toFixed(1)
                      : $lad.highlighted
                      ? $selectData.lad.index[$lad.highlighted].perc.toFixed(1)
                      : $selectData.lad.index[$lad.selected].perc.toFixed(1)}%
                    {#if $lad.selected}<img
                        src="./icons/chevron-right.svg"
                        class="next"
                        on:click={() => getSib("lad", 1)}
                      />{/if}
                  </strong><br />
                  <small
                    >{$lad.hovered
                      ? $selectData.lad.index[
                          $lad.hovered
                        ].value.toLocaleString()
                      : $lad.highlighted
                      ? $selectData.lad.index[
                          $lad.highlighted
                        ].value.toLocaleString()
                      : $selectData.lad.index[
                          $lad.selected
                        ].value.toLocaleString()}
                    of
                    {$lad.hovered
                      ? $selectData.lad.index[
                          $lad.hovered
                        ].count.toLocaleString()
                      : $lad.highlighted
                      ? $selectData.lad.index[
                          $lad.highlighted
                        ].count.toLocaleString()
                      : $selectData.lad.index[
                          $lad.selected
                        ].count.toLocaleString()}
                    {$selectItem.unit.toLowerCase()}s</small
                  >
                </div>
              {:else}
                <div />
              {/if}
              {#if $lsoa.hovered || $lsoa.selected}
                <div>
                  <hr style="border-top-color: #000000" />
                  <strong
                    >{$lsoa.hovered
                      ? lsoalookup[$lsoa.hovered].name.slice(-4)
                      : lsoalookup[$lsoa.selected].name.slice(-4)}</strong
                  ><br />
                  <strong class="text-lrg">
                    {#if $lsoa.selected}<img
                        src="./icons/chevron-left.svg"
                        class="next"
                        on:click={() => getSib("lsoa", -1)}
                      />{/if}
                    {$lsoa.hovered
                      ? $selectData.lsoa.index[$lsoa.hovered].perc.toFixed(1)
                      : $selectData.lsoa.index[$lsoa.selected].perc.toFixed(1)}%
                    {#if $lsoa.selected}<img
                        src="./icons/chevron-right.svg"
                        class="next"
                        on:click={() => getSib("lsoa", 1)}
                      />{/if}
                  </strong><br />
                  <small
                    >{$lsoa.hovered
                      ? $selectData.lsoa.index[
                          $lsoa.hovered
                        ].value.toLocaleString()
                      : $selectData.lsoa.index[
                          $lsoa.selected
                        ].value.toLocaleString()}
                    of
                    {$lsoa.hovered
                      ? $selectData.lsoa.index[
                          $lsoa.hovered
                        ].count.toLocaleString()
                      : $selectData.lsoa.index[
                          $lsoa.selected
                        ].count.toLocaleString()}
                    {selectItem.unit.toLowerCase()}s</small
                  >
                </div>
              {:else}
                <div />
              {/if}
            {/if}
          </div>
        </div>
      </PanelSection>
    {/if}
  </Panel>

  <Panel id="options_panel" side="right" desc="selection panel">
    <div slot="head">
      <h2>Data Portal</h2>
    </div>

    {#if $lad_dta}
      <PanelSection key="area" bind:selected={$lad.name}>
        <!-- wrapper html to shrink select -->
        <Select
          options={[...$lad_dta.values()]}
          bind:name={$lad.name}
          bind:selected={$lad.selected}
          search={true}
          placeholder="Find a district..."
          on:select={() => ($lsoa.selected = null)}
        >
          <Geolocate width="30px" />
        </Select>
      </PanelSection>
    {/if}

    <PanelSection key="data">
      <!-- <Group
      props={{ name: '2011 Census Tables', children: indicators, menu:0 }}
      bind:selected={selectItem}
      expanded /> -->

      <Indicate2L />
    </PanelSection>
  </Panel>

  {#if showmap}
    {#if mapLocation}
      <MapComponent bind:zoom={$mapZoom}>
        <!-- maplocation remove> -->

        {#if $selectData}
          <MapSource
            id="lsoa"
            type="vector"
            url={lsoabldg.url}
            layer={lsoabldg.layer}
            promoteId={lsoabldg.code}
            maxzoom={13}
          >
            <MapLayer
              id="lsoa"
              source="lsoa"
              sourceLayer={lsoabldg.layer}
              data={$selectData}
              type="fill"
              paint={{
                "fill-color": [
                  "case",
                  ["!=", ["feature-state", "color"], null],
                  ["feature-state", "color"],
                  "rgba(255, 255, 255, 0)",
                ],
              }}
              order="tunnel_motorway_casing"
            />
          </MapSource>
          <MapSource
            id="lsoa-bounds"
            type="vector"
            url={lsoabounds.url}
            layer={lsoabounds.layer}
            promoteId={lsoabounds.code}
            minzoom={9}
            maxzoom={12}
          >
            <MapLayer
              id="lsoa-fill"
              source="lsoa-bounds"
              sourceLayer={lsoabounds.layer}
              type="fill"
              paint={{ "fill-color": "rgba(255, 255, 255, 0)" }}
              hover={true}
              bind:hovered={$lsoa.hovered}
              click={true}
              clickCenter={true}
              bind:selected={$lsoa.selected}
            />
            <MapLayer
              id="lsoa-bounds"
              source="lsoa-bounds"
              sourceLayer={lsoabounds.layer}
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  "rgba(0, 0, 0, 1)",
                  ["==", ["feature-state", "hovered"], true],
                  "rgba(0, 0, 0, 1)",
                  "rgba(0, 0, 0, 0)",
                ],
                "line-width": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  2,
                  ["==", ["feature-state", "hovered"], true],
                  2,
                  0,
                ],
              }}
            />
          </MapSource>
        {/if}
        {#if $lad_dta}
          <MapSource
            id="lad"
            type="vector"
            url={ladvector.url}
            layer={ladvector.layer}
            promoteId={ladvector.code}
          >
            <MapLayer
              id="lad"
              source="lad"
              sourceLayer={ladvector.layer}
              type="line"
              highlight={true}
              highlighted={$lad.highlighted}
              filter={[
                "all",
                ["==", "lower", "true"],
                ["in", "country", "E", "W"],
              ]}
              paint={{
                "line-color": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  "#27A0CC",
                  ["==", ["feature-state", "hovered"], true],
                  "#27A0CC",
                  ["==", ["feature-state", "highlighted"], true],
                  "#27A0CC",
                  "rgba(192, 192, 192, 1)",
                ],
                "line-width": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  2,
                  ["==", ["feature-state", "hovered"], true],
                  2,
                  ["==", ["feature-state", "highlighted"], true],
                  2,
                  0.75,
                ],
              }}
              order="place_other"
            />
            <MapLayer
              id="lad-fill"
              source="lad"
              sourceLayer={ladvector.layer}
              type="fill"
              filter={[
                "all",
                ["==", "lower", "true"],
                ["in", "country", "E", "W"],
              ]}
              paint={{ "fill-color": "rgba(255, 255, 255, 0)" }}
              hover={true}
              bind:hovered={$lad.hovered}
              click={true}
              bind:selected={$lad.selected}
              maxzoom={8.99}
              on:select={() => ($lsoa.selected = null)}
            />
          </MapSource>
        {/if}
      </MapComponent>
    {/if}
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  h1 {
    margin-top: 0;
  }
  hr {
    border: none;
    border-top: 3px solid grey;
  }
  #infobox {
    min-height: 160px;
    padding-bottom: 18px;
  }
  .text-med {
    font-size: inherit;
    /* font-size: 1.5em; */
    font-weight: bold;
  }
  .text-lrg {
    font-size: 2em;
    font-weight: bold;
  }
  .grid {
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    justify-items: stretch;
    width: 100%;
    margin: 0;
  }
  .next {
    height: 24px;
    cursor: pointer;
  }
  :global(.mapboxgl-map) {
    width: 100%;
  }
  :global(main) {
    font-size-adjust: 0.1;
    font-size: 10px;
  }
</style>
