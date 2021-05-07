import Genome from "../Genome";

// DESIGN PATTERN : Strategy (permet de choisir une implémentation d'algorithme facilement -> ici une fitness function)
// définit une interface (classe abstraite) qui permet de calculer
// l'acceptabilité (fitness) d'un génome à partir d'un autre génome cible
export default interface FitnessStrategy<Gene> {
    calcFitness(source: Genome<Gene>, target: Genome<Gene>): number;
}
