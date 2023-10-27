
import Chart from 'chart.js/auto';
import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class ComponentDatasetsChart {

    panel = DomBuilder.div({ class: 'chart-panel' });

    createNode() {
        return this.panel;
    }

    /**
     *
     * @param datasets {Map<string,Dataset>}
     */
    refresh(datasets) {
        this.panel.empty();
        if (datasets.size > 1) {
            this.#buildPieChart(datasets);
        }
    }

    #buildPieChart(datasets) {
        let sizes = [];
        let labels = [];
        for (let [key, dataset] of datasets) {
            sizes.push(dataset.transactions.length);
            labels.push(dataset.name);
        }

        const data = {
            labels: labels,
            datasets: [{
                label: 'Transactions',
                data: sizes,
                backgroundColor: [
                    'rgba(218,41,21,0.8)',
                    'rgba(218,74,21,0.8)',
                    'rgba(218,120,21,0.8)',
                    'rgba(255,204,0,0.8)',
                    'rgba(194,175,108,0.8)',
                    'rgba(108,108,108,0.8)',
                    'rgba(79,79,79,0.8)',
                    'rgba(58,58,58,0.8)',
                ],
                borderWidth: 1
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        let canvas = DomBuilder.element('canvas');
        this.panel.append(canvas);
        const chart = new Chart(canvas, config);
    }
}