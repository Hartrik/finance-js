import { Dataset } from "../Dataset.js";
import { DataManager } from "../DataManager.js";

/**
 *
 * @version 2023-03-28
 * @author Patrik Harag
 */
export class DataManagerForPublicUse extends DataManager {
    static FILTERS_DATA_KEY = 'finance.filters.data';
    static DATASETS_DATA_KEY = 'finance.datasets.data';

    defaultFilter;
    defaultDataset;
    defaultDatasetName;
    defaultDatasetDataType;

    constructor(defaultFilter, defaultDataset, defaultDatasetName, defaultDatasetDataType) {
        super();
        this.defaultFilter = defaultFilter;
        this.defaultDataset = defaultDataset;
        this.defaultDatasetName = defaultDatasetName;
        this.defaultDatasetDataType = defaultDatasetDataType;
    }

    getSaveTooltip() {
        return 'Store into browser storage (local storage)'
    }

    // filters

    hasStoredFilters() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataManagerForPublicUse.FILTERS_DATA_KEY);
            return data !== null;
        }
        return false;
    }

    fetchFilters() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataManagerForPublicUse.FILTERS_DATA_KEY);
            if (data !== null) {
                return new Promise((resolve, reject) => {
                    resolve(data);
                });
            }
        }

        // fetch default filters
        return new Promise((resolve, reject) => {
            resolve(this.defaultFilter);
        });
    }

    storeFilters(rawFilters) {
        return new Promise((resolve, reject) => {
            if (window.localStorage) {
                window.localStorage.setItem(DataManagerForPublicUse.FILTERS_DATA_KEY, rawFilters);
                resolve(null);
            } else {
                reject("Local storage not supported");
            }
        });
    }

    discardFilters() {
        if (window.localStorage) {
            window.localStorage.removeItem(DataManagerForPublicUse.FILTERS_DATA_KEY);
        }
    }

    // datasets

    hasStoredDatasets() {
        if (window.localStorage) {
            let data = window.localStorage.getItem(DataManagerForPublicUse.DATASETS_DATA_KEY);
            return data !== null;
        }
        return false;
    }

    fetchDatasets() {
        if (window.localStorage) {
            let rawDatasets = window.localStorage.getItem(DataManagerForPublicUse.DATASETS_DATA_KEY);
            if (rawDatasets !== null) {
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
            let dataset = new Dataset(this.defaultDatasetName, this.defaultDatasetDataType, this.defaultDataset);
            let datasets = new Map();
            datasets.set(this.defaultDatasetName, dataset);
            resolve(datasets);
        });
    }

    storeDatasets(datasets) {
        return new Promise((resolve, reject) => {
            if (window.localStorage) {
                let rawDatasets = Dataset.serializeDatasets(datasets);
                window.localStorage.setItem(DataManagerForPublicUse.DATASETS_DATA_KEY, rawDatasets);
                resolve(null);
            } else {
                reject("Local storage not supported");
            }
        });
    }

    discardDatasets() {
        if (window.localStorage) {
            window.localStorage.removeItem(DataManagerForPublicUse.DATASETS_DATA_KEY);
        }
    }
}