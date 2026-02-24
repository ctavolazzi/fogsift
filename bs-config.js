/**
 * Browser-sync configuration
 * Local dev doesn't need CSP - Cloudflare serves it via _headers in production
 */
module.exports = {
    server: {
        baseDir: 'dist',
        serveStaticOptions: {
            extensions: ['html']  // serve /wiki/foo as /wiki/foo.html (matches Cloudflare behavior)
        }
    },
    port: 5050,
    open: false,
    files: ['dist/**/*']
};
