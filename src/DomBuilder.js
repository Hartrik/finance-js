
/**
 *
 * @version 2022-03-18
 * @author Patrik Harag
 */
export class DomBuilder {

    /**
     *
     * @param name {string}
     * @param attributes {object|null}
     * @param content {null|string|JQuery<HTMLElement>|JQuery<HTMLElement>[]}
     * @return {JQuery<HTMLElement>}
     */
    static element(name, attributes = null, content = null) {
        let element = $(`<${name}>`);
        if (attributes !== null) {
            for (let key in attributes) {
                element.attr(key, attributes[key]);
            }
        }
        if (content === null) {
            // nothing
        } else if (typeof content === 'string') {
            element.text(content);
        } else {
            element.append(content);
        }
        return element;
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|JQuery<HTMLElement>|JQuery<HTMLElement>[]}
     * @return {JQuery<HTMLElement>}
     */
    static div(attributes = null, content = null) {
        return DomBuilder.element('div', attributes, content);
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|string|JQuery<HTMLElement>|JQuery<HTMLElement>[]}
     * @return {JQuery<HTMLElement>}
     */
    static par(attributes = null, content = null) {
        return DomBuilder.element('p', attributes, content);
    }

    /**
     *
     * @param text {string|null}
     * @param attributes {object|null}
     * @return {JQuery<HTMLElement>}
     */
    static span(text = null, attributes = null) {
        return DomBuilder.element('span', attributes, text);
    }

    /**
     *
     * @param text {string}
     * @param attributes {object|null}
     * @param handler {function(e)}
     * @return {JQuery<HTMLElement>}
     */
    static link(text, attributes = null, handler = null) {
        let link = DomBuilder.element('a', attributes, text);
        if (handler !== null) {
            link.attr('href', 'javascript:void(0)');
            link.on("click", handler);
        }
        return link;
    }
}

/**
 *
 * @version 2022-03-20
 * @author Patrik Harag
 */
DomBuilder.Bootstrap = class {

    /**
     *
     * @param node {JQuery<HTMLElement>}
     * @param text {string}
     * @return {JQuery<HTMLElement>}
     */
    static initTooltip(text, node) {
        node.tooltip('dispose');  // remove old one if present

        node.attr('data-toggle', 'tooltip');
        node.attr('data-placement', 'top');
        node.attr('title', text);
        node.tooltip();
        return node;
    }

    /**
     *
     * @param text {string}
     * @param checked {boolean}
     * @param handler {function(boolean)}
     * @return {JQuery<HTMLElement>}
     */
    static switchButton(text, checked, handler = null) {
        let id = 'switch-button_' + Math.floor(Math.random() * 999_999_999);

        let switchInput = DomBuilder.element('input', {
            type: 'checkbox',
            id: id,
            class: 'custom-control-input',
            style: 'width: min-content;'
        });
        if (checked) {
            switchInput.attr('checked', 'true');
        }

        let control = DomBuilder.div({ class: 'custom-control custom-switch' }, [
            switchInput,
            DomBuilder.element('label', { class: 'custom-control-label', for: id }, text)
        ]);

        if (handler !== null) {
            switchInput.on('click', () => {
                let checked = switchInput.prop('checked');
                handler(checked);
            });
        }
        return control;
    }
}
