import {ComponentPanel} from "./ComponentPanel.js";
import {ComponentAnalysisTable} from "./ComponentAnalysisTable.js"
import {ComponentAnalysisTableGrouped} from "./ComponentAnalysisTableGrouped.js"
import {ComponentAnalysisChartGrouped} from "./ComponentAnalysisChartGrouped.js";
import {ComponentGroupingOptions} from "./ComponentGroupingOptions";
import {ComponentFilterOptions} from "./ComponentFilterOptions";
import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @version 2023-04-01
 * @author Patrik Harag
 */
export class ComponentPanelAnalysis extends ComponentPanel {

    context;

    statements = null;
    filters = null;

    componentGroupingOptions;
    componentFilterOptions;
    contentNode = DomBuilder.div();

    constructor(context, dataManager) {
        super();
        this.context = context;
        this.componentGroupingOptions = new ComponentGroupingOptions(context, () => this.refreshTable())
        this.componentFilterOptions = new ComponentFilterOptions(context, () => this.refreshTable())

        dataManager.addOnFiltersUpdated(filters => {
            this.componentFilterOptions.setFilters(filters);
            this.filters = filters;
            this.refreshTable();
        });
        dataManager.addOnDatasetsLoaded(datasets => {
            let allStatements = [];
            datasets.forEach(d => {
                if (d.statements) {
                    allStatements = allStatements.concat(d.statements);
                }
            })
            this.statements = allStatements;
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
                this.componentGroupingOptions.createNode(),
                this.componentFilterOptions.createNode()
            ]),
            this.contentNode
        ]);
    }

    refreshTable() {
        this.contentNode.empty();

        if (this.statements !== null && this.filters !== null) {
            let grouping = this.componentGroupingOptions.getGrouping();
            let selectedFilter = this.componentFilterOptions.getFilter();
            let allFilters = this.componentFilterOptions.getAllFilters();

            let filteredStatements = (selectedFilter.filterFunc != null)
                    ? this.statements.filter(s => selectedFilter.filterFunc(s)) : this.statements;

            if (grouping !== null) {
                let groupedStatements = grouping.createGroups(filteredStatements);

                let tableComponent = new ComponentAnalysisTableGrouped(this.context, groupedStatements, allFilters, selectedFilter);
                this.contentNode.append(tableComponent.createNode());

                this.contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredStatements.length + ", groups: " + groupedStatements.size)
                ]));

                let chartComponent = new ComponentAnalysisChartGrouped(this.context, groupedStatements, allFilters, selectedFilter);
                this.contentNode.append(chartComponent.createNode());
            } else {
                let tableComponent = new ComponentAnalysisTable(this.context, filteredStatements, allFilters, selectedFilter);
                this.contentNode.append(tableComponent.createNode());

                this.contentNode.append(DomBuilder.div({ class: 'summary-panel' }, [
                    DomBuilder.span("transactions: " + filteredStatements.length)
                ]));
            }
        }
    }
}
