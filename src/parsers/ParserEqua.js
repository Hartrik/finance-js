import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserEqua extends Parser {

    getKey() {
        return 'csv-equa';
    }

    getDisplayName() {
        return 'CSV – Equa';
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
            if (line.length < 10) {
                throw `Wrong format - expected: "Číslo účtu klienta";"IBAN účtu klienta";"Číslo účtu protistrany";"Název účtu protistrany";"Datum splatnosti";"Datum vystavení";"Částka";"Měna";"Typ pohybu";"Popis pohybu";"Kategorie";"Kód transakce";"Variabilní symbol";"Specifický symbol";"Konstantní symbol";"Místo transakce";"Plátce";"Země transakce";"Název";"Reference platby"`;
            }
            if (fistLine && line[0].trim() === 'Číslo účtu klienta') {
                // skip header
                fistLine = false;
                continue;
            }
            fistLine = false;

            let date = line[4].slice(6, 10) + '-' + line[4].slice(3, 5) + '-' + line[4].slice(0, 2);
            let value = parseFloat(line[6].replace(',', '.'));
            let description;
            if (line[9]) {
                description = line[9];
            } else {
                description = line[8];
                if (line[15]) {
                    description += ' - ' + line[15];
                }
                if (line[2]) {
                    description += ' - ' + line[2];
                }
            }
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}