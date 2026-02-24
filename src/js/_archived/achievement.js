/**
 * Xbox 360-style Achievement Unlocked notification
 * Usage: Achievement.unlock("Achievement Name", 50, "Description")
 * Or just: Achievement.unlock("First Sale!")
 */

const Achievement = {
    // Xbox 360 achievement sound (base64 encoded short beep)
    soundUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkZeLgHRtbnuHj5KQiH91cHN+h4+QjoV8dXV4gYiNjouEfHd2eYGHi42LhX55eHmAhYmLioaDfnp5eoGFiImIhYJ+enp7gIWHiIeFgn98e3t/goWGhoSCf3x7e36Bg4SFhIKAfXx7fX+BgoODgoB+fHt8fX+AgoKCgX9+fHt8fX5/gIGBgH9+fXx8fH1+f4CAgH9+fXx8fH1+fn9/f39+fXx8fH1+fn5/f39+fX18fHx9fn5+f39/fn19fHx8fX19fn5+fn5+fX19fHx9fX19fn5+fn59fX19fX19fX19fX19fX19fX19fX19fX19fX19',
    
    // Create and show achievement
    unlock(title = "Achievement Unlocked", gamerscore = 50, description = "") {
        // Remove any existing achievement
        const existing = document.getElementById('xbox-achievement');
        if (existing) existing.remove();
        
        // Create container
        const achievement = document.createElement('div');
        achievement.id = 'xbox-achievement';
        achievement.innerHTML = `
            <div class="achievement-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <div class="achievement-content">
                <div class="achievement-header">
                    <span class="achievement-label">Achievement Unlocked</span>
                    <span class="achievement-score">${gamerscore}G</span>
                </div>
                <div class="achievement-title">${title}</div>
                ${description ? `<div class="achievement-desc">${description}</div>` : ''}
            </div>
        `;
        
        // Inject styles if not present
        if (!document.getElementById('xbox-achievement-styles')) {
            const styles = document.createElement('style');
            styles.id = 'xbox-achievement-styles';
            styles.textContent = `
                #xbox-achievement {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%) translateY(150px);
                    background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%);
                    border: 2px solid #4a4a4a;
                    border-radius: 8px;
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
                    z-index: 999999;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    animation: achievementSlideIn 0.5s ease-out forwards;
                    min-width: 320px;
                    max-width: 450px;
                }
                
                #xbox-achievement.hiding {
                    animation: achievementSlideOut 0.4s ease-in forwards;
                }
                
                @keyframes achievementSlideIn {
                    0% { transform: translateX(-50%) translateY(150px); opacity: 0; }
                    100% { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                
                @keyframes achievementSlideOut {
                    0% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(150px); opacity: 0; }
                }
                
                .achievement-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #107c10 0%, #0e6b0e 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(16,124,16,0.4);
                }
                
                .achievement-icon svg {
                    width: 28px;
                    height: 28px;
                }
                
                .achievement-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .achievement-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                
                .achievement-label {
                    color: #107c10;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .achievement-score {
                    color: #888;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .achievement-title {
                    color: #fff;
                    font-size: 16px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .achievement-desc {
                    color: #999;
                    font-size: 12px;
                    margin-top: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                @media (max-width: 480px) {
                    #xbox-achievement {
                        left: 10px;
                        right: 10px;
                        transform: translateX(0) translateY(150px);
                        min-width: auto;
                    }
                    @keyframes achievementSlideIn {
                        0% { transform: translateX(0) translateY(150px); opacity: 0; }
                        100% { transform: translateX(0) translateY(0); opacity: 1; }
                    }
                    @keyframes achievementSlideOut {
                        0% { transform: translateX(0) translateY(0); opacity: 1; }
                        100% { transform: translateX(0) translateY(150px); opacity: 0; }
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(achievement);
        
        // Play sound
        try {
            const audio = new Audio(this.soundUrl);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore autoplay restrictions
        } catch (_e) { /* audio not available */ }
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            achievement.classList.add('hiding');
            setTimeout(() => achievement.remove(), 400);
        }, 4000);
        
        return achievement;
    },
    
    // Quick presets
    firstSale: () => Achievement.unlock("First Sale!", 100, "Someone paid real money for your work"),
    shipped: () => Achievement.unlock("Shipped It!", 50, "Deployed to production"),
    bugSquashed: () => Achievement.unlock("Bug Squashed", 25, "Fixed a nasty bug"),
    allGreen: () => Achievement.unlock("All Green", 25, "All tests passing"),
    midnight: () => Achievement.unlock("Night Owl", 10, "Coding past midnight"),
    streak: (days) => Achievement.unlock(`${days} Day Streak`, days * 5, "Consecutive days of commits"),
};

// Expose globally
window.Achievement = Achievement;

// Console helper
console.log('%c🏆 Achievement system loaded! Try: Achievement.unlock("Your Title", 50, "Description")', 
    'color: #107c10; font-weight: bold;');
