import { get, writable } from "svelte/store";
import { initialMockData, integratedMockMap } from "../../data/test/mockDataByGeography";
import {
  categories,
  censusTableStructureIsLoaded,
  initialiseCensusData,
  reset,
  tables,
  topics,
  fetchSelectedDataForGeoType,
  dataByGeography,
  cachedMapCategories,
} from "./censusdata";
import MockCensusDataService from "./services/mockCensusDataService";

describe("initialise census", () => {
  beforeEach(() => {
    // reset the stores
    reset();
  });

  it("it initialises the topic-table-category structure", async () => {
    // given
    // a mock for the census service
    let mockCensusService = new MockCensusDataService();

    // when
    // we call initialise census
    await initialiseCensusData(mockCensusService);

    // then
    // it calls functions on the geography service
    expect(Object.keys(topics)).toStrictEqual(["TP1", "TP2"]);
    expect(Object.keys(tables)).toStrictEqual(["TB1", "TB2", "TB3", "TB4"]);
    expect(Object.keys(categories)).toStrictEqual(["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"]);
    expect(tables["TB1"].total).toStrictEqual("TB1-T");
  });

  it("it switches censusTableStructureIsLoaded to true", async () => {
    // given
    // a mock for the census service
    let mockCensusService = new MockCensusDataService();

    // and record changes for censusTableStructureIsLoaded
    var changeHistory = [];
    censusTableStructureIsLoaded.subscribe((value) => {
      changeHistory.push(value);
    });

    // when
    // we call initialise census and await the result
    await initialiseCensusData(mockCensusService);

    // then
    // it switches the value from false to true
    expect(changeHistory).toStrictEqual([false, true]);
  });
});

describe("fetchSelectedDataForGeoType", () => {
  beforeEach(() => {
    get(dataByGeography).clear();
  });

  const mockCensusDataService = new MockCensusDataService();
  const catCodes1 = ["catCode1"];

  it("writes data to the dataByGeography and cachedMapCategories stores", async () => {
    const catCodesSet = new Set(catCodes1);

    await fetchSelectedDataForGeoType(mockCensusDataService, "geoType", catCodes1);

    expect(get(dataByGeography)).toEqual(initialMockData);
    expect(get(cachedMapCategories)).toEqual(catCodesSet);
  });
  it("adds new data to the existing dataByGeography cache", async () => {
    const catCodes2 = ["catCode2"];

    await fetchSelectedDataForGeoType(mockCensusDataService, "geoType", catCodes1);
    await fetchSelectedDataForGeoType(mockCensusDataService, "geoType", catCodes2);

    expect(get(dataByGeography)).toEqual(integratedMockMap);
  });
});
