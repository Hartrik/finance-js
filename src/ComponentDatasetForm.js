import {basicSetup, EditorView} from "codemirror";
import {Parsers} from "./Parsers";
import {Dataset} from "./Dataset";

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
        for (let key in Parsers.AVAILABLE) {
            let parser = Parsers.AVAILABLE[key];
            this.#inputTypeSelect.append($(`<option value="${key}">${parser.name}</option>`))
        }

        return $(`<form class="dataset-form" action="javascript:void(0);"></form>`)
            .append($(`<div class="form-group"></div>`)
                .append($(`<label for="dataFieldName">Dataset name</label>`))
                .append(this.#inputFieldName))
            .append($(`<div class="form-group"></div>`)
                .append($(`<label>Data</label>`))
                .append(this.#inputEditor.dom))
            .append($(`<div class="form-group"></div>`)
                .append($(`<label for="dataTypeSelect">Data type</label>`))
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