//@ts-check
import BinaryCSP from "./csp/BinaryCSP";
import { sleep } from "../utils/Utils";

export default class Backtracking {
    /** @type {Boolean} */ render; // défini si on fait un rendu pendant la recherche
    /** @type {Number} */ pauseDuration; // temporisation
    /** @type {Number} */ recursiveTempo; // nombre d'appel récursif avant le prochain rendu (1 pour tous les afficher)
    /** @type {Number} */ recursiveCount; // compteur
    /** @type {Boolean} */ stopped; // si la recherche est stoppée

    /** @type {Number} */ stack; // compteur d'appel récursif
    /** @type {Number} */ total; // compteur de valeurs testée au total

    constructor() {
        this.render = false;
        this.pauseDuration = 0;
        this.recursiveTempo = 1;
        this.recursiveCount = 0;
    }

    /**
     * résoud le BinaryCSP passé
     * @param {BinaryCSP} csp
     * @returns {Promise}
     */
    search = (csp) => {
        this.stopped = false;
        this.stack = 0;
        this.total = 0;

        // la résolution est asynchrone pour permettre l'affichage
        return new Promise((resolve, reject) => {
            this.recursiveSearch(csp)
                .then((res) => {
                    if (res) resolve({ stack: this.stack, total: this.total });
                    else reject();
                })
                .catch(reject);
        });
    };

    /**
     * Résoud récursivement le CSP, Utilise AC3 pour réduire le domaine du csp
     * @param {BinaryCSP} csp
     * @returns {Promise<Boolean>}
     */
    recursiveSearch = (csp) => {
        return new Promise(async (resolve, reject) => {
            if (this.stopped) return reject(); // on arrête si la recherche a été stoppée

            if (csp.isComplete()) return resolve(true); // si le csp est complet, on a réussi

            this.stack++;

            const cell = csp.selectUnassignedVariable(); // on choisit une variable non assignée

            // pour chaque valeur du domaine de la variable
            for (const value of csp.getDomainValuesForVariable(cell)) {
                this.total++;
                // si l'assignement est consistant
                if (csp.isConsistent(cell, value)) {
                    const savedValue = cell.value; // tempon de sauvegarde de la valeur

                    csp.assign(cell, value); // on assigne la valeur à la variable

                    await this.renderCsp(csp, cell); // fait le rendu

                    let success = false;

                    try {
                        success = await this.recursiveSearch(csp); // on fait un appel récursif
                    } catch {
                        reject(); // uniquement dans le cas d'un arrêt forcé
                    }

                    // si ça a marché, on a résolu le CSP
                    if (success) return resolve(true);
                    else {
                        csp.unassign(cell, savedValue); // on retire l'assignement de la valeur à la variable
                    }
                }
            }

            resolve(false);
        });
    };

    stop = () => {
        this.stopped = true;
    };

    // fait le rendu (optionnel)
    renderCsp = async (csp, cell) => {
        if (this.render) {
            this.recursiveCount++;
            if (this.recursiveCount > this.recursiveTempo) {
                this.recursiveCount = 0;
                await sleep(this.pauseDuration);
                csp.render(cell);
            }
        }
    };
}
