import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2023-10-27
 * @author Patrik Harag
 */
export class ComponentOptionsCategories {

    #refreshFunction;
    #checked;

    #node;

    constructor(enableCategories, refreshFunction) {
        this.#checked = enableCategories;
        this.#refreshFunction = refreshFunction;
    }

    createNode() {
        let labelContent = DomBuilder.element('i', { class: 'fa fa-th' });
        let toggleButton = DomBuilder.Bootstrap.toggleButton(labelContent, 'btn-secondary', this.#checked, b => {
            this.#checked = b;
            this.#refreshFunction(b);
        });

        this.#node = DomBuilder.div({ class: 'categories-component' }, toggleButton);
        return this.#node;
    }

    setDisabled(disabled) {
        if (disabled) {
            this.#node.hide();
        } else {
            this.#node.show();
        }
    }

    isSelected() {
        return this.#checked;
    }
}