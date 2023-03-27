import { Filters } from  "./Filters.js"
import { DialogDetails } from  "./DialogDetails.js"
import { esc, formatValue } from  "./utils.js"

/**
 * @version 2021-11-21
 * @author Patrik Harag
 */
export class DialogStats {

    context;
    statements;
    groupName;
    filters;

    constructor(context, groupName, statements, filters) {
        this.context = context;
        this.groupName = groupName;
        this.statements = statements;
        this.filters = filters;
    }

    show() {
        let dialog = $(`<div class="modal" tabindex="-1" role="dialog" aria-hidden="true"></div>`)
            .append($(`<div class="modal-dialog modal-dialog-centered modal-lg"></div>`)
                .append($(`<div class="modal-content"></div>`)
                    .append($(`<div class="modal-header"><span>${esc(this.groupName)} Summary</span></div>`))
                    .append($(`<div class="modal-body"></div>`).append(this._buildBody()))
                    .append($(`<div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>`))
                ));

        $(this.context.dialogAnchorSelector).append(dialog);
        dialog.modal('show');
    }

    _buildBody() {
        // pre-populate groups - because of order...
        let filterGroups = new Map();
        const othersFilter = {
            name: "Others"
        };
        for (let filter of this.filters.values()) {
            filterGroups.set(filter.name, {
                filter: filter,
                statements: []
            });
        }
        filterGroups.set(othersFilter.name, {
            filter: othersFilter,
            statements: []
        });

        // fill groups
        for (let statement of this.statements) {
            let matchedFilterName = null;
            for (let filter of this.filters.values()) {
                if (filter.hideInTable != null && filter.hideInTable) {
                    continue;
                }
                if (filter.subFilters != null) {
                    continue;
                }
                if (filter.filterFunc != null && filter.filterFunc(statement)) {
                    matchedFilterName = filter.name;
                    break;
                }
            }

            let current = filterGroups.get((matchedFilterName != null) ? matchedFilterName : othersFilter.name)
            current.statements.push(statement);
        }

        // build table
        let tableBody;
        let table = $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append(tableBody = $(`<tbody></tbody>`)))

        let totalExpenses = 0;
        let totalReceipts = 0;
        for (let filterGroup of filterGroups.values()) {
            if (filterGroup.statements.length === 0) {
                continue;
            }

            let expenses = filterGroup.statements.filter(s => s.value < 0).reduce((sum, s) => sum + s.value, 0);
            let receipts = filterGroup.statements.filter(s => s.value > 0).reduce((sum, s) => sum + s.value, 0);
            let result = receipts + expenses;

            totalExpenses += expenses;
            totalReceipts += receipts;

            let row = $(`<tr></tr>`);
            row.append($(`<td></td>`).append((filterGroup.filter.name === othersFilter.name)
                    ? $(`<span>${esc(filterGroup.filter.name)}</span>`)
                    : Filters.createFilterLabel(filterGroup.filter)));
            row.append($(`<td class="value-cell positive">${esc(formatValue(receipts))}</td>`));
            row.append($(`<td class="value-cell negative">${esc(formatValue(expenses))}</td>`));
            row.append($(`<td class="value-cell result ${result < 0 ? 'negative' : 'positive'}">${esc(formatValue(result))}</td>`));

            let detailsButton = $(`<a href="javascript:void(0)" class="fa fa-eye"></a>`);
            detailsButton.on("click", (e) => {
                let dialog = new DialogDetails(this.context, this.groupName + ' / ' + filterGroup.filter.name,
                        filterGroup.statements, filterGroup.filter, this.filters);
                dialog.show();
            });
            row.append($(`<td class="options-cell"></td>`).append(detailsButton));

            tableBody.append(row);
        }

        let result = totalReceipts + totalExpenses;
        let row = $(`<tr></tr>`);
        row.append($(`<td class="result">&sum;</td>`));
        row.append($(`<td class="value-cell result positive">${esc(formatValue(totalReceipts))}</td>`));
        row.append($(`<td class="value-cell result negative">${esc(formatValue(totalExpenses))}</td>`));
        row.append($(`<td class="value-cell result ${result < 0 ? 'negative' : 'positive'}">${esc(formatValue(result))}</td>`));
        row.append($(`<td></td>`));
        tableBody.append(row);

        return table;
    }

}