
/**
 * @typedef {Object} Statement
 * @property {string} date
 * @property {string} description
 * @property {number} value
 */

/**
 *
 * @version 2022-02-19
 * @author Patrik Harag
 */
export class Statements {

    static comparator(a, b) {
        if (a.date === b.date) {
            return a.description > b.description ? 1 : -1;
        }
        return a.date > b.date ? 1 : -1;
    }

    static create(date, description, value) {
        return {
            date: date,
            description: description,
            value: value
        };
    }
}
