
import Chart from 'chart.js/auto';

/**
 *
 * @version 2022-02-15
 * @author Patrik Harag
 */
export class ComponentAnalysisChart {

    context;

    panel = $(`<div class="chart-panel"></div>`);

    constructor(context) {
        this.context = context;
    }

    createNode() {
        return this.panel;
    }

    refresh(statements, allFilters, filter) {
        this.panel.empty();
        this._build(statements, allFilters, filter);
    }

    refreshWithGrouping(groupedStatements, allFilters, filter) {
        this.panel.empty();
        if (groupedStatements.size > 3 && groupedStatements.size < 100) {
            this._buildWithGroups(groupedStatements, allFilters, filter);
        }
    }

    _build(statements, filters, filter) {
        // nothing
    }

    _buildWithGroups(groupedStatements, filters, filter) {
        this._buildCashFlowChart(groupedStatements);
        this._buildCashFlowAccChart(groupedStatements);
    }

    _buildCashFlowChart(groupedStatements) {
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

        Array.from(groupedStatements.keys()).sort().forEach(k => {
            let group = groupedStatements.get(k);
            let expenses = group.statements.filter(s => s.value < 0).reduce((sum, s) => sum + s.value, 0);
            let receipts = group.statements.filter(s => s.value > 0).reduce((sum, s) => sum + s.value, 0);
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
                labels: Array.from(groupedStatements.keys()).sort(),
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

        let canvas = $(`<canvas width="400" height="150"></canvas>`);
        this.panel.append(canvas);
        const chart = new Chart(canvas, config);
    }

    _buildCashFlowAccChart(groupedStatements) {
        let valueDataset = {
            label: "value",
            data: [],
            borderColor: 'rgb(45,114,204)',
            backgroundColor: 'rgba(45,114,204,0.2)',
            fill: true
        };

        let sum = 0;
        Array.from(groupedStatements.keys()).sort().forEach(k => {
            let group = groupedStatements.get(k);
            let expenses = group.statements.filter(s => s.value < 0).reduce((sum, s) => sum + s.value, 0);
            let receipts = group.statements.filter(s => s.value > 0).reduce((sum, s) => sum + s.value, 0);

            sum += expenses + receipts;
            valueDataset.data.push(sum);
        })

        let datasets = [
            valueDataset
        ];

        const config = {
            type: 'line',
            data: {
                labels: Array.from(groupedStatements.keys()).sort(),
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

        let canvas = $(`<canvas width="400" height="150"></canvas>`);
        this.panel.append(canvas);
        const chart = new Chart(canvas, config);
    }
}
