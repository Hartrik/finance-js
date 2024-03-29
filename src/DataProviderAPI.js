import { Dataset } from "./Dataset.js";
import { DataProvider } from "./DataProvider.js";
import { ServerPrivateAPI } from "./ServerPrivateAPI.js";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class DataProviderAPI extends DataProvider {

    // filters

    hasStoredFilters() {
        return true;
    }

    fetchFilters() {
        return new Promise((resolve, reject) => {
            return ServerPrivateAPI.fetchSettings().then(data => {
                resolve(data['filters']);
            }).catch(e => {
                reject(e);
            })
        });
    }

    storeFilters(rawFilters) {
        let dataToSend = {
            filters: rawFilters
        };
        return ServerPrivateAPI.postSettings(dataToSend);
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
                if (rawDatasets['datasets'] === null) {
                    resolve(new Map());
                    return;
                }

                let datasets;
                try {
                    datasets = Dataset.parseDatasets(rawDatasets['datasets']);
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
        return ServerPrivateAPI.postData(dataToSend);
    }

    discardDatasets() {
        // ignore
    }
}
