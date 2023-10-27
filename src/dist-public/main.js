
import { Context } from "../Context.js";
import { Dataset } from "../Dataset.js";
import { DataProviderLocalStorage } from "./DataProviderLocalStorage.js";
import { DataManager } from "../DataManager.js";
import { ComponentTabbedPanel } from "../ComponentTabbedPanel.js";
import { ComponentPanelAnalysis } from "../ComponentPanelAnalysis.js";
import { ComponentPanelFilters } from "../ComponentPanelFilters.js";
import { ComponentPanelDatasets } from "../ComponentPanelDatasets.js";
import { ComponentPanelPersistenceLS } from "./ComponentPanelPersistenceLS.js";
import $ from "jquery";

import EXAMPLE_DATA from "../../examples/data_simple.csv";
import EXAMPLE_FILTER from "../../examples/filters.json";


export function builder() {
    return new Builder();
}

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
class Builder {

    #dialogAnchorSelector;
    #csrfParameterName;
    #csrfToken;

    setDialogAnchor(dialogAnchorSelector) {
        this.#dialogAnchorSelector = dialogAnchorSelector;
        return this;
    }

    setCsrf(csrfParameterName, csrfToken) {
        this.#csrfParameterName = csrfParameterName;
        this.#csrfToken = csrfToken;
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
        let dialogAnchorNode = $(this.#dialogAnchorSelector);
        let context = new Context(dialogAnchorNode, this.#csrfParameterName, this.#csrfToken);

        let datasets = new Map();
        datasets.set('example', new Dataset('example', 'csv-simple', EXAMPLE_DATA));

        let dataProvider = new DataProviderLocalStorage(EXAMPLE_FILTER, datasets);

        let dataManager = new DataManager(context, dataProvider, false);

        let componentTabbedPanel = new ComponentTabbedPanel();
        componentTabbedPanel.addPanel(new ComponentPanelDatasets(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelFilters(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelAnalysis(context, dataManager, window.innerWidth >= 1200));
        componentTabbedPanel.addPanel(new ComponentPanelPersistenceLS(context, dataManager));

        let node = componentTabbedPanel.createNode();
        setTimeout(() => dataManager.load());
        return node;
    }
}
