import Sudoku from "./sudoku/Sudoku";
import SudokuConstraint from "./sudoku/SudokuConstraint";
import Drawer from "./utils/Drawer";
import AC3 from "./probleme/AC3";
import Backtracking from "./probleme/Backtracking";
import Benchmark, { CONFIGS } from "./Benchmark";
import { ReadFile, PurifyGrid, Logger, Progressbar } from "./utils/Utils.js";

/* Important so P5 can find core function */
//@ts-ignore
window.setup = setup;

/** @type {Logger} */ const logger = new Logger("#alert_log");

/** @type {Sudoku} */ let sudoku;
/** @type {Drawer} */ let drawer;
/** @type {Backtracking} */ let backtracking = new Backtracking();
/** @type {AC3} */ let ac3;

/** @type {Boolean} */ let enableAc3;

/** @type {Boolean} */ globalThis.displayCellIds = false;
/** @type {String} */ let GRID = PurifyGrid(`...!.78!2..
387!54.!.1.
4..!169!...
---!---!---
...!42.!9.5
..2!...!84.
941!7.5!...
---!---!---
...!2..!5.3
25.!...!...
89.!..3!...`);

// met en place l'application
function setup() {
    sudoku = new Sudoku();
    drawer = new Drawer(50, "sudoku-container");
    sudoku.setDrawer(drawer);

    sudoku.enableMRV = $("#enable_mrv").prop("checked");
    sudoku.enableDegreeHeuristic = $("#enable_degree_heuristic").prop("checked");
    sudoku.enableLeastContrainingValue = $("#enable_least_contraining_value").prop("checked");

    // création de AC3
    ac3 = new AC3(sudoku, SudokuConstraint.isConsistent);

    // initialisation du sudoku avec la grille de départ
    laodSudoku(GRID);

    globalThis.sudoku = sudoku; // debug (accès global au sudoku)
}

function search() {
    // reset de la grille avant recherche
    sudoku.reset();

    let reducedDomains = 0;

    if (enableAc3) {
        reducedDomains = ac3.reduceDomains();
    }

    let old = Date.now();

    backtracking
        .search(sudoku)
        .then(({ stack, total }) => {
            sudoku.render();
            logger.log(
                `Une solution a été trouvée en ${
                    (Date.now() - old) / 1000
                }s. (${stack} appels récursifs - ${total} valeurs testées)${
                    enableAc3 ? ` - ${reducedDomains} valeurs du domaine réduit avec AC-3` : ""
                }`,
                "success"
            );
            setInterface(true);
        })
        .catch((err) => {
            if (err) console.log(err);
            sudoku.render();
            logger.log(`Aucune solution n'a été trouvée (${(Date.now() - old) / 1000}s.)`, "danger");
            setInterface(true);
        });

    // met à jour les boutons
    setInterface(false);
}

// charge le sudoku à partir de la grille d'information
function laodSudoku(grid) {
    if (sudoku instanceof Sudoku) {
        try {
            sudoku.setGrid(grid);
        } catch (err) {
            logger.log(`Erreur (${err})`, "danger");
            sudoku.reset();
        }
    }
}

// gestion des boutons start / stop
function setInterface(enable) {
    $("#search_button").prop("disabled", !enable);
    $("#clear_button").prop("disabled", !enable);
    $("#stop_button").prop("disabled", enable);
}

$(document).ready(() => {
    $("#file-selector").on("change", function () {
        if (this.files[0] != null) {
            ReadFile(this.files[0])
                .then((grid) => {
                    GRID = PurifyGrid(grid);
                    laodSudoku(GRID);
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            console.error("Aucun fichier selectionné !");
        }
    });

    $("#search_button").on("click", search);

    $("#clear_button").on("click", () => {
        sudoku.reset();
    });

    $("#stop_button").on("click", () => {
        backtracking.stop();
    });

    $("#benchmark_button").on("click", () => {
        let benchmark = new Benchmark(
            CONFIGS,
            "#benchmark_table",
            new Progressbar("#benchmark_progress"),
            new Logger("#benchmark_log")
        );
        benchmark.start(GRID);
    });

    $("#enable_render_search").on("change", (obj) => {
        backtracking.render = obj.target.checked;
    });

    $("#enable_ac3").on("change", (obj) => {
        enableAc3 = obj.target.checked;
    });

    $("#enable_mrv").on("change", (obj) => {
        sudoku.enableMRV = obj.target.checked;
        if (sudoku.enableMagicHeuristic) $("#enable_magic_heuristic").click();
    });

    $("#enable_degree_heuristic").on("change", (obj) => {
        sudoku.enableDegreeHeuristic = obj.target.checked;
        if (sudoku.enableMagicHeuristic) $("#enable_magic_heuristic").click();
    });

    $("#enable_least_contraining_value").on("change", (obj) => {
        sudoku.enableLeastContrainingValue = obj.target.checked;
    });

    $("#enable_magic_heuristic").on("change", (obj) => {
        sudoku.enableMagicHeuristic = obj.target.checked;
        if (sudoku.enableMagicHeuristic) {
            if (sudoku.enableMRV) $("#enable_mrv").click();
            if (sudoku.enableDegreeHeuristic) $("#enable_degree_heuristic").click();
        }
    });

    $("#enable_display_ids").on("change", (obj) => {
        displayCellIds = obj.target.checked;
        sudoku.render();
    });

    $("#pause_duration").on("change", (obj) => {
        backtracking.pauseDuration = obj.target.value;
    });

    $("#iteration_tempo").on("change", (obj) => {
        backtracking.recursiveTempo = obj.target.value;
    });

    $("#pause_duration").val(backtracking.pauseDuration);

    $("#iteration_tempo").val(backtracking.recursiveTempo);

    backtracking.render = $("#enable_render_search").prop("checked");
    displayCellIds = $("#enable_display_ids").prop("checked");
    enableAc3 = $("#enable_ac3").prop("checked");

    setInterface(true);
});
