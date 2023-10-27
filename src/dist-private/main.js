
import { Context } from "../Context.js";
import { DataProviderAPI } from "./DataProviderAPI.js";
import { DataManager } from "../DataManager.js";
import { ComponentTabbedPanel } from "../ComponentTabbedPanel.js";
import { ComponentPanelFilters } from "../ComponentPanelFilters.js";
import { ComponentPanelDatasets } from "../ComponentPanelDatasets.js";
import { ComponentPanelAnalysis } from "../ComponentPanelAnalysis.js";
import { ComponentPanelPersistenceAPI } from "./ComponentPanelPersistenceAPI.js";
import $ from "jquery";

// for logged users

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

        let dataProvider = new DataProviderAPI(context);
        let dataManager = new DataManager(context, dataProvider, true);

        let componentTabbedPanel = new ComponentTabbedPanel();
        componentTabbedPanel.addPanel(new ComponentPanelDatasets(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelFilters(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelAnalysis(context, dataManager, false));
        componentTabbedPanel.addPanel(new ComponentPanelPersistenceAPI(context, dataManager));

        let node = componentTabbedPanel.createNode();
        setTimeout(() => dataManager.load());
        return node;
    }
}
