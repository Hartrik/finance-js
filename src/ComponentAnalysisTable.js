import { Statements } from  "./Statements.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-02
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
        let sum = 0;
        statements.sort(Statements.comparator).forEach(statement => {
            sum += statement.value;

            let descriptionCell;

            let row = DomBuilder.element('tr');
            row.append(DomBuilder.element('td', { class: 'group-key-cell' }, DomBuilder.span(statement.date)));
            row.append(descriptionCell = DomBuilder.element('td', null, DomBuilder.span(statement.description)));
            row.append(DomBuilder.element('td', { class: `value-cell ${statement.value < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(statement.value)));
            row.append(DomBuilder.element('td', { class: `value-cell result ${sum < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(sum)));

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
                    descriptionCell.prepend(DomBuilder.span(' '));
                    descriptionCell.prepend(Utils.createFilterLabel(f));
                }
            }

            this.#tableBuilder.addRowBefore(row);
        });
    }
}
