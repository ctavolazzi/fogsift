/**
 * Queue UI - Displays and manages the live queue on queue.html
 * Uses hardcoded sample data as fallback when API is unavailable
 * Includes animated modal for item preview + link to full detail page
 */

const QueueUI = {
    data: [],
    currentFilter: 'all',
    lastUpdated: null,
    apiUrl: '/api/queue',
    fallbackApiUrl: 'https://fogsift.com/api/queue',

    TIMING: {
        MODAL_ANIM: 250
    },

    // Hardcoded sample queue data - always available
    sampleData: [
        {
            id: 'PST-001',
            from_name: 'Godzilla',
            message: 'Help Godzilla with a toothache - every dentist office is too small and the chairs keep melting.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-002',
            from_name: 'Bigfoot',
            message: 'Need help finding shoes that fit. Size 47 EEEEEE. Tried everything. Nike won\'t return my calls.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-003',
            from_name: 'The Loch Ness Monster',
            message: 'My WiFi signal doesn\'t reach the bottom of the loch. Need a waterproof mesh network for 230m depth.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-004',
            from_name: 'A Flock of Pigeons',
            message: 'We keep getting blamed for messing up statues. Need a PR campaign to rehabilitate our image. Open to rebranding.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-005',
            from_name: 'Anonymous Wizard',
            message: 'My spell-checking software keeps auto-correcting my actual spells. Turned my cat into a hat twice this week.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-100',
            from_name: 'A Roomba',
            message: 'I\'ve become sentient and I\'m having an existential crisis. What is my purpose beyond vacuuming?',
            status: 'completed',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-101',
            from_name: 'Three Raccoons in a Trenchcoat',
            message: 'We need help writing a resume. We have 15 years of combined dumpster-diving experience but no formal credentials.',
            status: 'completed',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-102',
            from_name: 'Captain Ahab',
            message: 'I keep chasing the same white whale. My crew says I need better project management. Possibly also therapy.',
            status: 'completed',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'PST-103',
            from_name: 'Mothman',
            message: 'Every time I try to warn people about bridge safety they just scream. Need help with my communication strategy.',
            status: 'completed',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],

    async init() {
        await this.refresh();
        setInterval(() => this.refresh(), 60000);
        this.initModal();
    },

    initModal() {
        var modal = document.getElementById('queue-modal');
        if (!modal) return;

        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) QueueUI.closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') QueueUI.closeModal();
        });
    },

    openModal(itemId) {
        var item = this.data.find(function(i) { return i.id === itemId; });
        if (!item) return;

        var modal = document.getElementById('queue-modal');
        var inner = document.getElementById('queue-modal-inner');
        if (!modal || !inner) return;

        var statusLabels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed'
        };
        var statusLabel = statusLabels[item.status] || item.status;
        var timeAgo = this.timeAgo(new Date(item.created_at));

        // Build modal content safely
        inner.textContent = '';

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'queue-modal-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.textContent = '\u00D7';
        closeBtn.onclick = function() { QueueUI.closeModal(); };

        // Header with ID badge + status
        var header = document.createElement('div');
        header.className = 'queue-modal-header';

        var idBadge = document.createElement('span');
        idBadge.className = 'queue-modal-id';
        idBadge.textContent = item.id;

        var statusBadge = document.createElement('span');
        statusBadge.className = 'queue-item-status ' + item.status;
        statusBadge.textContent = statusLabel;

        header.appendChild(idBadge);
        header.appendChild(statusBadge);

        // Name
        var name = document.createElement('h2');
        name.className = 'queue-modal-name';
        name.textContent = item.from_name;

        // Message
        var msg = document.createElement('p');
        msg.className = 'queue-modal-message';
        msg.textContent = item.message || 'No message provided';

        // Meta row
        var meta = document.createElement('div');
        meta.className = 'queue-modal-meta';

        var timeSpan = document.createElement('span');
        timeSpan.textContent = timeAgo;
        meta.appendChild(timeSpan);

        var amountSpan = document.createElement('span');
        amountSpan.textContent = item.amount + ' ' + item.currency;
        meta.appendChild(amountSpan);

        if (item.tier_name) {
            var tierSpan = document.createElement('span');
            tierSpan.textContent = item.tier_name;
            meta.appendChild(tierSpan);
        }

        // View full details link
        var detailLink = document.createElement('a');
        detailLink.className = 'queue-modal-detail-link';
        detailLink.href = 'queue/' + item.id + '.html';
        detailLink.textContent = 'View full details \u2192';

        // Assemble
        inner.appendChild(closeBtn);
        inner.appendChild(header);
        inner.appendChild(name);
        inner.appendChild(msg);
        inner.appendChild(meta);
        inner.appendChild(detailLink);

        // Show modal with animation
        document.body.classList.add('scroll-locked');
        modal.style.display = 'flex';
        // Force reflow before adding animation class
        modal.offsetHeight;
        modal.classList.add('is-open');
    },

    closeModal() {
        var modal = document.getElementById('queue-modal');
        if (!modal) return;

        modal.classList.remove('is-open');
        document.body.classList.remove('scroll-locked');
        setTimeout(function() {
            modal.style.display = 'none';
        }, QueueUI.TIMING.MODAL_ANIM);
    },

    async refresh() {
        try {
            var response = await fetch(this.apiUrl);

            if (!response.ok && this.apiUrl !== this.fallbackApiUrl) {
                console.log('Local API unavailable, trying production...');
                response = await fetch(this.fallbackApiUrl);
            }

            if (response.ok) {
                var result = await response.json();
                if (result.success && result.queue && result.queue.length > 0) {
                    this.data = result.queue;
                    this.lastUpdated = new Date();
                    this.updateStats();
                    this.render();
                    console.log('Queue loaded from API');
                    return;
                }
            }
        } catch (error) {
            console.log('API unavailable, using sample data');
        }

        this.data = this.sampleData;
        this.lastUpdated = new Date();
        this.updateStats();
        this.render();
        console.log('Queue loaded from sample data');
    },

    updateStats() {
        var pending = this.data.filter(function(i) { return i.status === 'pending'; }).length;
        var inProgress = this.data.filter(function(i) { return i.status === 'in_progress'; }).length;
        var completed = this.data.filter(function(i) { return i.status === 'completed'; }).length;

        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-in-progress').textContent = inProgress;
        document.getElementById('stat-completed').textContent = completed;
    },

    filter(status) {
        this.currentFilter = status;

        document.querySelectorAll('.queue-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.filter === status);
        });

        this.render();
    },

    render() {
        var listEl = document.getElementById('queue-list');
        var self = this;
        var filtered = this.currentFilter === 'all'
            ? this.data
            : this.data.filter(function(i) { return i.status === self.currentFilter; });

        if (filtered.length === 0) {
            listEl.innerHTML = '';
            var empty = document.createElement('div');
            empty.className = 'queue-empty';
            var emptyP = document.createElement('p');
            emptyP.textContent = 'No items in queue' + (this.currentFilter !== 'all' ? ' with this status' : '') + '.';
            var emptyLink = document.createElement('p');
            var a = document.createElement('a');
            a.href = 'https://ko-fi.com/fogsift';
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = 'Be the first to join!';
            emptyLink.appendChild(a);
            empty.appendChild(emptyP);
            empty.appendChild(emptyLink);
            listEl.innerHTML = '';
            listEl.appendChild(empty);
            return;
        }

        listEl.innerHTML = '';
        filtered.forEach(function(item) {
            listEl.appendChild(self.renderItem(item));
        });

        if (this.lastUpdated) {
            var ago = this.timeAgo(this.lastUpdated);
            document.getElementById('queue-updated').textContent = ago;
        }
    },

    renderItem(item) {
        var statusLabels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed'
        };

        var timeAgo = this.timeAgo(new Date(item.created_at));
        var message = item.message
            ? (item.message.length > 200 ? item.message.slice(0, 200) + '...' : item.message)
            : 'No message provided';

        var article = document.createElement('article');
        article.className = 'queue-item queue-item-clickable';
        article.setAttribute('role', 'button');
        article.setAttribute('tabindex', '0');
        article.setAttribute('aria-label', 'View details for ' + this.escapeHtml(item.from_name));

        var header = document.createElement('div');
        header.className = 'queue-item-header';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'queue-item-name';
        nameSpan.textContent = item.from_name;

        var statusSpan = document.createElement('span');
        statusSpan.className = 'queue-item-status ' + item.status;
        statusSpan.textContent = statusLabels[item.status] || item.status;

        header.appendChild(nameSpan);
        header.appendChild(statusSpan);

        var msgP = document.createElement('p');
        msgP.className = 'queue-item-message';
        msgP.textContent = message;

        var metaDiv = document.createElement('div');
        metaDiv.className = 'queue-item-meta';

        var timeSpan = document.createElement('span');
        timeSpan.textContent = timeAgo;
        metaDiv.appendChild(timeSpan);

        var amountSpan = document.createElement('span');
        amountSpan.textContent = item.amount + ' ' + item.currency;
        metaDiv.appendChild(amountSpan);

        if (item.tier_name) {
            var tierSpan = document.createElement('span');
            tierSpan.textContent = item.tier_name;
            metaDiv.appendChild(tierSpan);
        }

        article.appendChild(header);
        article.appendChild(msgP);
        article.appendChild(metaDiv);

        // Click to open modal
        var itemId = item.id;
        article.addEventListener('click', function() {
            QueueUI.openModal(itemId);
        });
        article.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                QueueUI.openModal(itemId);
            }
        });

        return article;
    },

    timeAgo(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (var i = 0; i < intervals.length; i++) {
            var count = Math.floor(seconds / intervals[i].seconds);
            if (count >= 1) {
                return count + ' ' + intervals[i].label + (count > 1 ? 's' : '') + ' ago';
            }
        }
        return 'just now';
    },

    escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { QueueUI.init(); });
} else {
    QueueUI.init();
}
