// formatte la chaîne de caractère selon nos critères
export function formatString(str: string): string {
    // retire les accents
    for (var pattern in ACCENTS) {
        str = str.replace(new RegExp(ACCENTS[pattern], "g"), pattern);
    }

    // ne garde que les caractères valides
    str = str
        .split("")
        .filter((char) => VALID_ASCII.includes(char.charCodeAt(0)))
        .join("");

    return str;
}

// tous les caractères ascii valides
/*
    32 : space
    33 : !
    39 : '
    40 : (
    41 : )
    44 : ,
    45 : -
    46 : .
    58 : :
    59 : ;
    63 : ?
    65-90 : A-Z
    97-122 : a-z
*/
export const VALID_ASCII = [
    32,
    33,
    39,
    40,
    41,
    44,
    45,
    46,
    58,
    59,
    63,
    ...Array.from(Array(90 - 65 + 1), (_, idx) => idx + 65),
    ...Array.from(Array(122 - 97 + 1), (_, idx) => idx + 97),
];

const ACCENTS: any = {
    a: "á|à|ã|â|ä|À|Á|Ã|Â|Ä",
    e: "é|è|ê|ë|É|È|Ê|Ë",
    i: "í|ì|î|ï|Í|Ì|Î|Ï",
    o: "ó|ò|ô|õ|ö|Ó|Ò|Ô|Õ|Ö",
    u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
    c: "ç|Ç",
    n: "ñ|Ñ",
};

// génère un caractère aléatoire (fonction de génération de gène utilisé par les génomes)
export function generateStringGene(): string {
    const randomCharCode = VALID_ASCII[Math.floor(Math.random() * VALID_ASCII.length)];
    return String.fromCharCode(randomCharCode);
}
