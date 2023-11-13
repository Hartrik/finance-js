import {Filters} from "../Filters";
import $ from "jquery";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class ComponentOptionsFilter {

    #refreshFunction;

    #filters;

    #inputTimeSelect;
    #inputFilterSelect;
    #inputSearch;

    #filterHandlers;

    constructor(refreshFunction) {
        this.#refreshFunction = refreshFunction;
        this.#filterHandlers = [];
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
        this.#inputTimeSelect = this._createSelect();
        this.#inputFilterSelect = this._createSelect();
        this.#inputSearch = this._createSearchBox();
        return $(`<div class="filter-component"></div>`)
            .append(this.#inputTimeSelect)
            .append(this.#inputFilterSelect)
            .append(this.#inputSearch);
    }

    setFilters(filters) {
        this.#filters = filters;
        this.#inputFilterSelect.empty();
        this.#filterHandlers = [];

        filters.forEach((filter, name) => {
            this.#inputFilterSelect.append($(`<option></option>`).text(name).val(this.#filterHandlers.length));
            this.#filterHandlers.push(filter);
        });
    }

    setTimeSpan(dateFrom, dateTo) {
        this.#inputTimeSelect.empty();
        this.#inputTimeSelect.append($(`<option></option>`).text('<anytime>').val(null));

        if (dateFrom === null || dateTo === null) {
            return;
        }

        const yearFrom = Number.parseInt(dateFrom.substring(0, 4));
        const yearTo = Number.parseInt(dateTo.substring(0, 4));

        for (let year = yearFrom; year <= yearTo; year++) {
            this.#inputTimeSelect.append($(`<option></option>`).text('' + year).val(year));
        }
    }

    getAllFilters() {
        return this.#filters;
    }

    getCombinedFilter() {
        let selected = this.#inputFilterSelect.val();
        let filter = this.#filterHandlers[selected];

        let year = this.#inputTimeSelect.val();
        if (year) {
            filter = Filters.concat(Filters.createYearFilter(year), filter);
        }

        let search = this.#inputSearch.val();
        if (search !== '') {
            filter = Filters.concat(filter, Filters.createSearchFilter(search));
        }

        return filter;
    }
}