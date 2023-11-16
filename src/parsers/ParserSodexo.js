import {Parser} from "./Parser";
import {Transactions} from "../Transactions";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserSodexo extends Parser {

    getKey() {
        return 'json-sodexo';
    }

    getDisplayName() {
        return 'JSON – Sodexo API';
    }

    getExtension() {
        return 'json';
    }

    parse(data) {
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
}