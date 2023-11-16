import { Parser } from "./Parser";
import { ParserSimpleCSV } from "./ParserSimpleCSV";
import { ParserFio } from "./ParserFio";
import { ParserMoneta } from "./ParserMoneta";
import { ParserEqua } from "./ParserEqua";
import { ParserRaiffeisen } from "./ParserRaiffeisen";
import { ParserSodexo } from "./ParserSodexo";
import { ParserOFX } from "./ParserOFX";

/**
 *
 * @version 2023-11-16
 * @author Patrik Harag
 */
export class Parsers {

    /**
     *
     * @type {Map<string, Parser>}
     */
    static AVAILABLE = new Map([
        new ParserSimpleCSV(),
        new ParserFio(),
        new ParserMoneta(),
        new ParserEqua(),
        new ParserRaiffeisen(),
        new ParserSodexo(),
        new ParserOFX(),
    ].map(p => [p.getKey(), p]));

    /**
     *
     * @param key {string}
     * @return {Parser}
     */
    static resolveParserByKey(key) {
        let parser = Parsers.AVAILABLE.get(key);
        if (parser === undefined) {
            throw "Parser not supported: " + key;
        }
        return parser;
    }

    /**
     * @returns {Parser[]} parsers
     */
    static resolveParserByExtension(ext) {
        let matches = [];
        for (let [key, parser] of Parsers.AVAILABLE) {
            if (parser.getExtension() === ext) {
                matches.push(parser);
            }
        }
        return matches;
    }
}
