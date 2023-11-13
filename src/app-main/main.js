
import { DomBuilder } from "../gui/DomBuilder.js";
import { DataProviderAPI } from "../DataProviderAPI.js";
import { DataProviderLocalStorage } from "../DataProviderLocalStorage";
import { DataManager } from "../DataManager.js";
import { Dataset } from "../Dataset";
import { Controller } from "../Controller";
import { ComponentTabbedPanel } from "../gui/ComponentTabbedPanel.js";
import { ComponentPanelFilters } from "../gui/ComponentPanelFilters.js";
import { ComponentPanelDatasets } from "../gui/ComponentPanelDatasets.js";
import { ComponentPanelAnalysis } from "../gui/ComponentPanelAnalysis.js";
import { ComponentPanelPersistenceAPI } from "../gui/ComponentPanelPersistenceAPI.js";
import { ComponentPanelPersistenceLocalStorage } from "../gui/ComponentPanelPersistenceLocalStorage";
import { ServerPrivateAPI } from "../ServerPrivateAPI";
import { DialogNotificationProvider } from "../gui/DialogNotificatonProvider";

import EXAMPLE_DATA from "../../examples/data_simple.csv";
import EXAMPLE_FILTER from "../../examples/filters.json";

export function builder() {
    return new Builder();
}

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
class Builder {

    #dataProvider = null;

    #urlDatasetEnabled = false;

    #categoriesEnabled = (window.innerWidth >= 1200);

    setPersistenceLocalStorage() {
        let datasets = new Map();
        datasets.set('example', new Dataset('example', 'csv-simple', EXAMPLE_DATA));
        this.#dataProvider = new DataProviderLocalStorage(EXAMPLE_FILTER, datasets);
        return this;
    }

    setPersistenceHttp(csrfParameterName, csrfToken) {
        this.#dataProvider = new DataProviderAPI();
        ServerPrivateAPI.csrfParameterName = csrfParameterName;
        ServerPrivateAPI.csrfToken = csrfToken;
        return this;
    }

    setCategoriesEnabled(enabled) {
        this.#categoriesEnabled = enabled;
        return this;
    }

    setUrlDatasetsEnabled(enabled) {
        this.#urlDatasetEnabled = enabled;
        return this;
    }

    build() {
        if (this.#dataProvider === null) {
            throw 'Data provider not set';
        }

        const dialogAnchorNode = DomBuilder.div({ class: 'finance-dialog-anchor finance-component' });
        document.body.prepend(dialogAnchorNode[0]);

        let notificationProvider = new DialogNotificationProvider(dialogAnchorNode);
        let dataManager = new DataManager(this.#dataProvider, this.#urlDatasetEnabled, notificationProvider);
        let controller = new Controller(dialogAnchorNode, dataManager);

        let componentTabbedPanel = new ComponentTabbedPanel();
        componentTabbedPanel.addPanel(new ComponentPanelDatasets(controller));
        componentTabbedPanel.addPanel(new ComponentPanelFilters(controller));
        componentTabbedPanel.addPanel(new ComponentPanelAnalysis(controller, this.#categoriesEnabled));
        if (this.#dataProvider instanceof DataProviderLocalStorage) {
            componentTabbedPanel.addPanel(new ComponentPanelPersistenceLocalStorage(controller));
        } else {
            componentTabbedPanel.addPanel(new ComponentPanelPersistenceAPI(controller));
        }

        let node = componentTabbedPanel.createNode();
        node.addClass('finance-component');
        setTimeout(() => dataManager.load());
        return node[0];
    }
}
