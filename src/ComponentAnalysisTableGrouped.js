import { DialogDetails } from  "./DialogDetails.js"
import { DialogStats } from  "./DialogStats.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-04-01
 * @author Patrik Harag
 */
export class ComponentAnalysisTableGrouped {

    #context;

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
        Array.from(groupedStatements.keys()).sort().reverse().forEach(k => {
            let group = groupedStatements.get(k);
            let expenses = group.statements.filter(s => s.value < 0).reduce((sum, s) => sum + s.value, 0);
            let receipts = group.statements.filter(s => s.value > 0).reduce((sum, s) => sum + s.value, 0);
            let result = receipts + expenses;
            sum += result;

            let row = $(`<tr></tr>`);
            row.append($(`<td><span style="white-space: nowrap;">${Utils.esc(group.key)}</span></td>`));
            row.append($(`<td class="value-cell positive">${Utils.esc(Utils.formatValue(receipts))}</td>`));
            row.append($(`<td class="value-cell negative">${Utils.esc(Utils.formatValue(expenses))}</td>`));
            row.append($(`<td class="value-cell result ${result < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(result))}</td>`));
            row.append($(`<td class="value-cell result ${sum < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(sum))}</td>`));

            // details
            let detailsButton = $(`<a href="javascript:void(0)" class="fa fa-eye"></a>`);
            detailsButton.on("click", (e) => {
                let dialog = new DialogDetails(this.#context, group.key, group.statements, filter, filters);
                dialog.show();
            });

            let statsButton = $(`<a href="javascript:void(0)" class="fa fa-pie-chart"></a>`);
            statsButton.on("click", (e) => {
                let dialog = new DialogStats(this.#context, group.key, group.statements, filters);
                dialog.show();
            });

            row.append($(`<td class="options-cell"></td>`)
                .append(detailsButton)
                .append(statsButton));

            this.#tableBuilder.addRow(row);
        })
    }
}
