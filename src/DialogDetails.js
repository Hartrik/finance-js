import { Transactions } from "./Transactions.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";
import $ from "jquery";

/**
 * @version 2023-04-01
 * @author Patrik Harag
 */
export class DialogDetails {

    context;
    transactions;
    groupName;
    filter;
    filters;

    constructor(context, groupName, transactions, activeFilter, filters) {
        this.context = context;
        this.groupName = groupName;
        this.transactions = transactions;
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

        this.transactions.sort(Transactions.comparator).forEach(transaction => {
            let row = $(`<tr></tr>`);
            row.append($(`<td><span style="white-space: nowrap;">${Utils.esc(transaction.date)}</span></td>`));
            let descriptionCell = $(`<td><span>${Utils.esc(transaction.description)}</span></td>`);
            row.append(descriptionCell);
            row.append($(`<td class="value-cell ${transaction.value < 0 ? 'negative' : 'positive'}">${Utils.esc(Utils.formatValue(transaction.value))}</td>`));
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
                if (f.filterFunc != null && f.filterFunc(transaction)) {
                    descriptionCell.prepend($(`<span> </span>`));
                    descriptionCell.prepend(Utils.createFilterLabel(f));
                }
            }
        })

        return table;
    }

}