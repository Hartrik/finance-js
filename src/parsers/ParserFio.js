import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserFio extends Parser {

    getKey() {
        return 'csv-fio';
    }

    getDisplayName() {
        return 'CSV – FIO';
    }

    getExtension() {
        return 'csv';
    }

    parse(csv) {
        csv = csv.trimStart();
        if (csv.startsWith('"accountId";') || csv.startsWith('accountId;')) {
            // note: there are also some minor differences between CSV obtained
            //   from internet banking and from bank API
            return this.#parseFio_v2(csv);
        } else {
            return this.#parseFio_v2(csv);
        }
    }

    #parseFio_v1(csv) {
        let transactions = [];
        let fistLine = true;
        let csvReader = new CSVReader(csv, ';');
        let line;
        while ((line = csvReader.readLine()) !== null) {
            if (line.length === 0 || (line.length === 1 && line[0].trim() === '')) {
                // skip empty line
                continue;
            }
            if (line.length !== 10) {
                throw `Wrong format - expected: "Datum";"Objem";"Měna";"Protiúčet";"Kód banky";"KS";"VS";"SS";"Poznámka";"Typ"`;
            }
            if (fistLine && line[0].trim() === 'Datum') {
                // skip header
                fistLine = false;
                continue;
            }
            fistLine = false;
            let date = line[0].slice(6, 10) + '-' + line[0].slice(3, 5) + '-' + line[0].slice(0, 2);
            let value = parseFloat(line[1].replace(',', '.'));
            let description = line[8];
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }

    #parseFio_v2(csv) {
        let transactions = [];
        let header = true;
        let csvReader = new CSVReader(csv, ';');
        let line;
        while ((line = csvReader.readLine()) !== null) {
            if (line.length === 0 || (line.length === 1 && line[0].trim() === '')) {
                // skip empty line
                continue;
            }
            if (header) {
                if (line[0].trim() === 'ID operace' || line[0].trim() === 'ID pohybu') {
                    // end of header
                    header = false;
                }
                // skip header
                continue;
            }
            if (line.length < 17) {
                throw `Wrong format`;
            }

            let date = line[1].slice(6, 10) + '-' + line[1].slice(3, 5) + '-' + line[1].slice(0, 2);
            let value = parseFloat(line[2].replace(',', '.'));
            let description = line[16];
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}