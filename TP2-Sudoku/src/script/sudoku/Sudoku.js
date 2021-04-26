//@ts-check
import Cell from "./Cell";
import Drawer from "../utils/Drawer";
import HeuristicSudoku from "./HeuristicSudoku";
import BinaryCSP from "../probleme/csp/BinaryCSP";
import SudokuConstraint from "./SudokuConstraint";

export default class Sudoku extends BinaryCSP {
    // ACTIVATION / DÉSACTIVATION DES HEURISTIQUES
    /** @type {Boolean} */ enableMRV = true; // état de MRV
    /** @type {Boolean} */ enableDegreeHeuristic = true; // état de MRV
    /** @type {Boolean} */ enableLeastContrainingValue = true; // état de least contraining value

    /** @type {Number} */ dimension; // dimension du sudoku (par défaut 3)
    /** @type {Array<Cell>} */ unassignedVariable; // variables non assignées
    /** @type {Array<Array<Object>>} */ savedDomains; // sauvegarde des domaines

    /** @type {Drawer} */ drawer; // renderer du sudoku

    constructor() {
        super();

        this.unassignedVariable = [];
        this.variables = [];
        this.constraints = [];
        this.domain = [];
        this.savedDomains = [];
    }

    /**
     * définit la dimension du sudoku (la taille d'une case -> 3x3, 4x4, etc) et créer la grille
     * @param {Number} dimension
     */
    setDimension = (dimension) => {
        if (this.dimension === dimension) return;

        this.dimension = dimension;

        // redessine la grille en fonction de la dimension
        if (this.drawer != null) this.drawer.init(this);

        // initialise les variables (des cellules vides)
        this.variables = [];
        this.domains = [];
        for (let row = 0; row < this.getSize(); row++) {
            for (let col = 0; col < this.getSize(); col++) {
                let id = this.getIdFromPos(row, col);
                let box = this.getBoxFromPos(row, col);

                this.variables.push(new Cell(id, row, col, Cell.EMPTY, false, box)); // on créé la cellule

                this.domains[id] = this.getDefaultDomainValues(); // on ajoute un domaine par défaut pour cette cellule
            }
        }

        // génère les contraintes du sudoku (pas besoin de le refaire)
        this.generateConstraints();

        // ajoute leurs cellules voisines à chaque cellules
        this.populateCellNeighbors();

        // génère les variables non assignées (les cases vides)
        this.generateUnassignedVariables();

        this.render();
    };

    /**
     * renvoi les valeurs du domaines par défaut du CSP
     * @returns {Array<Object>}
     */
    getDefaultDomainValues = () => {
        return Array.from({ length: this.getSize() }, (_, i) => i + 1);
    };

    /**
     * initialise la grille avec les données passeés
     * @param {Array<string>} grid
     * @returns {void}
     */
    setGrid = (grid) => {
        let gridDimension = Math.sqrt(grid[0].length);

        // si la dimension change, on recharge la grille
        if (this.dimension != gridDimension) this.setDimension(gridDimension);

        // met à jour les cellules avec les données
        this.variables.forEach((cell) => {
            let value, fixed;
            const pos = this.getPosFromId(cell.id);

            value = parseInt(grid[pos.row][pos.col], 16);
            value = isNaN(value) ? Cell.EMPTY : value;
            fixed = value != Cell.EMPTY;

            cell.value = value;
            cell.fixed = fixed;

            this.domains[cell.id] = fixed ? [value] : this.getDefaultDomainValues(); // met à jour le domaine de la cellule
        });

        if (!this.isValid()) throw "La grille n'est pas valide !";

        // génère les variables non assignées (les cases vides)
        this.generateUnassignedVariables();

        this.render();
    };

    /**
     * clear la grille de sudoku
     * @returns {void}
     */
    reset = () => {
        this.variables.forEach((cell) => {
            if (!cell.fixed) cell.setValue(Cell.EMPTY); // reset la value
            this.domains[cell.id] = cell.fixed ? [cell.value] : this.getDefaultDomainValues(); // met à jour le domaine de la cellule
        });

        this.generateUnassignedVariables();

        this.render();
    };

    /**
     * ajoute leurs cellules voisines à chaque cellules
     * @returns {void}
     */
    populateCellNeighbors = () => {
        this.constraints.forEach((constraint) => {
            constraint.var1.addNeighbor(constraint.var2);
            constraint.var2.addNeighbor(constraint.var1);
        });
    };

    /**
     * Met a jour la liste des variables non assignées
     * @returns {void}
     */
    generateUnassignedVariables = () => {
        this.unassignedVariable = [];

        this.variables.forEach((cell) => {
            if (cell.value === Cell.EMPTY) this.unassignedVariable.push(cell);
        });
    };

    /**
     * Génère l'ensemble des contraintes binaires pour le sudoku
     * @returns {Void}
     */
    generateConstraints = () => {
        this.constraints = [];
        let constraint;

        // calcul des contraintes des lignes ET des colonnes (parcours des lignes et des colonnes en même temps)
        for (let num = 0; num < this.getSize(); num++) {
            for (let i = 0; i < this.getSize() - 1; i++) {
                for (let j = i + 1; j < this.getSize(); j++) {
                    // on ajoute la contrainte pour la ligne
                    let idCol = this.getIdFromPos(i, num);
                    let idColPlusOne = this.getIdFromPos(j, num);

                    constraint = new SudokuConstraint(this.variables[idCol], this.variables[idColPlusOne]);

                    // si la contrainte n'existe pas déjà, on l'ajoute
                    if (!this.constraints.some((elem) => elem.hash === constraint.hash))
                        this.constraints.push(constraint);

                    // on ajoute la contrainte pour la colonne
                    let idRow = this.getIdFromPos(num, i);
                    let idRowPlusOne = this.getIdFromPos(num, j);

                    constraint = new SudokuConstraint(this.variables[idRow], this.variables[idRowPlusOne]);

                    // si la contrainte n'existe pas déjà, on l'ajoute
                    if (!this.constraints.some((elem) => elem.hash === constraint.hash))
                        this.constraints.push(constraint);
                }
            }
        }

        // calcul des contraintes de boîte

        /** @type {Array<Array<Cell>>} */ let cellsByBox = []; // temporaire, pour avoir une représentation de la grille par tableau de boîte

        this.variables.forEach((cell) => {
            if (cellsByBox[cell.box] === undefined) cellsByBox[cell.box] = [cell];
            else cellsByBox[cell.box].push(cell);
        });

        // pour chaque boîte
        for (const box of cellsByBox) {
            for (let i = 0; i < box.length - 1; i++) {
                for (let j = i + 1; j < box.length; j++) {
                    let constraint = new SudokuConstraint(box[i], box[j]);

                    // si la contrainte n'existe pas déjà, on l'ajoute
                    if (!this.constraints.some((elem) => elem.hash === constraint.hash))
                        this.constraints.push(constraint);
                }
            }
        }
    };

    /**
     * renvoi si le sudoku est valide (test complet)
     * @returns {Boolean}
     */
    isValid = () => {
        for (const constraint of this.constraints) {
            if (!constraint.isValid()) return false;
        }
        return true;
    };

    /**
     * calcule l'id d'une cellule à partir de sa position (ligne, colonne)
     * @returns {Number}
     */
    getIdFromPos = (row, col) => {
        return row * this.getSize() + col;
    };

    /**
     * calcule la position d'une cellule à partir de son id
     * @returns {{ row : Number, col : Number}}
     */
    getPosFromId = (id) => {
        return {
            row: Math.floor(id / this.getSize()),
            col: id % this.getSize(),
        };
    };

    /**
     * Return size of grid
     * @returns {Number}
     */
    getSize = () => {
        return this.dimension * this.dimension;
    };

    /**
     * Return cell at position (row, col)
     * @param {Number} row @param {Number} col
     * @returns {Cell}
     */
    getCell = (row, col) => {
        return this.variables[this.getIdFromPos(row, col)];
    };

    /**
     * Retourne l'index de la boite pour une cell
     * @param {Number} row  @param {Number} col
     * @returns {Number}
     */
    getBoxFromPos = (row, col) => {
        return Math.floor(row / this.dimension) * this.dimension + Math.floor(col / this.dimension);
    };

    /**
     * Set drawer
     * @returns {void}
     */
    setDrawer = (drawer) => {
        this.drawer = drawer;
        this.drawer.init(this);
    };

    /**
     * affiche la grille si le drawer existe
     * @param {Cell} selectedCell (la cellule que l'on veux surligner)
     * @returns {void}
     */
    render = (selectedCell = null) => {
        if (this.drawer != null) this.drawer.draw(selectedCell);
    };

    ///////////////////////////////////////////////////////////////////
    // RÉIMPLÉMENTATION DES MÉTHODES DU CSP

    /**
     * renvoi la prochaine cellule non assignée à utiliser
     * @returns {Cell}
     */
    selectUnassignedVariable = () => {
        // MRV SEUL
        if (this.enableMRV && !this.enableDegreeHeuristic) return HeuristicSudoku.getMinRemaningValue(this);
        // MRV et degree heuristic
        else if (this.enableMRV && this.enableDegreeHeuristic)
            return HeuristicSudoku.getMinRemaningValueWithDegreeHeuristic(this);
        // degree heuristic seul
        else if (!this.enableMRV && this.enableDegreeHeuristic)
            return HeuristicSudoku.getDegreeHeuristic(this.unassignedVariable);
        // RIEN (retourne la première variable non assignée)
        else return this.unassignedVariable[0];
    };

    /**
     * renvoi les valeurs du domaine de la cellule
     * @param {Cell} cell
     * @returns {Array<Object>}
     */
    getDomainValuesForVariable = (cell) => {
        // LEAST CONSTRAINING VALUE (trie le domaine de la meilleure valeur à la moins bonne)
        if (this.enableLeastContrainingValue) return HeuristicSudoku.leastContrainingValue(this, cell);
        // sinon, renvoi simplement le domaine
        else return this.domains[cell.id];
    };

    /**
     * renvoi si le sudoku est complet (si il reste des cases non assignées)
     * @returns {Boolean}
     */
    isComplete = () => {
        return this.unassignedVariable.length == 0;
    };

    /**
     * renvoi si la cellule respecte les contraintes (est consistante)
     * @param {Cell} cell @param {Number} value
     * @returns {boolean}
     */
    isConsistent = (cell, value) => {
        // pour toutes les cellules voisines
        return !cell.neighbors.some((aCell) => {
            return !SudokuConstraint.isConsistent(value, aCell.value); // si c'est inconsistant, on s'arrête
        });
    };

    /**
     * assigne la valeur à la cellule
     * @param {Cell} cell @param {Number} value
     * @returns {Void}
     */
    assign = (cell, value) => {
        let index = this.unassignedVariable.indexOf(cell);
        if (index !== -1) this.unassignedVariable.splice(index, 1);

        cell.setValue(value);

        // gestion du domaine de la cellule (sauvegarde du domaine)
        this.savedDomains[cell.id] = this.domains[cell.id].slice();
        this.domains[cell.id] = [value];

        // gestion du domaine des voisines
        cell.neighbors.forEach((neighbor) => {
            if (!neighbor.fixed) {
                let index = this.domains[neighbor.id].indexOf(value);
                if (index !== -1) this.domains[neighbor.id].splice(index, 1);
            }
        });
    };

    /**
     * désassigne la valeur à la cellule
     * @param {Cell} cell @param {Number} oldValue
     * @returns {Void}
     */
    unassign = (cell, oldValue) => {
        if (cell.fixed) return;

        // gestion du domaine de la cellule (restauration de l'ancien domaine)
        if (this.savedDomains[cell.id]) this.domains[cell.id] = this.savedDomains[cell.id].slice();

        // gestion du domaine des voisines
        cell.neighbors.forEach((neighbor) => {
            if (!neighbor.fixed) {
                let index = this.domains[neighbor.id].indexOf(cell.value);
                if (index === -1) this.domains[neighbor.id].push(cell.value);
            }
        });

        this.unassignedVariable.push(cell);

        cell.setValue(oldValue);
    };

    // debug
    log = () => {
        console.log(
            this.variables.map((cell) => {
                return this.domains[cell.id].reduce((prev, next) => prev + (next + "-"), "");
            })
        );
    };
}
