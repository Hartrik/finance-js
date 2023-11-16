import {Parser} from "./Parser";
import {Transactions} from "../Transactions";
import {CSVReader} from "./CSVReader";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserRaiffeisen extends Parser {

    getKey() {
        return 'csv-raiffeisen';
    }

    getDisplayName() {
        return 'CSV – Raiffeisen';
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
            if (line.length < 22) {
                throw `Wrong format - expected: Datum provedení;Datum zaúčtování;Číslo účtu;Název účtu;Kategorie transakce;Číslo protiúčtu;Název protiúčtu;Typ transakce;Zpráva;Poznámka;VS;KS;SS;Zaúčtovaná částka;Měna účtu;Původní částka a měna;Původní částka a měna;Poplatek;Id transakce;Vlastní poznámka;Název obchodníka;Město`;
            }
            if (fistLine && line[0].trim() === 'Datum provedení') {
                // skip header
                fistLine = false;
                continue;
            }
            fistLine = false;

            let date = line[0].slice(6, 10) + '-' + line[0].slice(3, 5) + '-' + line[0].slice(0, 2);
            let value = parseFloat(line[13].replace(',', '.').replace(' ', ''));
            let description;
            if (line[19]) {
                description = line[19];
            } else if (line[9]) {
                description = line[9];
            } else {
                description = line[7];
            }
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }
}