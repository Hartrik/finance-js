import {Utils} from "../Utils";
import {DomBuilder} from "./DomBuilder";
import $ from "jquery";

/**
 *
 * @version 2023-03-31
 * @author Patrik Harag
 */
export class ComponentDatasetsTable {

    #onDelete;
    #onEdit;

    #tableBody = $(`<tbody></tbody>`);

    constructor(controller, onDelete, onEdit) {
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
                row.append($(`<td>${ Utils.esc(dataset.transactions.length) }</td>`));
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

        this.#tableBody.append(this.#createLastRow());
    }

    #createLastRow() {
        return DomBuilder.element('tr', null, [
            DomBuilder.element('td'),
            DomBuilder.element('td'),
            DomBuilder.element('td'),
            DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-plus' }, e => {
                    this.#onEdit(null);
                })
            ])
        ]);
    }
}