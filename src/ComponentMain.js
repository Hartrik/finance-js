import { ComponentFiltersPanel } from "./ComponentFiltersPanel.js"
import { ComponentTablePanel } from  "./ComponentTablePanel.js"
import { ComponentDataPanel } from  "./ComponentDataPanel.js"
import { DomBuilder } from "./DomBuilder.js";

/**
 *
 * @version 2023-03-29
 * @author Patrik Harag
 */
export class ComponentMain {

    context;
    dataManager;

    /** @type {ComponentDataPanel} */
    componentDataPanel = null;
    /** @type {ComponentFiltersPanel} */
    componentFiltersPanel;
    /** @type {ComponentTablePanel} */
    componentTablePanel;
    componentsAdditionalPanels = [];

    dataSet = false;
    filtersSet = false;

    /**
     *
     * @param context Context
     * @param dataManager DataManager
     */
    constructor(context, dataManager) {
        this.context = context;
        this.dataManager = dataManager;
        this.componentTablePanel = new ComponentTablePanel(context);
        this.componentFiltersPanel = new ComponentFiltersPanel(context, dataManager,
            (filters) => this._onFiltersChanged(filters))
        this.componentDataPanel = new ComponentDataPanel(context, dataManager,
            (data) => this.updateData(data));
    }

    setUrlDatasetsEnabled(enable) {
        this.componentDataPanel.setUrlDatasetsEnabled(enable);
    }

    addPanelComponent(component) {
        this.componentsAdditionalPanels.push(component);
    }

    createNode() {
        let tabsNav = $(`<ul class="nav nav-tabs" role="tablist"></ul>`);
        let tabsContent = $(`<div class="tab-content"></div>`);

        this._appendTab(tabsNav, tabsContent, "finance-tab-data",
                [DomBuilder.element("i", { class: "fa fa-cog" }), DomBuilder.span(" Datasets")],
                false, this.componentDataPanel.createNode());
        this._appendTab(tabsNav, tabsContent, "finance-tab-filters",
                [DomBuilder.element("i", { class: "fa fa-cog" }), DomBuilder.span(" Filters")],
                false, this.componentFiltersPanel.createNode());
        this._appendTab(tabsNav, tabsContent, "finance-tab-table", "Exploration", true, this.componentTablePanel.createNode());
        this.componentsAdditionalPanels.forEach(component => {
            this._appendTab(tabsNav, tabsContent, component.getTabId(), component.getTabName(), false, component.createNode());
        });

        return $(`<div></div>`)
            .append(tabsNav)
            .append(tabsContent);
    }

    _appendTab(tabsNav, tabsContent, id, title, selected, content) {
        let navId = id + "-nav";

        tabsNav.append($(`<li class="nav-item"></li>`)
            .append($(`<a class="nav-link ${selected ? 'active' : ''}" id="${navId}" data-toggle="tab" href="#${id}" role="tab" aria-controls="${id}" aria-selected="${selected}"></a>`)
                .append(title)));

        tabsContent.append($(`<div class="tab-pane fade ${selected ? 'show active' : ''}" id="${id}" role="tabpanel" aria-labelledby="${navId}"></div>`)
            .append(content));
    }

    _onFiltersChanged(filters) {
        this.filtersSet = true;
        this.componentTablePanel.setFilters(filters);
        this.componentTablePanel.refreshToolbar();
        if (this.dataSet) {
            this.componentTablePanel.refreshTable();
        }
    }

    updateData(data) {
        this.dataSet = true;
        this.componentTablePanel.setData(data);
        if (this.filtersSet) {
            this.componentTablePanel.refreshTable();
        }
    }
}
