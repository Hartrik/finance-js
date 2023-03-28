import { Filters } from  "./Filters.js"
import { EditorView, basicSetup } from "codemirror"
import { json } from "@codemirror/lang-json"

/**
 *
 * @version 2023-03-28
 * @author Patrik Harag
 */
export class ComponentFiltersPanel {

    context;
    dataManager;
    filtersUpdatedHandler;

    editor;
    resultLabel;

    /**
     *
     * @param context Context
     * @param dataManager DataManager
     * @param filtersUpdatedHandler function
     */
    constructor(context, dataManager, filtersUpdatedHandler) {
        this.context = context;
        this.dataManager = dataManager;
        this.filtersUpdatedHandler = filtersUpdatedHandler;
    }

    _createHelp() {
        function asCode(str) {
            return '<code>' + str + '</code>';
        }

        return $(`<div class="alert alert-info alert-dismissible fade show" role="alert"></div>`)
            .append($(`<strong>Filter definition:</strong>`))
            .append($(`<ul></ul>`)
                .append($(`<li><code>name</code> (string)</li>`))
                .append($(`<li><code>color</code> (string) [optional] &#8211; label CSS color</li>`))
                .append($(`<li><code>query</code> (object) [optional, matches all if not set]</li>`)
                    .append($(`<br>`))
                    .append($(`<strong>Queries</strong>`))
                    .append($(`<ul></ul>`)
                        .append($(`<li>Queries are inspired by MongoDB queries.</li>`))
                        .append($(`<li>Fields: ${ Filters.QUERY_FIELDS.map(asCode).join(', ') }. Default: <code>description</code>.</li>`))
                        .append($(`<li>Operators: ${ Filters.QUERY_OPERATORS.map(asCode).join(', ') }. Default: <code>$contains</code> (string) / <code>$eq</code> (number).</li>`))
                    )
                )
                .append($(`<li><code>negFilter</code> (string) [optional, alternative to query] &#8211; create filter by negating other filter</li>`))
                .append($(`<li><code>hideInTable</code> (boolean) [optional, default = true] &#8211; hide this filter in the table view</li>`))
            )
            .append($(`<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`));
    }

    _createSaveSwitchInput() {
        let saveSwitch = $(`<input type="checkbox" class="custom-control-input" id="filtersSaveSwitch">`);
        if (this.dataManager.hasStoredFilters()) {
            saveSwitch.attr('checked', 'true');
        }

        saveSwitch.on("click", (e) => {
            let checked = saveSwitch.prop('checked');
            if (checked) {
                this._store();
            } else {
                this.dataManager.discardFilters();
            }
        });
        return saveSwitch;
    }

    _createSwitch(switchInput) {
        let div = $(`<div class="custom-control custom-switch"></div>`)
            .append(switchInput)
            .append($(`<label class="custom-control-label" for="filtersSaveSwitch">Save</label>`));

        if (this.dataManager.getSaveTooltip()) {
            div.attr('data-toggle', 'tooltip');
            div.attr('data-placement', 'top');
            div.attr('title', this.dataManager.getSaveTooltip());
            div.tooltip();
        }
        return div;
    }

    _createForm() {
        this.editor = new EditorView({
            extensions: [basicSetup, json()],
        })
        this.resultLabel = $(`<span class="parse-result-label"></span>`);
        let button = $(`<a href="javascript:void(0)" class="btn btn-primary">Update</a>`);
        let saveSwitch = this._createSaveSwitchInput();

        button.on("click", (e) => {
            this._process();
            if (saveSwitch.prop('checked')) {
                this._store();
            }
        });

        return $(`<form class="" action="javascript:void(0);"></form>`)
            .append($(`<div class="form-group"></div>`)
                .append($(`<label>Filter definitions</label>`))
                .append(this.editor.dom))
            .append($(`<div class="under-editor-box"></div>`)
                .append(button)
                .append(this._createSwitch(saveSwitch))
                .append(this.resultLabel));
    }

    createNode() {
        let dom = $(`<div class="panel-filters"></div>`)
            .append(this._createHelp())
            .append(this._createForm());

        this._initializeData();

        return dom;
    }

    _initializeData() {
        this.dataManager.fetchFilters().then((filters) => {
            this.setRawData(filters);
            this._process();
        });
    }

    _parseAndGetFiltersUnchecked() {
        let value = this.getRawData();
        let filtersJson;
        if (value.trim() !== "") {
            filtersJson = JSON.parse(value);
            if (filtersJson.size === 0) {
                filtersJson = Filters.DEFAULT;
            }
        } else {
            filtersJson = Filters.DEFAULT;
        }
        return Filters.load(filtersJson);
    }

    _parseAndGetFilters() {
        try {
            let filters = this._parseAndGetFiltersUnchecked();
            Filters.testFilters(filters);

            this.resultLabel.text("Updated: " + new Date().toLocaleTimeString());
            return filters;
        } catch (e) {
            alert("Parsing failed: " + e);
            return Filters.load(Filters.DEFAULT);
        }
    }

    _process() {
        let filters = this._parseAndGetFilters();
        this.filtersUpdatedHandler(filters);
    }

    _store() {
        this.dataManager.storeFilters(this.getRawData()).then(value => {
            this.resultLabel.text("Stored: " + new Date().toLocaleTimeString());
        }).catch(e => {
            console.log(e);
            alert("Saving failed: " + (e.statusText ? e.statusText : e));
        });
    }

    setRawData(data) {
        this.editor.dispatch({
            changes: {from: 0, to: this.editor.state.doc.length, insert: data}
        });
    }

    getRawData() {
        return this.editor.state.doc.toString();
    }
}
