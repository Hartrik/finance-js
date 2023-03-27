import { Groups } from "./Groups.js";
import { Filters } from "./Filters.js";
import { ComponentTable } from  "./ComponentTable.js"
import { ComponentChart } from "./ComponentChart.js";

/**
 *
 * @version 2022-05-22
 * @author Patrik Harag
 */
export class ComponentTablePanel {

    context;
    filters;
    data;

    componentGroupingOptions;
    componentFilterOptions;
    componentTable;
    componentChart;

    constructor(context) {
        this.context = context;
        this.componentGroupingOptions = new ComponentGroupingOptions(context, () => this.refreshTable())
        this.componentFilterOptions = new ComponentFilterOptions(context, () => this.refreshTable())
        this.componentTable = new ComponentTable(context);
        this.componentChart = new ComponentChart(context);
    }

    createNode() {
        return $(`<div></div>`)
            .append($(`<div class="options-bar"></div>`)
                .append(this.componentGroupingOptions.createNode())
                .append(this.componentFilterOptions.createNode()))
            .append(this.componentTable.createNode())
            .append(this.componentChart.createNode());
    }

    setFilters(filters) {
        this.filters = filters;
    }

    setData(data) {
        this.data = data;
    }

    refreshToolbar() {
        this.componentFilterOptions.setFilters(this.filters);
    }

    refreshTable() {
        if (this.data != null) {
            let grouping = this.componentGroupingOptions.getGrouping();
            let filter = this.componentFilterOptions.getFilter();
            let allFilters = this.componentFilterOptions.getAllFilters();

            if (grouping !== null) {
                let groupedStatements = grouping.createGroups(this.data, filter);
                this.componentTable.refreshWithGrouping(groupedStatements, allFilters, filter)
                this.componentChart.refreshWithGrouping(groupedStatements, allFilters, filter)
            } else {
                this.componentTable.refresh(this.data, allFilters, filter)
                this.componentChart.refresh(this.data, allFilters, filter)
            }
        }
    }
}

/**
 *
 * @version 2022-01-29
 * @author Patrik Harag
 */
class ComponentGroupingOptions {

    context;
    refreshFunction;
    grouping;

    constructor(context, refreshFunction) {
        this.context = context;
        this.refreshFunction = refreshFunction;
        this.grouping = Groups.GROUP_BY_MONTH;
    }

    createNode() {
        let noGroupingButton;
        let weekButton;
        let monthButton;
        let yearButton;
        let allButton;

        let dom = $(`<div class="grouping-component btn-group btn-group-toggle" data-toggle="buttons"></div>`)
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("No grouping").append(noGroupingButton = $(`<input type="radio" name="options" id="grouping-off">`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Week").append(weekButton = $(`<input type="radio" name="options" id="grouping-week">`)))
            .append($(`<label class="btn btn-secondary active"></label>`)
                .text("Month").append(monthButton = $(`<input type="radio" name="options" id="grouping-month" checked>`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Year").append(yearButton = $(`<input type="radio" name="options" id="grouping-year">`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Σ").append(allButton = $(`<input type="radio" name="options" id="grouping-all">`)));

        noGroupingButton.change(() => {
            this.grouping = Groups.NO_GROUPING;
            this.refreshFunction();
        });
        weekButton.change(() => {
            this.grouping = Groups.GROUP_BY_WEEK;
            this.refreshFunction();
        });
        monthButton.change(() => {
            this.grouping = Groups.GROUP_BY_MONTH;
            this.refreshFunction();
        });
        yearButton.change(() => {
            this.grouping = Groups.GROUP_BY_YEAR;
            this.refreshFunction();
        });
        allButton.change(() => {
            this.grouping = Groups.GROUP_ALL;
            this.refreshFunction();
        });

        return dom;
    }

    getGrouping() {
        return this.grouping;
    }
}

/**
 *
 * @version 2022-02-16
 * @author Patrik Harag
 */
class ComponentFilterOptions {

    context;
    refreshFunction;

    filters;

    select;
    input;
    handlers;

    constructor(context, refreshFunction) {
        this.context = context;
        this.refreshFunction = refreshFunction;
        this.handlers = [];
    }

    _createSelect() {
        let select = $(`<select class="btn btn-secondary"></select>`);

        select.on('change', () => {
            this.refreshFunction();
        });

        return select;
    }

    _createSearchBox() {
        let input = $(`<input type="text" class="form-control" placeholder="Search (text or query)"/>`);

        let keyupTimeoutID = 0;
        input.on('keydown', (e) => {
            if (e.key === "Escape"){
                clearTimeout(keyupTimeoutID);
                this.input.val('');
                this.refreshFunction();
            }
        });
        input.on('input', (e) => {
            clearTimeout(keyupTimeoutID);
            keyupTimeoutID = setTimeout(() => {
                this.refreshFunction();
            }, 500);
        });

        return input;
    }

    createNode() {
        this.select = this._createSelect();
        this.input = this._createSearchBox();
        return $(`<form class="filter-component form-inline" action="javascript:void(0);"></form>`)
            .append(this.select)
            .append(this.input);
    }

    setFilters(filters) {
        this.filters = filters;
        this.select.empty();
        this.handlers = [];

        filters.forEach((filter, name) => {
            this._addHandler(this.select, name, filter)
        });
    }

    _addHandler(select, name, filter) {
        select.append($(`<option></option>`).text(name).val(this.handlers.length));
        this.handlers.push(filter);
    }

    getAllFilters() {
        return this.filters;
    }

    getFilter() {
        let selected = this.select.val();
        let filter = this.handlers[selected];

        let search = this.input.val();
        if (search === '') {
            return filter;
        } else {
            return Filters.concatWithSearch(filter, search);
        }
    }
}
