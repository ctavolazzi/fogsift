/**
 * 🐰 WHITE RABBIT — FogSift Universal Debugger
 * "Follow the rabbit hole" — traces CDNs, APIs, data streams, algorithms, DOM events.
 *
 * Usage:
 *   WhiteRabbit.follow('auth', { user: 'chris' })   // start a named trace
 *   WhiteRabbit.hop('step name', data)              // log a step in the current trace
 *   WhiteRabbit.burrow('tag', fn)                   // time + trace a function call
 *   WhiteRabbit.warren()                            // print full trace summary
 *   WhiteRabbit.sniff()                             // print detected env / surface info
 *
 * Auto-instruments:
 *   - window.fetch (CDN loads, API calls)
 *   - XMLHttpRequest
 *   - Script load errors (onerror)
 *   - Theme changes (MutationObserver on data-theme)
 *   - Performance marks
 *
 * Activation:
 *   ?debug=rabbit  in URL, or localStorage.setItem('white-rabbit', '1')
 *   or call WhiteRabbit.activate() manually in console
 */

(function (global) {
    'use strict';

    const R = '🐰';
    const TRAIL = '🐾';
    const HOLE  = '🕳️';
    const BURROW = '🌿';
    const WARREN = '🐇';

    // ── Config ─────────────────────────────────────────────────────────────
    const STORAGE_KEY = 'white-rabbit';
    const URL_PARAM   = 'debug';

    function isActive() {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1'
                || new URLSearchParams(location.search).get(URL_PARAM) === 'rabbit';
        } catch { return false; }
    }

    // ── Internal state ─────────────────────────────────────────────────────
    let _active = false;
    let _traceId = null;
    let _traceLabel = null;
    let _traceStart = null;
    let _log = []; // all recorded events

    // ── Utility ────────────────────────────────────────────────────────────
    function ts() {
        return performance.now().toFixed(1) + 'ms';
    }

    function uid() {
        return Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    function label(tag, color) {
        return [`%c${R} [${tag}]`, `color:${color};font-weight:bold;font-family:monospace`];
    }

    function record(type, data) {
        _log.push({ type, data, t: performance.now() });
    }

    // ── Surface detection ──────────────────────────────────────────────────
    function detectSurface() {
        const ua = navigator.userAgent;
        const info = {
            ua,
            browser: 'unknown',
            engine: 'unknown',
            mobile: /Mobi|Android/i.test(ua),
            standalone: navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
            inAppBrowser: false,
            platform: navigator.platform || 'unknown',
            connection: navigator.connection
                ? `${navigator.connection.effectiveType} (rtt:${navigator.connection.rtt}ms)`
                : 'unknown',
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            viewport: `${window.innerWidth}×${window.innerHeight}`,
            dpr: window.devicePixelRatio,
            theme: document.documentElement.getAttribute('data-theme') || 'none',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        };

        // Browser detection
        if (/FBAV|FBAN/.test(ua))      { info.browser = 'Facebook In-App';  info.inAppBrowser = true; }
        else if (/Instagram/.test(ua)) { info.browser = 'Instagram In-App'; info.inAppBrowser = true; }
        else if (/ThreadsApp/.test(ua)){ info.browser = 'Threads In-App';   info.inAppBrowser = true; }
        else if (/TikTok/.test(ua))    { info.browser = 'TikTok In-App';    info.inAppBrowser = true; }
        else if (/Twitter/.test(ua))   { info.browser = 'Twitter In-App';   info.inAppBrowser = true; }
        else if (/Line\//.test(ua))    { info.browser = 'LINE In-App';      info.inAppBrowser = true; }
        else if (/EdgA|EdgiOS/.test(ua)) info.browser = 'Edge Mobile';
        else if (/CriOS/.test(ua))     info.browser = 'Chrome iOS';
        else if (/FxiOS/.test(ua))     info.browser = 'Firefox iOS';
        else if (/OPiOS/.test(ua))     info.browser = 'Opera iOS';
        else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) info.browser = 'Chrome';
        else if (/Firefox\//.test(ua)) info.browser = 'Firefox';
        else if (/Safari\//.test(ua) && /Version\//.test(ua)) info.browser = 'Safari';
        else if (/Edg\//.test(ua))     info.browser = 'Edge';

        // Engine
        if (/WebKit/.test(ua))   info.engine = 'WebKit';
        if (/Gecko\//.test(ua))  info.engine = 'Gecko';
        if (/Trident/.test(ua))  info.engine = 'Trident';

        // Known in-app quirks
        info.quirks = [];
        if (info.inAppBrowser) {
            info.quirks.push('localStorage may be blocked');
            info.quirks.push('navigator.share unavailable');
            info.quirks.push('WebGL may be restricted');
        }
        if (info.standalone) info.quirks.push('PWA standalone mode');
        if (info.reducedMotion) info.quirks.push('prefers-reduced-motion active');
        if (!info.cookiesEnabled) info.quirks.push('cookies disabled');

        return info;
    }

    // ── Fetch interceptor ──────────────────────────────────────────────────
    function wrapFetch() {
        if (!global.fetch || global.fetch._whiteRabbitWrapped) return;
        const _orig = global.fetch.bind(global);

        global.fetch = function wrappedFetch(input, init) {
            const reqId = uid();
            const url   = typeof input === 'string' ? input : input.url;
            const method = (init && init.method) || 'GET';
            const t0 = performance.now();

            if (_active) {
                console.log(...label('FETCH', '#e07b3c'), `→ ${method} ${url}`, `[${reqId}]`);
            }
            record('fetch:start', { reqId, url, method, t: t0 });

            return _orig(input, init).then(res => {
                const dur = (performance.now() - t0).toFixed(1);
                if (_active) {
                    const col = res.ok ? '#059669' : '#dc2626';
                    console.log(...label('FETCH', col), `← ${res.status} ${url} (${dur}ms)`, `[${reqId}]`);
                }
                record('fetch:done', { reqId, url, status: res.status, ok: res.ok, dur });
                return res;
            }).catch(err => {
                const dur = (performance.now() - t0).toFixed(1);
                if (_active) {
                    console.log(...label('FETCH', '#dc2626'), `✗ FAILED ${url} (${dur}ms)`, err.message, `[${reqId}]`);
                }
                record('fetch:error', { reqId, url, error: err.message, dur });
                throw err;
            });
        };
        global.fetch._whiteRabbitWrapped = true;
    }

    // ── XHR interceptor ────────────────────────────────────────────────────
    function wrapXHR() {
        if (!global.XMLHttpRequest || global.XMLHttpRequest._whiteRabbitWrapped) return;
        const OrigXHR = global.XMLHttpRequest;

        function WrappedXHR() {
            const xhr = new OrigXHR();
            const reqId = uid();
            let _url, _method, t0;

            const origOpen = xhr.open.bind(xhr);
            xhr.open = function (method, url, ...rest) {
                _url = url; _method = method;
                return origOpen(method, url, ...rest);
            };

            const origSend = xhr.send.bind(xhr);
            xhr.send = function (...args) {
                t0 = performance.now();
                if (_active) {
                    console.log(...label('XHR', '#0d9488'), `→ ${_method} ${_url}`, `[${reqId}]`);
                }
                record('xhr:start', { reqId, url: _url, method: _method });
                xhr.addEventListener('load', () => {
                    const dur = (performance.now() - t0).toFixed(1);
                    if (_active) {
                        const col = xhr.status < 400 ? '#059669' : '#dc2626';
                        console.log(...label('XHR', col), `← ${xhr.status} ${_url} (${dur}ms)`, `[${reqId}]`);
                    }
                    record('xhr:done', { reqId, url: _url, status: xhr.status, dur });
                });
                xhr.addEventListener('error', () => {
                    const dur = (performance.now() - t0).toFixed(1);
                    if (_active) {
                        console.log(...label('XHR', '#dc2626'), `✗ ERROR ${_url} (${dur}ms)`, `[${reqId}]`);
                    }
                    record('xhr:error', { reqId, url: _url, dur });
                });
                return origSend(...args);
            };

            return xhr;
        }
        WrappedXHR.prototype = OrigXHR.prototype;
        WrappedXHR._whiteRabbitWrapped = true;
        global.XMLHttpRequest = WrappedXHR;
    }

    // ── Script error listener ──────────────────────────────────────────────
    function watchScriptErrors() {
        global.addEventListener('error', e => {
            if (e.filename) {
                record('script:error', { src: e.filename, message: e.message, line: e.lineno });
                if (_active) {
                    console.log(...label('SCRIPT', '#dc2626'), `✗ ${e.message}`, `at ${e.filename}:${e.lineno}`);
                }
            }
        });
    }

    // ── Theme change watcher ───────────────────────────────────────────────
    function watchTheme() {
        const mo = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.attributeName === 'data-theme') {
                    const next = document.documentElement.getAttribute('data-theme');
                    record('theme:change', { to: next });
                    if (_active) {
                        console.log(...label('THEME', '#d97706'), `→ ${next || 'default'}`, `at ${ts()}`);
                    }
                }
            });
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // ── Performance marks ──────────────────────────────────────────────────
    function watchPerf() {
        if (!global.PerformanceObserver) return;
        try {
            const po = new PerformanceObserver(list => {
                list.getEntries().forEach(e => {
                    record('perf:mark', { name: e.name, t: e.startTime.toFixed(1) });
                    if (_active) {
                        console.log(...label('PERF', '#6b3fa0'), `⏱ ${e.name}`, `${e.startTime.toFixed(1)}ms`);
                    }
                });
            });
            po.observe({ type: 'mark', buffered: true });
        } catch { /* not supported */ }
    }

    // ── Public API ─────────────────────────────────────────────────────────
    const WhiteRabbit = {

        /**
         * activate() — turn on logging output
         * Automatically called if ?debug=rabbit or localStorage white-rabbit=1
         */
        activate() {
            _active = true;
            try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private browsing */ }
            console.log(
                `%c${R} WHITE RABBIT ACTIVATED`,
                'color:#e07b3c;font-size:14px;font-weight:bold;font-family:monospace'
            );
            console.log(`%c  Follow the rabbit hole. Type WhiteRabbit.warren() to see the full trace.`,
                'color:#7a6b5d;font-family:monospace;font-size:11px');
            return this;
        },

        /** deactivate() — silence output (keeps recording) */
        deactivate() {
            _active = false;
            try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
            console.log(`%c${R} White Rabbit deactivated. Recording continues silently.`,
                'color:#7a6b5d;font-family:monospace');
            return this;
        },

        /**
         * follow(label, context?) — start a named trace segment
         * like Alice entering the rabbit hole
         */
        follow(traceLabel, context) {
            _traceId    = uid();
            _traceLabel = traceLabel;
            _traceStart = performance.now();
            record('trace:start', { id: _traceId, label: traceLabel, context });
            if (_active) {
                console.group(`${R} ${HOLE} Following: "${traceLabel}" [${_traceId}]`);
                if (context) console.log(`%c  Context:`, 'color:#7a6b5d', context);
            }
            return _traceId;
        },

        /**
         * hop(step, data?) — log a named step within the current trace
         */
        hop(step, data) {
            const elapsed = _traceStart ? (performance.now() - _traceStart).toFixed(1) : '?';
            record('trace:hop', { traceId: _traceId, step, data, elapsed });
            if (_active) {
                console.log(...label(`HOP +${elapsed}ms`, '#0d9488'), step, data !== undefined ? data : '');
            }
            return this;
        },

        /**
         * burrow(tag, fn) — time and trace a synchronous function call
         * Returns the function's return value
         */
        burrow(tag, fn) {
            const t0 = performance.now();
            let result, error;
            try {
                result = fn();
            } catch (e) {
                error = e;
            }
            const dur = (performance.now() - t0).toFixed(2);
            record('burrow', { traceId: _traceId, tag, dur, error: error ? error.message : null });
            if (_active) {
                if (error) {
                    console.log(...label(`BURROW`, '#dc2626'), `${BURROW} ${tag} ✗ (${dur}ms)`, error);
                } else {
                    console.log(...label(`BURROW`, '#d97706'), `${BURROW} ${tag} ✓ (${dur}ms)`);
                }
            }
            if (error) throw error;
            return result;
        },

        /**
         * warren() — print the full trace log as a table + summary
         */
        warren() {
            console.group(`%c${WARREN} WHITE RABBIT — Full Warren (${_log.length} events)`,
                'color:#e07b3c;font-weight:bold;font-size:13px;font-family:monospace');

            const fetchEvents = _log.filter(e => e.type.startsWith('fetch:') || e.type.startsWith('xhr:'));
            const errors      = _log.filter(e => e.type.includes('error'));
            const hops        = _log.filter(e => e.type === 'trace:hop');
            const themeChanges = _log.filter(e => e.type === 'theme:change');

            if (fetchEvents.length) {
                console.group(`%c  ${R} Network (${fetchEvents.length} events)`, 'color:#0d9488;font-family:monospace');
                fetchEvents.forEach(e => console.log(`  ${e.type.padEnd(12)}`, e.data));
                console.groupEnd();
            }
            if (errors.length) {
                console.group(`%c  ${R} Errors (${errors.length})`, 'color:#dc2626;font-family:monospace');
                errors.forEach(e => console.log(`  ${e.type.padEnd(14)}`, e.data));
                console.groupEnd();
            }
            if (hops.length) {
                console.group(`%c  ${R} Trace hops (${hops.length})`, 'color:#d97706;font-family:monospace');
                console.table(hops.map(e => ({ step: e.data.step, elapsed: e.data.elapsed + 'ms', data: JSON.stringify(e.data.data || '') })));
                console.groupEnd();
            }
            if (themeChanges.length) {
                console.log(`%c  ${R} Theme changes:`, 'color:#6b3fa0;font-family:monospace',
                    themeChanges.map(e => e.data.to).join(' → '));
            }

            console.log(`%c  Total recorded events: ${_log.length}`, 'color:#7a6b5d;font-family:monospace');
            console.groupEnd();
            return _log;
        },

        /**
         * sniff() — print detected environment / surface info
         */
        sniff() {
            const info = detectSurface();
            console.group(`%c${R} Surface Sniff — ${info.browser}`,
                'color:#e07b3c;font-weight:bold;font-size:13px;font-family:monospace');
            console.log(`%c  Browser:`,  'color:#7a6b5d', info.browser);
            console.log(`%c  Engine:`,   'color:#7a6b5d', info.engine);
            console.log(`%c  Mobile:`,   'color:#7a6b5d', info.mobile);
            console.log(`%c  In-App:`,   'color:#7a6b5d', info.inAppBrowser);
            console.log(`%c  Standalone:`, 'color:#7a6b5d', info.standalone);
            console.log(`%c  Viewport:`, 'color:#7a6b5d', info.viewport, `@ ${info.dpr}x DPR`);
            console.log(`%c  Network:`,  'color:#7a6b5d', info.connection);
            console.log(`%c  Online:`,   'color:#7a6b5d', info.onLine);
            console.log(`%c  Theme:`,    'color:#7a6b5d', info.theme);
            console.log(`%c  Reduced-motion:`, 'color:#7a6b5d', info.reducedMotion);
            if (info.quirks.length) {
                console.log(`%c  ⚠ Quirks:`, 'color:#d97706;font-weight:bold', info.quirks.join(', '));
            }
            console.groupEnd();
            return info;
        },

        /**
         * probe(url) — fire a test fetch and report timing + headers
         */
        async probe(url) {
            console.log(`%c${R} Probing: ${url}`, 'color:#e07b3c;font-family:monospace');
            const t0 = performance.now();
            try {
                const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
                const dur = (performance.now() - t0).toFixed(1);
                const headers = {};
                res.headers.forEach((v, k) => { headers[k] = v; });
                console.log(`%c  ${res.status} in ${dur}ms`, res.ok ? 'color:#059669' : 'color:#dc2626');
                console.log('%c  Headers:', 'color:#7a6b5d', headers);
                return { status: res.status, dur, headers };
            } catch (e) {
                const dur = (performance.now() - t0).toFixed(1);
                console.log(`%c  ✗ FAILED in ${dur}ms: ${e.message}`, 'color:#dc2626');
                return { error: e.message, dur };
            }
        },

        /**
         * dump() — return raw log array
         */
        dump() { return [..._log]; },

        /**
         * clear() — reset log
         */
        clear() { _log = []; console.log(`${R} Warren cleared.`); return this; },

        get active() { return _active; },
        get log()    { return _log; },
    };

    // ── Bootstrap ──────────────────────────────────────────────────────────
    // Always instrument network (silent unless activated)
    wrapFetch();
    wrapXHR();
    watchScriptErrors();
    watchTheme();
    watchPerf();

    // Auto-activate if URL param or localStorage flag is set
    if (isActive()) {
        WhiteRabbit.activate();
    }

    // Expose globally
    global.WhiteRabbit = WhiteRabbit;
    // Shorthand alias
    global['🐰'] = WhiteRabbit;

    // Console hint — visible once per session, tells developers where the rabbit is
    try {
        if (!sessionStorage.getItem('wr-hint-shown')) {
            sessionStorage.setItem('wr-hint-shown', '1');
            console.log(
                `%c🐰 White Rabbit is watching.%c  Type %cWhiteRabbit.activate()%c or %c🐰.sniff()%c to follow the hole.`,
                'color:#e07b3c;font-weight:bold;font-family:monospace;font-size:12px',
                'color:#7a6b5d;font-family:monospace;font-size:11px',
                'color:#0d9488;font-family:monospace;font-size:11px',
                'color:#7a6b5d;font-family:monospace;font-size:11px',
                'color:#0d9488;font-family:monospace;font-size:11px',
                'color:#7a6b5d;font-family:monospace;font-size:11px'
            );
        }
    } catch { /* private browsing */ }

}(window));
