
/**
 *
 * @version 2022-05-21
 * @author Patrik Harag
 */
export class ServerPrivateAPI {

    /**
     *
     * @return Promise
     */
    static fetchData() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/app/finance/private/data',
                type: 'GET',
                dataType: 'json',
                success: resolve,
                error: reject
            });
        });
    }

    /**
     *
     * @return Promise
     */
    static postData(context, dataToSend) {
        return new Promise((resolve, reject) => {
            dataToSend[context.csrfParameterName] = context.csrfToken;

            $.ajax({
                url: '/app/finance/private/data',
                type: 'POST',
                data: JSON.stringify(dataToSend),
                contentType: 'application/json',
                dataType: 'json',
                success: resolve,
                error: reject
            });
        });
    }

    /**
     *
     * @return Promise
     */
    static fetchSettings() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/app/finance/private/settings',
                type: 'GET',
                dataType: 'json',
                success: resolve,
                error: reject
            });
        });
    }

    /**
     *
     * @return Promise
     */
    static postSettings(context, dataToSend) {
        return new Promise((resolve, reject) => {
            dataToSend[context.csrfParameterName] = context.csrfToken;

            $.ajax({
                url: '/app/finance/private/settings',
                type: 'POST',
                data: JSON.stringify(dataToSend),
                contentType: 'application/json',
                dataType: 'json',
                success: resolve,
                error: reject
            });
        });
    }

    /**
     *
     * @return Promise
     */
    static updateServerData(context) {
        return new Promise((resolve, reject) => {
            let dataToSend = {};
            dataToSend[context.csrfParameterName] = context.csrfToken;

            $.ajax({
                url: '/app/finance/private/update',
                type: 'POST',
                data: JSON.stringify(dataToSend),
                contentType: 'application/json',
                dataType: 'json',
                success: resolve,
                error: reject
            });
        });
    }
}
