import {Filters} from "./Filters";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentFilterOptions {

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
            if (e.key === "Escape") {
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