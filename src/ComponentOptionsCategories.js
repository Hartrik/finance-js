import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2023-04-03
 * @author Patrik Harag
 */
export class ComponentOptionsCategories {

    #refreshFunction;
    #initialEnableCategories;

    #inputCheckBox;
    #node;

    constructor(enableCategories, refreshFunction) {
        this.#initialEnableCategories = enableCategories;
        this.#refreshFunction = refreshFunction;
    }

    createNode() {
        this.#node = DomBuilder.div({ class: 'categories-component btn-group-toggle', 'data-toggle': 'buttons' }, [
            DomBuilder.element('label', { class: 'btn btn-secondary' }, [
                this.#inputCheckBox = DomBuilder.element('input', {
                    type: 'checkbox',
                    checked: this.#initialEnableCategories,
                    class: 'form-control'
                }),
                DomBuilder.element('i', { class: 'fa fa-th' })
            ])
        ]);

        this.#inputCheckBox.change((e) => {
            this.#refreshFunction(this.isSelected());
        });

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
        return this.#inputCheckBox.prop('checked');
    }
}