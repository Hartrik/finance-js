import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserMoneta extends Parser {

    getKey() {
        return 'csv-moneta';
    }

    getDisplayName() {
        return 'CSV – Moneta';
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
            if (line.length < 18) {
                throw `Wrong format - expected: "Číslo účtu";"IBAN";"Číslo protiúčtu";"Banka protiúčtu";"Název účtu příjemce";"Splatnost";"Odesláno";"Částka";"Měna";"Variabilní Symbol";"Specifický Symbol";"Konstantní Symbol";"Zpráva pro příjemce";"Poznámka pro mě";"Název kategorie";"Typ transakce";"Název trvalého příkazu";"Popis platby";"Popis platby 2";"Bankovní reference"`;
            }
            if (fistLine && line[0].trim() === 'Číslo účtu') {
                // skip header
                fistLine = false;
                continue;
            }
            fistLine = false;

            let date = line[6].slice(6, 10) + '-' + line[6].slice(3, 5) + '-' + line[6].slice(0, 2);

            let value = parseFloat(line[7].replace(',', '.'));

            let description;
            if (line[13]) {
                // "Poznámka pro mě"
                description = line[13];
            } else if (line[12]) {
                // "Zpráva pro příjemce"
                description = line[12];
            } else {
                // "Popis platby"
                description = line[17];
            }

            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}