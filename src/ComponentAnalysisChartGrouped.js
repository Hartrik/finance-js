import { DomBuilder } from "./DomBuilder";
import Chart from 'chart.js/auto';

/**
 *
 * @version 2023-04-01
 * @author Patrik Harag
 */
export class ComponentAnalysisChartGrouped {

    #context;

    #groupedTransactions;
    #selectedFilter;
    #allFilters;

    #container = DomBuilder.div({ class: 'chart-panel' });

    constructor(context, groupedTransactions, allFilters, selectedFilter) {
        this.#context = context;
        this.#groupedTransactions = groupedTransactions;
        this.#allFilters = allFilters;
        this.#selectedFilter = selectedFilter;
    }

    createNode() {
        return this.#container;
    }

    // chart's parent needs to be in the dom
    refresh() {
        if (this.#groupedTransactions.size > 3 && this.#groupedTransactions.size < 100) {
            this.#buildCashFlowChart(this.#groupedTransactions, this.#container);
            this.#buildCashFlowAccChart(this.#groupedTransactions, this.#container);
        }
    }

    #buildCashFlowChart(groupedTransactions, parent) {
        let expensesDataset = {
            label: "expenses",
            data: [],
            borderColor: 'rgb(160,0,0)',
            backgroundColor: 'rgba(160,0,0,0.2)',
            fill: true
        };
        let receiptsDataset = {
            label: "receipts",
            data: [],
            borderColor: 'rgb(0,100,0)',
            backgroundColor: 'rgba(0,100,0,0.2)',
            fill: true
        };
        let resultsDataset = {
            label: "results",
            data: [],
            borderColor: 'rgb(0,0,0)',
            fill: false
        };

        Array.from(groupedTransactions.keys()).sort().forEach(k => {
            let group = groupedTransactions.get(k);
            let expenses = group.transactions.filter(t => t.value < 0).reduce((sum, t) => sum + t.value, 0);
            let receipts = group.transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value, 0);
            expensesDataset.data.push(expenses);
            receiptsDataset.data.push(receipts);
            resultsDataset.data.push(expenses + receipts);
        })

        let datasets = [
            expensesDataset,
            receiptsDataset,
            resultsDataset
        ];

        const config = {
            type: 'line',
            data: {
                labels: Array.from(groupedTransactions.keys()).sort(),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: (ctx) => 'Receipts and expenses'
                    },
                    tooltip: {
                        mode: 'index'
                    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time period'
                        }
                    },
                    y: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            }
        };

        let canvas = DomBuilder.element('canvas', { width: 400, height: 150 });
        parent.append(canvas);
        const chart = new Chart(canvas, config);
    }

    #buildCashFlowAccChart(groupedTransactions, parent) {
        let valueDataset = {
            label: "value",
            data: [],
            borderColor: 'rgb(45,114,204)',
            backgroundColor: 'rgba(45,114,204,0.2)',
            fill: true
        };

        let sum = 0;
        Array.from(groupedTransactions.keys()).sort().forEach(k => {
            let group = groupedTransactions.get(k);
            let expenses = group.transactions.filter(t => t.value < 0).reduce((sum, t) => sum + t.value, 0);
            let receipts = group.transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value, 0);

            sum += expenses + receipts;
            valueDataset.data.push(sum);
        })

        let datasets = [
            valueDataset
        ];

        const config = {
            type: 'line',
            data: {
                labels: Array.from(groupedTransactions.keys()).sort(),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: (ctx) => 'Accumulative'
                    },
                    tooltip: {
                        mode: 'index'
                    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
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

        let canvas = DomBuilder.element('canvas', { width: 400, height: 150 });
        parent.append(canvas);
        const chart = new Chart(canvas, config);
    }
}
