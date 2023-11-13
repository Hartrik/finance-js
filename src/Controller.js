
/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class Controller {
    #dialogAnchorNode;
    #dataManager;

    constructor(dialogAnchorNode, dataManager) {
        this.#dialogAnchorNode = dialogAnchorNode;
        this.#dataManager = dataManager;
    }

    getDialogAnchor() {
        return this.#dialogAnchorNode;
    }

    getDataManager() {
        return this.#dataManager;
    }
}