//@ts-check
import AC3 from "./probleme/AC3";
import Backtracking from "./probleme/Backtracking";
import Sudoku from "./sudoku/Sudoku";
import SudokuConstraint from "./sudoku/SudokuConstraint";
import { booleanToAscii, Logger, Progressbar, sleep } from "./utils/Utils";

export default class Benchmark {
    /** @type {Sudoku} */ sudoku;
    /** @type {AC3} */ ac3;
    /** @type {Backtracking} */ backtracking;

    /** @type {Array<Object>} */ configs; // les configuration à tester
    /** @type {Map<Object, Object>} */ results; // map associant une configuration à son résultat

    /** @type {String} */ tableId; // id de la table à présenter
    /** @type {Logger} */ logger;
    /** @type {Progressbar} */ progressBar;

    // pour suivre l'avancement
    /** @type {Number} */ startTime; // prise de temps de départ
    /** @type {Number} */ total; // nombre total de test à faire
    /** @type {Number} */ current; // test courant

    /**
     * initialise la grille avec les données passeés
     * @param {Array<Object>} configs @param {String} tableId @param {Progressbar} progressBar @param {Logger} logger
     */
    constructor(configs, tableId, progressBar, logger = null) {
        this.sudoku = new Sudoku();
        this.ac3 = new AC3(this.sudoku, SudokuConstraint.isConsistent);
        this.backtracking = new Backtracking();

        this.configs = configs;

        this.tableId = tableId;
        this.logger = logger;
        this.progressBar = progressBar;
    }

    start = (grid) => {
        this.results = new Map();
        this.startTime = Date.now();

        // avancé du benchmark
        this.progressBar.show();
        this.total = this.configs.length;
        this.current = 0;

        return new Promise(async (resolve) => {
            // pour chaque config du benchmark
            for (const config of this.configs) {
                await this.register(grid, config);

                // progression
                this.current++;
                this.progressBar.setValue((this.current / this.total) * 100);
                await sleep(0); // raffraichis l'affichage
            }

            this.presentResults(this.results);

            resolve();
        });
    };

    /**
     * initialise la grille avec les données passeés
     * @param {Array<string>} grid @param {Object} config
     */
    register = (grid, config) => {
        return new Promise(async (resolve) => {
            let res = {
                time: 0,
                reducedDomains: 0,
                stack: 0,
                total: 0,
                err: null,
            };

            let old = Date.now();

            try {
                this.sudoku.setGrid(grid);
            } catch (err) {
                res.err = err;
            } finally {
                // met à jour la config du sudoku
                this.sudoku.enableMRV = config.enableMRV;
                this.sudoku.enableDegreeHeuristic = config.enableDegreeHeuristic;
                this.sudoku.enableLeastContrainingValue = config.enableLeastContrainingValue;

                if (config.enableAc3) {
                    res.reducedDomains = this.ac3.reduceDomains();
                }

                try {
                    const { stack, total } = await this.backtracking.search(this.sudoku);
                    res.stack = stack;
                    res.total = total;
                } catch (err) {
                    res.err = err;
                }
            }

            res.time = Date.now() - old;

            this.results.set(config, res);

            resolve();
        });
    };

    presentResults = (results) => {
        let data = [];

        $(this.tableId).DataTable().destroy();

        for (const config of results.keys()) {
            const stats = results.get(config);

            data.push([
                booleanToAscii(config.enableAc3),
                booleanToAscii(config.enableMRV),
                booleanToAscii(config.enableDegreeHeuristic),
                booleanToAscii(config.enableLeastContrainingValue),
                stats.stack,
                stats.total,
                (stats.total / stats.stack).toFixed(1),
                stats.reducedDomains,
                stats.time / 1000,
            ]);
        }

        $(this.tableId).DataTable({
            data,
            searching: false,
            paging: false,
            columnDefs: [{ className: "dt-center", targets: "_all" }],
            bInfo: false,
        });

        $(this.tableId).show();

        if (this.logger !== null)
            this.logger.log(`Fin du benchmark (${(Date.now() - this.startTime) / 1000}s.)`, "success");
    };
}

// LISTE DES CONFIGS DE BENCHMARK À TESTER
export const CONFIGS = [
    // RIEN
    {
        enableAc3: false,
        enableMRV: false,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: false,
    },
    // TOUT
    {
        enableAc3: true,
        enableMRV: true,
        enableDegreeHeuristic: true,
        enableLeastContrainingValue: true,
    },
    // QUE AC3
    {
        enableAc3: true,
        enableMRV: false,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: false,
    },
    // QUE MRV
    {
        enableAc3: false,
        enableMRV: true,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: false,
    },
    // QUE LCV
    {
        enableAc3: false,
        enableMRV: false,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: true,
    },
    // AC3 + MRV
    {
        enableAc3: true,
        enableMRV: true,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: false,
    },
    // MRV + DH
    {
        enableAc3: false,
        enableMRV: true,
        enableDegreeHeuristic: true,
        enableLeastContrainingValue: false,
    },
    // MRV + LCV
    {
        enableAc3: false,
        enableMRV: true,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: true,
    },
    // AC3 + MRV + DH
    {
        enableAc3: true,
        enableMRV: true,
        enableDegreeHeuristic: true,
        enableLeastContrainingValue: false,
    },
    // AC3 + MRV + LCV
    {
        enableAc3: true,
        enableMRV: true,
        enableDegreeHeuristic: false,
        enableLeastContrainingValue: true,
    },
];
