import {Filters} from "./Filters.js";
import {Dataset} from "./Dataset.js";
import FileSaver from 'file-saver';

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class DataManager {

    /** @type NotificationProvider */
    #notificationProvider;
    /** @type DataProvider */
    #dataProvider;

    /** @type function(string)[] */
    #onRawFiltersFetched = [];
    /** @type function(Map<string,Filter>)[] */
    #onFiltersUpdated = [];
    /** @type function(Map<string,Dataset>)[] */
    #onDatasetsLoaded = [];

    /** @type Map<string,Dataset>|null */
    #lastDatasets = null;
    /** @type string|null */
    #lastRawFilters = null;

    #urlDatasetsEnabled;
    #savingEnabled;

    constructor(dataProvider, urlDatasetsEnabled, notificationProvider) {
        this.#dataProvider = dataProvider;
        this.#urlDatasetsEnabled = urlDatasetsEnabled;
        this.#savingEnabled = (this.#dataProvider.hasStoredDatasets() || this.#dataProvider.hasStoredFilters());
        this.#notificationProvider = notificationProvider;
    }

    load() {
        this.#dataProvider.fetchFilters().then((rawJson) => {
            for (let handler of this.#onRawFiltersFetched) {
                handler(rawJson);
            }
            this.updateFilters(rawJson, false, false);
        }).catch(e => {
            this.#handleError('Filters fetch failed', e);

            const filters = Filters.load(Filters.DEFAULT);
            for (let handler of this.#onFiltersUpdated) {
                handler(filters);
            }
        });

        this.#dataProvider.fetchDatasets().then((datasets) => {
            this.updateDatasets(datasets, false, false);
        }).catch(e => {
            this.#handleError('Datasets fetch failed', e);

            const datasets = new Map();
            for (let handler of this.#onDatasetsLoaded) {
                handler(datasets);
            }
        });
    }

    /**
     *
     * @param handler {function(string)}
     */
    addOnRawFiltersFetched(handler) {
        this.#onRawFiltersFetched.push(handler);
    }

    /**
     *
     * @param handler {function(Map<string,Filter>)}
     */
    addOnFiltersUpdated(handler) {
        this.#onFiltersUpdated.push(handler);
    }

    /**
     *
     * @param handler {function(Map<string,Dataset>)}
     */
    addOnDatasetsLoaded(handler) {
        this.#onDatasetsLoaded.push(handler);
    }

    isSavingEnabled() {
        return this.#savingEnabled;
    }

    async enableSaving(enabled) {
        this.#savingEnabled = enabled;
        if (enabled) {
            if (this.#lastRawFilters) {
                await this.#dataProvider.storeFilters(this.#lastRawFilters).catch(e => {
                    this.#handleError('Error while saving filters', e);
                });
                await this.#dataProvider.storeDatasets(this.#lastDatasets).catch(e => {
                    this.#handleError('Error while saving datasets', e);
                });
                this.#handleInfo("Info", "Saving successful");
            }
        } else {
            this.#dataProvider.discardDatasets();
            this.#dataProvider.discardFilters();
        }
    }

    /**
     *
     * @param rawJson {string}
     * @param showSuccessMessage {boolean}
     * @param save {boolean}
     */
    updateFilters(rawJson, showSuccessMessage, save) {
        function parseUnchecked(string) {
            let filtersJson;
            if (string.trim() !== "") {
                filtersJson = JSON.parse(string);
                if (filtersJson.length === 0) {
                    filtersJson = Filters.DEFAULT;
                }
                let filters = Filters.load(filtersJson);
                Filters.testFilters(filters);
                return filters;
            } else {
                return Filters.load(Filters.DEFAULT);
            }
        }

        // parse filters
        let filters;
        try {
            filters = parseUnchecked(rawJson);
        } catch (e) {
            this.#handleError('Error while parsing filters', e);
            filters = Filters.load(Filters.DEFAULT);
            for (let handler of this.#onFiltersUpdated) {
                handler(filters);
            }
            return;
        }

        // apply filters
        try {
            for (let handler of this.#onFiltersUpdated) {
                handler(filters);
            }
        } catch (e) {
            this.#handleError('Error while applying filters', e);
            return;
        }
        this.#lastRawFilters = rawJson;

        // save filters
        if (this.#savingEnabled && save) {
            this.#dataProvider.storeFilters(rawJson).then(ok => {
                if (showSuccessMessage) {
                    this.#handleInfo('Filters updated', 'Filters updated & saved successfully');
                }
            }).catch(e => {
                this.#handleError('Error while saving filters', e);
            });
        } else {
            if (showSuccessMessage) {
                this.#handleInfo('Filters updated', 'Filters updated successfully');
            }
        }
    }

    async updateDatasets(datasets, showSuccessMessage, save) {
        let errors = 0;
        for (let [key, dataset] of datasets) {
            await dataset.loadTransactions(this.#urlDatasetsEnabled).catch(e => {
                errors++;
                console.log("Dataset '" + dataset.name + "' loading failed: " + (e.statusText ? e.statusText : e));
            });
        }

        if (errors) {
            this.#handleError('Error', 'Errors found in dataset(s)');
        }

        for (let handler of this.#onDatasetsLoaded) {
            handler(datasets);
        }
        this.#lastDatasets = Dataset.copyDatasets(datasets);

        if (!errors) {
            if (this.#savingEnabled && save) {
                this.#dataProvider.storeDatasets(datasets).then(ok => {
                    if (showSuccessMessage) {
                        this.#handleInfo('Datasets updated', 'Datasets updated & saved successfully');
                    }
                }).catch(e => {
                    this.#handleError('Error while saving datasets', e);
                });
            } else {
                if (showSuccessMessage) {
                    this.#handleInfo('Datasets updated', 'Datasets updated successfully');
                }
            }
        }
    }

    exportAll() {
        try {
            const json = {};
            if (this.#lastRawFilters) {
                json['filters'] = JSON.parse(this.#lastRawFilters);
            }
            if (this.#lastDatasets) {
                json['datasets'] = JSON.parse(Dataset.serializeDatasets(this.#lastDatasets));
            }
            const jsonAsString = JSON.stringify(json, null, '  ');

            const fileName = 'finance-js.json';
            const blob = new Blob([ jsonAsString ], { type: "application/json;charset=utf-8" });
            FileSaver.saveAs(blob, fileName);
        } catch (e) {
            this.#handleError('Export failed', e);
        }
    }

    #handleInfo(title, description) {
        this.#notificationProvider.handleInfo(title, description);
    }

    #handleError(title, e) {
        return this.#notificationProvider.handleError(title, e);
    }
}
