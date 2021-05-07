import { inRange } from "../utils/Utils";
import FitnessStrategy from "./fitness/FitnessStrategy";
import Genome from "./Genome";

// les options d'une expérience (paramètres)
export type ExperienceOptions<Gene> = {
    populationSize: number; // taille de la population
    mutationRate: number; // taux de mutation
    fitnessStrategy: FitnessStrategy<Gene>; // strategy de fitness pour calculer l'acceptabilité des génomes
    keepBest: number; // selection naturel (% des meilleurs individu à garder lors de la création de la mating pool)
    midpointPercent?: number; // point de cession pour le croisement des chromosomes en pourcentage de la longueur du génome (undefined  = aléatoire)
};

// les résultats d'une expérience
export type ExperienceResults<Gene> = {
    success: boolean; // si l'expérience a réussie
    generation: number; // numéro de la génération
    targetSize: number; // taille de la cible
    best: Genome<Gene> | null; // meilleur génome final
    options: ExperienceOptions<Gene>; // options de l'expérience
    fitnessStats: Array<FitnessStats>; // sauvegarde des stats de fitness de l'expérience
};

// statistiques de fitness d'une génération
export type FitnessStats = { gen: number; averageFitness: number; bestFitness: number };

// listener de fitness
export type OnFitnessChange = (fitnessStats: FitnessStats) => void;

// définit une expérience génétique consistant à faire tourner un algorithme génétique pour trouver un génome cible
// l'expérience est créée avec des options puis va être initialisée avec un génome cible
export default class GeneticExperience<Gene> {
    static MAX_GENERATION = 100000; // nombre maximum de génération
    static DEFAULT_POPULATION_SIZE = 200; // taille de la population par défaut
    static DEFAULT_MUTATION_RATE = 1; // taux de mutation par défaut (%)

    private population: Array<Genome<Gene>>; // contient la population actuelle de génome
    private matingPool: Array<Genome<Gene>>; // bassin de reproduction (les génomes à croiser entres eux)

    private target: Genome<Gene> | null; // génome cible de la population
    private best: Genome<Gene> | null; // meilleure individu (génome) actuel (peut être nul)

    private options: ExperienceOptions<Gene>; // paramètres (options) de l'expérience
    private results: ExperienceResults<Gene>; // résultats de l'expérience

    private midpoint?: number; // valeur concrète de cession pour le croisement des chromosomes

    private generation: number; // compteur de génération

    onFitnessChange?: OnFitnessChange; // listener de fitness

    // créer une expérience avec les options passés en paramètres
    constructor(options: ExperienceOptions<Gene>) {
        this.population = [];
        this.matingPool = [];

        // copie des options
        this.options = { ...options };

        // s'assure que les options qui sont des pourcentages sont bien compris entre 0 et 100
        this.options.mutationRate = inRange(this.options.mutationRate, 0, 100);
        this.options.keepBest = inRange(this.options.keepBest, 0, 100);
        if (this.options.midpointPercent)
            this.options.midpointPercent = inRange(this.options.midpointPercent, 0, 100);

        this.target = null;
        this.best = null;
        this.generation = 0;

        this.results = {
            generation: this.generation,
            success: false,
            targetSize: 0,
            best: null,
            options: this.options,
            fitnessStats: [],
        };
    }

    // initialise l'expérience avec un génome cible et génère une population de base
    init = (target: Genome<Gene>): void => {
        // créer un tableau de taille "size" initialisé avec des nouveaux génome ayant la taille du génome cible
        // et récupérant sa fonction de génération de gènes
        this.population = Array.from(
            { length: this.options.populationSize },
            (_) => new Genome<Gene>(target.getSize(), target.getGeneGenerator())
        );

        this.target = target;
        this.generation = 0;
        this.results = {
            generation: this.generation,
            success: false,
            targetSize: 0,
            best: null,
            options: this.options,
            fitnessStats: [],
        };

        // calcule du midpoint de croisement concret à partir du pourcentage et de la taille de la cible
        if (this.options.midpointPercent !== undefined) {
            this.midpoint = Math.floor((Math.max(100, this.options.midpointPercent) / 100) * target.getSize());
            // permet de s'assurer que la cession laisse quand même des éléments à gauche ET à droite
            if (this.midpoint >= target.getSize() - 1) this.midpoint = target.getSize() - 2;
        }

        // fait l'évaluation initiale de la génération
        this.evaluate();
    };

    // met à jour l'expérience (effectue un cycle d'évolution)
    update() {
        // 1 - génère le bassin de reproduction
        this.naturalSelection();

        // 2 - évolue, créer la prochaine génération
        this.evolve();

        // 3 - fait l'évaluation de l'expérience
        this.evaluate();
    }

    // effectue la selection naturelle sur la population (génère une bassin de reproduction avec les meilleurs éléments)
    private naturalSelection(): void {
        // si la population n'est pas générée ou n'est pas de bonne taille OU que le meilleur individu n'a pas été évalué, on ne fait rien
        if (this.population.length !== this.options.populationSize || this.best === null) return;

        // vide le bassin de reproduction
        this.matingPool = [];

        // on récupère l'acceptabilité du meilleur génome
        const maxFitness = this.best.fitness;

        // on filtre la population pour ne garder que les keepBest % meilleurs éléments
        const sortedPopulation = this.population.sort((a, b) => b.fitness - a.fitness);

        // nombre de meilleurs individus à conserver
        let count = Math.floor((this.options.keepBest / 100) * sortedPopulation.length);

        if (count < 1) count = 1; // s'assure qu'on prend au moins un élément

        // chaque génome est ajouté un nombre de fois proportionnel au poids de son acceptabilité
        // tel que plus un génome est acceptable plus il aura de chance d'être prit (et inversement)
        for (let i = 0; i < count; i++) {
            // ratio d'acceptabilité du génome
            const fitnessRatio = sortedPopulation[i].fitness / maxFitness;

            // calcul du nombre de fois qu'il sera ajouté au bassin de reproduction
            const n = Math.floor(fitnessRatio * 100);

            // ajoute le génome n fois dans le bassin de reproduction
            for (let j = 0; j < n; j++) {
                this.matingPool.push(sortedPopulation[i]);
            }
        }
    }

    // fait évoluer la population (génère la prochaine génération à partir du bassin de reproduction)
    private evolve = (): void => {
        // si le bassin de reproduction est vide, on ne fait rien
        if (this.matingPool.length === 0) return;

        // regénère la population à partir du croisement de génomes dans le bassin de reproduction
        for (let i = 0; i < this.population.length; i++) {
            // on tire deux partenaires aléatoires dans le bassin de reproduction
            const partnerA = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
            const partnerB = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];

            // on les fait se reproduire (croisement)
            const child = partnerA.crossover(partnerB, this.midpoint);

            // on fait muter l'enfant
            child.mutate(this.options.mutationRate);

            // on assigne le nouveau génome à la population
            this.population[i] = child;
        }

        // génération suivante
        this.generation++;
    };

    // évalue la génération actuelle
    private evaluate(): void {
        // 1 - calcule l'acceptabilité des génomes de la population
        this.calcFitnesses();

        // 2 - trouve le meilleur individu dans la population
        this.evaluateBestMatch();

        // 3 - enregistre les stats de la génération
        this.registerGeneration();
    }

    // calcule l'acceptabilité de tous les génomes de la population
    private calcFitnesses = (): void => {
        if (this.target === null) return;

        for (const genome of this.population) {
            // calcule l'acceptabilité du génome courant avec celui cible puis l'assigne au génome courant
            genome.fitness = this.options.fitnessStrategy.calcFitness(genome, this.target);
        }
    };

    // selectionne le nouveau meilleur génome de la population
    private evaluateBestMatch() {
        let bestFitness = Number.MIN_SAFE_INTEGER;
        let bestIndex = 0;

        for (let i = 0; i < this.population.length; i++) {
            if (this.population[i].fitness > bestFitness) {
                bestIndex = i;
                bestFitness = this.population[i].fitness;
            }
        }

        this.best = this.population[bestIndex];
    }

    // enregistre les stats de la génération
    private registerGeneration() {
        const fitnessStats = {
            gen: this.generation,
            averageFitness: this.getAverageFitness(),
            bestFitness: this.best?.fitness || 0,
        };

        this.results?.fitnessStats.push(fitnessStats);
        if (this.onFitnessChange) this.onFitnessChange(fitnessStats);
    }

    // renvoi vrai si l'expérience est finie (succès ou limite de génération atteinte)
    isFinished(): boolean {
        return this.isSuccessful() || this.generation > GeneticExperience.MAX_GENERATION;
    }

    // renvoi vrai si l'expérience à réussi
    private isSuccessful(): boolean {
        return this.target !== null && this.best !== null && this.target.equals(this.best);
    }

    // renvoi l'acceptabilité moyenne de la population
    private getAverageFitness(): number {
        return this.population.reduce((prev, next) => prev + next.fitness, 0) / this.population.length;
    }

    // GETTERS

    getGeneration(): number {
        return this.generation;
    }

    getPopulation(): Array<Genome<Gene>> {
        return this.population;
    }

    // retourne les résultats de l'expérience
    getResults(): ExperienceResults<Gene> {
        this.results.generation = this.generation;
        this.results.best = this.best;
        this.results.targetSize = this.target?.getSize() || 0;
        this.results.success = this.isSuccessful();

        return this.results;
    }
}
