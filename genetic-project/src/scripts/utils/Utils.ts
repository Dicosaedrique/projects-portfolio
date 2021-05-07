// renvoi un nombre entier aléatoire compris entre min et max (inclus)
export function randomIntInRange(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomIntMax(max: number): number {
    return randomIntInRange(0, max);
}

export function randomIntMin(min: number): number {
    return randomIntInRange(min, Number.MAX_SAFE_INTEGER);
}

// permet de parcourir les valeurs d'un énuméré
export function mapEnumValues<O extends Record<string, unknown>>(obj: O): any[] {
    return Object.keys(obj)
        .filter((key) => Number.isNaN(+key))
        .map((key) => obj[key]);
}

// renvoi un nombre borné par min et max
export function inRange(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
}

// renvoi vrai si la valeur passée en paramètre est comprise entre min et max (inclus)
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

// source : bformet (https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser)
// télécharge l'objet passé en paramètre sous format json
export function downloadObjectAsJson(exportObj: Object, exportName: string) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// source : Abhilash Kakumanu (https://stackabuse.com/how-to-split-an-array-into-even-chunks-in-javascript/)
// sépare un tableau en chunk de tailles équivalentes
export function sliceIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    if (array.length % chunkSize !== 0)
        throw "La taille du tableau doit être un multiple de la taille des chunk !";

    const res = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        res.push(chunk);
    }

    return res;
}
