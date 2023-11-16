import {Parser} from "./Parser";
import {Transactions} from "../Transactions";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class ParserOFX extends Parser {

    getKey() {
        return 'ofx';
    }

    getDisplayName() {
        return 'OFX (Open Financial Exchange)';
    }

    getExtension() {
        return 'ofx';
    }

    parse(ofx) {
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