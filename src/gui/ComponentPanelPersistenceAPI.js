import { DomBuilder } from "./DomBuilder.js";
import { ComponentPanel } from "./ComponentPanel.js";
import { ServerPrivateAPI } from "../ServerPrivateAPI.js";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class ComponentPanelPersistenceAPI extends ComponentPanel {

    /** @type Controller */
    #controller;

    constructor(controller) {
        super();
        this.#controller = controller;
    }

    getTabId() {
        return 'finance-tab-persistence-api';
    }

    getTabName() {
        return [DomBuilder.element("i", { class: "fa fa-floppy-o" }), DomBuilder.span(" Persistence")];
    }

    createNode() {
        return DomBuilder.div({ class: 'panel-persistence' }, [
            DomBuilder.Bootstrap.alertInfo([
                DomBuilder.par(null, "Datasets and filters are saved automatically.")
            ]),
            this.#createForceUpdateButton(), DomBuilder.element('br'),
            this.#createForceUpdateButtonIncremental(), DomBuilder.element('br'),
            this.#createExportButton()
        ]);
    }

    #createForceUpdateButton() {
        return DomBuilder.button('Update server data', { class: "btn btn-secondary" }, (e) => {
            this.updateServerData(false);
        });
    }

    #createForceUpdateButtonIncremental() {
        return DomBuilder.button('Update server data – incremental', { class: "btn btn-secondary" }, (e) => {
            this.updateServerData(true);
        });
    }

    updateServerData(incrementalUpdate) {
        ServerPrivateAPI.updateServerData(incrementalUpdate).then(d => {
            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Info');
            dialog.setBodyContent(DomBuilder.par(null, "Server data updated"));
            dialog.addCloseButton('Close');
            dialog.show(this.#controller.getDialogAnchor());

            // load changes
            this.#controller.getDataManager().load();

        }).catch(e => {
            let msg = e.statusText ? e.statusText : e;
            console.log('API call failed: ' + msg)

            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent("Error");
            dialog.setBodyContent([
                DomBuilder.par(null, 'API call failed: '),
                DomBuilder.element('code', null, msg)
            ]);
            dialog.addCloseButton('Close');
            dialog.show(this.#controller.getDialogAnchor());
        });
    }

    #createExportButton() {
        return DomBuilder.button('Export', { class: 'btn btn-secondary' }, e => {
            this.#controller.getDataManager().exportAll();
        })
    }
}
