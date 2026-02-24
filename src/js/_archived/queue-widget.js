/**
 * FogSift Queue Widget
 * - Shows next available date estimate
 * - Floating conversion nudge
 * - Subtle urgency elements
 */

const QueueWidget = {
  queueData: null,
  SLOTS_PER_DAY: 2,
  WORK_DAYS: [1, 2, 3, 4, 5], // Monday-Friday
  
  _safeSessionGet(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (_e) {
      return null;
    }
  },
  
  _safeSessionSet(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (_e) { /* storage unavailable */ }
  },
  
  async init() {
    try {
      const response = await fetch('/content/queue.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.queueData = await response.json();
      this.renderFloatingWidget();
      this.updateEstimates();
    } catch (_e) {
      console.log('Queue widget: Could not load queue data');
    }
  },
  
  // Calculate next available work date
  getNextAvailableDate() {
    if (!this.queueData) return null;
    
    const queueLength = this.queueData.queue.length;
    const slotsNeeded = queueLength + 1; // +1 for new submission
    const daysNeeded = Math.ceil(slotsNeeded / this.SLOTS_PER_DAY);
    
    let date = new Date();
    let workDaysAdded = 0;
    
    while (workDaysAdded < daysNeeded) {
      date.setDate(date.getDate() + 1);
      if (this.WORK_DAYS.includes(date.getDay())) {
        workDaysAdded++;
      }
    }
    
    return date;
  },
  
  // Get slots remaining this week
  getSlotsRemainingThisWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    
    // Days remaining in work week (Mon-Fri)
    let workDaysRemaining = 0;
    for (let d = dayOfWeek; d <= 5; d++) {
      if (this.WORK_DAYS.includes(d)) workDaysRemaining++;
    }
    
    // If it's weekend, count all of next week
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      workDaysRemaining = 5;
    }
    
    const totalSlots = workDaysRemaining * this.SLOTS_PER_DAY;
    const queueLength = this.queueData?.queue?.length || 0;
    
    return Math.max(0, totalSlots - queueLength);
  },
  
  // Format date nicely
  formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },
  
  // Render the floating widget
  renderFloatingWidget() {
    if (!this.queueData) return;
    
    const queueLength = this.queueData?.queue?.length || 0;
    const nextDate = this.getNextAvailableDate();
    const slotsRemaining = this.getSlotsRemainingThisWeek();
    
    // Don't show if mock data
    if (this.queueData?.meta?.is_mock_data) {
      // Still show but with different messaging
    }
    
    const widget = document.createElement('div');
    widget.id = 'queue-widget';
    widget.innerHTML = `
      <button class="queue-widget-close" onclick="QueueWidget.dismiss()" aria-label="Close">&times;</button>
      <div class="queue-widget-inner">
        <div class="queue-widget-content">
          <div class="queue-widget-stat">
            <span class="queue-widget-number">${queueLength}</span>
            <span class="queue-widget-label">in queue</span>
          </div>
          <div class="queue-widget-divider"></div>
          <div class="queue-widget-estimate">
            <span class="queue-widget-date">${nextDate ? this.formatDate(nextDate) : 'This week'}</span>
            <span class="queue-widget-sublabel">est. next slot</span>
          </div>
        </div>
        <a href="https://ko-fi.com/fogsift" class="queue-widget-cta" target="_blank" rel="noopener">
          Join Queue
        </a>
        ${slotsRemaining <= 4 ? `<div class="queue-widget-urgency">${slotsRemaining} slots left this week</div>` : ''}
      </div>
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #queue-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: var(--font-body, system-ui, sans-serif);
        animation: slideUp 0.5s ease-out;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .queue-widget-inner {
        background: var(--cream, #f5f0e6);
        border: 2px solid var(--accent, #e07b3c);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15);
        min-width: 200px;
        position: relative;
      }
      
      .queue-widget-close {
        position: absolute;
        top: -10px;
        right: -10px;
        background: var(--cream, #f5f0e6);
        border: 2px solid var(--accent, #e07b3c);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        font-size: 16px;
        cursor: pointer;
        color: var(--muted, #666);
        padding: 0;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.2s;
        z-index: 1;
      }
      .queue-widget-close:hover {
        color: var(--text, #333);
        background: var(--accent, #e07b3c);
        color: white;
      }
      
      .queue-widget-content {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .queue-widget-stat {
        text-align: center;
      }
      
      .queue-widget-number {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: var(--accent, #e07b3c);
        line-height: 1;
      }
      
      .queue-widget-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted, #666);
      }
      
      .queue-widget-divider {
        width: 1px;
        height: 40px;
        background: var(--border, #ddd);
      }
      
      .queue-widget-estimate {
        text-align: center;
        flex: 1;
      }
      
      .queue-widget-date {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--text, #333);
      }
      
      .queue-widget-sublabel {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted, #666);
      }
      
      .queue-widget-cta {
        display: block;
        background: var(--accent, #e07b3c);
        color: white;
        text-align: center;
        padding: 10px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .queue-widget-cta:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(224, 123, 60, 0.3);
      }
      
      .queue-widget-urgency {
        margin-top: 8px;
        text-align: center;
        font-size: 11px;
        color: #dc2626;
        font-weight: 500;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      /* Mobile: Hide widget - CTAs already prominent on page */
      @media (max-width: 600px) {
        #queue-widget {
          display: none;
        }
      }
      
      #queue-widget.dismissed {
        display: none;
      }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(widget);
    
    // Auto-dismiss after 30 seconds if not interacted with
    setTimeout(() => {
      if (!this._safeSessionGet('queue-widget-interacted')) {
        // Don't auto-dismiss, just leave it
      }
    }, 30000);
  },
  
  dismiss() {
    const widget = document.getElementById('queue-widget');
    if (widget) {
      widget.classList.add('dismissed');
      this._safeSessionSet('queue-widget-dismissed', 'true');
    }
  },
  
  // Update any estimate displays on the page
  updateEstimates() {
    const nextDate = this.getNextAvailableDate();
    const slotsRemaining = this.getSlotsRemainingThisWeek();
    
    // Update any elements with these classes
    document.querySelectorAll('.js-next-available-date').forEach(el => {
      el.textContent = nextDate ? this.formatDate(nextDate) : 'This week';
    });
    
    document.querySelectorAll('.js-slots-remaining').forEach(el => {
      el.textContent = slotsRemaining;
    });
    
    document.querySelectorAll('.js-queue-length').forEach(el => {
      el.textContent = this.queueData?.queue?.length || 0;
    });
  }
};

// Don't show on:
// - Home page (CTAs already prominent there)
// - Queue page (already has the info)
// - Mobile devices (< 600px) - CTAs are prominent enough
// - If already dismissed this session
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isHomePage = path === '/' || path === '/index.html' || path.endsWith('/index.html');
  const isQueuePage = path.includes('queue');
  const isDismissed = QueueWidget._safeSessionGet('queue-widget-dismissed');
  const isMobile = window.innerWidth < 600;
  
  if (!isHomePage && !isQueuePage && !isDismissed && !isMobile) {
    QueueWidget.init();
  }
});
