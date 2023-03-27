import { Dataset } from "../Dataset.js";
import { DataManager } from "../DataManager.js";
import { ServerPrivateAPI } from "./ServerPrivateAPI.js";

/**
 *
 * @version 2022-05-22
 * @author Patrik Harag
 */
export class DataManagerForPrivateUse extends DataManager {
    _context;

    constructor(context) {
        super();
        this._context = context;
    }

    getSaveTooltip() {
        return 'Send to server'
    }

    // filters

    hasStoredFilters() {
        return true;
    }

    fetchFilters() {
        return new Promise((resolve, reject) => {
            return ServerPrivateAPI.fetchSettings().then(data => {
                resolve(data.filters);
            }).catch(e => {
                reject(e);
            })
        });
    }

    storeFilters(rawFilters) {
        let dataToSend = {
            filters: rawFilters
        };
        return ServerPrivateAPI.postSettings(this._context, dataToSend);
    }

    discardFilters() {
        // ignore
    }

    // data

    hasStoredDatasets() {
        return true;
    }

    fetchDatasets() {
        return new Promise((resolve, reject) => {
            return ServerPrivateAPI.fetchData().then(rawDatasets => {
                if (rawDatasets.datasets === null) {
                    resolve(new Map());
                    return;
                }

                let datasets;
                try {
                    datasets = Dataset.parseDatasets(rawDatasets.datasets);
                } catch (e) {
                    reject(e);
                    return;
                }
                resolve(datasets);
            }).catch(e => {
                reject(e);
            })
        });
    }

    storeDatasets(datasets) {
        let dataToSend = {
            datasets: Dataset.serializeDatasets(datasets)
        };
        return ServerPrivateAPI.postData(this._context, dataToSend);
    }

    discardDatasets() {
        // ignore
    }
}
