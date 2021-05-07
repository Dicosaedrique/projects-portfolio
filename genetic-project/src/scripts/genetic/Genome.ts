// définit une fonction qui génère un gène aléatoire
export type GeneGenerator<Gene> = () => Gene;

// représente un génome soit un individu génétique portant un ensemble de gènes
export default class Genome<Gene> {
    private generateGene: GeneGenerator<Gene>; // fonction de génération des gènes du génome
    private genes: Array<Gene>; // les gènes du génome
    public fitness: number; // l'acceptabilité du génome (propriété publique manipulable)

    // on construit un génome en fonction de son nombre de gènes et d'une fonction permettant de retourner un gène aléatoire
    constructor(genesLength: number, geneGenerator: GeneGenerator<Gene>) {
        this.generateGene = geneGenerator;
        this.fitness = 0;

        // génération des gènes
        this.genes = Array.from({ length: genesLength }, (_) => this.generateGene());
    }

    // renvoi l'ADN du génome (la phrase complète en joingnant les gènes)
    getDNA(): string {
        return this.genes.join("");
    }

    // à partir de ce génome et d'un partenaire passé en paramètre, renvoi le croisement des deux (un nouveau génome)
    // on peut passer un midpoint en paramètre qui définit ou se situe la coupure pour le croisement
    crossover(partner: Genome<Gene>, midpoint?: number): Genome<Gene> {
        if (this.getSize() !== partner.getSize())
            throw "Un croisement entre deux génome ne peut être effectué que sur des génomes de même taille !";

        // création du nouveau génome
        const child = new Genome<Gene>(this.getSize(), this.generateGene);

        // définition du point de coupure pour croiser les génomes (si pas définit, alors aléatoire)
        if (midpoint === undefined) midpoint = Math.floor(Math.random() * this.getSize());

        // assigne la première moitié du nouveau génome avec les gènes de celui-ci et la seconde moitié avec l'autre
        for (let i = 0; i < this.getSize(); i++) {
            if (i > midpoint) child.genes[i] = this.genes[i];
            else child.genes[i] = partner.genes[i];
        }

        return child;
    }

    // fait muter le génome en passant en paramètre une probabilité (% entre 0 et 100)
    mutate(mutationRate: number): void {
        // pour chaque gène
        for (let i = 0; i < this.getSize(); i++) {
            // si on doit faire muter
            if (Math.random() < mutationRate / 100) {
                // remplace le gène par un nouveau gène aléatoire
                this.genes[i] = this.generateGene();
            }
        }
    }

    // GETTERS

    // renvoi l'acceptabilité du génome
    getGenes(): Array<Gene> {
        return this.genes;
    }

    // renvoi la taille du génome
    getSize(): number {
        return this.genes.length;
    }

    // renvoi la fonction de génération du génome
    getGeneGenerator(): GeneGenerator<Gene> {
        return this.generateGene;
    }

    // renvoi vrai si l'ADN de la cible passée en paramètre est égale à celle de ce génome
    equals(target: Genome<Gene>): boolean {
        return this.getDNA() === target.getDNA();
    }

    // génère un génome à partir d'une séquence de gènes et d'un générateur (permet de générer les cibles au départ)
    static createFromGenes<Gene>(genes: Array<Gene>, geneGenerator: GeneGenerator<Gene>): Genome<Gene> {
        const genome = new Genome<Gene>(genes.length, geneGenerator);
        genome.genes = genes; // assigne au génome ses gènes de départ
        return genome;
    }
}
