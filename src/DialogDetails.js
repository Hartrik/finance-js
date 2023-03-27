import { Statements } from  "./Statements.js"
import { Filters } from  "./Filters.js"
import { esc, formatValue } from  "./utils.js"

/**
 * @version 2021-11-21
 * @author Patrik Harag
 */
export class DialogDetails {

    context;
    statements;
    groupName;
    filter;
    filters;

    constructor(context, groupName, statements, activeFilter, filters) {
        this.context = context;
        this.groupName = groupName;
        this.statements = statements;
        this.filter = activeFilter;
        this.filters = filters;
    }

    show() {
        let dialog = $(`<div class="modal" tabindex="-1" role="dialog" aria-hidden="true"></div>`)
            .append($(`<div class="modal-dialog modal-dialog-centered modal-lg"></div>`)
                .append($(`<div class="modal-content"></div>`)
                    .append($(`<div class="modal-header"><span>${esc(this.groupName)}</span></div>`))
                    .append($(`<div class="modal-body"></div>`).append(this._buildBody()))
                    .append($(`<div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>`))
                ));

        $(this.context.dialogAnchorSelector).append(dialog);
        dialog.modal('show');
    }

    _buildBody() {
        let tableBody;
        let table = $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append(tableBody = $(`<tbody></tbody>`)))

        this.statements.sort(Statements.comparator).forEach(statement => {
            let row = $(`<tr></tr>`);
            row.append($(`<td><span style="white-space: nowrap;">${esc(statement.date)}</span></td>`));
            let descriptionCell = $(`<td><span>${esc(statement.description)}</span></td>`);
            row.append(descriptionCell);
            row.append($(`<td class="value-cell ${statement.value < 0 ? 'negative' : 'positive'}">${esc(formatValue(statement.value))}</td>`));
            tableBody.append(row);

            // filter labels
            for (const f of this.filters.values()) {
                if (f.hideInTable != null && f.hideInTable) {
                    continue;
                }
                if (f.subFilters != null) {
                    // skip synthetic filters
                    continue;
                }
                if (this.filter === f) {
                    // same as selected filter
                    continue;
                }
                if (f.filterFunc != null && f.filterFunc(statement)) {
                    descriptionCell.prepend($(`<span> </span>`));
                    descriptionCell.prepend(Filters.createFilterLabel(f));
                }
            }
        })

        return table;
    }

}