/**
 * Browser-sync configuration
 * Local dev doesn't need CSP - Cloudflare serves it via _headers in production
 */
module.exports = {
    server: {
        baseDir: 'dist'
    },
    port: 5050,
    open: false,
    files: ['dist/**/*']
};
