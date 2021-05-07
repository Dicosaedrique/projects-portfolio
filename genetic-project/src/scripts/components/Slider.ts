import * as $ from "jquery";

import { inRange } from "../utils/Utils";

type SliderCallback = (value: number) => void;

// créer un composant HTML qui permet de slide une valeur avec un affichage sur mesure
export default class Slider {
    static ID = 0;

    private value: number;
    private min: number;
    private max: number;

    private absoluteMin: number;
    private absoluteMax: number;

    private container: JQuery<HTMLElement>;
    private input: JQuery<HTMLElement>;
    private leftValue: JQuery<HTMLElement>;
    private rightValue: JQuery<HTMLElement>;

    private callback: SliderCallback | undefined;

    constructor(
        value: number,
        min: number,
        max: number,
        container: JQuery<HTMLElement>,
        callback?: SliderCallback,
        absoluteMin?: number,
        absoluteMax?: number
    ) {
        this.value = value;
        this.min = min;
        this.max = max;

        this.absoluteMin = absoluteMin || min;
        this.absoluteMax = absoluteMax || max;

        this.callback = callback;

        const id = `slider-${Slider.ID++}`;

        this.container = container;

        this.input = $("<input/>", {
            type: "range",
            class: "form-range w-50 mx-4",
            id: id,
            min: this.min,
            max: this.max,
            value: this.value,
        }).on("input", this.onChange);

        this.leftValue = $("<span/>", { class: "h5" }).text("");
        this.rightValue = $("<span/>", { class: "h5" }).text("");

        this.container.append(this.leftValue, this.input, this.rightValue);

        // mise à jour initiale de l'interface
        this.render();
    }

    private onChange = (): void => {
        this.value = inRange(this.input.val() as number, this.min, this.max);
        this.render();
        if (this.callback) this.callback(this.value);
    };

    private render = () => {
        this.leftValue.text(this.value + (this.absoluteMin - this.min) + "%");
        this.rightValue.text(this.absoluteMax - this.value + "%");
    };

    getValue(): number {
        return this.value;
    }
}
