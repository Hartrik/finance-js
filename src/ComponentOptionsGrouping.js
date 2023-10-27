import {Groups} from "./Groups";
import $ from "jquery";

/**
 *
 * @version 2023-10-27
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
        const short = window.innerWidth < 800;

        const noGroupingButton = $(`<input type="radio" name="options" class="btn-check" id="grouping-off">`);
        const weekButton = $(`<input type="radio" name="options" class="btn-check" id="grouping-week">`);
        const monthButton = $(`<input type="radio" name="options" class="btn-check" id="grouping-month" checked>`);
        const yearButton = $(`<input type="radio" name="options" class="btn-check" id="grouping-year">`);
        const allButton = $(`<input type="radio" name="options" class="btn-check" id="grouping-all">`);

        const noGroupingLabel = $(`<label class="btn btn-secondary" for="grouping-off"></label>`).text(short ? "Ø" : "No grouping");
        const weekLabel = $(`<label class="btn btn-secondary" for="grouping-week"></label>`).text("Week");
        const monthLabel = $(`<label class="btn btn-secondary" for="grouping-month"></label>`).text("Month");
        const yearLabel = $(`<label class="btn btn-secondary" for="grouping-year"></label>`).text("Year");
        const allLabel = $(`<label class="btn btn-secondary" for="grouping-all"></label>`).text("Σ");

        const dom = $(`<div class="btn-group grouping-component" role="group"></div>`)
            .append(noGroupingButton).append(noGroupingLabel)
            .append(weekButton).append(weekLabel)
            .append(monthButton).append(monthLabel)
            .append(yearButton).append(yearLabel)
            .append(allButton).append(allLabel);

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