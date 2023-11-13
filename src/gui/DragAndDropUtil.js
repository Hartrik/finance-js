
/**
 *
 * @version 2023-03-30
 * @author Patrik Harag
 */
export class DragAndDropUtil {

    /**
     *
     * @param domNode
     * @param handler {function(fileName: string, content: string)}
     */
    static initTxtFileDragAndDrop(domNode, handler) {
        ['dragenter', 'dragover'].forEach(eventName => {
            domNode.addEventListener(eventName, e => {
                e.preventDefault()
                e.stopPropagation()
                domNode.classList.add('drag-and-drop-highlight');
            });
        });

        domNode.addEventListener('dragleave', e => {
            e.preventDefault()
            e.stopPropagation()
            domNode.classList.remove('drag-and-drop-highlight');
        });

        domNode.addEventListener('drop', e => {
            e.preventDefault()
            e.stopPropagation()
            domNode.classList.remove('drag-and-drop-highlight');

            DragAndDropUtil.#loadTxtFile(e.dataTransfer.files, handler);
        });
    }

    static #loadTxtFile(files, handler) {
        if (!files) {
            return;
        }
        let file = files[0];

        let reader = new FileReader();
        reader.onload = (readerEvent) => {
            let content = readerEvent.target.result;
            handler(file.name, content);
        }
        reader.readAsText(file);
    }
}