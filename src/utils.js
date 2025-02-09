import { get } from "svelte/store";
import {
  englandAndWalesData,
  dataByGeography,
  fetchSelectedDataForWholeBoundingBox,
  tables,
  fetchSelectedDataForGeoType,
} from "./model/censusdata/censusdata";
import GeodataApiDataService from "./model/censusdata/services/geodataApiDataService";
import config from "./config";
import { ladLookup } from "./model/geography/geography";
import { fetchCensusDataBreaks, reverseTotalCatCodeLookup } from "./model/metadata/metadata";
import MetadataApiDataService from "./model/metadata/services/metadataApiDataService";
import { mapZoomBBox } from "./model/geography/stores";
import { isCatDataFetchedForGeoCode } from "./model/utils";

export function isEmpty(obj) {
  return (
    obj && // null and undefined check
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}

export function isNotEmpty(obj) {
  return !isEmpty(obj);
}

function decomposeCategoryId(categoryId) {
  const digitsSuffix = categoryId.match(/\d+$/)[0];
  return {
    digitsSuffix: digitsSuffix,
    prefix: categoryId.substring(categoryId.lastIndexOf(digitsSuffix), 0),
  };
}

// adjust for 1-based (nomis bulk, in the db) vs 0-based (nomis api) categories: QS101EW001 -> QS101EW0002
export function categoryIDToDBColumn(categoryId) {
  const categoryIdParts = decomposeCategoryId(categoryId);
  const adjustedSuffix = (parseInt(categoryIdParts.digitsSuffix) + 1).toString().padStart(4, "0");
  return categoryIdParts.prefix + adjustedSuffix;
}

// get totals column (1-based, in the db) from category ID: QS101EW010 -> QS101EW0001
export function categoryIDToDBTotalsColumn(categoryId) {
  const categoryIdParts = decomposeCategoryId(categoryId);
  return categoryIdParts.prefix + "0001";
}

export function dbColumnToCategoryId(dbColumn) {
  const dbColumnParts = decomposeCategoryId(dbColumn);
  const adjustedSuffix = (parseInt(dbColumnParts.digitsSuffix) - 1).toString().padStart(3, "0");
  return dbColumnParts.prefix + adjustedSuffix;
}

export function returnNeighbouringLad(selectedLadCode) {
  let neighbouringLadCode = returnNeighbouringLadCode(selectedLadCode);
  if (ladLookup[neighbouringLadCode]) {
    return {
      name: ladLookup[neighbouringLadCode].name,
      code: neighbouringLadCode,
    };
  }
  neighbouringLadCode = returnNeighbouringLadCode(selectedLadCode, true);
  return {
    name: ladLookup[neighbouringLadCode].name,
    code: neighbouringLadCode,
  };
}

function returnNeighbouringLadCode(ladCode, searchLowerLadCode) {
  const ladCodeParts = {
    prefix: ladCode.substr(0, 5),
    suffix: ladCode.substr(5),
  };
  let adjustedSuffix;
  if (searchLowerLadCode) {
    adjustedSuffix = (parseInt(ladCodeParts.suffix) - 1).toString().padStart(4, "0");
  } else {
    adjustedSuffix = (parseInt(ladCodeParts.suffix) + 1).toString().padStart(4, "0");
  }
  return ladCodeParts.prefix + adjustedSuffix;
}

export function populateSelectedCatData(geoCode, category) {
  if (get(dataByGeography).has(geoCode) && get(dataByGeography).get(geoCode).has(category.code)) {
    return {
      total: get(dataByGeography).get(geoCode).get(category.code)["total"].toLocaleString(),
      val: get(dataByGeography).get(geoCode).get(category.code)["value"].toLocaleString(),
      perc: get(dataByGeography).get(geoCode).get(category.code)["perc"],
      unit: tables[category.table].unit,
      geoCode: geoCode,
    };
  }
}

export function calculateComparisonDiff(geoCode, comparatorGeoCode, catCode) {
  if (get(dataByGeography).has(geoCode) && get(dataByGeography).get(geoCode).has(catCode)) {
    let comparatorCategory;
    if (comparatorGeoCode == config.eAndWGeoCode) {
      comparatorCategory = get(englandAndWalesData).get(config.eAndWGeoCode).get(catCode);
    } else {
      comparatorCategory = get(dataByGeography).get(comparatorGeoCode).get(catCode);
    }
    const localCategory = get(dataByGeography).get(geoCode).get(catCode);
    const percentageDiff = ((localCategory.perc - comparatorCategory.perc) / comparatorCategory.perc) * 100;
    return Math.round(percentageDiff * 10) / 10;
  }
}

export const updateMap = (category) => {
  if (category) {
    fetchSelectedDataForWholeBoundingBox(
      new GeodataApiDataService(),
      "lsoa",
      [category.code, tables[category.table].total],
      get(mapZoomBBox),
    );
    fetchCensusDataBreaks(new MetadataApiDataService(), category.code, tables[category.table].total, 5, "lsoa");
  }
};

export function fetchMapDataForSelectedCat(catCode, totalCode) {
  fetchSelectedDataForGeoType(new GeodataApiDataService(), "lad", [catCode, totalCode]);
  fetchCensusDataBreaks(new MetadataApiDataService(), catCode, totalCode, 5, "lad");
  fetchCensusDataBreaks(new MetadataApiDataService(), catCode, totalCode, 5, "lsoa");
}

export function lazyLoadFullTableMapData(selectedCatCode, totalCode) {
  const catCodes = get(reverseTotalCatCodeLookup)[totalCode];
  let catCodesToFetch = [];
  catCodes.forEach((catCode) => {
    if (catCode.code != selectedCatCode) {
      catCodesToFetch.push(catCode.code);
    }
  });
  fetchSelectedDataForGeoType(new GeodataApiDataService(), "lad", [...catCodesToFetch, totalCode]);
  catCodesToFetch.forEach((catCode) => {
    fetchCensusDataBreaks(new MetadataApiDataService(), catCode, totalCode, 5, "lad");
  });
}

export function populateSelectedCatAndLocationCard(geoCode, category, locationName, table) {
  if (isCatDataFetchedForGeoCode(get(dataByGeography), geoCode, category.code)) {
    // para 1 describes the category
    const para1 = category.desc;

    // para 2 describes the category values in the currently selected area
    const categoryData = populateSelectedCatData(geoCode, category);
    const locationStr = geoCode == config.eAndWGeoCode ? "England and Wales" : locationName;
    const categoryNameAsSentenceComponent = strToSentenceComponent(category.name);
    const tableNameAsSentenceComponent = strToSentenceComponent(table.name);
    const para2 = `Out of ${
      categoryData.total
    } ${categoryData.unit.toLowerCase()} in ${locationStr}, for ${categoryData.val.toLocaleString()} ${tableNameAsSentenceComponent} is ${categoryNameAsSentenceComponent}.`;

    // para 3 describes its relationship to the category in England and Wales (null if the location IS England and
    // Wales)
    const ewValue = get(englandAndWalesData).get(config.eAndWGeoCode).get(category.code)["value"].toLocaleString();
    const ewTotal = get(englandAndWalesData).get(config.eAndWGeoCode).get(category.code)["total"].toLocaleString();
    const para3 =
      geoCode != config.eAndWGeoCode ? `This compares to ${ewValue} out of ${ewTotal} in England and Wales.` : null;

    return {
      para1: para1,
      para2: para2,
      para3: para3,
    };
  }
}

function strToSentenceComponent(str) {
  // uncapitalise
  var outStr = str.charAt(0).toLowerCase() + str.slice(1);
  // remove full-stop
  if (outStr.slice(-1) === ".") {
    outStr = outStr.slice(0, -1);
  }
  return outStr;
}

export function returnCorrectArticle(topicName) {
  if (/[aeiouAEIOU]/.test(topicName.charAt(0))) {
    return "an";
  } else {
    return "a";
  }
}
