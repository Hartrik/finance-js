import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserSimpleCSV extends Parser {

    getKey() {
        return 'csv-simple';
    }

    getDisplayName() {
        return 'CSV – simple – Date;Value;Description';
    }

    getExtension() {
        return 'csv';
    }

    parse(csv) {
        let transactions = [];
        let fistLine = true;
        let csvReader = new CSVReader(csv, ';');
        let line;
        while ((line = csvReader.readLine()) !== null) {
            if (line.length === 0 || (line.length === 1 && line[0].trim() === '')) {
                // skip empty line
                continue;
            }
            if (line.length !== 3) {
                throw `Wrong format - expected: Date;Value;Description OR "Date";"Value";"Description"`;
            }
            if (fistLine && line[0].trim() === 'Date') {
                // skip header
                fistLine = false;
                continue;
            }
            fistLine = false;
            let date = line[0];
            let value = parseFloat(line[1]);
            let description = line[2];
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}