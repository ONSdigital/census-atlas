import {writable, get} from "svelte/store";

export const selectedCensusCategory = writable(null);
export const activeOnMapCensusCategory = writable(null);
export const selectedData = writable(null);

export function updateSelectedCensusCategory(newCensusCategory) {
    selectedCensusCategory.set(newCensusCategory)
}

export function updateActiveOnMapCensusCategory(newMetadata) {
    activeOnMapCensusCategory.set(newMetadata)
}

export function updateSelectedData(newData) {
    selectedData.set(newData)
}

export function mapDoesNotMatchSelection() {
    let s = get(selectedCensusCategory)
    let m = get(activeOnMapCensusCategory)
    return !(m && s && (m.code === s.code))
}