import Cell from "./Cell";
import BinaryConstraint from "../probleme/csp/BinaryConstraint";

export default class SudokuConstraint extends BinaryConstraint {
    /**
     * @param {Cell} cell1 @param {Cell} cell2
     */
    constructor(cell1, cell2) {
        super(cell1, cell2);

        this.hashConstraint();
    }

    /**
     * renvoi si la contrainte est valide (si les deux cellules n'ont pas la même valeur ou qu'au moins une des deux est vide)
     * @returns {Boolean}
     */
    isValid = () => {
        return SudokuConstraint.isConsistent(this.var1.value, this.var2.value);
    };

    /**
     * hash la contrainte (indifférence de l'ordre des variables => pour permettre d'éviter la duplication)
     * @returns {Void}
     */
    hashConstraint = () => {
        let temp = [this.var1.id, this.var2.id].sort();
        this.hash = temp.join("-");
    };

    /**
     * retourne vrai si les deux valeurs du domaine sont valides ensembles (selon les règles du Sudoku)
     * @param {Number} val1 @param {Number} val2
     * @returns {Boolean}
     */
    static isConsistent = (val1, val2) => {
        return val1 === Cell.EMPTY || val2 === Cell.EMPTY || val1 != val2;
    };
}
