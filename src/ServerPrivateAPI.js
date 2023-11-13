
import $ from "jquery";

/**
 *
 * @version 2023-11-13
 * @author Patrik Harag
 */
export class ServerPrivateAPI {

    static csrfParameterName = null;
    static csrfToken = null;

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
    static postData(dataToSend) {
        return new Promise((resolve, reject) => {
            if (ServerPrivateAPI.csrfParameterName !== null) {
                dataToSend[ServerPrivateAPI.csrfParameterName] = ServerPrivateAPI.csrfToken;
            }

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
    static postSettings(dataToSend) {
        return new Promise((resolve, reject) => {
            if (ServerPrivateAPI.csrfParameterName !== null) {
                dataToSend[ServerPrivateAPI.csrfParameterName] = ServerPrivateAPI.csrfToken;
            }

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
    static updateServerData(incremental = false) {
        return new Promise((resolve, reject) => {
            let dataToSend = {};
            if (ServerPrivateAPI.csrfParameterName !== null) {
                dataToSend[ServerPrivateAPI.csrfParameterName] = ServerPrivateAPI.csrfToken;
            }

            $.ajax({
                url: '/app/finance/private/update?incremental=' + incremental,
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
