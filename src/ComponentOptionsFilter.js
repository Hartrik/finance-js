import {Filters} from "./Filters";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentOptionsFilter {

    #refreshFunction;

    #filters;

    #inputSelect;
    #inputSearch;
    #handlers;

    constructor(refreshFunction) {
        this.#refreshFunction = refreshFunction;
        this.#handlers = [];
    }

    _createSelect() {
        let select = $(`<select class="btn btn-secondary"></select>`);

        select.on('change', () => {
            this.#refreshFunction();
        });

        return select;
    }

    _createSearchBox() {
        let input = $(`<input type="text" class="form-control" placeholder="Search (text or query)"/>`);

        let keyupTimeoutID = 0;
        input.on('keydown', (e) => {
            if (e.key === "Escape") {
                clearTimeout(keyupTimeoutID);
                this.#inputSearch.val('');
                this.#refreshFunction();
            }
        });
        input.on('input', (e) => {
            clearTimeout(keyupTimeoutID);
            keyupTimeoutID = setTimeout(() => {
                this.#refreshFunction();
            }, 500);
        });

        return input;
    }

    createNode() {
        this.#inputSelect = this._createSelect();
        this.#inputSearch = this._createSearchBox();
        return $(`<form class="filter-component form-inline" action="javascript:void(0);"></form>`)
            .append(this.#inputSelect)
            .append(this.#inputSearch);
    }

    setFilters(filters) {
        this.#filters = filters;
        this.#inputSelect.empty();
        this.#handlers = [];

        filters.forEach((filter, name) => {
            this.#addHandler(this.#inputSelect, name, filter)
        });
    }

    #addHandler(select, name, filter) {
        select.append($(`<option></option>`).text(name).val(this.#handlers.length));
        this.#handlers.push(filter);
    }

    getAllFilters() {
        return this.#filters;
    }

    getFilter() {
        let selected = this.#inputSelect.val();
        let filter = this.#handlers[selected];

        let search = this.#inputSearch.val();
        if (search === '') {
            return filter;
        } else {
            return Filters.concatWithSearch(filter, search);
        }
    }
}