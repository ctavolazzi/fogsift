/**
 * Browser-sync configuration
 * Adds security headers that match _headers for local development
 */
module.exports = {
    server: {
        baseDir: 'dist',
        middleware: [
            function(req, res, next) {
                // Add CSP header matching _headers for Cloudflare
                res.setHeader('Content-Security-Policy',
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: https://images.pexels.com https://solarpunkstation.com; " +
                    "connect-src 'self' https://cloudflareinsights.com; " +
                    "frame-ancestors 'none'; " +
                    "base-uri 'self'; " +
                    "form-action 'self'"
                );
                next();
            }
        ]
    },
    port: 5050,
    open: false,
    files: ['dist/**/*']
};
