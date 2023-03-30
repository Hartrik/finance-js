
/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class DataProvider {

    // filters

    hasStoredFilters() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise<string>
     */
    fetchFilters() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
     */
    storeFilters(rawFilters) {
        throw 'Unsupported operation: not implemented';
    }

    discardFilters() {
        throw 'Unsupported operation: not implemented';
    }

    // datasets

    hasStoredDatasets() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     * @returns Promise<Map<Dataset>>
     */
    fetchDatasets() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
     */
    storeDatasets(datasets) {
        throw 'Unsupported operation: not implemented';
    }

    discardDatasets() {
        throw 'Unsupported operation: not implemented';
    }
}

