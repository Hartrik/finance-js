import { DomBuilder } from "../DomBuilder.js";
import { ComponentPanel } from "../ComponentPanel.js";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentPanelPersistenceLS extends ComponentPanel {

    /** @type Context */
    #context;
    /** @type DataManager */
    #dataManager;

    constructor(context, dataManager) {
        super();
        this.#context = context;
        this.#dataManager = dataManager;
    }

    getTabId() {
        return 'finance-tab-persistence-local-storage';
    }

    getTabName() {
        return [
            DomBuilder.element("i", { class: "fa fa-floppy-o" }),
            DomBuilder.span(" Persistence")
        ];
    }

    createNode() {
        return DomBuilder.div({ class: 'panel-persistence' }, [
            DomBuilder.Bootstrap.alertInfo([
                DomBuilder.par(null, 'Filters and datasets can be stored in browser storage (using the HTML Web Storage API). ' +
                    'Saved data will only be stored on this device and only until the browsing history is deleted.')
            ]),
            DomBuilder.Bootstrap.switchButton('Save', this.#dataManager.isSavingEnabled(), checked => {
                this.#dataManager.enableSaving(checked);
            }),
            DomBuilder.button('Export', { class: 'btn btn-secondary' }, e => {
                this.#dataManager.exportAll();
            })
        ]);
    }
}
