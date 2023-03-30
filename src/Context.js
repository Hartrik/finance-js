/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class Context {

    dialogAnchor;

    csrfParameterName;
    csrfToken;

    constructor(dialogAnchor, csrfParameterName, csrfToken) {
        this.dialogAnchor = dialogAnchor;
        this.csrfParameterName = csrfParameterName;
        this.csrfToken = csrfToken;
    }
}
