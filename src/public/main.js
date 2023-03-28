
import { ComponentMain } from "../ComponentMain.js";
import { Context } from "../Context.js";
import { DataManagerForPublicUse } from "./DataManagerForPublicUse.js";

import EXAMPLE_DATA from "../../examples/data_simple.csv";
import EXAMPLE_FILTER from "../../examples/filters.json";


export function builder() {
    return new Builder();
}

/**
 *
 * @version 2023-03-27
 * @author Patrik Harag
 */
class Builder {

    #dialogAnchorSelector;
    #csrfParameterName;
    #csrfToken;

    #dataManager;

    setDialogAnchor(dialogAnchorSelector) {
        this.#dialogAnchorSelector = dialogAnchorSelector;
        return this;
    }

    setCsrf(csrfParameterName, csrfToken) {
        this.#csrfParameterName = csrfParameterName;
        this.#csrfToken = csrfToken;
        return this;
    }

    initDataManager(defaultFilter, defaultDataset, defaultDatasetName, defaultDatasetDataType) {
        this.#dataManager = new DataManagerForPublicUse(defaultFilter, defaultDataset, defaultDatasetName, defaultDatasetDataType);
        return this;
    }

    initDataManagerDefault() {
        this.#dataManager = new DataManagerForPublicUse(EXAMPLE_FILTER, EXAMPLE_DATA, 'dataset_1', 'csv-simple');
        return this;
    }

    build() {
        if (!this.#dialogAnchorSelector) {
            throw 'Dialog anchor not set';
        }
        if (!this.#csrfParameterName) {
            throw 'CSRF parameter name not set';
        }
        if (!this.#csrfToken) {
            throw 'CSRF token not set';
        }
        let context = new Context(this.#dialogAnchorSelector, this.#csrfParameterName, this.#csrfToken);

        if (!this.#dataManager) {
            throw 'Data manager not initialized';
        }
        let componentMain = new ComponentMain(context, this.#dataManager);

        return componentMain.createNode();
    }
}
