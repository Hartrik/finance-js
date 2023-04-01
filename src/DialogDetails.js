import { Statements } from  "./Statements.js"
import { Filters } from  "./Filters.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";

/**
 * @version 2023-04-01
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
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent(this.groupName);
        dialog.setBodyContent(this._buildBody());
        dialog.addCloseButton('Close');
        dialog.setSizeLarge();
        dialog.show(this.context.dialogAnchor);
    }

    _buildBody() {
        let tableBody;
        let table = $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append(tableBody = $(`<tbody></tbody>`)))

        this.statements.sort(Statements.comparator).forEach(statement => {
            let row = $(`<tr></tr>`);
            row.append($(`<td><span style="white-space: nowrap;">${Utils.esc(statement.date)}</span></td>`));
            let descriptionCell = $(`<td><span>${Utils.esc(statement.description)}</span></td>`);
            row.append(descriptionCell);
            row.append($(`<td class="value-cell ${statement.value < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(statement.value))}</td>`));
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