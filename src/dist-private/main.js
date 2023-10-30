
import { DomBuilder } from "../DomBuilder.js";
import { Context } from "../Context.js";
import { DataProviderAPI } from "./DataProviderAPI.js";
import { DataManager } from "../DataManager.js";
import { ComponentTabbedPanel } from "../ComponentTabbedPanel.js";
import { ComponentPanelFilters } from "../ComponentPanelFilters.js";
import { ComponentPanelDatasets } from "../ComponentPanelDatasets.js";
import { ComponentPanelAnalysis } from "../ComponentPanelAnalysis.js";
import { ComponentPanelPersistenceAPI } from "./ComponentPanelPersistenceAPI.js";

// for logged users

export function builder() {
    return new Builder();
}

/**
 *
 * @version 2023-10-30
 * @author Patrik Harag
 */
class Builder {

    #csrfParameterName;
    #csrfToken;

    setCsrf(csrfParameterName, csrfToken) {
        this.#csrfParameterName = csrfParameterName;
        this.#csrfToken = csrfToken;
        return this;
    }
    build() {
        if (!this.#csrfParameterName) {
            throw 'CSRF parameter name not set';
        }
        if (!this.#csrfToken) {
            throw 'CSRF token not set';
        }

        const dialogAnchorNode = DomBuilder.div({ class: 'finance-dialog-anchor finance-component' });
        document.body.prepend(dialogAnchorNode[0]);

        let context = new Context(dialogAnchorNode, this.#csrfParameterName, this.#csrfToken);

        let dataProvider = new DataProviderAPI(context);
        let dataManager = new DataManager(context, dataProvider, true);

        let componentTabbedPanel = new ComponentTabbedPanel();
        componentTabbedPanel.addPanel(new ComponentPanelDatasets(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelFilters(context, dataManager));
        componentTabbedPanel.addPanel(new ComponentPanelAnalysis(context, dataManager, false));
        componentTabbedPanel.addPanel(new ComponentPanelPersistenceAPI(context, dataManager));

        let node = componentTabbedPanel.createNode();
        node.addClass('finance-component');
        setTimeout(() => dataManager.load());
        return node[0];
    }
}
