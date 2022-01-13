import { writable } from "svelte/store";

let dataService = null;
export const selectedCategoryBreaks = writable({});

export async function fetchCensusDataBreaks(metadataDataService, cat, k) {
  dataService = metadataDataService;
  let breaks = {}
  breaks.lad = await dataService.fetchCensusDataBreaks("LAD", cat, k);
  breaks.lsoa = await dataService.fetchCensusDataBreaks("LSOA", cat, k);
  selectedCategoryBreaks.set(breaks);
}
