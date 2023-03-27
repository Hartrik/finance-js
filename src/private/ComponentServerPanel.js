import { ServerPrivateAPI } from "./ServerPrivateAPI.js";

/**
 *
 * @version 2022-09-17
 * @author Patrik Harag
 */
export class ComponentServerPanel {

    context;
    dataChangedTrigger;

    constructor(context, dataChangedTrigger) {
        this.context = context;
        this.dataChangedTrigger = dataChangedTrigger;
    }

    getTabId() {
        return 'finance-tab-server-tools';
    }

    getTabName() {
        return 'Tools';
    }

    _createForceUpdateButton() {
        let button = $(`<a href="javascript:void(0)" class="btn btn-secondary">Fetch statements from FIO</a>`);
        button.on("click", (e) => {
            ServerPrivateAPI.updateServerData(this.context).then(d => {
                alert("Server data updated");
            }).catch(e => {
                console.log(e);
                alert("Failed: " + (e.statusText ? e.statusText : e));
            });
        });
        return button;
    }

    createNode() {
        return $(`<div class="panel-data"></div>`)
            .append($(`<p></p>`).append(this._createForceUpdateButton()));
    }
}
