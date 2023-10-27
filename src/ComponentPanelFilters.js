import { ComponentPanel } from "./ComponentPanel.js";
import { DomBuilder } from "./DomBuilder.js";
import { Filters } from  "./Filters.js"
import { EditorView, basicSetup } from "codemirror"
import { json } from "@codemirror/lang-json"
import $ from "jquery";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentPanelFilters extends ComponentPanel {

    /** @type Context */
    #context;
    /** @type DataManager */
    #dataManager;

    #editor;

    /**
     *
     * @param context Context
     * @param dataManager DataManager
     */
    constructor(context, dataManager) {
        super();
        this.#context = context;
        this.#dataManager = dataManager;

        this.#dataManager.addOnRawFiltersFetched(json => {
            this.#setRawData(json);
        });
    }

    getTabId() {
        return 'finance-tab-filters';
    }

    getTabName() {
        return [
            DomBuilder.element("i", { class: "fa fa-cog" }),
            DomBuilder.span(" Filters")
        ];
    }

    createNode() {
        this.#editor = new EditorView({
            extensions: [basicSetup, json()],
        })

        return DomBuilder.div({ class: 'panel-filters' }, [
            this._createHelp(),
            DomBuilder.par(null, "Filter definitions:"),
            DomBuilder.div(null, [
                this.#editor.dom,
                DomBuilder.button('Update', { class: 'btn btn-primary' }, e => {
                    this.#dataManager.updateFilters(this.#getRawData(), true, true);
                })
            ])
        ]);
    }

    _createHelp() {
        function asCode(str) {
            return '<code>' + str + '</code>';
        }

        return DomBuilder.Bootstrap.alertInfo([
            $(`<p><strong>Filter</strong> is a way how to define a category of transactions.</p>`),
            "Filter definition:",
            $(`<ul></ul>`)
                .append($(`<li><code>name</code> (string)</li>`))
                .append($(`<li><code>color</code> (string) [optional] &#8211; label CSS color</li>`))
                .append($(`<li><code>query</code> (object) [optional, matches all if not set]</li>`)
                    .append($(`<br>`))
                    .append($(`<strong>Query:</strong>`))
                    .append($(`<ul></ul>`)
                        .append($(`<li>The syntax is inspired by MongoDB queries.</li>`))
                        .append($(`<li>Fields: ${ Filters.QUERY_FIELDS.map(asCode).join(', ') }. Default: <code>description</code>.</li>`))
                        .append($(`<li>Operators: ${ Filters.QUERY_OPERATORS.map(asCode).join(', ') }. Default: <code>$contains</code> (string) / <code>$eq</code> (number).</li>`))
                    )
                )
                .append($(`<li><code>negFilter</code> (string) [optional, alternative to <code>query</code>] &#8211; create filter by negating other filter</li>`))
                .append($(`<li><code>hideInTable</code> (boolean) [optional, default = false] &#8211; hide this filter in tables (for very generic, negated or overlapping filters)</li>`))
        ]);
    }

    #setRawData(data) {
        this.#editor.dispatch({
            changes: {from: 0, to: this.#editor.state.doc.length, insert: data}
        });
    }

    #getRawData() {
        return this.#editor.state.doc.toString();
    }
}
