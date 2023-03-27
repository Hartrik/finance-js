import { Parsers } from "./Parsers.js";

/**
 *
 * @version 2022-05-22
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
                            this.statements = this._parse(result);
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
                    this.statements = this._parse(this.data);
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

    _parse(data) {
        let parser = Parsers.resolveParserByKey(this.dataType);
        let statements = parser.parse(data);

        // append dataset parameter
        statements.forEach(s => {
           s.dataset = this.name;
        });

        return statements;
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
}