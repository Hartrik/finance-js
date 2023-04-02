import { DialogDetails } from  "./DialogDetails.js"
import { DialogStats } from  "./DialogStats.js"
import { Utils } from "./Utils.js"
import { DomBuilder } from "./DomBuilder";
import { Filters } from "./Filters";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentAnalysisTableCategories {

    #context;

    /** @typedef Map<string,GroupedStatements> */
    #groupedStatements;
    #selectedFilter;
    #allFilters;

    #tableBuilder = new DomBuilder.BootstrapTable();

    constructor(context, groupedStatements, allFilters, selectedFilter) {
        this.#context = context;
        this.#groupedStatements = groupedStatements;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        this.#build(this.#groupedStatements, this.#allFilters, this.#selectedFilter);
        return this.#tableBuilder.createNode();
    }

    #build(groupedStatements, filters, filter) {
        // prepare row data
        let rowData = Array.from(groupedStatements.keys()).sort().map(k => {
            let group = groupedStatements.get(k);
            let categories = Filters.groupByFilters(group.statements, filters, "Others");
            return {
                categories: categories,
                group: group
            };
        });

        // sum non-empty categories
        let categoriesSums = new Map();
        rowData.forEach(data => {
            data.categories.forEach((value, key) => {
                if (value.statements.length > 0) {
                    let s = value.statements.reduce((sum, s) => sum + s.value, 0);
                    let old = categoriesSums.get(key);
                    categoriesSums.set(key, (old !== undefined) ? old + s : s);
                }
            });
        });

        // render table rows
        let sum = 0;
        rowData.forEach(data => {
            let group = data.group;
            let groupSum = 0;

            let row = DomBuilder.element('tr');
            row.append(DomBuilder.element('td', { class: 'group-key-cell' }, DomBuilder.span(group.key)));

            data.categories.forEach((value, key) => {
                if (!categoriesSums.has(key)) {
                    // skip this one
                    return;
                }

                let categorySum = 0;
                value.statements.forEach(statement => {
                    categorySum += statement.value;
                });
                groupSum += categorySum;

                row.append(DomBuilder.element('td', { class: `value-cell ${categorySum < 0 ? 'negative' : 'positive'}` },
                        Utils.createValue(categorySum)));
            });

            sum += groupSum;

            row.append(DomBuilder.element('td', { class: `value-cell result ${groupSum < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(groupSum)));
            row.append(DomBuilder.element('td', { class: `value-cell result ${sum < 0 ? 'negative' : 'positive'}` },
                    Utils.createValue(sum)));

            // details
            row.append(DomBuilder.element('td', { class: 'options-cell' }, [
                DomBuilder.link('', { class: 'fa fa-eye' }, () => {
                    let dialog = new DialogDetails(this.#context, group.key, group.statements, filter, filters);
                    dialog.show();
                }),
                DomBuilder.link('', { class: 'fa fa-pie-chart' }, () => {
                    let dialog = new DialogStats(this.#context, group.key, group.statements, filters);
                    dialog.show();
                })
            ]));

            this.#tableBuilder.addRowBefore(row);
        });

        // render table header
        let headerRow = this.#createTableRowWithLabels(filters, categoriesSums);
        this.#tableBuilder.addRowBefore(headerRow);

        // render table footer
        if (groupedStatements.size > 10) {
            let footerRow = this.#createTableRowWithLabels(filters, categoriesSums);
            this.#tableBuilder.addRow(footerRow);
        }
        let footerRow = this.#createTableRowWithSums(filters, categoriesSums);
        this.#tableBuilder.addRow(footerRow);
    }

    #createTableRowWithLabels(filters, categoriesSums) {
        let headerRow = DomBuilder.element('tr');
        headerRow.append(DomBuilder.element('td'));
        Filters.groupByFilters([], filters, "Others").forEach((value, key) => {
            if (categoriesSums.has(key)) {
                let label = (!value.others) ? Utils.createFilterLabel(value.filter) : value.filter.name;
                headerRow.append(DomBuilder.element('td', { class: 'label-cell' }, label));
            }
        });
        headerRow.append(DomBuilder.element('td'));
        headerRow.append(DomBuilder.element('td'));
        headerRow.append(DomBuilder.element('td'));
        return headerRow;
    }

    #createTableRowWithSums(filters, categoriesSums) {
        let footerRow = DomBuilder.element('tr');
        footerRow.append(DomBuilder.element('td'));
        Filters.groupByFilters([], filters, "Others").forEach((value, key) => {
            let v = categoriesSums.get(key);
            if (v !== undefined) {
                footerRow.append(DomBuilder.element('td', {class: `value-cell result ${v < 0 ? 'negative' : 'positive'}`},
                    Utils.createValue(v)));
            }
        });
        footerRow.append(DomBuilder.element('td'));
        footerRow.append(DomBuilder.element('td'));
        footerRow.append(DomBuilder.element('td'));
        return footerRow;
    }
}
