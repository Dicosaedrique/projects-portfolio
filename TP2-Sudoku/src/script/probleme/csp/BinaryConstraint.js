export default class BinaryConstraint {
    /** @type {String} */ hash; // hash de la contrainte

    /** @type {Object} */ var1;
    /** @type {Object} */ var2;

    /**
     * @param {Object} var1 @param {Object} var2
     */
    constructor(var1, var2) {
        this.var1 = var1;
        this.var2 = var2;
    }

    /**
     * renvoi si la contrainte est valide
     * @returns {Boolean}
     */
    isValid = () => {
        throw "NOT IMPLEMENTED";
    };

    /**
     * hash la contrainte
     * @returns {Void}
     */
    hashConstraint = () => {
        throw "NOT IMPLEMENTED";
    };
}
