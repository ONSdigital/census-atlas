import { writable } from "svelte/store";

export let censusTableStructureIsLoaded = writable(false)
export let categoryDataIsLoaded = writable(false);
export let tableIsLoaded = writable(false);

export let categoryData = {};
export let tableData = {};
export let breaks = [];

export let topics = {}
export let tables = {}
export let categories = {}

  
let dataService = null;

export async function initialiseCensusData(censusDataService) {
  dataService = censusDataService;
  await fetchTableStructure()
}

export async function fetchTableStructure() {
  let structure = await dataService.fetchCensusTableStructure()
  
  structure.forEach((topic) => {
    topics[topic.code] = {
      code: topic.code,
      name: topic.name,
      tables: topic.tables.map((table) => table.code)
    }
    
    topic.tables.forEach((table) => {
        tables[table.code] = {
          topic: topic.code,
          code: table.code,
          name: table.name,
          categories: table.categories.map((category) => category.code)
        }
        
        table.categories.forEach((category) => {
          categories[category.code] = {
            code: category.code,
            name: category.name,
            table: table.code,
            topic: topic.code
          }
        })
      }
    )
  })
  console.log(topics, tables, categories)
  
  censusTableStructureIsLoaded.set(true)
}

export async function fetchCensusData(categoryCode, geographyCode) {
  categoryDataIsLoaded.set(false);

  // Do a simple data load
  let lsoaData = await dataService.fetchLsoaCategoryData(categoryCode);
  let higherData = await dataService.fetchHigherGeographyCategoryData(categoryCode);

  categoryData = { ...lsoaData, ...higherData };
  breaks = await dataService.fetchLegendBreakpoints(categoryCode);
  categoryDataIsLoaded.set(true);
}
