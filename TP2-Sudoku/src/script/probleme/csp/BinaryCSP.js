//@ts-check
import BinaryConstraint from "./BinaryConstraint";

export default class BinaryCSP {
    /** @type {Array<Object>} */ variables; // les variables du CSP
    /** @type {Array<Array<Object>>} */ domains; // les domaines des variables du CSP
    /** @type {Array<BinaryConstraint>}*/ constraints; // les contraintes du CSP

    /**
     * renvoi les variables du CSP
     * @returns {Array<Object>}
     */
    getVariables = () => {
        return this.variables;
    };

    /**
     * selectionne et renvoi la prochaine variable non assignée à utiliser
     * @returns {Object}
     */
    selectUnassignedVariable = () => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * renvoi les valeurs du domaine pour chaque variable
     * @returns {Array<Array<Object>>}
     */
    getDomains = () => {
        return this.domains;
    };

    /**
     * sauvegarde les domaines du CSP (renvoi une copie des domaines)
     * @returns {Array<Array<Object>>}
     */
    saveDomains = () => {
        return this.domains.map((domain) => {
            return Array.from(domain);
        });
    };

    /**
     * restaure les domaines du CSP
     * @param {Array<Array<Object>>} domains
     */
    restoreDomains = (domains) => {
        this.domains = domains;
    };

    /**
     * renvoi les valeurs du domaines par défaut du CSP
     * @returns {Array<Object>}
     */
    getDefaultDomainValues = () => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * renvoi les valeurs du domaine (pour la variable donnée)
     * @param {Object} variable
     * @returns {Array<Object>}
     */
    getDomainValuesForVariable = (variable) => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * renvoi les contraintes du CSP
     * @returns {Array<BinaryConstraint>}
     */
    getConstraints = () => {
        return this.constraints;
    };

    /**
     * renvoi si l'assignement est complet
     * @returns {Boolean}
     */
    isComplete = () => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * renvoi si la variable est consistante
     * @param {Object} variable @param {Object} value
     * @returns {boolean}
     */
    isConsistent = (variable, value) => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * assigne la valeur à la variable
     * @param {Object} variable @param {Object} value
     * @returns {Void}
     */
    assign = (variable, value) => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * désassigne la valeur à la variable
     * @param {Object} variable @param {Object} value
     * @returns {Void}
     */
    unassign = (variable, value) => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * fait le rendu du CSP (optionnel)
     * @param {Object} variable
     * @returns {Void}
     */
    render = (variable) => {
        return;
    };
}
