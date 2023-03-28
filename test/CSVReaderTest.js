const assert = require('assert');
const Parsers = require('../dist/lib-parsers.umd.js');

function test(expected, actual) {
    let expectedStr = JSON.stringify(expected);
    let actualStr = JSON.stringify(actual);

    assert.equal(actualStr, expectedStr);
    console.log(`\u001B[32m✓\u001B[39m`);
}


{
    console.log('testCSVParseNoQuotes');
    let reader = new Parsers.CSVReader(' a, b \t, c c c \n\n,,xx x\n,');
    test(["a", "b", "c c c"], reader.readLine());
    test([], reader.readLine());
    test(["", "", "xx x"], reader.readLine());
    test([""], reader.readLine());
    test(null, reader.readLine());
}
{
    console.log('testCSVParseQuotes');
    let reader = new Parsers.CSVReader('" a ", "b", "c c c"\n"", "test",\n"a" "b"');
    test([" a ", "b", "c c c"], reader.readLine());
    test(["", "test"], reader.readLine());
    test(["a", "b"], reader.readLine());
    test(null, reader.readLine());
}
{
    console.log('testCSVParseQuotesEsc');
    let reader = new Parsers.CSVReader('"a""b""c"\n"""b""c"\n"a""b"""\n""""');
    test(["a\"b\"c"], reader.readLine());
    test(["\"b\"c"], reader.readLine());
    test(["a\"b\""], reader.readLine());
    test(["\""], reader.readLine());
    test(null, reader.readLine());
}
