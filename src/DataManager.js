import { Dataset } from "./Dataset.js";

/**
 *
 * @version 2022-05-21
 * @author Patrik Harag
 */
export class DataManager {

    static createForPublicUse(defaultFilterUrl,
                              defaultDatasetUrl, defaultDatasetName, defaultDatasetDataType) {
        return new DataManagerForPublicUse(
            defaultFilterUrl,
            defaultDatasetUrl, defaultDatasetName, defaultDatasetDataType);
    }


    getSaveTooltip() {
        return '';
    }

    // filters

    hasStoredFilters() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
     */
    fetchFilters() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
     */
    storeFilters(rawFilters) {
        throw 'Unsupported operation: not implemented';
    }

    discardFilters() {
        throw 'Unsupported operation: not implemented';
    }

    // datasets

    hasStoredDatasets() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     * @returns Promise
     */
    fetchDatasets() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
     */
    storeDatasets(datasets) {
        throw 'Unsupported operation: not implemented';
    }

    discardDatasets() {
        throw 'Unsupported operation: not implemented';
    }
}

/**
 *
 * @version 2022-05-21
 * @author Patrik Harag
 */
class DataManagerForPublicUse extends DataManager {
    static FILTERS_DATA_KEY = 'finance.filters.data';
    static DATASETS_DATA_KEY = 'finance.datasets.data';

    defaultFilterUrl;
    defaultDatasetUrl;
    defaultDatasetName;
    defaultDatasetDataType;

    constructor(defaultFilterUrl, defaultDatasetUrl, defaultDatasetName, defaultDatasetDataType) {
        super();
        this.defaultFilterUrl = defaultFilterUrl;
        this.defaultDatasetUrl = defaultDatasetUrl;
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
            $.ajax({
                url: this.defaultFilterUrl,
                type: 'GET',
                dataType: 'text',
                success: (data) => {
                    resolve(data);
                },
                error: function (data) {
                    reject(data);
                }
            });
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
            $.ajax({
                url: this.defaultDatasetUrl,
                type: 'GET',
                dataType: 'text',
                success: (data) => {
                    let dataset = new Dataset(this.defaultDatasetName, this.defaultDatasetDataType, data);
                    let datasets = new Map();
                    datasets.set(this.defaultDatasetName, dataset);
                    resolve(datasets);
                },
                error: (data) => {
                    reject(data);
                }
            });
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
