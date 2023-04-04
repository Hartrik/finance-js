/**
 *
 * @version 2023-04-04
 * @author Patrik Harag
 */
export class Analytics {

    static EVENT_NAME = 'app_finance_js';
    static FEATURE_APP_INITIALIZED = 'initialized';

    static #USED_FEATURES = new Set();

    static triggerFeatureUsed(feature) {
        if (!Analytics.#USED_FEATURES.has(feature)) {
            // report only the first usage
            Analytics.#USED_FEATURES.add(feature);
            Analytics.#report({
                'app_finance_js_feature': feature
            });
        }
    }

    static #report(properties) {
        if (typeof gtag === 'function') {
            gtag('event', Analytics.EVENT_NAME, properties);
        }
        // console.log('event: ' + Analytics.EVENT_NAME + ' = ' + JSON.stringify(properties));
    }
}
