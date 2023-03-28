/**
 *
 * @version 2022-02-20
 * @author Patrik Harag
 */
export class CSVReader {
    _string;
    _separator;
    _position = 0;

    constructor(string, separator = ',') {
        this._string = string;
        this._separator = separator;
    }

    readLine() {
        if (this._position === 0 && this._string.length > 0 && this._string.charAt(0) === '\ufeff') {
            // skip BOM
            this._position++;
        }

        let strings = [];
        let buffer = '';
        let inString = false;
        let separatorNeeded = false;
        let quotationMark = null;

        PROCESSING: while (this._position < this._string.length) {
            let c = this._string.charAt(this._position);

            switch (c) {
                case '"':
                    if (inString) {
                        if (quotationMark === c) {
                            if (this._position + 1 < this._string.length && this._string.charAt(this._position + 1) === c) {
                                // escaped character...
                                this._position++;
                                buffer += c;
                            } else {
                                // end of string
                                // note: we don't check separatorNeeded
                                strings.push(buffer);
                                buffer = '';
                                inString = false;
                                separatorNeeded = true;
                            }
                        } else {
                            buffer += c;
                        }
                    } else {
                        separatorNeeded = false;
                        quotationMark = c;
                        inString = true;
                    }
                    this._position++;
                    break;
                case this._separator:
                    if (inString) {
                        if (quotationMark === null) {
                            // end of string with no quotation marks
                            strings.push(buffer.trim());
                            buffer = '';
                            inString = false;
                            separatorNeeded = false;
                        } else {
                            buffer += c;
                        }
                    } else {
                        if (!separatorNeeded) {
                            // empty cell
                            strings.push('');
                        }
                        separatorNeeded = false;
                    }
                    this._position++;
                    break;
                case '\n':
                case '\r':
                    this._position++;
                    break PROCESSING;
                case '\t':
                case ' ':
                    if (inString) {
                        buffer += c;
                    }
                    this._position++;
                    break;
                default:
                    if (!inString) {
                        separatorNeeded = false;
                        quotationMark = null;
                        inString = true;
                    }
                    buffer += c;
                    this._position++;
                    break;
            }
        }

        if (inString) {
            if (quotationMark === null) {
                strings.push(buffer.trim());
            } else {
                // note: missing ending quotation mark
                strings.push(buffer);
            }
        }

        if (strings.length === 0 && this._position >= this._string.length) {
            return null;
        }
        return strings;
    }
}