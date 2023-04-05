import { DomBuilder } from "./DomBuilder";
import Chart from 'chart.js/auto';
import {Filters} from "./Filters";
import {Utils} from "./Utils";

/**
 *
 * @version 2023-04-05
 * @author Patrik Harag
 */
export class ComponentAnalysisChartCategories {

    static #DEFAULT_COLORS = [
        '#1b87c2',
        '#87058c',
        '#ad6607',
        '#0b1cc0',
        '#de3391',
        '#ffcc00',
        '#01a979',
    ];


    #context;

    #groupedStatements;
    #selectedFilter;
    #allFilters;

    #container = DomBuilder.div({ class: 'chart-panel' });

    constructor(context, groupedStatements, allFilters, selectedFilter) {
        this.#context = context;
        this.#groupedStatements = groupedStatements;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        return this.#container;
    }

    // chart's parent needs to be in the dom
    refresh() {
        if (this.#groupedStatements.size > 3 && this.#groupedStatements.size < 100) {
            this.#buildCashFlowChart(this.#groupedStatements, this.#container);
        }
    }

    #buildCashFlowChart(groupedStatements, parent) {
        // prepare data
        let sortedGroups = Array.from(groupedStatements.keys()).sort();

        let data = sortedGroups.map(k => {
            let group = groupedStatements.get(k);
            let categories = Filters.groupByFilters(group.statements, this.#allFilters, "Others");
            return {
                categories: categories,
                group: group
            };
        });

        // sum non-empty categories
        let nonEmptyCategories = new Set();
        let uniqueColors = new Set();
        data.forEach(data => {
            data.categories.forEach((value, key) => {
                if (value.statements.length > 0) {
                    nonEmptyCategories.add(key);
                    uniqueColors.add((value.filter.color !== undefined) ? value.filter.color : null);
                }
            });
        });

        console.log(uniqueColors);

        let datasets = [];

        let randomColorBuffer = [...ComponentAnalysisChartCategories.#DEFAULT_COLORS];
        Filters.groupByFilters([], this.#allFilters, "Others").forEach((value, key) => {
            if (nonEmptyCategories.has(key)) {

                if (randomColorBuffer.length === 0) {
                    randomColorBuffer = [...ComponentAnalysisChartCategories.#DEFAULT_COLORS];
                }
                let color = randomColorBuffer.shift();
                if (value.filter.color != null && !(uniqueColors.size === 1 && nonEmptyCategories.size > 1)) {
                    color = value.filter.color;
                }

                const [r, g, b] = Utils.parseHexColor(color);

                let dataset = {
                    label: value.filter.name,
                    data: [],
                    borderWidth: data.length < 15 ? 3 : 0,
                    borderColor: data.length < 15 ? color : undefined,
                    borderSkipped: data.length < 15 ? false : undefined,
                    backgroundColor: data.length < 15 ? `rgba(${r},${g},${b},0.2)` : `rgb(${r},${g},${b})`,
                    fill: true
                };

                datasets.push(dataset);
            }
        });

        data.forEach((value) => {
            let i = 0;
            let sum = 0;
            value.categories.forEach((category, key) => {
                if (!nonEmptyCategories.has(key)) {
                    // skip this one
                    return;
                }

                let result = category.statements.reduce((sum, s) => sum + s.value, 0);
                datasets[i].data.push(result);

                sum += result;
                i++;
            });
        });

        const config = {
            type: 'bar',
            data: {
                labels: sortedGroups,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Categories'
                    },
                    legend: {
                        display: (datasets.length < 6)
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Time period'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            }
        };

        let canvas = $(`<canvas width="400" height="150"></canvas>`);
        parent.append(canvas);
        const chart = new Chart(canvas, config);
    }
}
