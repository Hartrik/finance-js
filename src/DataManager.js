
/**
 *
 * @version 2022-05-21
 * @author Patrik Harag
 */
export class DataManager {

    getSaveTooltip() {
        return '';
    }

    // filters

    hasStoredFilters() {
        throw 'Unsupported operation: not implemented';
    }

    /**
     *
     * @return Promise
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
     * @returns Promise
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

