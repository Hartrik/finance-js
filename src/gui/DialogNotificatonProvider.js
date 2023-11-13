import { NotificationProvider } from "../NotificationProvider";
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class DialogNotificationProvider extends NotificationProvider{
    #dialogAnchorNode;

    constructor(dialogAnchorNode) {
        super();
        this.#dialogAnchorNode = dialogAnchorNode;
    }

    handleError(title, e) {
        const msg = e.statusText ? e.statusText : e;
        console.log(title + ': ' + msg);

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent("Error");
        dialog.setBodyContent([
            DomBuilder.par(null, title + ': '),
            DomBuilder.element('code', null, msg)
        ]);
        dialog.addCloseButton('Close');
        dialog.show(this.#dialogAnchorNode);
    }

    handleInfo(title, description) {
        console.log(title + ': ' + description);

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent(title);
        dialog.setBodyContent(DomBuilder.par(null, description));
        dialog.addCloseButton('Close');
        dialog.show(this.#dialogAnchorNode);
    }
}