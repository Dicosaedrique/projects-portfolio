import * as $ from "jquery";
import "@fortawesome/fontawesome-free/js/all.js";

import Controller from "./Controller";
import View from "./View";
import Renderer from "./renderers/Renderer";
import { initBenchmarkGraphs } from "./benchmark/Benchmark.results";

// définit par bootstrap
const LARGE_BREAKPOINT = 992;

let controller: Controller;
let view: View;

// @ts-ignore (charge setup au début de la page)
window.onload = setup;

function setup() {
    // création du renderer (canvas)
    const renderer = new Renderer("renderer_container");

    // gestion de la taille des canvas de l'expérience génétique
    resize();
    $(window).on("resize", resize);

    // création du contrôleur
    controller = new Controller(renderer);

    // création de la vue
    view = new View(controller);

    // initialisation des graphes de benchmarking
    initBenchmarkGraphs();
}

// redéfinit la taille des conteneurs des canvas de l'expérience (permet d'être responsive)
function resize() {
    const size = window.innerWidth * (window.innerWidth <= LARGE_BREAKPOINT ? 0.7 : 0.4);

    // resize le canvas du graphique de fitness
    $("#renderer_container").width(size);
    $("#renderer_container").height(size);

    $("#chart_canvas_container").width(size);
    $("#chart_canvas_container").height(size);
}

// DEV (accès global aux objets -> dans la console)
// @ts-ignore
global.controller = controller;
// @ts-ignore
global.view = view;

// assignation de la bonne méthode "requestAnimationFrame" en fonction du type de navigateur
window.requestAnimationFrame =
    window.requestAnimationFrame ||
    // @ts-ignore
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    // @ts-ignore
    window.msRequestAnimationFrame;
