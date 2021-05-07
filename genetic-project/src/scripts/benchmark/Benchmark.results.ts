import { ChartConfiguration } from "chart.js";
import { Graph } from "../components/Graph";
import { isInRange, sliceIntoChunks } from "../utils/Utils";

const DEFAULT_CONFIG: ChartConfiguration = {
    type: "line",
    data: {
        labels: [],
        datasets: [],
    },
};

// LONGUEUR DES GÉNOMES

import * as benchmark_genome_size from "./results/benchmark_genome_size.json";

const labels_genome_size = sliceIntoChunks(benchmark_genome_size.results[0].targets, 100).map(
    (chunk) => chunk[0].size
);

const data_genome_size = sliceIntoChunks(benchmark_genome_size.results[0].targets, 100).map(
    (chunk) => chunk.reduce((prev, next) => prev + next.averageGen, 0) / chunk.length
);

const GRAPH_GENOME_SIZE_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_genome_size,
        datasets: [
            {
                label: "Nombre moyen de génération (en fonction de la longueur du génome)",
                data: data_genome_size,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    },
};

// KEEP BEST

import * as benchmark_keep_best from "./results/benchmark_keep_best.json";

const labels_keep_best = benchmark_keep_best.results.map((options) => `${options.options.keepBest}%`);
const data_keep_best = benchmark_keep_best.results.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_KEEP_BEST_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_keep_best,
        datasets: [
            {
                label: "Nombre moyen de génération (en fonction du taux de meilleurs génomes gardés)",
                data: data_keep_best,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

const GRAPH_KEEP_BEST_DETAILS_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_keep_best.slice(0, 80),
        datasets: [
            {
                label: "Nombre moyen de génération (en fonction du taux de meilleurs génomes gardés)",
                data: data_keep_best.slice(0, 80),
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

// TAUX DE MUTATION

import * as benchmark_mutation from "./results/benchmark_mutation.json";

const labels_mutation = benchmark_mutation.results.map((options) => `${options.options.mutationRate.toFixed(1)}%`);
const data_mutation = benchmark_mutation.results.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_MUTATION_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_mutation,
        datasets: [
            {
                label: "Nombre moyen de génération (en fonction du taux de mutation)",
                data: data_mutation,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

const mutation_details = benchmark_mutation.results.filter((option) =>
    isInRange(option.options.mutationRate, 0, 7)
);
const labels_mutation_details = mutation_details.map((options) => `${options.options.mutationRate.toFixed(1)}%`);
const data_mutation_details = mutation_details.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_MUTATION_DETAILS_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_mutation_details,
        datasets: [
            {
                label: "Nombre moyen de génération (en fonction du taux de mutation)",
                data: data_mutation_details,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

// FONCTION DE FITNESS

import * as benchmark_fitness from "./results/benchmark_fitness.json";
import * as benchmark_fitness_opti from "./results/benchmark_fitness_opti.json";

const labels_fitness = ["Simple fitness", "Advanced Fitness"];

// const data_fitness = computeFitnessData(benchmark_fitness);
// const data_fitness_opti = computeFitnessData(benchmark_fitness_opti);

const data_fitness = benchmark_fitness.results.map(
    (result) => result.targets.reduce((prev, next) => prev + next.averageGen, 0) / result.targets.length
);

const data_fitness_opti = benchmark_fitness_opti.results.map(
    (result) => result.targets.reduce((prev, next) => prev + next.averageGen, 0) / result.targets.length
);

const GRAPH_FITNESS_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    type: "bar",
    data: {
        labels: labels_fitness,
        datasets: [
            {
                label: "Nombre gén. moy. (100 %)",
                data: data_fitness,
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
                label: "Nombre gén. moy. (10 %)",
                data: data_fitness_opti,
                backgroundColor: "rgba(0, 159, 64, 0.5)",
            },
        ],
    },
};

// TAILLE DE LA POPULATION

import * as benchmark_population from "./results/benchmark_population.json";

const labels_population = benchmark_population.results.map((options) => options.options.populationSize);

const data_population = benchmark_population.results.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_POPULATION_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_population,
        datasets: [
            {
                label: "Gén. moy. (en fonction de la taille de la population) - individus de taille 50",
                data: data_population,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

import * as benchmark_population_big from "./results/benchmark_population_big.json";

const labels_population_big = benchmark_population_big.results.map((options) => options.options.populationSize);

const data_population_big = benchmark_population_big.results.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_POPULATION_BIG_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    data: {
        labels: labels_population_big,
        datasets: [
            {
                label: "Gén. moy. (en fonction de la taille de la population) - individus de taille 100",
                data: data_population_big,
                borderColor: "#0000FF",
                borderWidth: 2,
                pointRadius: 1,
            },
        ],
    },
};

// MIDPOINT

import * as benchmark_midpoint from "./results/benchmark_midpoint.json";
import { BenchmarkResults } from "./Benchmark.worker";

const labels_midpoint = benchmark_midpoint.results.map(
    (options) => `${options.options.midpointPercent || "Aléat. "}%`
);

const data_midpoint = benchmark_midpoint.results.map(
    (options) => options.targets.reduce((prev, next) => prev + next.averageGen, 0) / options.targets.length
);

const GRAPH_MIDPOINT_CONFIG: ChartConfiguration = {
    ...DEFAULT_CONFIG,
    type: "bar",
    data: {
        labels: labels_midpoint,
        datasets: [
            {
                label: "Gén. moy. (en fonction du midpoint) - individus de taille 50",
                data: data_midpoint,
                backgroundColor: "#0000FF",
            },
        ],
    },
};

// CRÉATION DES GRAPHES

let graph_genome_size: Graph;
let graph_keep_best: Graph;
let graph_keep_best_details: Graph;
let graph_mutation: Graph;
let graph_mutation_details: Graph;
let graph_fitness: Graph;
let graph_population: Graph;
let graph_population_big: Graph;
let graph_midpoint: Graph;

export function initBenchmarkGraphs() {
    graph_genome_size = new Graph("benchmark_genome_size", GRAPH_GENOME_SIZE_CONFIG);
    graph_keep_best = new Graph("benchmark_keep_best", GRAPH_KEEP_BEST_CONFIG);
    graph_keep_best_details = new Graph("benchmark_keep_best_details", GRAPH_KEEP_BEST_DETAILS_CONFIG);
    graph_mutation = new Graph("benchmark_mutation", GRAPH_MUTATION_CONFIG);
    graph_mutation_details = new Graph("benchmark_mutation_details", GRAPH_MUTATION_DETAILS_CONFIG);
    graph_fitness = new Graph("benchmark_fitness", GRAPH_FITNESS_CONFIG);
    graph_population = new Graph("benchmark_population", GRAPH_POPULATION_CONFIG);
    graph_population_big = new Graph("benchmark_population_big", GRAPH_POPULATION_BIG_CONFIG);
    graph_midpoint = new Graph("benchmark_midpoint", GRAPH_MIDPOINT_CONFIG);
}
