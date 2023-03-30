import {Utils} from "./Utils";
import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2022-05-22
 * @author Patrik Harag
 */
export class ComponentDatasetsTable {

    #onDelete;
    #onEdit;

    #tableBody = $(`<tbody></tbody>`);

    constructor(context, onDelete, onEdit) {
        this.#onDelete = onDelete;
        this.#onEdit = onEdit;
    }

    createNode() {
        return $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append($(`<thead></thead>`)
                    .append($(`<td>Dataset name</td>`))
                    .append($(`<td>Type</td>`))
                    .append($(`<td>Items</td>`))
                    .append($(`<td></td>`)))
                .append(this.#tableBody))
    }

    refresh(datasets) {
        this.#tableBody.empty();

        datasets.forEach(dataset => {
            let row = $(`<tr></tr>`);
            row.append($(`<td>${ Utils.esc(dataset.name) }</td>`));
            row.append($(`<td>${ Utils.esc(dataset.dataType) }</td>`));
            if (dataset.exception === undefined) {
                row.append($(`<td>${ Utils.esc(dataset.statements.length) }</td>`));
            } else {
                let span = DomBuilder.span("Error: " + dataset.exception);
                row.append($(`<td></td>`).append(span));
            }
            row.append(DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-edit' }, e => {
                    this.#onEdit(dataset);
                }),
                DomBuilder.link('', { class: 'fa fa-trash' }, e => {
                    this.#onDelete(dataset);
                })
            ]));
            this.#tableBody.append(row);
        });

        let lastRow = DomBuilder.element('tr', null, [
            DomBuilder.element('td'),
            DomBuilder.element('td'),
            DomBuilder.element('td'),
            DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-plus' }, e => {
                    this.#onEdit(null);
                })
            ])
        ]);
        this.#tableBody.append(lastRow);
    }
}