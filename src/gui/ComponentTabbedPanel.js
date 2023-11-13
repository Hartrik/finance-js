
import $ from "jquery";

/**
 *
 * @version 2023-03-29
 * @author Patrik Harag
 */
export class ComponentTabbedPanel {

    static SELECTED_TAB_ID = 'finance-tab-analysis';

    #panels = [];


    /**
     *
     * @param component {ComponentPanel}
     */
    addPanel(component) {
        this.#panels.push(component);
    }

    createNode() {
        let tabsNav = $(`<ul class="nav nav-tabs" role="tablist"></ul>`);
        let tabsContent = $(`<div class="tab-content"></div>`);

        this.#panels.forEach(component => {
            const tabId = component.getTabId();
            const tabName = component.getTabName();
            const selected = (tabId === ComponentTabbedPanel.SELECTED_TAB_ID);
            const content = component.createNode();
            this._appendTab(tabsNav, tabsContent, tabId, tabName, selected, content);
        });

        return $(`<div></div>`)
            .append(tabsNav)
            .append(tabsContent);
    }

    _appendTab(tabsNav, tabsContent, id, title, selected, content) {
        let navId = id + "-nav";

        tabsNav.append($(`<li class="nav-item" role="presentation"></li>`)
            .append($(`<button type="button" class="nav-link ${selected ? 'active' : ''}" id="${navId}" data-bs-toggle="tab" data-bs-target="#${id}" role="tab" aria-controls="${id}" aria-selected="${selected}"></button>`)
                .append(title)));

        tabsContent.append($(`<div class="tab-pane fade ${selected ? 'show active' : ''}" id="${id}" role="tabpanel" aria-labelledby="${navId}"></div>`)
            .append(content));
    }
}
