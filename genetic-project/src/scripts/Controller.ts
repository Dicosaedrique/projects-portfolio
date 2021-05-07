import { AdvancedFitnessStrategy, SimpleFitnessStrategy } from "./genetic/fitness";
import GeneticExperience, {
    ExperienceOptions,
    ExperienceResults,
    OnFitnessChange,
} from "./genetic/GeneticExperience";
import Genome from "./genetic/Genome";
import Renderer from "./renderers/Renderer";
import { formatString, generateStringGene } from "./utils/StringFormat";
import { randomIntMax } from "./utils/Utils";
import Benchmark from "./benchmark/Benchmark";

// phrases aléatoires (en français) générées grâce au site de Romain Valeri (http://romainvaleri.online.fr/index.html)
import * as rawData from "./utils/data.json";

export const BEST_OPTIONS: ExperienceOptions<string> = {
    populationSize: 200,
    mutationRate: 2,
    fitnessStrategy: new AdvancedFitnessStrategy<string>(),
    keepBest: 1,
};

export const WORST_OPTIONS: ExperienceOptions<string> = {
    populationSize: 100,
    mutationRate: 1,
    fitnessStrategy: new SimpleFitnessStrategy<string>(),
    keepBest: 100,
};

type CallbackSuccess = (results: ExperienceResults<string>) => void;

// définit le contrôleur qui gère l'expérience (initialisation, démarrage, pause, arrêt, résultats)
export default class Controller {
    experience: GeneticExperience<string> | null; // expérience du controlleur
    benchmark: Benchmark; // benchmarking

    renderer: Renderer; // renderer pour l'expérience

    private running: boolean;
    private paused: boolean;

    // listeners
    onFitnessChange?: OnFitnessChange;
    onSuccess?: CallbackSuccess;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.renderer.waiting(); // signale que le renderer est en attente d'une phrase

        this.benchmark = new Benchmark();
        this.experience = null;

        this.running = false;
        this.paused = false;
    }

    // initialise l'expérience avec les options et la phase cible
    init(options: ExperienceOptions<string>, phrase: string) {
        // 1 - création de l'experience à partir des options
        this.experience = new GeneticExperience<string>(options);
        this.experience.onFitnessChange = this.onFitnessChange;

        // 2 - création de la cible de l'expérience génétique à partir de la phrase objectif
        const target = Genome.createFromGenes<string>(phrase.split(""), generateStringGene);

        // 3 - initialisation de l'expérience avec la cible
        this.experience.init(target);
    }

    // démarre la recherche (si le controlleur à été initialisé avant)
    start() {
        if (this.experience !== null) {
            // si le controlleur n'est pas démarré ou est en pause, on le lance
            if (!this.running || this.paused) {
                this.running = true;
                this.paused = false;
                this.loop();
            }
        }
    }

    // met en pause la recherche
    pause() {
        if (this.running && !this.paused) {
            this.paused = true;
            this.running = false;
        }
    }

    // arrête la recherche
    stop() {
        if (this.running || this.paused) {
            this.experience = null;
            this.paused = false;
            this.running = false;
        }
    }

    // lance la boucle de rendu infini
    private loop() {
        window.requestAnimationFrame(this.render);
    }

    // rendu du controlleur et mise à jour (+ boucle de rendu)
    private render = () => {
        if (this.running && this.experience !== null) {
            // si on a finit la recherche, on arrête et on notifie l'application
            if (this.experience.isFinished()) {
                if (this.onSuccess) this.onSuccess(this.experience.getResults());
                this.stop();
            } else {
                // 1 - met à jour l'expérience
                this.experience.update();

                // 2 - fait le rendu de l'expérience
                this.renderer.render(this.experience);

                // 3 - lance la prochaine boucle
                this.loop();
            }
        }
    };

    // BENCHMARKING

    // lance le benchmarking
    startBenchmark(): void {
        if (!window.Worker)
            throw "Les webworkers ne marchent pas dans votre navigateur ! Le benchmarking ne peut pas être effectué !";

        this.benchmark.start();
    }

    // STATIQUES

    static RANDOM_SENTENCES = rawData as string[];

    // renvoi une phrase aléatoire (formattée)
    static getRandomPhrase(): string {
        return formatString(Controller.RANDOM_SENTENCES[randomIntMax(Controller.RANDOM_SENTENCES.length - 1)]);
    }
}
