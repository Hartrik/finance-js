import { Statements } from  "./Statements.js"
import { Filters } from  "./Filters.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-01
 * @author Patrik Harag
 */
export class ComponentAnalysisTable {

    #context;

    #statements;
    #selectedFilter;
    #allFilters;

    #tableBuilder = new DomBuilder.BootstrapTable();

    constructor(context, statements, allFilters, selectedFilter) {
        this.#context = context;
        this.#statements = statements;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        this.#build(this.#statements, this.#allFilters, this.#selectedFilter);
        return this.#tableBuilder.createNode();
    }

    #build(statements, filters, filter) {
        const reversedComparator = (a, b) => Statements.comparator(b, a);

        let sum = 0;
        statements.sort(reversedComparator).forEach(statement => {
            if (filter.filterFunc != null && !filter.filterFunc(statement)) {
                return;
            }

            sum += statement.value;

            let row = $(`<tr></tr>`);
            row.append($(`<td><span style="white-space: nowrap;">${Utils.esc(statement.date)}</span></td>`));
            let descriptionCell = $(`<td><span>${Utils.esc(statement.description)}</span></td>`);
            row.append(descriptionCell);
            row.append($(`<td class="value-cell ${statement.value < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(statement.value))}</td>`));
            row.append($(`<td class="value-cell result ${sum < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(sum))}</td>`));

            // filter labels
            for (const f of filters.values()) {
                if (f.hideInTable != null && f.hideInTable) {
                    continue;
                }
                if (f.subFilters != null) {
                    // skip synthetic filters
                    continue;
                }
                if (filter === f) {
                    // same as selected filter
                    continue;
                }
                if (f.filterFunc != null && f.filterFunc(statement)) {
                    descriptionCell.prepend($(`<span> </span>`));
                    descriptionCell.prepend(Filters.createFilterLabel(f));
                }
            }

            this.#tableBuilder.addRow(row);
        });
    }
}
