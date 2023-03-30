import { Statements } from  "./Statements.js"
import { Filters } from  "./Filters.js"
import { DialogDetails } from  "./DialogDetails.js"
import { DialogStats } from  "./DialogStats.js"
import { Utils } from "./Utils.js"

/**
 *
 * @version 2022-02-15
 * @author Patrik Harag
 */
export class ComponentAnalysisTable {

    context;

    tableBody = $(`<tbody></tbody>`);

    constructor(context) {
        this.context = context;
    }

    createNode() {
        return $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append(this.tableBody))
    }

    refresh(statements, allFilters, filter) {
        this.tableBody.empty();
        this._build(statements, allFilters, filter);
    }

    refreshWithGrouping(groupedStatements, allFilters, filter) {
        this.tableBody.empty();
        this._buildWithGroups(groupedStatements, allFilters, filter)
    }

    _build(statements, filters, filter) {
        let sum = 0;
        statements.sort(Statements.comparator).forEach(statement => {
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

            this.tableBody.prepend(row);
        });
    }

    _buildWithGroups(groupedStatements, filters, filter) {
        let sum = 0;
        Array.from(groupedStatements.keys()).sort().forEach(k => {
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
                let dialog = new DialogDetails(this.context, group.key, group.statements, filter, filters);
                dialog.show();
            });

            let statsButton = $(`<a href="javascript:void(0)" class="fa fa-pie-chart"></a>`);
            statsButton.on("click", (e) => {
                let dialog = new DialogStats(this.context, group.key, group.statements, filters);
                dialog.show();
            });

            row.append($(`<td class="options-cell"></td>`)
                .append(detailsButton)
                .append(statsButton));

            this.tableBody.prepend(row);
        })
    }
}
