import {DomBuilder} from "./DomBuilder";

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
export class ComponentOptionsCeil {

    #refreshFunction;
    #inputCheckBox;

    constructor(refreshFunction) {
        this.#refreshFunction = refreshFunction;
    }

    createNode() {
        let node = DomBuilder.div({ class: 'ceil-component btn-group-toggle', 'data-toggle': 'buttons' }, [
            DomBuilder.element('label', { class: 'btn btn-secondary' }, [
                this.#inputCheckBox = DomBuilder.element('input', { type: 'checkbox', class: 'form-control' }),
                ' ,00'
            ])
        ]);

        this.#inputCheckBox.change((e) => {
            this.#refreshFunction(this.isSelected());
        });

        return node;
    }

    isSelected() {
        return this.#inputCheckBox.prop('checked');
    }
}