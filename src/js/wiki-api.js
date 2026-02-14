/**
 * FOGSIFT WIKI API CLIENT (TKT-x7k9-004)
 *
 * Purpose: Client-side module for loading wiki data from API endpoints
 * Dependencies: Debug.js (optional, for logging)
 * Used by: JD Sitemap component, Wiki navigation
 *
 * Related:
 * - API Endpoints: _docs/20-29_development/architecture_category/architecture.02_api_endpoints.md
 * - Work Effort: WE-251227-x7k9
 */


(function() {
    'use strict';

    // API base path (relative to current page)
    const API_BASE = '/api';

    /**
     * WikiAPI - Interface for loading wiki data
     *
     * Usage:
     *   const index = await WikiAPI.loadIndex();
     *   const sitemap = await WikiAPI.loadSitemap();
     */
    const WikiAPI = {
        /**
         * Load wiki index (categories and pages)
         * @returns {Promise<Object>} Wiki index data
         */
        async loadIndex() {
            return this._fetch('/wiki/index.json');
        },

        /**
         * Load JD sitemap data (pre-computed numbering)
         * @returns {Promise<Object>} Sitemap data with JD numbers
         */
        async loadSitemap() {
            return this._fetch('/wiki/sitemap.json');
        },

        /**
         * Load articles/field notes
         * @returns {Promise<Object>} Articles data
         */
        async loadArticles() {
            return this._fetch('/articles.json');
        },

        /**
         * Load site metadata (version, build date)
         * @returns {Promise<Object>} Site meta
         */
        async loadMeta() {
            return this._fetch('/meta.json');
        },

        /**
         * Internal fetch wrapper with error handling and optional caching
         * @private
         */
        async _fetch(endpoint) {
            const url = `${API_BASE}${endpoint}`;
            const startTime = performance.now();

            try {
                // Check cache first (if Cache module exists)
                if (typeof Cache !== 'undefined' && Cache.isValid) {
                    const cached = Cache.get(endpoint);
                    if (cached) {
                        this._log('cache hit', endpoint);
                        return cached;
                    }
                }

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const duration = Math.round(performance.now() - startTime);

                // Log API call (if Debug module exists)
                this._logApi(endpoint, response.status, duration);

                // Store in cache (if Cache module exists)
                if (typeof Cache !== 'undefined' && Cache.set) {
                    Cache.set(endpoint, data);
                }

                return data;
            } catch (error) {
                this._log('error', `${endpoint}: ${error.message}`);
                throw error;
            }
        },

        /**
         * Log API calls (uses Debug module if available)
         * @private
         */
        _logApi(endpoint, status, ms) {
            if (typeof Debug !== 'undefined' && Debug.api) {
                Debug.api(endpoint, status, ms);
            }
        },

        /**
         * General logging (uses Debug module if available)
         * @private
         */
        _log(type, message) {
            if (typeof Debug !== 'undefined' && Debug.log) {
                Debug.log('WikiAPI', `${type}: ${message}`);
            }
        }
    };

    // Export to global scope
    window.WikiAPI = WikiAPI;
})();

