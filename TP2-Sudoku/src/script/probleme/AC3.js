//@ts-check
import SudokuConstraint from "../sudoku/SudokuConstraint";
import Queue from "../utils/Queue";
import BinaryCSP from "./csp/BinaryCSP";

export default class AC3 {
    /** @type {BinaryCSP}*/ csp;
    /** @type {(val1 : Object, val2 : Object) => Boolean} */ isConsistent;

    /**
     * @param {BinaryCSP} csp
     * @param {(val1 : Object, val2 : Object) => Boolean} isConsistent fonction de validation (prend deux valeurs du domaine en paramètre et renvoi si elles sont valides)
     */
    constructor(csp, isConsistent) {
        this.csp = csp;
        this.isConsistent = isConsistent;
    }

    /**
     * réduit les domaines du CSP
     * @returns {Number} le nombre de valeur du domaine réduite
     */
    reduceDomains = () => {
        let array = this.csp.getConstraints().map((constraint) => {
            return [constraint.var1, constraint.var2];
        });

        array = array.concat(
            this.csp.getConstraints().map((constraint) => {
                return [constraint.var2, constraint.var1];
            })
        );

        // on remplit la file avec les contraintes (remappées en paire de cellules)
        /** @type {Queue}*/ const queue = new Queue(array);

        let removed = 0;

        while (!queue.isEmpty()) {
            let [Xi, Xj] = queue.dequeue();

            let removeTemp = this.removeInconsistentValues(Xi, Xj);

            if (removeTemp > 0) {
                removed += removeTemp;
                for (let Xk of Xi.neighbors) {
                    queue.enqueue([Xk, Xi]);
                }
            }
        }

        return removed;
    };

    /**
     * enlève les valeurs inconsistantes, retourne vrai si au moins une valeur a été supprimée
     * @param {Object} Xi @param {Object} Xj
     * @returns {Number}
     */
    removeInconsistentValues = (Xi, Xj) => {
        let removed = 0;

        for (let x of this.csp.getDomains()[Xi.id]) {
            if (!this.csp.getDomains()[Xj.id].some((y) => this.isConsistent(x, y))) {
                this.csp.getDomains()[Xi.id].splice(this.csp.getDomains()[Xi.id].indexOf(x), 1);
                removed++;
            }
        }

        return removed;
    };
}
