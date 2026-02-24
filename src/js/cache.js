/**
 * FOGSIFT CACHE MODULE (TKT-x7k9-005)
 *
 * Purpose: localStorage caching layer for API responses
 * Dependencies: None (standalone)
 * Used by: WikiAPI.js
 *
 * Features:
 * - TTL-based expiration (default 1 hour)
 * - Build timestamp invalidation (clears on deploy)
 * - Graceful degradation if localStorage unavailable
 *
 * Related:
 * - API Endpoints: _docs/20-29_development/architecture_category/architecture.02_api_endpoints.md
 * - Work Effort: WE-251227-x7k9
 */


(function() {
    'use strict';

    // Cache configuration
    const STORAGE_PREFIX = 'fogsift_';
    const BUILD_KEY = STORAGE_PREFIX + 'build';
    const DEFAULT_TTL = 3600000; // 1 hour in milliseconds

    /**
     * Cache - localStorage wrapper with TTL and version invalidation
     *
     * Usage:
     *   Cache.set('/wiki/index.json', data);
     *   const data = Cache.get('/wiki/index.json');
     *   Cache.clear();
     */
    const Cache = {
        /** Default TTL in milliseconds */
        ttl: DEFAULT_TTL,

        /**
         * Check if localStorage is available
         * @returns {boolean}
         */
        get available() {
            try {
                const test = '__test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (_e) {
                return false;
            }
        },

        /**
         * Get cached data if valid
         * @param {string} key - Cache key (usually API endpoint)
         * @returns {Object|null} Cached data or null if invalid/missing
         */
        get(key) {
            if (!this.available) return null;

            try {
                const item = localStorage.getItem(STORAGE_PREFIX + key);
                if (!item) return null;

                const { data, timestamp, buildTimestamp } = JSON.parse(item);

                // Check if cache has expired
                if (Date.now() - timestamp > this.ttl) {
                    this._log('expired', key);
                    this.remove(key);
                    return null;
                }

                // Check if build has changed (invalidates cache on deploy)
                const currentBuild = this._getCurrentBuild();
                if (currentBuild && buildTimestamp && buildTimestamp !== currentBuild) {
                    this._log('build changed', key);
                    this.clear();
                    return null;
                }

                return data;
            } catch (e) {
                this._log('error', `get ${key}: ${e.message}`);
                return null;
            }
        },

        /**
         * Store data in cache
         * @param {string} key - Cache key (usually API endpoint)
         * @param {Object} data - Data to cache
         */
        set(key, data) {
            if (!this.available) return;

            try {
                const item = {
                    data,
                    timestamp: Date.now(),
                    buildTimestamp: this._getCurrentBuild() || data.buildTimestamp
                };

                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
                this._log('set', key);
            } catch (e) {
                // localStorage might be full
                this._log('error', `set ${key}: ${e.message}`);
                // Try to clear old entries and retry
                this._cleanup();
            }
        },

        /**
         * Remove a single cache entry
         * @param {string} key - Cache key
         */
        remove(key) {
            if (!this.available) return;
            localStorage.removeItem(STORAGE_PREFIX + key);
        },

        /**
         * Check if cache entry is valid (exists and not expired)
         * @param {string} key - Cache key
         * @returns {boolean}
         */
        isValid(key) {
            return this.get(key) !== null;
        },

        /**
         * Clear all fogsift cache entries
         */
        clear() {
            if (!this.available) return;

            const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
            keys.forEach(k => localStorage.removeItem(k));
            this._log('cleared', `${keys.length} entries`);
        },

        /**
         * Set the current build timestamp (called when meta.json loads)
         * @param {number} timestamp - Build timestamp from API
         */
        setBuildTimestamp(timestamp) {
            if (!this.available) return;
            localStorage.setItem(BUILD_KEY, String(timestamp));
        },

        /**
         * Get stored build timestamp
         * @returns {number|null}
         * @private
         */
        _getCurrentBuild() {
            if (!this.available) return null;
            const stored = localStorage.getItem(BUILD_KEY);
            return stored ? parseInt(stored, 10) : null;
        },

        /**
         * Remove oldest entries when storage is full
         * @private
         */
        _cleanup() {
            if (!this.available) return;

            const entries = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(STORAGE_PREFIX) && key !== BUILD_KEY) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        entries.push({ key, timestamp: item.timestamp });
                    } catch (_e) {
                        // Invalid entry, remove it
                        localStorage.removeItem(key);
                    }
                }
            }

            // Sort by timestamp (oldest first) and remove oldest half
            entries.sort((a, b) => a.timestamp - b.timestamp);
            const toRemove = Math.ceil(entries.length / 2);
            entries.slice(0, toRemove).forEach(e => localStorage.removeItem(e.key));
            this._log('cleanup', `removed ${toRemove} entries`);
        },

        /**
         * Logging helper (uses Debug module if available)
         * @private
         */
        _log(type, message) {
            if (typeof Debug !== 'undefined' && Debug.log) {
                Debug.log('Cache', `${type}: ${message}`);
            }
        }
    };

    // Export to global scope
    window.Cache = Cache;
})();

