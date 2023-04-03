import {ComponentPanel} from "./ComponentPanel.js";
import {ComponentAnalysisTable} from "./ComponentAnalysisTable.js"
import {ComponentAnalysisTableGrouped} from "./ComponentAnalysisTableGrouped.js"
import {ComponentAnalysisTableCategories} from "./ComponentAnalysisTableCategories.js";
import {ComponentAnalysisChartGrouped} from "./ComponentAnalysisChartGrouped.js";
import {ComponentOptionsGrouping} from "./ComponentOptionsGrouping";
import {ComponentOptionsCategories} from "./ComponentOptionsCategories";
import {ComponentOptionsCeil} from "./ComponentOptionsCeil";
import {ComponentOptionsFilter} from "./ComponentOptionsFilter";
import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentPanelAnalysis extends ComponentPanel {

    #context;

    #statements = null;
    #filters = null;

    #componentGroupingOptions;
    #componentCategoriesOptions;
    #componentCeilOptions;
    #componentFilterOptions;
    #contentNode = DomBuilder.div();

    constructor(context, dataManager, enableCategories) {
        super();
        this.#context = context;
        this.#componentGroupingOptions = new ComponentOptionsGrouping(() => {
            this.#componentCategoriesOptions.setDisabled(this.#componentGroupingOptions.getGrouping() === null);
            this.refreshTable();
        })
        this.#componentCategoriesOptions = new ComponentOptionsCategories(enableCategories, (selected) => this.refreshTable());
        this.#componentCeilOptions = new ComponentOptionsCeil(() => this.#refreshCeiling());
        this.#componentFilterOptions = new ComponentOptionsFilter(() => this.refreshTable());

        dataManager.addOnFiltersUpdated(filters => {
            this.#componentFilterOptions.setFilters(filters);
            this.#filters = filters;
            this.refreshTable();
        });
        dataManager.addOnDatasetsLoaded(datasets => {
            let allStatements = [];
            datasets.forEach(d => {
                if (d.statements) {
                    allStatements = allStatements.concat(d.statements);
                }
            })
            this.#statements = allStatements;
            this.refreshTable();
        });
    }

    getTabId() {
        return 'finance-tab-analysis';
    }

    getTabName() {
        return 'Exploration';
    }

    createNode() {
        return DomBuilder.div({ class: 'panel-analysis' }, [
            DomBuilder.div({ class: 'options-bar' }, [
                this.#componentGroupingOptions.createNode(),
                this.#componentCategoriesOptions.createNode(),
                this.#componentCeilOptions.createNode(),
                this.#componentFilterOptions.createNode()
            ]),
            this.#contentNode
        ]);
    }

    refreshTable() {
        this.#refreshCeiling();
        this.#contentNode.empty();

        if (this.#statements !== null && this.#filters !== null) {
            let grouping = this.#componentGroupingOptions.getGrouping();
            let selectedFilter = this.#componentFilterOptions.getFilter();
            let allFilters = this.#componentFilterOptions.getAllFilters();

            let filteredStatements = (selectedFilter.filterFunc != null)
                    ? this.#statements.filter(s => selectedFilter.filterFunc(s)) : this.#statements;

            if (grouping !== null) {
                let groupedStatements = grouping.createGroups(filteredStatements);

                let showCategories = this.#componentCategoriesOptions.isSelected();
                let tableComponent = (showCategories)
                        ? new ComponentAnalysisTableCategories(this.#context, groupedStatements, allFilters, selectedFilter)
                        : new ComponentAnalysisTableGrouped(this.#context, groupedStatements, allFilters, selectedFilter);
                this.#contentNode.append(tableComponent.createNode());

                this.#contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredStatements.length + ", groups: " + groupedStatements.size)
                ]));

                let chartComponent = new ComponentAnalysisChartGrouped(this.#context, groupedStatements, allFilters, selectedFilter);
                this.#contentNode.append(chartComponent.createNode());
                chartComponent.refresh();
            } else {
                let tableComponent = new ComponentAnalysisTable(this.#context, filteredStatements, allFilters, selectedFilter);
                this.#contentNode.append(tableComponent.createNode());

                this.#contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredStatements.length)
                ]));
            }
        }
    }

    #refreshCeiling() {
        let selected = this.#componentCeilOptions.isSelected();
        if (selected) {
            this.#contentNode.removeClass('hide-value-floating-part');
        } else {
            this.#contentNode.addClass('hide-value-floating-part');
        }
    }
}
