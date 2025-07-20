import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2024-01-01
 * @author Patrik Harag
 */
export class ParserUniCredit extends Parser {

    getKey() {
        return 'csv-unicredit';
    }

    getDisplayName() {
        return 'CSV – UniCredit';
    }

    getExtension() {
        return 'csv';
    }

    parse(csv) {
        let transactions = [];
        let header = true;
        let csvReader = new CSVReader(csv, ';');
        let line;
        while ((line = csvReader.readLine()) !== null) {
            if (line.length === 0 || (line.length === 1 && line[0].trim() === '')) {
                // skip empty line
                continue;
            }
            if (line.length < 31) {
                throw `Wrong format - expected: Account Number;Amount;Currency;Booking Date;Value Date;Partner Bank Code;Partner Bank name 1;Partner Bank name 2;Partner account number;Beneficiary;Address 1;Address 2;Address 3;Transaction Details 1;Transaction Details 2;Transaction Details 3;Transaction Details 4;Transaction Details 5;Transaction Details 6;Constant code;Variable code;Specific code;Foreign Exchange Rate;Reference number;Status;Rejection date;Rejection Detail;TPP Registration Number;TPP Name;TPP Payment Reference;Country of Registration;National Authority Code`;
            }

            if (header) {
                if (line[0] === 'Account Number') {
                    // end of header
                    header = false;
                }
                continue;
            }

            if (line[24] === 'RESERVED') {
                // ignore unprocessed payments
                continue;
            }

            let date = line[4];  // Value Date
            let value = parseFloat(line[1].replace(',', '.').replace(' ', ''));  // Amount
            let description;
            if (line[13]) {
                description = line[13];  // Transaction Details 1
            } else if (line[14]) {
                description = line[14];  // Transaction Details 2
            } else {
                description = line[15];  // Transaction Details 3
            }
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}