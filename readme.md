# Finance JS
This is a simple web application for personal financial analysis.
It is intended to be used with a data from internet banking (an exported bank statements)
or with a manually created ones (a list of cash expenses).

Implemented storage options: REST API backend / Local Storage API.

**Online: https://harag.cz/app/finance**
- Local Storage only: Everything is processed (and optionally stored) in the browser – no data is sent to the server.

## Milestones
- 2021-10-31: The first commit
- 2022-02-05: Work has started on the public version (without server side data parsing, DB, etc.)
- 2022-02-06: Parser: simple CSV
- 2022-02-09: Parser: OFX
- 2022-02-20: Parser: Fio CSV, Moneta CSV, Equa CSV
- 2022-02-25: Filter and datasets saving (local storage)
- 2022-11-30: Parser: Sodexo JSON
- 2023-03-27: The codebase moved into *this* separate Git repository and migrated to Rollup.js
- 2023-03-28: Text areas replaced by the CodeMirror source editor
- 2023-04-05: Architecture redesign & user interface improvements; New features: *multi-transactions*, *categories table*, *ceiling*
- 2023-04-15: Parser: Raiffeisen CSV
- 2023-10-27: Migration to Bootstrap 5
- 2023-11-13: New feature: *year filter*
- 2024-01-01: Parser: UniCredit CSV

## Development

`npm run build` builds the library to `dist`.

`npm run dev` builds the library, then keeps rebuilding it whenever the source files change using rollup-watch.

`npm test` builds the library, then tests it.

### TODOs
- TODO: remove remaining jQuery DOM building statements `$('<tr></tr>')` >> DomBuilder
- TODO: replace remaining anonymous objects using classes
- TODO: use private # fields where possible
- TODO: JSDoc
