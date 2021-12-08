import { csvParse } from "d3-dsv";
import { ckmeans } from "simple-statistics";
import { lsoaLookup } from "./../../geography/geography";
import config from "./../../../config";
import simpleTopicTableCategoryData from "../../../data/simpleTopicTableCategoryData";

import { mapZoomBBox } from "../../../stores.js"

const baseURL = "https://5laefo1cxd.execute-api.eu-central-1.amazonaws.com/dev/hello/skinny";

export default class APIDemoDataService {
  constructor() {
    this.reset();
    this.currentCategoryID = null;
    mapZoomBBox.subscribe(value => {
      this.mapZoomBBox = value;
      this.fetchLsoaCategoryData(this.currentCategoryID);
    })
    this.EWdataBatchNomisKeyed = {};
    this.fetchAllEWCategoryData();
  }

  reset() {
    this.dataset = {
      lsoa: {
        index: {},
        breaks: [],
      },
      higher: {
        index: {},
      },
      lad: {
        index: {},
      },
      englandAndWales: {
        count: 0,
        value: 0,
      },
    };
  }

  async fetchCensusTableStructure() {
    return simpleTopicTableCategoryData
  }

  // make sure something calls this on init
  async fetchAllEWCategoryData() {
    const url = `${baseURL}?rows=K04000001`;
    let response = await fetch(url);
    let string = await response.text();
    csvParse(string, (row, i, cols) => {
      cols.forEach((col) => {
        this.EWdataBatchNomisKeyed[col] = +row[col];
      });     
    });
  }
  // fetch the ew, lad and lsoa data
  async fetchLsoaCategoryData(categoryId) {
    // don't do anything if no categoryId selected
    if (categoryId === null) {
      console.log('No categoryID selectected, skipping data load.')
      return this.dataset.lsoa.index
    }    
    
    this.currentCategoryID = categoryId;

    // bbox query
    const bboxQuery = [
      this.mapZoomBBox.swCorner.lon,
      this.mapZoomBBox.swCorner.lat,
      this.mapZoomBBox.neCorner.lon,
      this.mapZoomBBox.neCorner.lat
    ].join((","));

    // cols query, including the geography_code, category totals and category data
    const dbColumn = this.categoryIDToDBTotalsColumn(categoryId);
    const dbtotalsColumn = this.categoryIDToDBColumn(categoryId);
    const colsQuery = [
      "geography_code",
      dbtotalsColumn,
      dbColumn,
    ].join(",");
    
    // assemble URL and query API
    const url = `${baseURL}?bbox=${bboxQuery}&cols=${colsQuery}`;
    let response = await fetch(url);
    let string = await response.text();

    // parse csv string to dataset
    let lsoaPercs = [];
    csvParse(string, (row) => {
      // only LSOA and LAD expected, so if it doesn't start with E01...
      if (row["geography_code"].startsWith('E01')) {
        const perc = (+row[dbColumn] / +row[dbtotalsColumn]) * 100;
        lsoaPercs.append(perc);
        Object.assign(
          this.dataset.lsoa.index,
          {
            [row["geography_code"]]: {
              value: +row[dbColumn],
              count: +row[dbtotalsColumn],
              perc: perc,
            }
          }
        );
      } else {
        // ... then it must be an LAD
        Object.assign(
          this.dataset.lad.index,
          {
            [row["geography_code"]]: {
              value: +row[dbColumn],
              count: +row[dbtotalsColumn],
              perc: (+row[dbColumn] / +row[dbtotalsColumn]) * 100,
            }
          }
        );
      };
    });

    // add breaks NB - this SHOULD be based on the full dataset for the country, so its almost certainly nonsense here
    // ToDo - have the API provide these?
    let chunks = ckmeans(lsoaPercs, config.ux.legend_sections);
    this.dataset.lsoa.breaks = this._getBreaks(chunks);
    
    // retrieve EW data from cache
    this.dataset.englandAndWales.count = this.EWdataBatchNomisKeyed[dbtotalsColumn];
    this.dataset.englandAndWales.value = this.EWdataBatchNomisKeyed[dbColumn];
    this.dataset.englandAndWales.perc = (this.dataset.englandAndWales.value / this.dataset.englandAndWales.count) * 100;

    // add to 'higher' geography
    this.dataset.higher = this.dataset.lad;
    this.dataset.higher.index["ENGLAND_AND_WALES"] = this.dataset.englandAndWales;

    return this.dataset.lsoa.index;
  }

  async fetchLegendBreakpoints(categoryId) {
    return this.dataset.lsoa.breaks;
  }

  async fetchHigherGeographyCategoryData(categoryId) {
    // is derived in legacy version from
    return this.dataset.higher.index;
  }

  async fetchCategoryAggregateData(categoryId) {
    return {
      breaks: this.dataset.lsoa.breaks,
    };
  }

  async fetchTableForGeography(tableId, geographyId) {
    return {
      tableId: tableId,
      geographyId: geographyId,
      rows: [
        // { category: 'Female', value: 4801, perc: 0.49 }
      ],
    };
  }

  // ---------------------------------

  _decomposeCategoryId(categoryId) {
    const digitsSuffix = categoryId.match(/\d+$/)[0];
    return {
      digitsSuffix: digitsSuffix, 
      prefix: categoryId.substring(categoryId.lastIndexOf(digitsSuffix), 0)
    }
  }

  // adjust for 1-based (nomis bulk, in the db) vs 0-based (nomis api) categories: QS101EW001 -> QS101EW0002
  _categoryIDToDBColumn(categoryId) {
    const categoryIdParts = this.decomposeCategoryId(categoryId);
    const adjustedSuffix = (parseInt(categoryIdParts.digitsSuffix)+1).toString().padStart(4,"0");
    return categoryIdParts.prefix + adjustedSuffix 
  }

  // get totals column (1-based, in the db) from category ID: QS101EW010 -> QS101EW0001
  _categoryIDToDBTotalsColumn(categoryId) {
    const categoryIdParts = this.decomposeCategoryId(categoryId);
    return categoryIdParts.prefix + "0001" 
  }

  _getBreaks(chunks) {
    let breaks = [];

    chunks.forEach((chunk) => {
      breaks.push(chunk[0]);
    });

    breaks.push(chunks[chunks.length - 1][chunks[chunks.length - 1].length - 1]);
    return breaks;
  }
}
