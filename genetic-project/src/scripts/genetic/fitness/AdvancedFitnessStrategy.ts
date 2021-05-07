import Genome from "../Genome";
import FitnessStrategy from "./FitnessStrategy";

// implémente une stratégie de fitness fonction plus développée qui consiste à passer d'une
// fonction linéaire à une fonction exponentielle
export default class AdvancedFitnessStrategy<Gene> implements FitnessStrategy<Gene> {
    calcFitness(source: Genome<Gene>, target: Genome<Gene>): number {
        if (source.getSize() !== target.getSize())
            throw "On ne peut évaluer l'acceptabilité d'un génome qu'avec un autre génome de taille identique !";

        let score = 0;

        // pour chaque gène commun, incrémente le score
        for (let i = 0; i < source.getSize(); i++) {
            if (source.getGenes()[i] === target.getGenes()[i]) score++;
        }

        let fitness = score / target.getSize();

        // rend la fonction exponentielle en ajoutant une puissance (4 est choisi arbitrairement)
        fitness = Math.pow(fitness, 4);

        // on divise le score par la longueur du génome
        return fitness;
    }
}
