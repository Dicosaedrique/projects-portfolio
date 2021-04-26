//@ts-check
import Cell from "../sudoku/Cell";
import Sudoku from "../sudoku/Sudoku";

export default class Drawer {
    /** @type {Number} */ cellSize;
    /** @type {Object} */ canvas; // le canvas

    /** @type {Sudoku} */ sudoku; // une référence vers le sudoku

    /** @type {Object} */ cellBackground; // couleur de fond d'une cellule
    /** @type {Object} */ selectedCellBackground; // couleur de fond de la cellule selectionné
    /** @type {Object} */ hoverCellBackground; // couleur de fond de la cellule survolée

    /** @type {Object} */ cellValueColor; // couleur de la valeur d'une cellule
    /** @type {Object} */ fixedCellValueColor; // couleur de la valeur des cellules fixée
    /** @type {Object} */ lineColor; // couleurs des lignes du sudoku
    /** @type {Number} */ lineWeight; // épaisseur d'une ligne de base
    /** @type {Number} */ lineHalfWeight; // moitié de l'épaisseur d'une ligne

    /** @type {Array<Number>} */ posMap; // mapping des positions des cellules (évite de recalculer plusieurs fois les positions car elles restent les mêmes)

    /** @type {Cell} */ hoverCell = null; // cellule survolée
    /** @type {Cell} */ clickedCell = null; // cellule cliquée

    /**
     * @param {Number} cellSize @param {String} canvasParent
     */
    constructor(cellSize, canvasParent) {
        this.cellSize = cellSize;

        // setup des propriétés du drawer
        this.cellBackground = color(255, 255, 255); // blanc
        this.selectedCellBackground = color(247, 247, 87); // jaune
        this.hoverCellBackground = color(184, 255, 218);
        this.constraintColor = color(254, 184, 255);

        this.fixedCellValueColor = color(0, 0, 255); // bleu
        this.cellValueColor = color(0, 0, 0); // noir

        this.lineColor = color(0, 0, 0); // noir

        // l'épaisseur des lignes et demi lignes s'adaptent à celle la taille des cellules
        this.lineWeight = this.cellSize / 10;
        this.lineHalfWeight = Math.max(this.lineWeight / 2, 1);

        // création du canvas
        this.canvas = createCanvas();
        this.canvas.parent(canvasParent);

        document.getElementById(canvasParent).addEventListener("mousemove", this.onMouseHover);
        document.getElementById(canvasParent).addEventListener("mouseleave", this.onMouseLeave);
        document.getElementById(canvasParent).addEventListener("mousedown", this.onMouseDown);
        document.getElementById(canvasParent).addEventListener("mouseup", this.onMouseUp);
        document.getElementById(canvasParent).addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    /**
     * initialise le drawer (et dessine la grille)
     * @param {Sudoku} sudoku
     */
    init = (sudoku) => {
        this.sudoku = sudoku;

        // calcul la taille du canvas en fonction de l'épaisseur des traits
        let canvasSize =
            this.cellSize * sudoku.getSize() +
            this.lineWeight * (sudoku.dimension + 1) +
            this.lineHalfWeight * (sudoku.getSize() - sudoku.dimension);

        resizeCanvas(canvasSize, canvasSize);

        // dessine les contours de la grille
        this.drawSudokuLines(sudoku);
    };

    // dessine les contours du sudoku (ne le fait qu'une fois)
    drawSudokuLines = () => {
        // couleur des lignes
        stroke(this.lineColor);

        // sauvegarde les positions (évite de recalculer)
        this.posMap = [];

        // trace toutes les lignes et les colonnes
        for (let num = 0; num <= this.sudoku.getSize(); num++) {
            let nbFull = Math.trunc(num / this.sudoku.dimension + 1);
            let nbHalf = num - Math.trunc(num / this.sudoku.dimension);
            let pos = num * this.cellSize + nbFull * this.lineWeight + nbHalf * this.lineHalfWeight;

            let finalWeight = num % this.sudoku.dimension == 0 ? this.lineWeight : this.lineHalfWeight;

            strokeWeight(finalWeight);
            line(0, pos - finalWeight / 2, width, pos - finalWeight / 2);
            line(pos - finalWeight / 2, 0, pos - finalWeight / 2, height);

            this.posMap[num] = pos;
        }
    };

    /**
     * redessine les cellules de la grille
     * @param {Cell} selectedCell
     */
    draw = (selectedCell = null) => {
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.cellSize / 2);

        this.sudoku.variables.forEach((cell) => {
            this.drawCell(cell, cell == selectedCell ? this.selectedCellBackground : this.cellBackground);
        });
    };

    /**
     * dessine une cellule
     * @param {Cell} cell @param {Object} backgroundColor
     */
    drawCell = (cell, backgroundColor) => {
        // récupère les positions (coin supérieur gauche) de l'espace de la cellule
        let x = this.posMap[cell.col];
        let y = this.posMap[cell.row];

        fill(backgroundColor);

        // efface la cellule (peint le fond)
        rect(x, y, this.cellSize, this.cellSize);

        // dessine la valeur de la cellule (si elle en a une)
        if (cell.value != Cell.EMPTY) {
            // choisit le style du texte et sa couleur (change en fonction de si la cellule est fixée)
            textStyle(cell.fixed ? BOLD : NORMAL);
            fill(cell.fixed ? this.fixedCellValueColor : this.cellValueColor);

            text(cell.value.toString(16).toUpperCase(), x + this.cellSize / 2, y + this.cellSize / 2);
        }

        if (displayCellIds) {
            fill(color(255, 0, 0));
            textSize(this.cellSize / 5);
            text(cell.id, x + this.cellSize / 4, y + this.cellSize / 4);
            textSize(this.cellSize / 2);
        }
    };

    /**
     * détecte la collision entre le curseur et une cellule
     * @return {Cell}
     */
    detectCell = () => {
        let x = -1,
            y = -1;
        for (let i = 0; i < this.posMap.length - 1; i++) {
            if (this.posMap[i] <= mouseX && this.posMap[i] + this.cellSize >= mouseX) x = i;
            if (this.posMap[i] <= mouseY && this.posMap[i] + this.cellSize >= mouseY) y = i;
            if (x != -1 && y != -1) {
                return this.sudoku.getVariables()[this.sudoku.getIdFromPos(y, x)];
            }
        }

        return null;
    };

    onMouseDown = (evt) => {
        let detectedCell = this.detectCell();

        if (detectedCell != null) {
            this.clickedCell = detectedCell;

            // clique gauche
            if (evt.button == 0) {
                this.clickedCell.neighbors.forEach((cell) => {
                    this.drawCell(cell, this.constraintColor);
                });
                this.drawCell(this.clickedCell, this.constraintColor);
            }
            // clique droit
            else if (evt.button == 2) {
                console.log(this.clickedCell);
                console.log(this.sudoku.getDomains()[this.clickedCell.id]);
            }
        }
    };

    onMouseUp = (evt) => {
        // clique gauche
        if (evt.button == 0 && this.clickedCell != null) {
            this.clickedCell.neighbors.forEach((cell) => {
                this.drawCell(cell, this.cellBackground);
            });
            this.drawCell(this.clickedCell, this.cellBackground);
        }

        this.clickedCell = null;
    };

    onMouseHover = () => {
        if (this.clickedCell == null) {
            let detectedCell = this.detectCell();

            if (detectedCell != null) {
                if (this.hoverCell != null) this.drawCell(this.hoverCell, this.cellBackground);

                this.hoverCell = detectedCell;
                this.drawCell(this.hoverCell, this.hoverCellBackground);
            }
        }
    };

    onMouseLeave = () => {
        if (this.hoverCell != null) this.drawCell(this.hoverCell, this.cellBackground);
    };
}
