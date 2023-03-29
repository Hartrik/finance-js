import { DomBuilder } from "./DomBuilder.js";
import { Dataset } from "./Dataset.js";
import { Parsers } from "./Parsers.js";
import { Utils } from "./Utils.js";
import { EditorView, basicSetup } from "codemirror"

/**
 *
 * @version 2023-03-29
 * @author Patrik Harag
 */
export class ComponentDataPanel {

    context;
    dataManager;
    dataChangedTrigger;
    datasets = new Map();

    saveSwitch;
    resultLabel = $(`<span class="save-result-label"></span>`);

    /** @type {ComponentDataForm} */
    formComponent;
    /** @type {ComponentDataTable} */
    formTable;

    constructor(context, dataManager, dataChangedTrigger) {
        this.context = context;
        this.dataManager = dataManager;
        this.dataChangedTrigger = dataChangedTrigger;
        this.formComponent = new ComponentDataForm(
                (dataset) => this._onDatasetSubmitted(dataset));
        this.formTable = new ComponentDataTable(
                (dataset) => this._onDatasetDeleted(dataset),
                (dataset) => this._onDatasetEdit(dataset));
    }

    setUrlDatasetsEnabled(enable) {
        this.formComponent.setUrlDatasetsEnabled(enable);
    }

    _createHelp() {
        let sources = DomBuilder.element("ul");
        for (let k in Parsers.AVAILABLE) {
            let parser = Parsers.AVAILABLE[k];
            sources.append(DomBuilder.element("li", null, parser.name));
        }

        return $(`<div class="alert alert-info alert-dismissible fade show" role="alert"></div>`)
            .append(DomBuilder.par(null, [DomBuilder.element("strong", null, "Dataset"),
                    " is a collection of financial transactions. There can be multiple datasets – bank statements," +
                    " savings account statements, manually created list of cash expenses, etc."]))
            .append("Supported sources:")
            .append(sources)
            .append($(`<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`));
    }

    _createSaveSwitchInput() {
        let saveSwitch = $(`<input type="checkbox" class="custom-control-input" id="datasetsSaveSwitch">`);
        if (this.dataManager.hasStoredDatasets()) {
            saveSwitch.attr('checked', 'true');
        }

        saveSwitch.on("click", (e) => {
            if (saveSwitch.prop('checked')) {
                this._storeDatasets();
            } else {
                this.dataManager.discardDatasets();
            }
        });
        return saveSwitch;
    }

    _createSwitch(switchInput) {
        let div = $(`<div class="custom-control custom-switch"></div>`)
            .append(switchInput)
            .append($(`<label class="custom-control-label" for="datasetsSaveSwitch">Save</label>`));

        if (this.dataManager.getSaveTooltip()) {
            DomBuilder.Bootstrap.initTooltip(this.dataManager.getSaveTooltip(), div);
        }
        return div;
    }

    createNode() {
        this.saveSwitch = this._createSaveSwitchInput();

        let node = $(`<div class="panel-data"></div>`)
            .append(this._createHelp())
            .append($(`<p>Loaded datasets:</p>`))
            .append(this.formTable.createNode())
            .append($(`<div class="under-table-box"></div>`)
                .append(this._createSwitch(this.saveSwitch))
                .append(this.resultLabel))
            .append($(`<h2>Add/Replace dataset</h2>`))
            .append(this.formComponent.createNode());

        this._initializeData();

        return node;
    }

    _initializeData() {
        let example = !this.dataManager.hasStoredDatasets();

        this.dataManager.fetchDatasets().then(datasets => {
            this._loadDatasets(datasets);
            this.resultLabel.text("Loaded: " + new Date().toLocaleTimeString());

            if (example) {
                // example - show first
                let first = datasets.entries().next().value;
                if (first !== undefined) {
                    let v = first[1];
                    this.formComponent.setRawData(v.name, v.data, v.dataType);
                }
            }
        }).catch(e => {
            console.log(e);
            alert("Data initialization failed: " + (e.statusText ? e.statusText : e));
        });
    }

    _loadDatasets(datasets) {
        datasets.forEach(dataset => {
            dataset.loadStatements(this.formComponent.isUrlDatasetsEnabled()).then(statements => {
                this.datasets.set(dataset.name, dataset);
                this._update();
            }).catch(e => {
                console.log(e);

                this.datasets.set(dataset.name, dataset);
                this.formTable.refresh(this.datasets);

                alert("Dataset loading failed: " + (e.statusText ? e.statusText : e));
            });
        })
    }

    _onDatasetEdit(dataset) {
        this.formComponent.setRawData(dataset.name, dataset.data, dataset.dataType);
    }

    _onDatasetDeleted(dataset) {
        this.datasets.delete(dataset.name);
        this._saveIfNeeded();
        this._update();
    }

    _onDatasetSubmitted(dataset) {
        this.datasets.set(dataset.name, dataset);
        this._saveIfNeeded();
        this._update();
    }

    _saveIfNeeded() {
        // save if enabled
        if (this.saveSwitch.prop('checked')) {
            this._storeDatasets();
        }
    }

    _storeDatasets() {
        this.dataManager.storeDatasets(this.datasets).then(value => {
            this.resultLabel.text("Stored: " + new Date().toLocaleTimeString());
        }).catch(e => {
            console.log(e);
            alert("Saving failed: " + (e.statusText ? e.statusText : e));
        })
    }

    _update() {
        // refresh table
        this.formTable.refresh(this.datasets);

        // trigger data changed
        let allStatements = [];
        this.datasets.forEach(d => {
            if (d.statements !== null) {
                allStatements = allStatements.concat(d.statements);
            }
        })
        this.dataChangedTrigger(allStatements);
    }
}

/**
 *
 * @version 2022-05-22
 * @author Patrik Harag
 */
class ComponentDataTable {

    onDelete;
    onEdit;

    tableBody = $(`<tbody></tbody>`);

    constructor(onDelete, onEdit) {
        this.onDelete = onDelete;
        this.onEdit = onEdit;
    }

    createNode() {
        return $(`<div class="table-responsive"></div>`)
            .append($(`<table class="table table-striped"></table>`)
                .append($(`<thead></thead>`)
                    .append($(`<td>Dataset name</td>`))
                    .append($(`<td>Type</td>`))
                    .append($(`<td>Items</td>`))
                    .append($(`<td></td>`)))
                .append(this.tableBody))
    }

    refresh(datasets) {
        this.tableBody.empty();

        datasets.forEach(dataset => {
            let row = $(`<tr></tr>`);
            row.append($(`<td>${ Utils.esc(dataset.name) }</td>`));
            row.append($(`<td>${ Utils.esc(dataset.dataType) }</td>`));
            if (dataset.exception === undefined) {
                row.append($(`<td>${ Utils.esc(dataset.statements.length) }</td>`));
            } else {
                let span = DomBuilder.span("ERROR");
                DomBuilder.Bootstrap.initTooltip(dataset.exception, span);
                row.append($(`<td></td>`).append(span));
            }
            row.append($(`<td class="options-cell"></td>`)
                .append($(`<a href="javascript:void(0)" class="fa fa-edit"></a>`)
                    .on("click", (e) => this.onEdit(dataset)))
                .append($(`<a href="javascript:void(0)" class="fa fa-trash"></a>`)
                    .on("click", (e) => {
                        if (confirm("Delete dataset?")) {
                            this.onDelete(dataset);
                        }
                    }))
            );
            this.tableBody.append(row);
        });
    }
}

/**
 *
 * @version 2023-03-28
 * @author Patrik Harag
 */
class ComponentDataForm {

    onSubmit;

    enableUrlDatasets = false;

    fieldName;
    editor;
    typeSelect;
    button;
    resultLabel;

    constructor(onSubmit) {
        this.onSubmit = onSubmit;
    }

    setUrlDatasetsEnabled(enable) {
        this.enableUrlDatasets = enable;
    }

    isUrlDatasetsEnabled() {
        return this.enableUrlDatasets;
    }

    createNode() {
        this.editor = new EditorView({
            extensions: [basicSetup],
        })

        this.fieldName = $(`<input class="form-control" id="dataFieldName">`);

        this.typeSelect = $(`<select class="form-control" id="dataTypeSelect"></select>`);
        for (let key in Parsers.AVAILABLE) {
            let parser = Parsers.AVAILABLE[key];
            this.typeSelect.append($(`<option value="${key}">${parser.name}</option>`))
        }

        this.button = $(`<a href="javascript:void(0)" class="btn btn-primary">Submit</a>`);
        this.resultLabel = $(`<span class="parse-result-label"></span>`);

        this._initFileDragAndDrop(this.fieldName, $(this.editor.dom), this.typeSelect);

        this.button.on("click", (e) => {
            this.submit();
        });

        return $(`<form class="" action="javascript:void(0);"></form>`)
            .append($(`<div class="form-group"></div>`)
                .append($(`<label for="dataFieldName">Dataset name</label>`))
                .append(this.fieldName))
            .append($(`<div class="form-group"></div>`)
                .append($(`<label>Data</label>`))
                .append(this.editor.dom))
            .append($(`<div class="form-group"></div>`)
                .append($(`<label for="dataTypeSelect">Data type</label>`))
                .append(this.typeSelect))
            .append(this.button)
            .append(this.resultLabel);
    }

    _initFileDragAndDrop(nameField, area, select) {
        let upload = (files) => {
            let file = files[0];

            let reader = new FileReader();
            reader.onload = (e) => {
                nameField.val(file.name);

                this.editor.dispatch({
                    changes: {from: 0, to: this.editor.state.doc.length, insert: e.target.result}
                });

                // select data type automatically
                let ext = file.name.split('.').pop();  // this doesn't need to be precise
                let parserKeys = Parsers.resolveParserByExtension(ext)
                if (parserKeys.length === 1) {
                    select.val(parserKeys[0]);
                }
            }
            reader.readAsText(file);
        }

        area.on('dragover', e => {
            if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        area.on('dragenter', e => {
            if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        area.on('drop', e => {
            if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                upload(e.originalEvent.dataTransfer.files);
            }
        });
    }

    submit() {
        let name = this.fieldName.val();
        let data = this.getRawData();
        let dataType = this.typeSelect.val();

        let dataset = new Dataset(name, dataType, data);
        dataset.loadStatements(this.enableUrlDatasets).then(statements => {
            this.onSubmit(dataset);
            alert("Dataset loaded successfully");
        }).catch(e => {
            console.log(e);
            alert("Dataset loading failed: " + (e.statusText ? e.statusText : e));
        });
    }

    setRawData(name, data, parserKey) {
        this.fieldName.val(name);
        this.typeSelect.val(parserKey);
        this.editor.dispatch({
            changes: {from: 0, to: this.editor.state.doc.length, insert: data}
        });
    }

    getRawData() {
        return this.editor.state.doc.toString();
    }
}
