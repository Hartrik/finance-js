import { Utils } from "./Utils.js"

/**
 * @typedef {Object} Filter
 * @property {string} query query DSL
 * @property {string|undefined} color hex color
 * @property {function} filterFunc filtering function (processed query)
 */

/**
 * Functions related to filters.
 * Filter query language is inspired by MongoDB query language.
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class Filters {

    static QUERY_OPERATORS = ['$eq', '$contains', '$regex', '$gt', '$gte', '$lt', '$lte', '$or', '$and', '$not'];
    static QUERY_FIELDS = ['description', 'date', 'value', 'dataset'];

    static DEFAULT = [
        {
            "name": "<no filter>",
            "hideInTable": true,
        },
    ];


    static compile(query) {
        return function(transaction) {
            return Filters._matches(transaction, query)
        }
    }

    static _matches(transaction, query) {
        switch (typeof query) {
            case 'number':
            case 'string':
                // field not specified => default field
                return Filters._matchesField(transaction.description, query);
            case 'object':
                for (let [key, value] of Object.entries(query)) {
                    switch (key) {
                        // fields
                        case 'description':
                        case 'date':
                        case 'value':
                        case 'dataset':
                            if (!Filters._matchesField(transaction[key], value)) {
                                return false;
                            }
                            break;

                        // top level logical operations
                        case '$or':
                            for (let q of value) {
                                if (Filters._matches(transaction, q)) {
                                    return true;
                                }
                            }
                            return false;
                        case '$and':
                            for (let q of value) {
                                if (!Filters._matches(transaction, q)) {
                                    return false;
                                }
                            }
                            return true;
                        case '$not':
                            return !Filters._matches(transaction, value);

                        default:
                            throw 'Filter: Token not expected: ' + key
                    }
                }
                return true;
            default:
                throw 'Filter: Unsupported field: ' + query
        }
    }

    static _matchesField(field, query) {
        switch (typeof query) {
            case 'number':
                return field === query;
            case 'string':
                let normalizedField = field.toLowerCase();
                let normalizedQuery = query.toLowerCase();
                return normalizedField.includes(normalizedQuery);
            case 'object':
                for (let [key, value] of Object.entries(query)) {
                    if (!Filters._matchesFieldOperator(field, key, value)) {
                        return false;
                    }
                }
                return true;
            default:
                throw 'Filter: Unsupported field: ' + field
        }
    }

    static _matchesFieldOperator(field, operator, value) {
        switch (operator) {
            case '$eq':
                return (field === value)

            // strings
            case '$contains':
                let normalizedField = field.toLowerCase();
                let normalizedQuery = value.toLowerCase();
                return normalizedField.includes(normalizedQuery);
            case '$regex':
                let regex = new RegExp(value, "i");
                return field.match(regex) !== null;

            // numbers
            case '$gt':
                return (field > value)
            case '$gte':
                return (field >= value)
            case '$lt':
                return (field < value);
            case '$lte':
                return (field <= value);

            // logical
            case '$or':
                for (let query of value) {
                    if (Filters._matchesField(field, query)) {
                        return true;
                    }
                }
                return false;
            case '$and':
                for (let query of value) {
                    if (!Filters._matchesField(field, query)) {
                        return false;
                    }
                }
                return true;
            case '$not':
                return !Filters._matchesField(field, value);

            // others
            default:
                throw 'Filter: Unsupported operator: ' + operator
        }
    }

    /**
     *
     * @param json
     * @returns {Map<string, Filter>}
     */
    static load(json) {
        let loadedFilters = new Map();
        json.forEach((value) => {
            if (value.query != null) {
                value.filterFunc = Filters.compile(value.query);
            }
            if (value.color != null) {
                value.color = Utils.colourNameToHex(value.color);
                if (!Utils.isHexColor(value.color)) {
                    throw 'Color format not supported: ' + value.color
                }
            }
            loadedFilters.set(value.name, value);
        })

        // generate negated filters
        // TODO: not systematic
        loadedFilters.forEach((filter, name) => {
            if (filter.negFilter != null) {
                let f = loadedFilters.get(filter.negFilter);
                if (f != null) {
                    filter.filterFunc = (t) => !f.filterFunc(t);
                } else {
                    throw 'Filter: filter not found: ' + filter.negFilter
                }
            }
        });

        // generate synthetic (parent) filters
        let allFilters = new Map()
        loadedFilters.forEach((filter, name) => {
            let index = -1;
            do {
                index = name.indexOf('/', index + 1);
                if (index > 0) {
                    let syntheticName = name.substr(0, index);
                    if (!loadedFilters.has(syntheticName) && !loadedFilters.has(syntheticName)) {
                        let syntheticFilter = Filters._createSyntheticFilter(syntheticName, loadedFilters);
                        allFilters.set(syntheticName, syntheticFilter);
                    }
                }
            } while (index > 0);

            allFilters.set(name, filter);
        });

        return allFilters;
    }

    static _createSyntheticFilter(syntheticName, filters) {
        let subFilters = [];
        filters.forEach((filter, name) => {
            if (name.startsWith(syntheticName + '/')) {
                subFilters.push(filter);
            }
        });

        let func = function (transaction) {
            for (const filter of subFilters) {
                if (filter.filterFunc(transaction)) {
                    return true;
                }
            }
            return false;
        };

        return {
            'name': syntheticName,
            'subFilters': subFilters,
            'filterFunc': func
        }
    }

    static createSearchFilter(searchText) {
        searchText = searchText.trim();
        let searchFilter;
        if (searchText.startsWith('{') && searchText.endsWith('}')) {
            try {
                let query = JSON.parse(searchText);
                searchFilter = Filters.compile(query);
                this.testFilters([ searchFilter ]);
            } catch (e) {
                searchFilter = Filters.compile(searchText);
            }
        } else {
            searchFilter = Filters.compile(searchText);
        }

        return {
            'name': '"' + searchText + '"',
            'filterFunc': searchFilter
        };
    }

    static createYearFilter(year) {
        year = '' + year;  // make sure it is a string

        let searchFilter = Filters.compile({
            "date": {
                "$contains": year
            }
        });

        return {
            'name': year,
            'filterFunc': searchFilter
        };
    }

    static concat(filter1, filter2) {
        return {
            'name': filter1.name + ' & ' + filter2.name,
            'filterFunc': function (transaction) {
                if (filter1.filterFunc == null || filter1.filterFunc(transaction)) {
                    return (filter2.filterFunc == null || filter2.filterFunc(transaction));
                }
                return false;
            }
        };
    }

    static testFilters(filters) {
        // dynamic check - should throw an exception if there is a problem...
        let testTransaction = {
            "description": "xxx",
            "dataset": "test",
            "value": 10
        };
        filters.forEach(f => {
            if (f.filterFunc !== undefined) {
                f.filterFunc(testTransaction);
            }
        });
    }

    static groupByFilters(transactions, filters, noFilterGroupName) {
        // pre-populate groups - because of order...
        let filterGroups = new Map();
        const othersFilter = {
            name: noFilterGroupName
        };
        for (let filter of filters.values()) {
            filterGroups.set(filter.name, {
                filter: filter,
                others: false,
                transactions: []
            });
        }
        filterGroups.set(othersFilter.name, {
            filter: othersFilter,
            others: true,
            transactions: []
        });

        // fill groups
        for (let transaction of transactions) {
            let matchedFilterName = null;
            for (let filter of filters.values()) {
                if (filter.hideInTable != null && filter.hideInTable) {
                    continue;
                }
                if (filter.subFilters != null) {
                    continue;
                }
                if (filter.filterFunc != null && filter.filterFunc(transaction)) {
                    matchedFilterName = filter.name;
                    break;
                }
            }

            let current = filterGroups.get((matchedFilterName != null) ? matchedFilterName : othersFilter.name)
            current.transactions.push(transaction);
        }
        return filterGroups;
    }
}
