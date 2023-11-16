import {DomBuilder} from "./DomBuilder.js";
import {Dataset} from "../Dataset.js";
import {Parsers} from "../parsers/Parsers.js";
import {DragAndDropUtil} from "./DragAndDropUtil";
import {ComponentPanel} from "./ComponentPanel.js";
import {ComponentDatasetsTable} from "./ComponentDatasetsTable";
import {ComponentDatasetForm} from "./ComponentDatasetForm";
import {ComponentDatasetsChart} from "./ComponentDatasetsChart";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class ComponentPanelDatasets extends ComponentPanel {

    /** @type Controller */
    #controller;

    /** @type {Map<string,Dataset>} */
    #datasets = null;
    /** @type {ComponentDatasetsTable} */
    #datasetsTable;
    /** @type {ComponentDatasetsChart} */
    #datasetsChart;

    constructor(controller) {
        super();
        this.#controller = controller;
        this.#datasetsTable = new ComponentDatasetsTable(controller,
                (dataset) => this.#showDeleteDialog(dataset),
                (dataset) => this.#showEditDialog(dataset));
        this.#datasetsChart = new ComponentDatasetsChart();

        this.#controller.getDataManager().addOnDatasetsLoaded(datasets => {
            let sorted = new Map([...datasets.entries()].sort((a, b) => {
                return b[1].transactions.length - a[1].transactions.length;
            }));
            this.#datasets = sorted;
            this.#refresh(sorted);
        });
    }

    getTabId() {
        return 'finance-tab-datasets';
    }

    getTabName() {
        return [
            DomBuilder.element("i", { class: "fa fa-cog" }),
            DomBuilder.span(" Datasets")
        ];
    }

    createNode() {
        let panel = DomBuilder.div({ class: "panel-data" }, [
            this.#createHelp(),
            DomBuilder.par(null, 'Loaded datasets:'),
            this.#datasetsTable.createNode(),
            DomBuilder.par({ class: 'drag-and-drop-hint' }, 'Tip: Drag and drop file here'),
            this.#datasetsChart.createNode()
        ]);

        DragAndDropUtil.initTxtFileDragAndDrop(panel[0], (fileName, content) => {
            this.#txtFileDropped(fileName, content);
        });

        return panel;
    }

    #createHelp() {
        let sources = DomBuilder.element("ul");
        for (let [key, parser] of Parsers.AVAILABLE) {
            sources.append(DomBuilder.element("li", null, parser.getDisplayName()));
        }

        return DomBuilder.Bootstrap.alertInfo([
            DomBuilder.par(null, [
                DomBuilder.element("strong", null, "Dataset"),
                " is a collection of financial transactions. There can be multiple datasets – bank statements," +
                    " savings account statements, manually created list of cash expenses, etc."
            ]),
            "Supported sources:",
            sources
        ]);
    }

    #txtFileDropped(fileName, content) {
        let dataType = 'csv-simple';

        // select data type automatically
        let ext = fileName.split('.').pop();  // this doesn't need to be precise
        let parsers = Parsers.resolveParserByExtension(ext);
        if (parsers.length > 0) {
            dataType = parsers[0].getKey();
        }

        let dataset = new Dataset(fileName, dataType, content);
        this.#showEditDialog(dataset);
    }

    #showDeleteDialog(dataset) {
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Delete dataset');
        dialog.setBodyContent(DomBuilder.par(null, "Are you sure you want to delete this dataset?"));
        dialog.addSubmitButton('Confirm', () => this.#onDatasetDeleted(dataset));
        dialog.addCloseButton('Close');
        dialog.show(this.#controller.getDialogAnchor());
    }

    #showEditDialog(dataset) {
        let formComponent = new ComponentDatasetForm();

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent(dataset ? 'Edit dataset' : 'Add dataset');
        dialog.setBodyContent(formComponent.createNode());
        dialog.addSubmitButton('Confirm', () => this.#onDatasetChanged(dataset, formComponent.getDataset()));
        dialog.addCloseButton('Close');

        if (dataset) {
            formComponent.setRawData(dataset.name, dataset.data, dataset.dataType);
        }
        dialog.setSizeExtraLarge();
        dialog.show(this.#controller.getDialogAnchor());
    }

    #onDatasetChanged(old, dataset) {
        if (old) {
            this.#datasets.delete(old.name);
        }
        this.#datasets.set(dataset.name, dataset);
        this.#controller.getDataManager().updateDatasets(this.#datasets, true, true);
    }

    #onDatasetDeleted(dataset) {
        if (this.#datasets.delete(dataset.name)) {
            this.#controller.getDataManager().updateDatasets(this.#datasets, true, true);
        }
    }

    #refresh(datasets) {
        this.#datasetsTable.refresh(datasets);
        this.#datasetsChart.refresh(datasets);
    }
}