//@ts-check

export default class Cell {
    /** @type {Number} */ id; // unique

    /** @type {Number} */ row; // ligne de la cellule
    /** @type {Number} */ col; // colonne de la cellule

    /** @type {Number} */ value; // valeur de la cellule
    /** @type {Boolean} */ fixed; // indique si la valeur peut changer ou non

    /** @type {Number} */ box; // numéro de la boîte dans le sudoku (carré de dimension*dimension)

    /** @type {Array<Cell>} */ neighbors; // liste de toutes les cellules voisines (sur la ligne, la colonne et la case)

    /**
     * @param {Number} id @param {Number} row @param {Number} col @param {Number} value @param {Boolean} fixed @param {Number} box
     */
    constructor(id, row, col, value, fixed, box) {
        this.id = id;

        this.row = row;
        this.col = col;

        this.value = value;
        this.fixed = fixed;

        this.box = box;

        this.neighbors = [];
    }

    /**
     * @param {Number} value
     * @returns {void}
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * ajoute un voisin
     * @param {Cell} neighbor
     * @returns {void}
     */
    addNeighbor = (neighbor) => {
        if (this.neighbors.indexOf(neighbor) === -1) this.neighbors.push(neighbor);
    };
}

/** @type {Number} */ Cell.EMPTY = -1;
