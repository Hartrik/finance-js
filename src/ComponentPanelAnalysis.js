import {ComponentPanel} from "./ComponentPanel.js";
import {ComponentAnalysisTable} from "./ComponentAnalysisTable.js"
import {ComponentAnalysisChart} from "./ComponentAnalysisChart.js";
import {ComponentGroupingOptions} from "./ComponentGroupingOptions";
import {ComponentFilterOptions} from "./ComponentFilterOptions";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentPanelAnalysis extends ComponentPanel {

    context;

    statements = null;
    filters = null;

    componentGroupingOptions;
    componentFilterOptions;
    componentTable;
    componentChart;

    constructor(context, dataManager) {
        super();
        this.context = context;
        this.componentGroupingOptions = new ComponentGroupingOptions(context, () => this.refreshTable())
        this.componentFilterOptions = new ComponentFilterOptions(context, () => this.refreshTable())
        this.componentTable = new ComponentAnalysisTable(context);
        this.componentChart = new ComponentAnalysisChart(context);

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
        return $(`<div></div>`)
            .append($(`<div class="options-bar"></div>`)
                .append(this.componentGroupingOptions.createNode())
                .append(this.componentFilterOptions.createNode()))
            .append(this.componentTable.createNode())
            .append(this.componentChart.createNode());
    }

    refreshTable() {
        if (this.statements !== null && this.filters !== null) {
            let grouping = this.componentGroupingOptions.getGrouping();
            let filter = this.componentFilterOptions.getFilter();
            let allFilters = this.componentFilterOptions.getAllFilters();

            if (grouping !== null) {
                let groupedStatements = grouping.createGroups(this.statements, filter);
                this.componentTable.refreshWithGrouping(groupedStatements, allFilters, filter)
                this.componentChart.refreshWithGrouping(groupedStatements, allFilters, filter)
            } else {
                this.componentTable.refresh(this.statements, allFilters, filter)
                this.componentChart.refresh(this.statements, allFilters, filter)
            }
        }
    }
}
