import { Utils } from "./Utils.js"

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
class WeekGrouping extends Grouping {

    // https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php

    /* For a given date, get the ISO week number
     *
     * Based on information at:
     *
     *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
     *
     * Algorithm is to find nearest thursday, it's year
     * is the year of the week number. Then get weeks
     * between that date and the first day of that year.
     *
     * Note that dates in one year can be weeks of previous
     * or next year, overlap is up to 3 days.
     *
     * e.g. 2014/12/29 is Monday in week  1 of 2015
     *      2012/1/1   is Sunday in week 52 of 2011
     */
    static weekNumber(d) {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        // Get first day of year
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        // Return array of year and week number
        return "" + d.getUTCFullYear() + "-W" + (weekNo < 10 ? "0" : "") + weekNo
    }

    static fromIso8601(strDate) {
        return new Date(Date.parse(strDate));
    }


    _keyFunc(transaction) {
        return WeekGrouping.weekNumber(WeekGrouping.fromIso8601(transaction.date))
    }

    _follows(key) {
        let year = Number.parseInt(key.substr(0, 4));
        let week = Number.parseInt(key.substr(6, 8));
        if (week >= 52) {  // ignore occasional 53. week here
            week = 1;
            year++;
        } else {
            week++;
        }
        return `${year}-W${week < 10 ? '0' + week : week}`;
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
 * @version 2022-05-22
 * @author Patrik Harag
 */
export class Groups {
    static NO_GROUPING = null;
    static GROUP_BY_WEEK = new WeekGrouping();
    static GROUP_BY_MONTH = new MonthGrouping();
    static GROUP_BY_YEAR = new YearGrouping();
    static GROUP_ALL = new SumGrouping();
}
