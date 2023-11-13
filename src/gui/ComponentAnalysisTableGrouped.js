import { DialogDetails } from "./DialogDetails.js"
import { DialogStats } from "./DialogStats.js"
import { Utils } from "../Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentAnalysisTableGrouped {

    #controller;

    /** @typedef Map<string,GroupedTransactions> */
    #groupedTransactions;
    #selectedFilter;
    #allFilters;

    #tableBuilder = new DomBuilder.BootstrapTable();

    constructor(controller, groupedTransactions, allFilters, selectedFilter) {
        this.#controller = controller;
        this.#groupedTransactions = groupedTransactions;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        this.#build(this.#groupedTransactions, this.#allFilters, this.#selectedFilter);
        return this.#tableBuilder.createNode();
    }

    #build(groupedTransactions, filters, filter) {
        let sum = 0;
        Array.from(groupedTransactions.keys()).sort().forEach(k => {
            let group = groupedTransactions.get(k);
            let expenses = group.transactions.filter(t => t.value < 0).reduce((sum, t) => sum + t.value, 0);
            let receipts = group.transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value, 0);
            let result = receipts + expenses;
            sum += result;

            let row = DomBuilder.element('tr');
            row.append(DomBuilder.element('td', { class: 'group-key-cell' }, DomBuilder.span(group.key)));
            row.append(DomBuilder.element('td', { class: `value-cell positive` }, Utils.createValue(receipts)));
            row.append(DomBuilder.element('td', { class: `value-cell negative` }, Utils.createValue(expenses)));
            row.append(DomBuilder.element('td', { class: `value-cell result ${result < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(result)));
            row.append(DomBuilder.element('td', { class: `value-cell result ${sum < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(sum)));

            // details
            let path = (filter.filterFunc === undefined) ? '' : filter.name + ' / ';
            row.append(DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-eye' }, () => {
                    let dialog = new DialogDetails(this.#controller, path + group.key, group.transactions, filter, filters);
                    dialog.show();
                }),
                DomBuilder.link('', { class: 'fa fa-th' }, () => {
                    let dialog = new DialogStats(this.#controller, path + group.key, group.transactions, filters);
                    dialog.show();
                })
            ]));

            this.#tableBuilder.addRowBefore(row);
        })
    }
}
