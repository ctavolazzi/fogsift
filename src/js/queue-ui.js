/**
 * Queue UI - Displays and manages the live queue on queue.html
 * Uses hardcoded sample data as fallback when API is unavailable
 */

const QueueUI = {
    data: [],
    currentFilter: 'all',
    lastUpdated: null,
    apiUrl: '/api/queue',
    fallbackApiUrl: 'https://fogsift.com/api/queue',

    // Hardcoded sample queue data - always available
    sampleData: [
        {
            id: 'sample-001',
            from_name: 'Alex M.',
            message: 'My Raspberry Pi project keeps crashing after ~2 hours of runtime. I\'ve checked the power supply and it seems fine. Running a Python script that reads sensor data.',
            status: 'completed',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample-002',
            from_name: 'Jamie L.',
            message: 'Need help understanding why my team\'s velocity keeps dropping despite adding more developers. We\'re using Scrum but something feels off.',
            status: 'in_progress',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample-003',
            from_name: 'Sam K.',
            message: 'Looking for advice on structuring a home automation system. Want to integrate smart lights, thermostats, and security cameras without vendor lock-in.',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample-004',
            from_name: 'Morgan T.',
            message: 'Our small business database is getting slow. Around 50,000 customer records. Should we optimize or migrate to something else?',
            status: 'pending',
            amount: '20.00',
            currency: 'USD',
            tier_name: 'Queue Response',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
    ],

    async init() {
        await this.refresh();
        // Auto-refresh every 60 seconds
        setInterval(() => this.refresh(), 60000);
    },

    async refresh() {
        try {
            // Try local API first
            let response = await fetch(this.apiUrl);

            // If local fails, try production API
            if (!response.ok && this.apiUrl !== this.fallbackApiUrl) {
                console.log('Local API unavailable, trying production...');
                response = await fetch(this.fallbackApiUrl);
            }

            if (response.ok) {
                const result = await response.json();
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

        // Fallback to hardcoded sample data
        this.data = this.sampleData;
        this.lastUpdated = new Date();
        this.updateStats();
        this.render();
        console.log('Queue loaded from sample data');
    },

    updateStats() {
        const pending = this.data.filter(i => i.status === 'pending').length;
        const inProgress = this.data.filter(i => i.status === 'in_progress').length;
        const completed = this.data.filter(i => i.status === 'completed').length;

        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-in-progress').textContent = inProgress;
        document.getElementById('stat-completed').textContent = completed;
    },

    filter(status) {
        this.currentFilter = status;

        // Update tab UI
        document.querySelectorAll('.queue-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === status);
        });

        this.render();
    },

    render() {
        const listEl = document.getElementById('queue-list');
        const filtered = this.currentFilter === 'all'
            ? this.data
            : this.data.filter(i => i.status === this.currentFilter);

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div class="queue-empty">
                    <p>No items in queue${this.currentFilter !== 'all' ? ' with this status' : ''}.</p>
                    <p><a href="https://ko-fi.com/fogsift" target="_blank" rel="noopener">Be the first to join!</a></p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = filtered.map(item => this.renderItem(item)).join('');

        // Update timestamp
        if (this.lastUpdated) {
            const ago = this.timeAgo(this.lastUpdated);
            document.getElementById('queue-updated').textContent = ago;
        }
    },

    renderItem(item) {
        const statusLabels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed'
        };

        const timeAgo = this.timeAgo(new Date(item.created_at));
        const message = item.message
            ? (item.message.length > 200 ? item.message.slice(0, 200) + '...' : item.message)
            : '<em>No message provided</em>';

        return `
            <article class="queue-item">
                <div class="queue-item-header">
                    <span class="queue-item-name">${this.escapeHtml(item.from_name)}</span>
                    <span class="queue-item-status ${item.status}">${statusLabels[item.status] || item.status}</span>
                </div>
                <p class="queue-item-message">${this.escapeHtml(message)}</p>
                <div class="queue-item-meta">
                    <span>${timeAgo}</span>
                    <span>${item.amount} ${item.currency}</span>
                    ${item.tier_name ? `<span>${item.tier_name}</span>` : ''}
                </div>
            </article>
        `;
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QueueUI.init());
} else {
    QueueUI.init();
}
