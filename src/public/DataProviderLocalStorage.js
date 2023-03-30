import { Dataset } from "../Dataset.js";
import { DataProvider } from "../DataProvider.js";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class DataProviderLocalStorage extends DataProvider {
    static FILTERS_DATA_KEY = 'finance.filters.data';
    static DATASETS_DATA_KEY = 'finance.datasets.data';

    #defaultFilter;
    #defaultDatasets;

    constructor(defaultFilter, defaultDatasets) {
        super();
        this.#defaultFilter = defaultFilter;
        this.#defaultDatasets = defaultDatasets;
    }

    // filters

    hasStoredFilters() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataProviderLocalStorage.FILTERS_DATA_KEY);
            return data != null;
        }
        return false;
    }

    fetchFilters() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataProviderLocalStorage.FILTERS_DATA_KEY);
            if (data) {
                return new Promise((resolve, reject) => {
                    resolve(data);
                });
            }
        }

        // fetch default filters
        return new Promise((resolve, reject) => {
            resolve(this.#defaultFilter);
        });
    }

    storeFilters(rawFilters) {
        return new Promise((resolve, reject) => {
            if (window.localStorage) {
                window.localStorage.setItem(DataProviderLocalStorage.FILTERS_DATA_KEY, rawFilters);
                resolve(null);
            } else {
                reject("Local storage not supported");
            }
        });
    }

    discardFilters() {
        if (window.localStorage) {
            window.localStorage.removeItem(DataProviderLocalStorage.FILTERS_DATA_KEY);
        }
    }

    // datasets

    hasStoredDatasets() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataProviderLocalStorage.DATASETS_DATA_KEY);
            return data != null;
        }
        return false;
    }

    fetchDatasets() {
        if (window.localStorage) {
            let rawDatasets = window.localStorage.getItem(DataProviderLocalStorage.DATASETS_DATA_KEY);
            if (rawDatasets) {
                return new Promise((resolve, reject) => {
                    let datasets;
                    try {
                        datasets = Dataset.parseDatasets(rawDatasets);
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    resolve(datasets);
                });
            }
        }

        // fetch example
        return new Promise((resolve, reject) => {
            resolve(this.#defaultDatasets);
        });
    }

    storeDatasets(datasets) {
        return new Promise((resolve, reject) => {
            if (window.localStorage) {
                let rawDatasets = Dataset.serializeDatasets(datasets);
                window.localStorage.setItem(DataProviderLocalStorage.DATASETS_DATA_KEY, rawDatasets);
                resolve(null);
            } else {
                reject("Local storage not supported");
            }
        });
    }

    discardDatasets() {
        if (window.localStorage) {
            window.localStorage.removeItem(DataProviderLocalStorage.DATASETS_DATA_KEY);
        }
    }
}