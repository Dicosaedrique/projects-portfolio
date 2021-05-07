import { Chart, registerables, ChartConfiguration } from "chart.js";
import { FitnessStats } from "../genetic/GeneticExperience";
Chart.register(...registerables);

export { Chart };

const GRAPH_CONFIG: ChartConfiguration = {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Acceptabilité Moyenne",
                data: [],
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: "Meilleure Acceptabilité",
                data: [],
                borderColor: "#00FF00",
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        animation: false,
        maintainAspectRatio: false,
    },
};

export class Graph {
    chart: Chart;

    constructor(context: string, config: ChartConfiguration) {
        this.chart = new Chart(context, config);
        this.chart.update();
    }
}

export default class AverageFitnessGraph extends Graph {
    step: number;
    generations: Set<number>;

    constructor(context: string, step = 1) {
        super(context, GRAPH_CONFIG);
        this.generations = new Set();
        this.chart.update();
        this.step = step;
    }

    reset() {
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.generations = new Set();
        this.chart.update();
    }

    addGeneration(fitnessStats: FitnessStats) {
        const gen = Math.floor(fitnessStats.gen / this.step);
        if (!this.generations.has(gen)) {
            this.generations.add(gen);

            this.chart.data.labels?.push(fitnessStats.gen);
            this.chart.data.datasets[0].data.push(fitnessStats.averageFitness);
            this.chart.data.datasets[1].data.push(fitnessStats.bestFitness);
            this.chart.update();
        }
    }
}
