import Genome from "../Genome";
import FitnessStrategy from "./FitnessStrategy";

// startégie de fitness de base, on compte le nombre de gènes commun et divise par la longueur
// soit le pourcentage de gènes correct
export default class SimpleFitnessStrategy<Gene> implements FitnessStrategy<Gene> {
    calcFitness(source: Genome<Gene>, target: Genome<Gene>): number {
        if (source.getSize() !== target.getSize())
            throw "On ne peut évaluer l'acceptabilité d'un génome qu'avec un autre génome de taille identique !";

        let fitness = 0;

        // pour chaque gène commun, incrémente le score d'acceptabilité
        for (let i = 0; i < source.getSize(); i++) {
            if (source.getGenes()[i] === target.getGenes()[i]) fitness++;
        }

        return fitness / target.getSize();
    }
}
