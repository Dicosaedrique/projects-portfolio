//@ts-check
import Cell from "./Cell";
import Sudoku from "./Sudoku";

export default class HeuristicSudoku {
    /**
     * MRV SEUL -> renvoi la cellule avec le plus petit nombre de valeur légale (taille du domaine) -> PAS DE GESTION DE L'ÉGALITÉ
     * @param {Sudoku} sudoku
     * @returns {Cell}
     */
    static getMinRemaningValue = (sudoku) => {
        return sudoku.unassignedVariable.reduce((prev, curr) =>
            sudoku.getDomains()[curr.id].length < sudoku.getDomains()[prev.id].length ? curr : prev
        );
    };

    /**
     * DEGREE HEURISTIC SEUL -> on renvoi la cellule avec le plus grand nombre de contraintes sur les
     * cellules restantes c'est à dire celle qui a le plus de cellules voisines non définies
     * @param {Array<Cell>} array tableau de cellule à traiter
     * @returns {Cell}
     */
    static getDegreeHeuristic = (array) => {
        let maxValue = -1;
        let theCell;

        for (const cell of array) {
            let count = 0;
            // compte le nombre de voisins variable
            for (const neighbor of cell.neighbors) {
                if (neighbor.value === Cell.EMPTY) count++;
            }

            if (count > maxValue) {
                maxValue = count;
                theCell = cell;
            }
        }

        return theCell;
    };

    /**
     * MRV ET DEGREE HEURISTIC COMBINÉ -> bris de l'égalité de MRV avec degree heuristic (on doit réadapter MRV pour obtenir un tableau de cellules égales et pas juste la plus petite)
     * @param {Sudoku} sudoku
     * @returns {Cell}
     */
    static getMinRemaningValueWithDegreeHeuristic = (sudoku) => {
        // ÉTAPE 1 - CALCULE DES CELLULES LES MOINS CONTRAINGANTES (taille du domaine)

        let minValue = Number.MAX_SAFE_INTEGER;
        let array = [];

        for (let cell of sudoku.unassignedVariable) {
            let length = sudoku.getDomains()[cell.id].length;

            if (length < minValue) {
                minValue = length;
                array = [cell];
            } else if (length == minValue) array.push(cell);
        }

        // si pas d'égalité, on retourne simplement la cellule
        if (array.length == 1) return array[0];

        // ÉTAPE 2 - BRIS DE L'ÉGALITÉ AVEC DEGREE HEURISTIC
        return HeuristicSudoku.getDegreeHeuristic(array);
    };

    /**
     * LEAST CONSTRAINING VALUE (selection de la valeur) => on trie le domaine de la valeur la moins contraignante à la plus contraignante
     * @param {Sudoku} sudoku @param {Cell} cell
     * @returns {Array<Cell>}
     */
    static leastContrainingValue = (sudoku, cell) => {
        let array = [];

        for (const value of sudoku.getDomains()[cell.id]) {
            let obj = {
                value,
                count: 0,
            };

            for (const neighbor of cell.neighbors) {
                if (sudoku.getDomains()[neighbor.id].indexOf(value) !== -1) obj.count++;
            }

            array.push(obj);
        }

        array.sort((a, b) => a.count - b.count);

        return array.map((elem) => elem.value);
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // inverse de degree heuristic (prend la valeur min au lieu de max) mais marche beaucoup mieux (???)
    static magicHeuristic = (array) => {
        let minValue = Number.MAX_SAFE_INTEGER;
        let theCell;

        for (const cell of array) {
            let count = 0;
            // compte le nombre de voisins variable
            for (const neighbor of cell.neighbors) {
                if (neighbor.value === Cell.EMPTY) count++;
            }

            if (count < minValue) {
                minValue = count;
                theCell = cell;
            }
        }

        return theCell;
    };
}
