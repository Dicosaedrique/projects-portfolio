import * as $ from "jquery";

import Select from "./components/Select";
import Slider from "./components/Slider";
import Controller, { BEST_OPTIONS, WORST_OPTIONS } from "./Controller";
import { fitnessStrategies, FitnessStrategy } from "./genetic/fitness";
import Renderer from "./renderers/Renderer";
import { formatString } from "./utils/StringFormat";
import AverageFitnessGraph from "./components/Graph";
import GeneticExperience, {
    ExperienceOptions,
    ExperienceResults,
    FitnessStats,
} from "./genetic/GeneticExperience";
import { BenchmarkResults } from "./benchmark/Benchmark.worker";
import { downloadObjectAsJson } from "./utils/Utils";

// classe qui s'occupe de gérer la vue pour charger les différents paramètres du programme
export default class View {
    controller: Controller; // référence vers le controlleur
    options: ExperienceOptions<string>;

    fitnessGraph: AverageFitnessGraph; // graphique de fitness pour la recherche en live

    // élément d'interface
    phraseInput: JQuery<HTMLElement>;
    startButton: JQuery<HTMLElement>;
    stopButton: JQuery<HTMLElement>;
    pauseButton: JQuery<HTMLElement>;
    benchmarkButton: JQuery<HTMLElement>;
    populationSizeInput: JQuery<HTMLElement>;
    mutationRateInput: JQuery<HTMLElement>;
    generatePhraseButton: JQuery<HTMLElement>;
    maxDisplayedElementInput: JQuery<HTMLElement>;
    randomMidpointInput: JQuery<HTMLElement>;
    midpointContainer: JQuery<HTMLElement>;
    naturalSelectionInput: JQuery<HTMLElement>;
    resultGeneration: JQuery<HTMLElement>;
    resultSuccess: JQuery<HTMLElement>;
    resultFailure: JQuery<HTMLElement>;
    benchmarkContainer: JQuery<HTMLElement>;
    benchmarkStart: JQuery<HTMLElement>;
    benchmarkProgress: JQuery<HTMLElement>;
    benchmarkProgressDetails: JQuery<HTMLElement>;
    benchmarkResults: JQuery<HTMLElement>;
    downloadBenchmarkResults: JQuery<HTMLElement>;

    constructor(controller: Controller) {
        this.options = { ...BEST_OPTIONS };

        this.controller = controller;
        this.controller.onSuccess = this.onSuccess;
        this.controller.onFitnessChange = this.onFitnessChange;

        this.fitnessGraph = new AverageFitnessGraph("chart_canvas", 5);

        // récupération des éléments dans le DOM
        this.phraseInput = $("#phrase_input");
        this.startButton = $("#button_start");
        this.stopButton = $("#button_stop");
        this.pauseButton = $("#button_pause");
        this.generatePhraseButton = $("#button_generate_phrase");
        this.populationSizeInput = $("#population_size");
        this.mutationRateInput = $("#mutation_rate");
        this.maxDisplayedElementInput = $("#max_displayed_elem");
        this.randomMidpointInput = $("#random_midpoint");
        this.midpointContainer = $("#slider_midpoint");
        this.naturalSelectionInput = $("#keep_best");
        this.resultGeneration = $("#result_generation");
        this.resultSuccess = $("#result_success");
        this.resultFailure = $("#result_failure");

        // partie benchmark
        this.benchmarkButton = $("#button_benchmark");
        this.benchmarkContainer = $("#benchmark_container");
        this.benchmarkStart = $("#benchmark_start");
        this.benchmarkProgress = $("#benchmark_progress");
        this.benchmarkProgressDetails = $("#benchmark_progress_details");
        this.benchmarkResults = $("#benchmark_result");
        this.downloadBenchmarkResults = $("#download_results");

        this.init();
    }

    // initialise les listener et l'interface
    private init() {
        // ASSIGNE LES LISTENERS D'EVENT

        this.phraseInput.on("input", this.onPhraseChange);
        this.onClickGeneratePhrase(); // définit la valeur du champ une première fois

        this.startButton.on("click", this.onClickStart);
        this.stopButton.on("click", this.onClickStop);
        this.pauseButton.on("click", this.onClickPause);
        this.generatePhraseButton.on("click", this.onClickGeneratePhrase);
        this.benchmarkButton.on("click", this.onClickBenchmark);

        this.populationSizeInput.val(this.options.populationSize);
        this.mutationRateInput.val(this.options.mutationRate);
        this.naturalSelectionInput.val(this.options.keepBest);

        this.maxDisplayedElementInput.on("input", this.onMaxDisplayedElementChange);
        this.maxDisplayedElementInput.val(Renderer.DEFAULT_MAX_DISPLAYED_ELEM);

        this.randomMidpointInput.on("change", this.onRandomMidpointChange);

        // AUTRES

        // création du composant de selection du type de stratégie de fitness
        new Select<FitnessStrategy<string>>(
            fitnessStrategies,
            $("#fitness-container"),
            "fitness_input",
            this.onFitnessStrategyChange
        );

        // création du composant de selection du midpoint (en pourcentage)
        new Slider(50, 5, 95, this.midpointContainer, this.onMidpointChange, 0, 100);
        this.midpointContainer.hide();

        this.resultSuccess.hide();

        this.resultFailure.text(
            `Aucune solution n'a été trouvée ! Limite de génération atteinte (${GeneticExperience.MAX_GENERATION}).`
        );
        this.resultFailure.hide();

        // initialisation du benchmark
        this.initBenchmark();
    }

    // lorsque l'input du champ de saisie de la phrase change
    private onPhraseChange = () => {
        this.phraseInput.val(formatString(this.phraseInput.val() as string));
    };

    // lorsque l'on appuie sur le bouton start, démarre le contrôleur
    private onClickStart = () => {
        const phrase = formatString(this.phraseInput.val() as string);

        this.options.populationSize = Number.parseInt(this.populationSizeInput.val() as string);
        this.options.mutationRate = this.mutationRateInput.val() as number;
        this.options.keepBest = Number.parseInt(this.naturalSelectionInput.val() as string);

        this.controller.init(this.options, phrase);
        this.controller.start();

        this.resultSuccess.hide();
        this.resultFailure.hide();
    };

    // lorsque l'on appuie sur le bouton stop, stop le contrôleur
    private onClickStop = () => {
        this.controller.stop();
    };

    // lorsque l'on appuie sur le bouton pause, pause le contrôleur
    private onClickPause = () => {
        this.controller.pause();
    };

    // lorsque l'on appuie sur le bouton pour générer une nouvelle phrase
    private onClickGeneratePhrase = () => {
        this.phraseInput.val(Controller.getRandomPhrase());
    };

    // lorsque l'on appuie sur bouton de lancement du benchmark
    private onClickBenchmark = () => {
        this.benchmarkButton.hide();
        this.benchmarkResults.hide();
        this.benchmarkContainer.show();
        this.controller.startBenchmark();
    };

    // lorsque l'on change le nombre d'éléments max à afficher dans le renderer
    private onMaxDisplayedElementChange = () => {
        this.controller.renderer.setMaximum(this.maxDisplayedElementInput.val() as number);
    };

    // lorsque la fitness strategy change
    private onFitnessStrategyChange = (strategy: FitnessStrategy<string>) => {
        this.options.fitnessStrategy = strategy;
    };

    // lorsque le midpoint change
    private onMidpointChange = (value: number) => {
        this.options.midpointPercent = value;
    };

    // lorsque l'on coche ou décoche le midpoint aléatoire (affiche la selection manuelle du midpoint)
    private onRandomMidpointChange = () => {
        const checked = this.randomMidpointInput.prop("checked") as boolean;
        if (checked) {
            this.options.midpointPercent = undefined;
            this.midpointContainer.hide();
        } else {
            this.midpointContainer.show();
        }
    };

    // lorsque les stats de fitness changent (nouvelle génération), on les affiche sur le graphe
    private onFitnessChange = (fitnessStats: FitnessStats) => {
        // si on reset les générations, on reset les graphs
        if (fitnessStats.gen === 0) {
            this.fitnessGraph.reset();
        } else {
            this.fitnessGraph.addGeneration(fitnessStats);
        }
    };

    // lorsque l'on finit la recherche (résultats de la recherche)
    private onSuccess = (results: ExperienceResults<string>) => {
        if (results.success) {
            this.resultSuccess.show();
            this.resultGeneration.text(results.generation);
        } else {
            this.resultFailure.show();
        }
        console.log(results);
    };

    // initialisation du benchmark
    private initBenchmark() {
        this.benchmarkContainer.hide();

        this.controller.benchmark.onStart = (total) => {
            this.benchmarkStart.text(`Lancement du benchmark : ${total} recherche prévues.`);
        };

        this.controller.benchmark.onEnd = (results: BenchmarkResults) => {
            this.benchmarkButton.show();
            this.benchmarkResults.show();
            this.benchmarkResults.text(
                `Le benchmark a finit en ${(results.duration / 1000 / 60).toFixed(2)} minutes pour un total de ${
                    results.total
                } recherches.`
            );

            const download = this.downloadBenchmarkResults.prop("checked") as boolean;

            if (download) {
                downloadObjectAsJson(results, "raw_benchmark_results");
            }

            console.log(results);
        };

        this.controller.benchmark.onProgress = (current, total) => {
            const percent = `${Math.floor((current / total) * 100)}%`;
            this.benchmarkProgressDetails.text(`${current} / ${total}`);
            this.benchmarkProgress.width(percent);
            this.benchmarkProgress.text(percent);
        };
    }
}
