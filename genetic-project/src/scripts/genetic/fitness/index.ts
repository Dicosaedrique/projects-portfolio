import FitnessStrategy from "./FitnessStrategy";
import SimpleFitnessStrategy from "./SimpleFitnessStrategy";
import AdvancedFitnessStrategy from "./AdvancedFitnessStrategy";
import { DataOptions } from "../../components/Select";

// pour l'affichage des différentes stratégies dans un input select
const fitnessStrategies: Array<DataOptions<FitnessStrategy<string>>> = [
    {
        name: "Simple fitness",
        obj: new SimpleFitnessStrategy<string>(),
        description:
            "Fonction linéaire correspondant au pourcentage de gènes communs entre un individu et la cible.",
        defaultSelect: false,
    },
    {
        name: "Advanced fitness",
        obj: new AdvancedFitnessStrategy<string>(),
        description:
            "Fonction exponentielle correspondant au ratio de gènes communs entre un individu et la cible mais en ajoutant une puissance 4 à ce score pour s'assurer qu'un gène de plus en commun soit bien plus impactant.",

        defaultSelect: true,
    },
];

export { FitnessStrategy, SimpleFitnessStrategy, AdvancedFitnessStrategy, fitnessStrategies };
