import { DomBuilder } from "../DomBuilder.js";
import { ComponentPanel } from "../ComponentPanel.js";
import { ServerPrivateAPI } from "./ServerPrivateAPI.js";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentPanelPersistenceAPI extends ComponentPanel {

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
        return 'finance-tab-persistence-api';
    }

    getTabName() {
        return [DomBuilder.element("i", { class: "fa fa-floppy-o" }), DomBuilder.span(" Persistence")];
    }

    createNode() {
        return DomBuilder.div({ class: 'panel-persistence' }, [
            DomBuilder.Bootstrap.infoBlock([
                DomBuilder.par(null, "Datasets and filters are saved automatically.")
            ]),
            this._createForceUpdateButton()
        ]);
    }

    _createForceUpdateButton() {
        return DomBuilder.button('Fetch statements from FIO', { class: "btn btn-secondary" }, (e) => {
            ServerPrivateAPI.updateServerData(this.#context).then(d => {
                let dialog = new DomBuilder.BootstrapDialog();
                dialog.setHeaderContent('Info');
                dialog.setBodyContent(DomBuilder.par(null, "Server data updated"));
                dialog.addCloseButton('Close');
                dialog.show(this.#context.dialogAnchor);
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
                dialog.show(this.#context.dialogAnchor);
            });
        });
    }
}
