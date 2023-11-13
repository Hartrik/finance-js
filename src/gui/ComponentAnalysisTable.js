import { Transactions } from "../Transactions.js"
import { Utils } from "../Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentAnalysisTable {

    #controller;

    #transactions;
    #selectedFilter;
    #allFilters;

    #tableBuilder = new DomBuilder.BootstrapTable();

    constructor(controller, transactions, allFilters, selectedFilter) {
        this.#controller = controller;
        this.#transactions = transactions;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        this.#build(this.#transactions, this.#allFilters, this.#selectedFilter);
        return this.#tableBuilder.createNode();
    }

    #build(transactions, filters, filter) {
        let sum = 0;
        transactions.sort(Transactions.comparator).forEach(transaction => {
            sum += transaction.value;

            let descriptionCell;

            let row = DomBuilder.element('tr');
            row.append(DomBuilder.element('td', { class: 'group-key-cell' }, DomBuilder.span(transaction.date)));
            row.append(descriptionCell = DomBuilder.element('td', null, DomBuilder.span(transaction.description)));
            row.append(DomBuilder.element('td', { class: `value-cell ${transaction.value < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(transaction.value)));
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
                if (f.filterFunc != null && f.filterFunc(transaction)) {
                    descriptionCell.prepend(DomBuilder.span(' '));
                    descriptionCell.prepend(Utils.createFilterLabel(f));
                }
            }

            this.#tableBuilder.addRowBefore(row);
        });
    }
}
