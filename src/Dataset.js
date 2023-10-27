import { Parsers } from "./Parsers.js";
import $ from "jquery";

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
    transactions;

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
    loadTransactions(enableUrlDatasets) {
        if (enableUrlDatasets && Dataset.#isValidHttpUrl(this.data)) {
            // asynchronously fetch raw data from url and parse
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: this.data,
                    type: 'GET',
                    dataType: 'text',
                    success: (result) => {
                        try {
                            this.transactions = this.#parse(result);
                        } catch (e) {
                            this.exception = e;
                            this.transactions = [];
                            reject(e);
                            return;
                        }
                        resolve(this.transactions);
                    },
                    error: reject
                });
            });
        } else {
            // parse only
            return new Promise((resolve, reject) => {
                try {
                    this.transactions = this.#parse(this.data);
                } catch (e) {
                    this.exception = e;
                    this.transactions = [];
                    reject(e);
                    return;
                }
                resolve(this.transactions);
            });
        }
    }

    #parse(data) {
        let parser = Parsers.resolveParserByKey(this.dataType);
        let transactions = parser.parse(data);

        let copy = [];
        for (let transaction of transactions) {
            // append dataset parameter
           transaction.dataset = this.name;

            if (transaction.description.includes(';;;')) {
                // process multi-transaction
                copy.push(...this.#splitMultiTransaction(transaction));
            } else {
                copy.push(transaction);
            }
        }
        return copy;
    }

    #splitMultiTransaction(transaction) {
        // 100 - platba za zboží ;;; 200 - uplatek

        let result = [];
        for (let part of transaction.description.split(';;;')) {
            part = part.trim();
            if (part) {
                let separatorPos = part.indexOf('-');
                if (separatorPos && separatorPos + 1 < part.length) {
                    const numberPart = part.substring(0, separatorPos).trim();
                    const descriptionPart = part.substring(separatorPos + 1).trim();
                    let subTransaction = Object.assign({}, transaction);
                    subTransaction.description = descriptionPart;
                    subTransaction.value = Number.parseFloat(numberPart);
                    subTransaction.origin = transaction;
                    result.push(subTransaction);
                } else {
                    return transaction;  // wrong format
                }
            }
        }

        // test
        let sum = result.reduce((sum, t) => sum + t.value, 0);
        if (sum !== transaction.value) {
            throw 'Multi transaction checksum failed: ' + JSON.stringify(transaction);
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
        if (object.transactions !== undefined && object.transactions !== null) {
            dataset.transactions = object.transactions;
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