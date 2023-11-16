import {basicSetup, EditorView} from "codemirror";
import {Parsers} from "../parsers/Parsers";
import {Dataset} from "../Dataset";
import $ from "jquery";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentDatasetForm {

    #inputFieldName;
    #inputEditor;
    #inputTypeSelect;

    createNode() {
        this.#inputEditor = new EditorView({
            extensions: [basicSetup],
        })

        this.#inputFieldName = $(`<input class="form-control" id="dataFieldName">`);

        this.#inputTypeSelect = $(`<select class="form-control" id="dataTypeSelect"></select>`);
        for (let [key, parser] of Parsers.AVAILABLE) {
            this.#inputTypeSelect.append($(`<option value="${key}">${parser.getDisplayName()}</option>`))
        }

        return $(`<div class="dataset-form"></div>`)
            .append($(`<div class="mb-3"></div>`)
                .append($(`<label class="form-label" for="dataFieldName">Dataset name</label>`))
                .append(this.#inputFieldName))
            .append($(`<div class="mb-3"></div>`)
                .append($(`<label class="form-label">Data</label>`))
                .append(this.#inputEditor.dom))
            .append($(`<div class="mb-3"></div>`)
                .append($(`<label class="form-label" for="dataTypeSelect">Data type</label>`))
                .append(this.#inputTypeSelect));
    }

    getDataset() {
        let name = this.#inputFieldName.val().trim();
        if (!name) {
            name = '' + new Date().getTime();
        }

        let data = this.getRawData();
        let dataType = this.#inputTypeSelect.val();

        return new Dataset(name, dataType, data);
    }

    setRawData(name, data, parserKey) {
        this.#inputFieldName.val(name);
        this.#inputTypeSelect.val(parserKey);
        this.#inputEditor.dispatch({
            changes: {from: 0, to: this.#inputEditor.state.doc.length, insert: data}
        });
    }

    getRawData() {
        return this.#inputEditor.state.doc.toString();
    }
}