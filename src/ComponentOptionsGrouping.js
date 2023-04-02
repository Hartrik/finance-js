import {Groups} from "./Groups";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentOptionsGrouping {

    #refreshFunction;
    #grouping;

    constructor(refreshFunction) {
        this.#refreshFunction = refreshFunction;
        this.#grouping = Groups.GROUP_BY_MONTH;
    }

    createNode() {
        let noGroupingButton;
        let weekButton;
        let monthButton;
        let yearButton;
        let allButton;

        const short = window.innerWidth < 800;

        let dom = $(`<div class="grouping-component btn-group btn-group-toggle" data-toggle="buttons"></div>`)
            .append($(`<label class="btn btn-secondary"></label>`)
                .text(short ? "Ø" : "No grouping").append(noGroupingButton = $(`<input type="radio" name="options" id="grouping-off">`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Week").append(weekButton = $(`<input type="radio" name="options" id="grouping-week">`)))
            .append($(`<label class="btn btn-secondary active"></label>`)
                .text("Month").append(monthButton = $(`<input type="radio" name="options" id="grouping-month" checked>`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Year").append(yearButton = $(`<input type="radio" name="options" id="grouping-year">`)))
            .append($(`<label class="btn btn-secondary"></label>`)
                .text("Σ").append(allButton = $(`<input type="radio" name="options" id="grouping-all">`)));

        noGroupingButton.change(() => {
            this.#grouping = Groups.NO_GROUPING;
            this.#refreshFunction();
        });
        weekButton.change(() => {
            this.#grouping = Groups.GROUP_BY_WEEK;
            this.#refreshFunction();
        });
        monthButton.change(() => {
            this.#grouping = Groups.GROUP_BY_MONTH;
            this.#refreshFunction();
        });
        yearButton.change(() => {
            this.#grouping = Groups.GROUP_BY_YEAR;
            this.#refreshFunction();
        });
        allButton.change(() => {
            this.#grouping = Groups.GROUP_ALL;
            this.#refreshFunction();
        });

        return dom;
    }

    getGrouping() {
        return this.#grouping;
    }
}