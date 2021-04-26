//@ts-check

// lit un fichier et renvoi une promesse contenant la réponse
export function ReadFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => resolve(reader.result);
        reader.readAsText(file);
    });
}

/**
 *
 * @param {string} data
 * @returns {Array.<string>}
 */
export function PurifyGrid(data) {
    let grid;
    // @ts-ignore
    data = data.replaceAll("!", "");
    // @ts-ignore
    data = data.replaceAll("-", "");
    // Split by line and remove empty lines (en tenant compte du type de caractère de fin de ligne)
    if (data.indexOf("\r\n") !== -1) grid = data.split("\r\n");
    else grid = data.split("\n");

    // filtre les chaînes vides
    grid = grid.filter((string) => string != "");

    return grid;
}

export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export class Logger {
    id;
    clearId;

    constructor(id) {
        this.id = id;
        this.clear();
    }

    log(text, color = "primary", fade = 0) {
        $(this.id).show();
        $(this.id).text(text);
        $(this.id).attr("class", `alert alert-${color} my-2`);

        if (fade > 0) {
            clearTimeout(this.clearId);
            this.clearId = setTimeout(() => {
                $(this.id).fadeOut();
            }, fade);
        }
    }

    clear() {
        $(this.id).hide();
    }
}

export function booleanToAscii(bool) {
    return bool ? "✅" : "❌";
}

export class Progressbar {
    progressId;

    constructor(progressId) {
        this.progressId = progressId;
        this.setValue();
    }

    show = () => {
        $(this.progressId).parent().show();
    };

    hide = () => {
        $(this.progressId).parent().hide();
    };

    setValue = (value) => {
        $(this.progressId).text(value + "%");
        $(this.progressId).width(value + "%");
    };
}
