import * as $ from "jquery";

type Callback<Type> = (value: Type) => void;
export type DataOptions<Type> = { name: string; obj: Type; description: string; defaultSelect: boolean };

// créer un composant HTML qui permet de selectionner parmi une liste d'objet
export default class Select<Type> {
    static ID = 0;

    private options: Array<DataOptions<Type>>;

    private container: JQuery<HTMLElement>;
    private select: JQuery<HTMLElement>;
    private description: JQuery<HTMLElement>;

    private callback: Callback<Type> | undefined;

    constructor(
        options: Array<DataOptions<Type>>,
        container: JQuery<HTMLElement>,
        id: string,
        callback?: Callback<Type>
    ) {
        this.options = options;
        this.callback = callback;

        this.container = container;

        this.select = $("<select/>", {
            class: "form-select w-50",
            id: id,
        }).on("change", this.onChange);

        this.description = $("<p/>", { class: "mt-2 text-secondary small" });

        for (let i = 0; i < this.options.length; i++) {
            this.select.append(
                $("<option/>", { value: i, selected: this.options[i].defaultSelect }).text(this.options[i].name)
            );

            if (this.options[i].defaultSelect) {
                this.description.text(this.options[i].description || "");
            }
        }

        this.container.append(this.select, $("<p/>", { class: "h6 mt-2" }).text("Description"), this.description);
    }

    private onChange = (): void => {
        if (this.callback) this.callback(this.getValue());

        this.description.text(this.options[this.select.val() as number].description);
    };

    getValue(): Type {
        return this.options[this.select.val() as number].obj;
    }
}
