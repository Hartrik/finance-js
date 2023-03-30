
import { ComponentMain } from "../ComponentMain.js";
import { Context } from "../Context.js";
import { DataProviderAPI } from "./DataProviderAPI.js";
import { ComponentServerPanel } from "./ComponentServerPanel.js";

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
        let context = new Context(this.#dialogAnchorSelector, this.#csrfParameterName, this.#csrfToken);

        let componentMain = new ComponentMain(context, new DataProviderAPI(context));
        componentMain.setUrlDatasetsEnabled(true);

        let componentServerPanel = new ComponentServerPanel(context, (data) => componentMain.updateData(data));
        componentMain.addPanelComponent(componentServerPanel);

        return componentMain.createNode();
    }
}
