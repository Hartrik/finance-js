import {DomBuilder} from "./DomBuilder";

/**
 * @version 2023-03-28
 * @author Patrik Harag
 */
export class Utils {

    // TODO: remove this; use DomBuilder
    static esc(input) {
        let map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        let text = '' + input;
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    static formatValue(val) {
        return Number(Number(val).toFixed(2)).toLocaleString('cs', {
            minimumFractionDigits: 2
        });
    }

    // DOM

    static createValue(val) {
        let formatted = '' + Utils.formatValue(val);
        let parts = formatted.split(',');
        return [
            DomBuilder.span(parts[0], { class: 'value-integer-part' }),
            DomBuilder.span(',' + parts[1], { class: 'value-floating-part' })
        ];
    }

    static createFilterLabel(f) {
        // TODO
        let color = f.color != null ? `style="background-color: ${Utils.esc(f.color)};"` : '';
        return $(`<span class="badge badge-info" ${color}>${Utils.esc(f.name)}</span>`);
    }
}
