import { Parsers } from "./Parsers.js";

/**
 *
 * @version 2023-04-05
 * @author Patrik Harag
 */
export class Dataset {

    /** @type {string} */
    name;

    /** @type {string} */
    dataType;

    /** @type {string} */
    data;

    /** @type {array|undefined} */
    statements;

    /** @type {object|undefined} */
    exception;

    constructor(name, dataType, data) {
        if (name === undefined || name === null) {
            throw "Dataset name not set";
        }
        if (dataType === undefined || dataType === null) {
            throw "Dataset dataType not set";
        }
        if (data === undefined || data === null) {
            throw "Dataset data not set";
        }
        this.name = name;
        this.dataType = dataType;
        this.data = data;
    }

    /**
     *
     * @param enableUrlDatasets {boolean}
     * @return {Promise<array>}
     */
    loadStatements(enableUrlDatasets) {
        if (enableUrlDatasets && Dataset.#isValidHttpUrl(this.data)) {
            // asynchronously fetch raw data from url and parse
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: this.data,
                    type: 'GET',
                    dataType: 'text',
                    success: (result) => {
                        try {
                            this.statements = this.#parse(result);
                        } catch (e) {
                            this.exception = e;
                            this.statements = [];
                            reject(e);
                            return;
                        }
                        resolve(this.statements);
                    },
                    error: reject
                });
            });
        } else {
            // parse only
            return new Promise((resolve, reject) => {
                try {
                    this.statements = this.#parse(this.data);
                } catch (e) {
                    this.exception = e;
                    this.statements = [];
                    reject(e);
                    return;
                }
                resolve(this.statements);
            });
        }
    }

    #parse(data) {
        let parser = Parsers.resolveParserByKey(this.dataType);
        let statements = parser.parse(data);

        let copy = [];
        for (let statement of statements) {
            // append dataset parameter
           statement.dataset = this.name;

            if (statement.description.includes(';;;')) {
                // process multi-statement
                copy.push(...this.#splitMultiStatement(statement));
            } else {
                copy.push(statement);
            }
        }
        return copy;
    }

    #splitMultiStatement(statement) {
        // 100 - platba za zboží ;;; 200 - uplatek

        let result = [];
        for (let part of statement.description.split(';;;')) {
            part = part.trim();
            if (part) {
                let separatorPos = part.indexOf('-');
                if (separatorPos && separatorPos + 1 < part.length) {
                    const numberPart = part.substring(0, separatorPos).trim();
                    const descriptionPart = part.substring(separatorPos + 1).trim();
                    let subStatement = Object.assign({}, statement);
                    subStatement.description = descriptionPart;
                    subStatement.value = Number.parseFloat(numberPart);
                    subStatement.origin = statement;
                    result.push(subStatement);
                } else {
                    return statement;  // wrong format
                }
            }
        }

        // test
        let sum = result.reduce((sum, s) => sum + s.value, 0);
        if (sum !== statement.value) {
            throw 'Multi statement checksum failed: ' + JSON.stringify(statement);
        }

        return result;
    }

    static #isValidHttpUrl(string) {
        if (string.trim().includes('\n')) {
            return false;
        }

        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    /**
     *
     * @param object
     * @return {Dataset}
     */
    static asDataset(object) {
        let dataset = new Dataset(object.name, object.dataType, object.data);
        if (object.statements !== undefined && object.statements !== null) {
            dataset.statements = object.statements;
        }
        return dataset;
    }

    /**
     *
     * @param jsonString {string}
     * @returns {Map<Dataset>}
     */
    static parseDatasets(jsonString) {
        let parsed = JSON.parse(jsonString);
        let datasets = new Map();
        for (const [key, value] of Object.entries(parsed)) {
            datasets.set(key, Dataset.asDataset(value));
        }
        return datasets;
    }

    /**
     *
     * @param datasets {Map<Dataset>}
     * @returns {string} json string
     */
    static serializeDatasets(datasets) {
        let copy = {};
        datasets.forEach(d => {
            copy[d.name] = {
                name: d.name,
                dataType: d.dataType,
                data: d.data,
            };
        });
        return JSON.stringify(copy);
    }

    /**
     *
     * @param datasets {Map<Dataset>}
     * @returns {Map<Dataset>} deep copy
     */
    static copyDatasets(datasets) {
        let copy = new Map();
        datasets.forEach(d => {
            copy.set(d.name, new Dataset(d.name, d.dataType, d.data));
        });
        return copy;
    }
}