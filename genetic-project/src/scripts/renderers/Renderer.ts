import * as $ from "jquery";

import GeneticExperience from "../genetic/GeneticExperience";

// classe permettant le rendu de l'expérience avec JQuery
export default class Renderer {
    static DEFAULT_MAX_DISPLAYED_ELEM = 10; // nombre d'élément max à afficher par défaut

    maxDisplayedElem: number; // nombre d'élément max à afficher

    // éléments jquery pour mise à jour de l'affichage
    container: JQuery<HTMLElement>;
    currentGeneration: JQuery<HTMLElement>;
    bestGenome: JQuery<HTMLElement>;
    maxDisplayElemSpan: JQuery<HTMLElement>;
    otherGenomes: JQuery<HTMLElement>;

    constructor(containerID: string) {
        this.container = $(`#${containerID}`);

        // création de la structure du renderer (parse de HTML car plus rapide)
        const stringHTML = `<h3 class="mb-5">Génération <span id="current_generation" class="text-primary"></span></h3><h4>Meilleur génome</h4><p id="best_genome" class="h5 mb-4 text-success"></p><br /><h4>Top <span id="max_elem_display"></span> des meilleurs génomes</h4><p id="other_genomes" class="h5 mb-1"></p>`;
        const html = $.parseHTML(stringHTML);
        this.container.append(html);

        // récupération des éléments de l'interface
        this.currentGeneration = $("#current_generation");
        this.bestGenome = $("#best_genome");
        this.maxDisplayElemSpan = $("#max_elem_display");
        this.otherGenomes = $("#other_genomes");

        this.maxDisplayedElem = 0;
        this.setMaximum(Renderer.DEFAULT_MAX_DISPLAYED_ELEM);
    }

    // affiche un écran d'attente
    waiting = () => {
        this.currentGeneration.text("...");
        this.bestGenome.text("En attente d'une phrase...");
    };

    // fait le rendu de l'expérience
    render = (experience: GeneticExperience<string>) => {
        // trie du plus acceptable au moins
        const population = experience.getPopulation().sort((a, b) => b.fitness - a.fitness);

        const limit = Math.min(population.length, this.maxDisplayedElem);

        let html = "";

        for (let i = 0; i < limit; i++) {
            html += population[i].getDNA() + "<br/>";
        }

        // affichage des autres génomes
        this.otherGenomes.html(html);

        // affichage de la génération en cours
        this.currentGeneration.text(experience.getGeneration());

        // affichage du meilleur génome
        if (population.length > 0) this.bestGenome.text(population[0].getDNA());
    };

    // change le maximum d'éléments affichés
    setMaximum = (max: number) => {
        this.maxDisplayedElem = max;
        this.maxDisplayElemSpan.text(this.maxDisplayedElem);
    };
}
