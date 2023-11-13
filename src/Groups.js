
/**
 * @typedef {Object} GroupedTransactions
 * @property {string} key
 * @property {Transaction[]} transactions
 */

/**
 * @version 2022-05-22
 * @author Patrik Harag
 */
export class Grouping {

    /**
     *
     * @param transaction
     * @returns {string}
     * @protected
     */
    _keyFunc(transaction) {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @param {string} key
     * @returns {string}
     * @protected
     */
    _follows(key) {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @param transactions {Transaction[]}
     * @returns {Map<string, GroupedTransactions>}
     */
    createGroups(transactions) {
        let groups = new Map()
        transactions.forEach(transaction => {
            let key = this._keyFunc(transaction);
            let current = groups.get(key)
            if (current === undefined) {
                current = {
                    key: key,
                    transactions: []
                }
            }
            current.transactions.push(transaction);
            groups.set(key, current);
        });

        if (groups.size > 2) {
            this._generateEmptyGroups(groups);
        }

        return groups;
    }

    /**
     *
     * @param {Map} groups
     * @protected
     */
    _generateEmptyGroups(groups) {
        let keys = Array.from(groups.keys()).sort();
        for (let i = 0; i < keys.length - 1; i++) {
            let current = keys[i];
            let next = keys[i + 1];

            const LIMIT = 10_000;  // max number of generated groups...
            for (let j = 0; j < LIMIT; j++) {
                let expected = this._follows(current);
                if (expected === next) {
                    // correct
                    break;
                } else {
                    if (!groups.has(expected)) {
                        groups.set(expected, {
                            key: expected,
                            transactions: []
                        });
                        current = expected;
                    } else {
                        // the follow method does not work well here - for example 53. week
                        break;
                    }
                }
            }
        }
    }
}

/**
 * @version 2022-05-22
 * @author Patrik Harag
 */
class MonthGrouping extends Grouping {
    _keyFunc(transaction) {
        return transaction.date.substr(0, 7);
    }

    _follows(key) {
        let year = Number.parseInt(key.substr(0, 4));
        let month = Number.parseInt(key.substr(5, 7));
        if (month === 12) {
            month = 1;
            year++;
        } else {
            month++;
        }
        return `${year}-${month < 10 ? '0' + month : month}`;
    }
}

/**
 * @version 2022-05-22
 * @author Patrik Harag
 */
class YearGrouping extends Grouping {
    _keyFunc(transaction) {
        return transaction.date.substr(0, 4);
    }

    _follows(key) {
        let year = Number.parseInt(key);
        year++;
        return '' + year;
    }
}

/**
 * @version 2022-05-22
 * @author Patrik Harag
 */
class SumGrouping extends Grouping {
    _keyFunc(transaction) {
        return 'Σ';
    }
}

/**
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class Groups {
    static NO_GROUPING = null;
    static GROUP_BY_MONTH = new MonthGrouping();
    static GROUP_BY_YEAR = new YearGrouping();
    static GROUP_ALL = new SumGrouping();
}
