import { Transactions } from "./Transactions.js";
import { CSVReader } from "./CSVReader.js";

/**
 *
 * @version 2023-08-05
 * @author Patrik Harag
 */
export class Parsers {

    static AVAILABLE = {
        'csv-simple': {
            extension: 'csv',
            name: 'CSV – simple – Date;Value;Description',
            parse: Parsers.parseCSV_simple
        },
        'csv-fio': {
            extension: 'csv',
            name: 'CSV – Fio',
            parse: Parsers.parseCSV_fio
        },
        'csv-moneta': {
            extension: 'csv',
            name: 'CSV – Moneta',
            parse: Parsers.parseCSV_moneta
        },
        'csv-equa': {
            extension: 'csv',
            name: 'CSV – Equa',
            parse: Parsers.parseCSV_equa
        },
        'csv-raiffeisen': {
            extension: 'csv',
            name: 'CSV – Raiffeisen',
            parse: Parsers.parseCSV_raiffeisen
        },
        'json-sodexo': {
            extension: 'json',
            name: 'JSON – Sodexo API',
            parse: Parsers.parseSodexo
        },
        'ofx': {
            extension: 'ofx',
            name: 'OFX (Open Financial Exchange)',
            parse: Parsers.parseOFX
        }
    };

    static resolveParserByKey(key) {
        let parser = Parsers.AVAILABLE[key];
        if (parser === undefined) {
            throw "Parser not supported: " + key;
        }
        return parser;
    }

    /**
     * @returns {string[]} parser keys
     */
    static resolveParserByExtension(ext) {
        let matches = [];
        for (let key in Parsers.AVAILABLE) {
            let parser = Parsers.AVAILABLE[key];
            if (parser.extension === ext) {
                matches.push(key);
            }
        }
        return matches;
    }


    static parseCSV_simple(csv) {
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

    static parseCSV_fio(csv) {
        csv = csv.trimStart();
        if (csv.startsWith('"accountId";') || csv.startsWith('accountId;')) {
            // note: there are also some minor differences between CSV obtained
            //   from internet banking and from bank API
            return Parsers.parseCSV_fio_v2(csv);
        } else {
            return Parsers.parseCSV_fio_v1(csv);
        }
    }

    static parseCSV_fio_v1(csv) {
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

    static parseCSV_fio_v2(csv) {
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

    static parseCSV_moneta(csv) {
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

    static parseCSV_equa(csv) {
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

    static parseCSV_raiffeisen(csv) {
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

    static parseSodexo(data) {
        // https://sodexo-ucet.cz/Transactions/GetTransactionsAjax

        let parsed = JSON.parse(data);
        if (parsed['Data']) {
            parsed = parsed['Data'];
        }

        let transactions = [];
        for (let i in parsed) {
            let entry = parsed[i];

            let valuePar = entry['Amount'];
            let datePar = entry['DateLocalized'];
            let typePar = entry['TypeLocalized'];
            let workshopPar = entry['WorkshopName'];

            let value = parseFloat(valuePar);
            let date = datePar.slice(6, 10) + '-' + datePar.slice(3, 5) + '-' + datePar.slice(0, 2);
            let description = 'Sodexo: ' + typePar + (workshopPar ? (' - ' + workshopPar) : '');
            transactions.push(Transactions.create(date, description, value));
        }
        return transactions;
    }

    static parseOFX(ofx) {
        let parser = new DOMParser();
        let document = parser.parseFromString(ofx, "text/xml");

        let transactions = [];

        let processSTMTTRN = (node) => {
            let date = null;
            let description = null;
            let value = null;
            for (let k in node.children) {
                let child = node.children[k];
                switch (child.localName) {
                    case 'DTPOSTED':
                        let s = child.textContent;
                        date = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);
                        break;
                    case 'TRNAMT':
                        value = parseFloat(child.textContent);
                        break;
                    case 'MEMO':
                        description = child.textContent;
                        break;
                }
            }
            transactions.push(Transactions.create(date, description, value));
        };

        let walkOFX = (node) => {
            for (let k in node.children) {
                let child = node.children[k];
                if (child.localName === 'STMTTRN') {
                    // transaction
                    processSTMTTRN(child);
                } else {
                    walkOFX(child);
                }
            }
        };

        walkOFX(document);
        return transactions;
    }
}
