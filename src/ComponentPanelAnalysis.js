import {ComponentPanel} from "./ComponentPanel.js";
import {ComponentAnalysisTable} from "./ComponentAnalysisTable.js"
import {ComponentAnalysisTableGrouped} from "./ComponentAnalysisTableGrouped.js"
import {ComponentAnalysisTableCategories} from "./ComponentAnalysisTableCategories.js";
import {ComponentAnalysisChartGrouped} from "./ComponentAnalysisChartGrouped.js";
import {ComponentAnalysisChartCategories} from "./ComponentAnalysisChartCategories";
import {ComponentOptionsGrouping} from "./ComponentOptionsGrouping";
import {ComponentOptionsCategories} from "./ComponentOptionsCategories";
import {ComponentOptionsCeil} from "./ComponentOptionsCeil";
import {ComponentOptionsFilter} from "./ComponentOptionsFilter";
import {DomBuilder} from "./DomBuilder.js";
import {Analytics} from "./Analytics";

/**
 *
 * @version 2023-04-04
 * @author Patrik Harag
 */
export class ComponentPanelAnalysis extends ComponentPanel {

    #context;

    #transactions = null;
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
            let allTransactions = [];
            datasets.forEach(d => {
                if (d.transactions) {
                    allTransactions = allTransactions.concat(d.transactions);
                }
            })
            this.#transactions = allTransactions;
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

        if (this.#transactions !== null && this.#filters !== null) {
            let grouping = this.#componentGroupingOptions.getGrouping();
            let selectedFilter = this.#componentFilterOptions.getFilter();
            let allFilters = this.#componentFilterOptions.getAllFilters();

            let filteredTransactions = (selectedFilter.filterFunc != null)
                    ? this.#transactions.filter(t => selectedFilter.filterFunc(t)) : this.#transactions;

            if (grouping !== null) {
                let groupedTransactions = grouping.createGroups(filteredTransactions);

                let showCategories = this.#componentCategoriesOptions.isSelected();
                let tableComponent = (showCategories)
                        ? new ComponentAnalysisTableCategories(this.#context, groupedTransactions, allFilters, selectedFilter)
                        : new ComponentAnalysisTableGrouped(this.#context, groupedTransactions, allFilters, selectedFilter);
                this.#contentNode.append(tableComponent.createNode());

                this.#contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredTransactions.length + ", groups: " + groupedTransactions.size)
                ]));

                if (showCategories) {
                    let chartComponent = new ComponentAnalysisChartCategories(this.#context, groupedTransactions, allFilters, selectedFilter);
                    this.#contentNode.append(chartComponent.createNode());
                    chartComponent.refresh();
                }

                let chartComponent = new ComponentAnalysisChartGrouped(this.#context, groupedTransactions, allFilters, selectedFilter);
                this.#contentNode.append(chartComponent.createNode());
                chartComponent.refresh();
            } else {
                let tableComponent = new ComponentAnalysisTable(this.#context, filteredTransactions, allFilters, selectedFilter);
                this.#contentNode.append(tableComponent.createNode());

                this.#contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredTransactions.length)
                ]));
            }

            Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);
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
