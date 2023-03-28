
/**
 * @version 2023-03-28
 * @author Patrik Harag
 */
export class Utils {

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

    static fromIso8601(strDate) {
        return new Date(Date.parse(strDate));
    }

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
}
