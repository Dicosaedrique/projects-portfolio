import GeneticExperience, { ExperienceOptions } from "../genetic/GeneticExperience";
import Genome from "../genetic/Genome";
import {
    benchmark_genome_size,
    benchmark_keep_best,
    benchmark_mutation,
    benchmark_fitness,
    benchmark_fitness_opti,
    benchmark_population,
    benchmark_midpoint,
} from "./Benchmark.config";

const ctx: Worker = self as any;

let benchmark: BenchmarkWorker<string>;

ctx.onmessage = (event: MessageEvent<string>) => {
    if (event.data === "start") {
        benchmark = new BenchmarkWorker<string>();
        benchmark.start(...benchmark_fitness_opti);
    }
};

export type Options = {
    populationSize: number;
    mutationRate: number;
    fitnessStrategy: string;
    midpointPercent?: number;
    keepBest: number;
};

// les résultats d'une expérience (on filtre les vrais résultats pour ne pas avoir des fichiers de données énormes)
export type Results = {
    success: boolean; // si l'expérience a réussie
    generation: number; // numéro de la génération
};

export type OptionsGenerator<Gene> = () => ExperienceOptions<Gene>[];
export type TargetsGenerator<Gene> = () => Genome<Gene>[];

// les résultats d'un benchmark
export type BenchmarkResults = {
    perTarget: number;
    total: number;
    duration: number;
    results: BenchmarkOptionResults[];
};

// les résultats d'une option dans le benchmark
export type BenchmarkOptionResults = {
    options: Options;
    targets: BenchmarkTargetResults[];
};

// les résultats d'une cible dans le benchmark
export type BenchmarkTargetResults = {
    dna: string;
    size: number;
    averageGen: number;
    results: Results[];
};

// classe de benchmarking qui tourne dans un worker
export class BenchmarkWorker<Gene> {
    private options: ExperienceOptions<Gene>[];
    private targets: Genome<Gene>[];
    private perTarget: number;

    // créer un benchmark avec
    constructor() {
        this.options = [];
        this.targets = [];
        this.perTarget = 1;
    }

    // initialise le benchmark avec des options, des cibles et un nombre de test à faire par cible puis le lance
    start(
        optionsGenerator: OptionsGenerator<Gene>,
        targetsGenerator: TargetsGenerator<Gene>,
        perTarget: number = 1
    ): void {
        this.options = optionsGenerator();
        this.targets = targetsGenerator();
        this.perTarget = Math.max(1, perTarget);

        this.benchmark();
    }

    // lance le benchmark et retoure les résultats
    private benchmark() {
        const start = performance.now();

        const total = this.options.length * this.targets.length * this.perTarget;
        let current = 0;

        ctx.postMessage({ message: "start", data: total });

        const res: BenchmarkResults = {
            perTarget: this.perTarget,
            total,
            results: [],
            duration: 0,
        };

        let experience: GeneticExperience<Gene>;

        // pour chaque options
        for (const option of this.options) {
            // création des résultats de l'option
            const optionResults: BenchmarkOptionResults = {
                options: {
                    populationSize: option.populationSize,
                    mutationRate: option.mutationRate,
                    fitnessStrategy: option.fitnessStrategy.constructor.name,
                    midpointPercent: option.midpointPercent,
                    keepBest: option.keepBest,
                },
                targets: [],
            };

            // création d'une expérience pour ces options
            experience = new GeneticExperience<Gene>(option);

            // pour chaque cible
            for (const target of this.targets) {
                // création des résultats de la cible
                const targetResults: BenchmarkTargetResults = {
                    dna: target.getDNA(),
                    size: target.getSize(),
                    averageGen: 0,
                    results: [],
                };

                // répétition de la recherche de la cible "perTarget" fois
                for (let i = 0; i < this.perTarget; i++) {
                    experience.init(target);

                    // tant que l'expérience n'est pas fini
                    while (!experience.isFinished()) {
                        experience.update(); // met à jour l'expérience
                    }

                    const { success, generation } = experience.getResults();

                    targetResults.results.push({ success, generation });

                    current++;
                    ctx.postMessage({ message: "progress", data: { current, total } });
                }

                // calcul de la génération moyenne pour cette cible
                targetResults.averageGen =
                    targetResults.results.reduce((prev, next) => prev + next.generation, 0) /
                    targetResults.results.length;

                // ajout des résultats de la cible à ceux de l'option
                optionResults.targets.push(targetResults);
            }

            // ajout des résultats de l'option aux résultats du benchmark
            res.results.push(optionResults);
        }

        res.duration = performance.now() - start;

        ctx.postMessage({ message: "end", data: res });
    }
}

export default null as any;
