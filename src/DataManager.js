import {Filters} from "./Filters.js";
import {Dataset} from "./Dataset.js";
import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class DataManager {

    /** @type Context */
    #context;
    /** @type DataProvider */
    #dataProvider;

    /** @type function(string)[] */
    #onRawFiltersFetched = [];
    /** @type function(Map<string,Filter>)[] */
    #onFiltersUpdated = [];
    /** @type function(Map<string,Dataset>)[] */
    #onDatasetsLoaded = [];

    #lastDatasets = null;
    #lastFilters = null;

    #urlDatasetsEnabled;
    #savingEnabled;

    constructor(context, dataProvider, urlDatasetsEnabled) {
        this.#context = context;
        this.#dataProvider = dataProvider;
        this.#urlDatasetsEnabled = urlDatasetsEnabled;
        this.#savingEnabled = (this.#dataProvider.hasStoredDatasets() || this.#dataProvider.hasStoredFilters());
    }

    load() {
        this.#dataProvider.fetchFilters().then((rawJson) => {
            for (let handler of this.#onRawFiltersFetched) {
                handler(rawJson);
            }
            this.updateFilters(rawJson, false, false);
        }).catch(e => {
            this.#handleError('Filters fetch failed', e);
        });

        this.#dataProvider.fetchDatasets().then((datasets) => {
            this.updateDatasets(datasets, false, false);
        }).catch(e => {
            this.#handleError('Datasets fetch failed', e);
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
            if (this.#lastFilters) {
                await this.#dataProvider.storeFilters(this.#lastFilters).catch(e => {
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
        this.#lastFilters = rawJson;

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
            await dataset.loadStatements(this.#urlDatasetsEnabled).catch(e => {
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

    #handleInfo(title, description) {
        console.log(title + ': ' + description);

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent(title);
        dialog.setBodyContent(DomBuilder.par(null, description));
        dialog.addCloseButton('Close');
        dialog.show(this.#context.dialogAnchor);
    }

    #handleError(title, e) {
        const msg = e.statusText ? e.statusText : e;
        console.log(title + ': ' + msg);

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent("Error");
        dialog.setBodyContent([
            DomBuilder.par(null, title + ': '),
            DomBuilder.element('code', null, msg)
        ]);
        dialog.addCloseButton('Close');
        dialog.show(this.#context.dialogAnchor);
    }
}
