import { DialogDetails } from  "./DialogDetails.js"
import { DialogStats } from  "./DialogStats.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentAnalysisTableGrouped {

    #context;

    /** @typedef Map<string,GroupedStatements> */
    #groupedStatements;
    #selectedFilter;
    #allFilters;

    #tableBuilder = new DomBuilder.BootstrapTable();

    constructor(context, groupedStatements, allFilters, selectedFilter) {
        this.#context = context;
        this.#groupedStatements = groupedStatements;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        this.#build(this.#groupedStatements, this.#allFilters, this.#selectedFilter);
        return this.#tableBuilder.createNode();
    }

    #build(groupedStatements, filters, filter) {
        let sum = 0;
        Array.from(groupedStatements.keys()).sort().forEach(k => {
            let group = groupedStatements.get(k);
            let expenses = group.statements.filter(s => s.value < 0).reduce((sum, s) => sum + s.value, 0);
            let receipts = group.statements.filter(s => s.value > 0).reduce((sum, s) => sum + s.value, 0);
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
            row.append(DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-eye' }, () => {
                    let dialog = new DialogDetails(this.#context, group.key, group.statements, filter, filters);
                    dialog.show();
                }),
                DomBuilder.link('', { class: 'fa fa-pie-chart' }, () => {
                    let dialog = new DialogStats(this.#context, group.key, group.statements, filters);
                    dialog.show();
                })
            ]));

            this.#tableBuilder.addRowBefore(row);
        })
    }
}
