import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2023-10-27
 * @author Patrik Harag
 */
export class ComponentOptionsCeil {

    #refreshFunction;
    #checked = false;

    constructor(refreshFunction) {
        this.#refreshFunction = refreshFunction;
    }

    createNode() {
        let toggleButton = DomBuilder.Bootstrap.toggleButton(' ,00', 'btn-secondary', this.#checked, b => {
            this.#checked = b;
            this.#refreshFunction(b);
        });

        return DomBuilder.div({ class: 'ceil-component' }, toggleButton);
    }

    isSelected() {
        return this.#checked;
    }
}