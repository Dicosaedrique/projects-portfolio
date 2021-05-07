import { AdvancedFitnessStrategy, SimpleFitnessStrategy } from "../genetic/fitness";
import { ExperienceOptions } from "../genetic/GeneticExperience";
import Genome from "../genetic/Genome";
import { generateStringGene } from "../utils/StringFormat";
import { OptionsGenerator, TargetsGenerator } from "./Benchmark.worker";

/////////////////////////////////////////////////////////////////////////////////
// CE FICHIER CONTIENT LES FONCTIONS DE GÉNÉRATIONS DES OPTIONS DE BENCHMARKING
/////////////////////////////////////////////////////////////////////////////////

type BenchmarkParams<Gene> = [OptionsGenerator<Gene>, TargetsGenerator<Gene>, number];

const best_options: ExperienceOptions<string> = {
    populationSize: 200,
    mutationRate: 2,
    fitnessStrategy: new AdvancedFitnessStrategy<string>(),
    keepBest: 10,
};

// créer un génome aléatoire de longueur donnée
function createGenomeByLength(length: number): Genome<string> {
    return new Genome(length, generateStringGene);
}

// renvoi une fonction de génération de "count" génomes de longueur "length"
function generateGenomes(length: number, count: number): TargetsGenerator<string> {
    return () => {
        return Array.from({ length: count }, (_) => createGenomeByLength(length));
    };
}

// renvoi une fonction de génération de "count" génomes de longueur "minLength" à "maxLength"
function generateGenomesRange(
    minLength: number,
    maxLength: number,
    count: number,
    step = 1
): TargetsGenerator<string> {
    return () => {
        const genomes = [];

        for (let i = minLength; i <= maxLength; i += step) {
            genomes.push(...generateGenomes(i, count)());
        }

        return genomes;
    };
}

// génère le meilleur set d'options
function generateBestOptions(): ExperienceOptions<string>[] {
    return [{ ...best_options }];
}

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°1 : DÉTERMINER SI LA DIFFICULTÉ DE RÉSOLUTION EN FONCTION DE LA LONGUEUR DU GÉNOME EST LINÉAIRE

export const benchmark_genome_size: BenchmarkParams<string> = [
    generateBestOptions,
    generateGenomesRange(1, 100, 100),
    1,
];

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°2 : DÉTERMINER L'IMPACT DU PARAMÈTRE KEEPBEST

const generateOptions_keep_best_1_100: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const options = [];

    const min = 1,
        max = 100;

    for (let i = min; i <= max; i++) {
        const option = { ...best_options };
        option.keepBest = i;
        options.push(option);
    }

    return options;
};

export const benchmark_keep_best: BenchmarkParams<string> = [
    generateOptions_keep_best_1_100,
    generateGenomes(50, 5),
    10,
];

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°3 : COMPARAISON DES TAUX DE MUTATION

const generateOptions_mutation: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const options = [];

    const min = 0.1,
        max = 8.0;

    for (let i = min; i <= max; i += 0.1) {
        const option = { ...best_options };
        option.mutationRate = i;
        options.push(option);
    }

    return options;
};

export const benchmark_mutation: BenchmarkParams<string> = [generateOptions_mutation, generateGenomes(50, 10), 1];

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°4 : COMPARAISON DES FONCTIONS DE FITNESS

const generateOptions_fitness: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const option: any = {
        populationSize: 200,
        mutationRate: 1,
        keepBest: 100,
    };

    const options = [{ ...option }, { ...option }];

    options[0].fitnessStrategy = new SimpleFitnessStrategy();
    options[1].fitnessStrategy = new AdvancedFitnessStrategy();

    return options;
};

const generateOptions_fitness_opti: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const option: any = {
        populationSize: 200,
        mutationRate: 1,
        keepBest: 10,
    };

    const options = [{ ...option }, { ...option }];

    options[0].fitnessStrategy = new SimpleFitnessStrategy();
    options[1].fitnessStrategy = new AdvancedFitnessStrategy();

    return options;
};

export const benchmark_fitness: BenchmarkParams<string> = [generateOptions_fitness, generateGenomes(30, 20), 1];
export const benchmark_fitness_opti: BenchmarkParams<string> = [
    generateOptions_fitness_opti,
    generateGenomes(30, 20),
    1,
];

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°5 : COMPARAISON DES TAILLES DE POPULATIONS POUR DES PHRASES DE TAILLES MOYENNES

const generateOptions_population: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const options = [];

    const min = 100,
        max = 10000;

    for (let i = min; i <= max; i += 100) {
        const option = { ...best_options };
        option.populationSize = i;
        options.push(option);
    }

    return options;
};

export const benchmark_population: BenchmarkParams<string> = [
    generateOptions_population,
    generateGenomes(100, 10),
    1,
];

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
// BENCHMARK N°6 : COMPARAISON DU MIDPOINT

const generateOptions_midpoint: OptionsGenerator<string> = (): ExperienceOptions<string>[] => {
    const optionsMidpointRandom = { ...best_options };
    const options = [optionsMidpointRandom];

    const min = 5,
        max = 95;

    for (let i = min; i <= max; i += 5) {
        const option = { ...best_options };
        option.midpointPercent = i;
        options.push(option);
    }

    return options;
};

export const benchmark_midpoint: BenchmarkParams<string> = [generateOptions_midpoint, generateGenomes(50, 100), 1];

//////////////////////////////////////////////////////////////////////////
