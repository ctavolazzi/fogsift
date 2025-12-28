/**
 * FOGSIFT DEBUG MODULE (TKT-x7k9-008)
 *
 * Purpose: Toggleable debug logging for development and troubleshooting
 * Dependencies: None (standalone, loads before other modules)
 * Used by: Cache.js, WikiAPI.js, and other modules
 *
 * Usage:
 *   Debug.enable()                    // Enable and persist
 *   Debug.disable()                   // Disable and clear
 *   Debug.log('Module', 'message')    // General logging
 *   Debug.api('/endpoint', 200, 45)   // API call logging
 *   Debug.component('Name', 'event')  // Component lifecycle
 *
 * Related:
 * - Work Effort: WE-251227-x7k9
 */

(function() {
    'use strict';

    // Debug configuration
    const STORAGE_KEY = 'fogsift_debug';
    const PREFIX = '[FOGSIFT]';

    // Console styling
    const STYLES = {
        module: 'color: #6b7280; font-weight: bold;',
        api: 'color: #059669; font-weight: bold;',
        component: 'color: #7c3aed; font-weight: bold;',
        error: 'color: #dc2626; font-weight: bold;',
        success: 'color: #16a34a;',
        timing: 'color: #d97706;',
        default: 'color: #374151;'
    };

    /**
     * Debug - Toggleable logging system
     *
     * Disabled by default. Enable via:
     *   Debug.enable() in browser console
     */
    const Debug = {
        /** Whether debug logging is active */
        enabled: false,

        /** Prefix for all log messages */
        prefix: PREFIX,

        /**
         * Initialize debug state from localStorage
         */
        init() {
            try {
                this.enabled = localStorage.getItem(STORAGE_KEY) === 'true';
                if (this.enabled) {
                    console.log(`%c${PREFIX} Debug mode enabled`, STYLES.success);
                }
            } catch (e) {
                // localStorage not available
            }
        },

        /**
         * Enable debug logging and persist
         */
        enable() {
            this.enabled = true;
            try {
                localStorage.setItem(STORAGE_KEY, 'true');
            } catch (e) {}
            console.log(`%c${PREFIX} Debug mode enabled`, STYLES.success);
            console.log(`%c${PREFIX} Use Debug.disable() to turn off`, STYLES.default);
        },

        /**
         * Disable debug logging and clear storage
         */
        disable() {
            this.enabled = false;
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {}
            console.log(`%c${PREFIX} Debug mode disabled`, STYLES.default);
        },

        /**
         * General purpose logging
         * @param {string} module - Module name (e.g., 'WikiAPI', 'Cache')
         * @param {string} message - Log message
         * @param {*} [data] - Optional data to log
         */
        log(module, message, data) {
            if (!this.enabled) return;

            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const msg = `%c${PREFIX} %c[${module}] %c${message}`;

            if (data !== undefined) {
                console.log(msg, STYLES.default, STYLES.module, STYLES.default, data);
            } else {
                console.log(msg, STYLES.default, STYLES.module, STYLES.default);
            }
        },

        /**
         * Log API calls with timing
         * @param {string} endpoint - API endpoint path
         * @param {number} status - HTTP status code
         * @param {number} ms - Duration in milliseconds
         */
        api(endpoint, status, ms) {
            if (!this.enabled) return;

            const statusStyle = status >= 200 && status < 300 ? STYLES.success : STYLES.error;
            const msg = `%c${PREFIX} %c[API] %c${endpoint} %c${status} %c(${ms}ms)`;

            console.log(
                msg,
                STYLES.default,
                STYLES.api,
                STYLES.default,
                statusStyle,
                STYLES.timing
            );
        },

        /**
         * Log component lifecycle events
         * @param {string} name - Component name
         * @param {string} event - Event type (e.g., 'mounted', 'updated', 'rendered')
         * @param {*} [data] - Optional event data
         */
        component(name, event, data) {
            if (!this.enabled) return;

            const msg = `%c${PREFIX} %c[${name}] %c${event}`;

            if (data !== undefined) {
                console.log(msg, STYLES.default, STYLES.component, STYLES.default, data);
            } else {
                console.log(msg, STYLES.default, STYLES.component, STYLES.default);
            }
        },

        /**
         * Log errors (always shown even if debug disabled)
         * @param {string} module - Module name
         * @param {string|Error} error - Error message or Error object
         */
        error(module, error) {
            const errorMsg = error instanceof Error ? error.message : error;
            console.error(
                `%c${PREFIX} %c[${module}] %c${errorMsg}`,
                STYLES.default,
                STYLES.error,
                STYLES.error
            );
        },

        /**
         * Log a group of related messages
         * @param {string} label - Group label
         * @param {Function} fn - Function containing log calls
         */
        group(label, fn) {
            if (!this.enabled) return;

            console.group(`${PREFIX} ${label}`);
            fn();
            console.groupEnd();
        },

        /**
         * Log a table of data
         * @param {string} label - Table label
         * @param {Array|Object} data - Data to display as table
         */
        table(label, data) {
            if (!this.enabled) return;

            console.log(`%c${PREFIX} ${label}:`, STYLES.module);
            console.table(data);
        }
    };

    // Initialize on load
    Debug.init();

    // Export to global scope
    window.Debug = Debug;
})();

