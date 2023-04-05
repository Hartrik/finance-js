
/**
 * @typedef {Object} Transaction
 * @property {string} date
 * @property {string} description
 * @property {number} value
 * @property {Transaction} origin
 */

/**
 *
 * @version 2023-04-05
 * @author Patrik Harag
 */
export class Transactions {

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
