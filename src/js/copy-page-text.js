/* ============================================
   FOGSIFT COPY PAGE TEXT MODULE
   Extract and copy page text content to clipboard
   ============================================ */

const CopyPageText = {
    /**
     * Extract text from main content area, excluding navigation and footer elements
     * @returns {string} Extracted and cleaned text content
     */
    extractText() {
        // Find main content container
        const mainContent = document.querySelector('main#main-content') ||
                           document.querySelector('.wiki-main') ||
                           document.querySelector('.wiki-index-layout') ||
                           document.querySelector('main');

        if (!mainContent) {
            return '';
        }

        // Clone to avoid modifying DOM
        const clone = mainContent.cloneNode(true);

        // Remove excluded elements from clone
        const excludeSelectors = [
            '.nav-wrapper',
            'footer[role="contentinfo"]',
            '.wiki-footer',
            '.wiki-index-footer',
            '.skip-link',
            '.mobile-drawer',
            '.wiki-sidebar',
            '[aria-hidden="true"]'
        ];

        excludeSelectors.forEach(selector => {
            const elements = clone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Remove hidden elements
        const allElements = clone.querySelectorAll('*');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' ||
                style.visibility === 'hidden' ||
                el.hasAttribute('hidden')) {
                el.remove();
            }
        });

        // Extract text content
        let text = clone.textContent || clone.innerText || '';

        // Normalize whitespace
        text = text
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n\n')  // Normalize line breaks
            .trim();

        return text;
    },

    /**
     * Copy page text to clipboard
     */
    async copy() {
        try {
            const text = this.extractText();

            if (!text) {
                Toast.error('No text content found to copy');
                return;
            }

            await navigator.clipboard.writeText(text);
            Toast.show('Page text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy text:', err);
            Toast.error('Failed to copy text to clipboard');
        }
    }
};

// Explicit global export for consistency with other modules
window.CopyPageText = CopyPageText;

