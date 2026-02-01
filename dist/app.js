const Toast={containerId:"toast-container",TIMING:{DEFAULT_DURATION:2500,ERROR_DURATION:5e3,FADE_DURATION:200,COPY_FEEDBACK:1e3},getContainer(){let e=document.getElementById(this.containerId);return e||(e=document.createElement("div"),e.id=this.containerId,e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),document.body.appendChild(e)),e},show(e,t=this.TIMING.DEFAULT_DURATION){this._create(e,"success",t)},error(e,t=this.TIMING.ERROR_DURATION){this._create(e,"error",t,!0)},info(e,t=this.TIMING.DEFAULT_DURATION){this._create(e,"info",t)},_create(e,t="success",i,n=!1){const s=this.getContainer(),o=document.createElement("div");o.className=`toast toast--${t}`;const a=document.createElement("span");if(a.className="toast__message",a.innerText=e,o.appendChild(a),n){const r=document.createElement("button");r.className="toast__copy",r.innerHTML="[COPY]",r.title="Copy error to clipboard",r.onclick=c=>{c.stopPropagation(),navigator.clipboard.writeText(e).then(()=>{r.innerHTML="[COPIED]",setTimeout(()=>r.innerHTML="[COPY]",this.TIMING.COPY_FEEDBACK)}).catch(()=>{r.innerHTML="[FAILED]",setTimeout(()=>r.innerHTML="[COPY]",this.TIMING.COPY_FEEDBACK)})},o.appendChild(r)}s.appendChild(o);const l=setTimeout(()=>{this._dismiss(o)},i);o.addEventListener("click",r=>{r.target.classList.contains("toast__copy")||(clearTimeout(l),this._dismiss(o))})},_dismiss(e){const t=this.TIMING.FADE_DURATION;e.style.animation=`slideOut ${t/1e3}s ease forwards`,setTimeout(()=>e.remove(),t)}};window.Toast=Toast;const CopyPageText={extractText(){const e=document.querySelector("main#main-content")||document.querySelector(".wiki-main")||document.querySelector(".wiki-index-layout")||document.querySelector("main");if(!e)return"";const t=e.cloneNode(!0);[".nav-wrapper",'footer[role="contentinfo"]',".wiki-footer",".wiki-index-footer",".skip-link",".mobile-drawer",".wiki-sidebar",'[aria-hidden="true"]'].forEach(o=>{t.querySelectorAll(o).forEach(l=>l.remove())}),t.querySelectorAll("*").forEach(o=>{const a=window.getComputedStyle(o);(a.display==="none"||a.visibility==="hidden"||o.hasAttribute("hidden"))&&o.remove()});let s=t.textContent||t.innerText||"";return s=s.replace(/\s+/g," ").replace(/\n\s*\n/g,`

`).trim(),s},async copy(){const e=typeof Toast<"u"&&Toast.show&&Toast.error;try{const t=this.extractText();if(!t){e?Toast.error("No text content found to copy"):console.warn("No text content found to copy");return}await navigator.clipboard.writeText(t),e&&Toast.show("Page text copied to clipboard")}catch(t){console.error("Failed to copy text:",t),e&&Toast.error("Failed to copy text to clipboard")}}};window.CopyPageText=CopyPageText;const Theme={STORAGE_KEY:"theme",SCROLL_KEY:"theme-scroll-position",EVENT_NAME:"themechange",THEMES:["light","dark","industrial-punchcard","matrix","sky","synthwave","pipboy","rivendell","camo","barbie","ocean"],THEME_LABELS:{light:"Light",dark:"Dark","industrial-punchcard":"Industrial",matrix:"Matrix",sky:"Sky",synthwave:"Synthwave",pipboy:"Pip-Boy",rivendell:"Rivendell",camo:"Camo",barbie:"Barbie",ocean:"Ocean",demo:"Demo"},_initialized:!1,_observer:null,_demoInterval:null,_demoActive:!1,init(){if(this._initialized)return;this._initialized=!0;const e="light";try{localStorage.setItem(this.STORAGE_KEY,e)}catch{}this._applyTheme(e),this._hydrateDropdowns(),this._setupStorageListener(),this._setupMutationObserver(),this._setupThemeListener(),this._setupKeyboardShortcut(),this._setupSystemThemeListener()},get(){return document.documentElement.getAttribute("data-theme")||"light"},set(e,t={}){const{notify:i=!0,broadcast:n=!0,preserveScroll:s=!0,fromDemo:o=!1}=t;if(e==="demo"){this.startDemo();return}this._demoActive&&!o&&this.stopDemo(),this.THEMES.includes(e)||(console.warn(`Theme: Invalid theme "${e}", falling back to light`),e="light");const a=this.get();if(a!==e){if(s&&this._saveScrollPosition(),this._applyTheme(e),s&&requestAnimationFrame(()=>{this._restoreScrollPosition()}),!this._demoActive)try{localStorage.setItem(this.STORAGE_KEY,e)}catch(l){console.warn("Theme: Could not persist preference:",l.message)}if(n&&this._dispatchChange(e,a),i&&typeof Toast<"u"){const l=this._demoActive?`DEMO: ${this.THEME_LABELS[e].toUpperCase()}`:`VISUAL MODE: ${this.THEME_LABELS[e].toUpperCase()}`;Toast.show(l)}}},DEMO_INTERVAL:4e3,_demoCountdown:0,_demoCountdownInterval:null,startDemo(){this._demoActive||(this._demoActive=!0,this._demoOriginalTheme=this.get(),this._demoIndex=0,typeof Toast<"u"&&Toast.show("\u{1F3AC} DEMO MODE: Press T to exit"),this._createCountdownDisplay(),this._demoTick(),this._demoInterval=setInterval(()=>this._demoTick(),this.DEMO_INTERVAL),this._demoCountdown=Math.floor(this.DEMO_INTERVAL/1e3),this._updateCountdownDisplay(),this._demoCountdownInterval=setInterval(()=>{this._demoCountdown--,this._demoCountdown<=0&&(this._demoCountdown=Math.floor(this.DEMO_INTERVAL/1e3)),this._updateCountdownDisplay()},1e3))},stopDemo(){this._demoActive&&(this._demoActive=!1,document.documentElement.classList.remove("demo-channel-switch"),this._demoInterval&&(clearInterval(this._demoInterval),this._demoInterval=null),this._demoCountdownInterval&&(clearInterval(this._demoCountdownInterval),this._demoCountdownInterval=null),this._removeCountdownDisplay(),this._demoOriginalTheme&&this.THEMES.includes(this._demoOriginalTheme)&&this.set(this._demoOriginalTheme,{notify:!0}),typeof Toast<"u"&&Toast.show("Demo ended"))},_demoTick(){const e=this.THEMES[this._demoIndex];document.documentElement.classList.add("theme-transitioning"),document.documentElement.classList.add("demo-channel-switch"),setTimeout(()=>{this.set(e,{notify:!0,preserveScroll:!0,fromDemo:!0})},100),setTimeout(()=>{document.documentElement.classList.remove("demo-channel-switch"),document.documentElement.classList.remove("theme-transitioning")},350),this._demoIndex=(this._demoIndex+1)%this.THEMES.length},isDemoActive(){return this._demoActive},_createCountdownDisplay(){this._removeCountdownDisplay();const e=document.createElement("div");e.id="demo-countdown",e.setAttribute("role","timer"),e.setAttribute("aria-live","off"),document.body.appendChild(e)},_updateCountdownDisplay(){const e=document.getElementById("demo-countdown");if(!e)return;const t=this.THEME_LABELS[this.get()]||this.get(),i=this._demoIndex,n=this.THEME_LABELS[this.THEMES[i]]||this.THEMES[i],s=(Math.floor(this.DEMO_INTERVAL/1e3)-this._demoCountdown)/Math.floor(this.DEMO_INTERVAL/1e3)*100;e.innerHTML=`
            <div class="demo-countdown-content">
                <span class="demo-countdown-label">DEMO</span>
                <span class="demo-countdown-theme">${t}</span>
                <div class="demo-countdown-bar">
                    <div class="demo-countdown-progress" style="width: ${s}%"></div>
                </div>
                <span class="demo-countdown-next">Next: ${n} in ${this._demoCountdown}s</span>
            </div>
        `},_removeCountdownDisplay(){const e=document.getElementById("demo-countdown");e&&e.remove()},cycle(){const e=this.get(),t=this.THEMES.indexOf(e),i=this.THEMES[(t+1)%this.THEMES.length];this.set(i)},toggle(){this.cycle()},onChange(e){this.set(e.target.value)},subscribe(e){const t=i=>e(i.detail.theme,i.detail.previousTheme);return window.addEventListener(this.EVENT_NAME,t),()=>window.removeEventListener(this.EVENT_NAME,t)},_applyTheme(e){document.documentElement.classList.add("theme-transitioning"),document.documentElement.setAttribute("data-theme",e),this._hydrateDropdowns(),setTimeout(()=>{document.documentElement.classList.remove("theme-transitioning")},300)},_saveScrollPosition(){try{const e={x:window.scrollX||window.pageXOffset,y:window.scrollY||window.pageYOffset,path:window.location.pathname};sessionStorage.setItem(this.SCROLL_KEY,JSON.stringify(e))}catch{}},_restoreScrollPosition(){try{const e=sessionStorage.getItem(this.SCROLL_KEY);if(!e)return;const t=JSON.parse(e);t.path===window.location.pathname&&window.scrollTo({top:t.y,left:t.x,behavior:"instant"})}catch{}},_hydrateDropdowns(){const e=this.get();document.querySelectorAll(".theme-dropdown").forEach(t=>{t.value!==e&&(t.value=e)})},_dispatchChange(e,t){const i=new CustomEvent(this.EVENT_NAME,{bubbles:!0,detail:{theme:e,previousTheme:t}});window.dispatchEvent(i)},_setupStorageListener(){window.addEventListener("storage",e=>{if(e.key===this.STORAGE_KEY&&e.newValue){const t=e.newValue;this.THEMES.includes(t)&&t!==this.get()&&(this._applyTheme(t),this._dispatchChange(t,this.get()))}})},_setupMutationObserver(){typeof MutationObserver>"u"||(this._observer=new MutationObserver(e=>{for(const t of e)for(const i of t.addedNodes)i.nodeType===Node.ELEMENT_NODE&&(i.classList?.contains("theme-dropdown")?i.value=this.get():i.querySelectorAll&&i.querySelectorAll(".theme-dropdown").forEach(n=>{n.value=this.get()}))}),this._observer.observe(document.body,{childList:!0,subtree:!0}))},_setupThemeListener(){window.addEventListener(this.EVENT_NAME,()=>{this._hydrateDropdowns()})},_detectSystemTheme(){return typeof window>"u"||!window.matchMedia?"light":window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"},_setupSystemThemeListener(){if(typeof window>"u"||!window.matchMedia)return;window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",t=>{try{localStorage.getItem(this.STORAGE_KEY)||this.set(t.matches?"dark":"light")}catch{this.set(t.matches?"dark":"light")}})},_setupKeyboardShortcut(){document.addEventListener("keydown",e=>{const t=e.target.tagName.toLowerCase();t==="input"||t==="textarea"||e.target.isContentEditable||e.ctrlKey||e.altKey||e.metaKey||((e.key==="t"||e.key==="T")&&(this._demoActive?this.stopDemo():this.cycle(),e.preventDefault()),(e.key==="d"||e.key==="D")&&(this._demoActive?this.stopDemo():this.startDemo(),e.preventDefault()))})},destroy(){this._observer&&(this._observer.disconnect(),this._observer=null),this._initialized=!1}},ThemePicker={_isOpen:!1,_picker:null,_toggle:null,_menu:null,init(){this._picker=document.querySelector(".theme-picker"),this._picker&&(this._toggle=this._picker.querySelector(".theme-picker-toggle"),this._menu=this._picker.querySelector(".theme-picker-menu"),this._updateSelection(),document.addEventListener("click",e=>{this._isOpen&&!this._picker.contains(e.target)&&this.close()}),this._picker.addEventListener("keydown",e=>this._handleKeydown(e)),Theme.subscribe(()=>this._updateSelection()))},toggle(){this._isOpen?this.close():this.open()},open(){if(!this._picker)return;this._isOpen=!0,this._picker.setAttribute("aria-expanded","true"),this._toggle.setAttribute("aria-expanded","true");const e=this._menu.querySelector(".theme-picker-option");e&&e.focus()},close(){this._picker&&(this._isOpen=!1,this._picker.setAttribute("aria-expanded","false"),this._toggle.setAttribute("aria-expanded","false"))},select(e){Theme.set(e),this.close(),this._toggle.focus()},_updateSelection(){if(!this._menu)return;const e=Theme.get();this._menu.querySelectorAll(".theme-picker-option").forEach(t=>{const i=t.dataset.theme===e;t.setAttribute("aria-selected",i?"true":"false")})},_handleKeydown(e){const t=Array.from(this._menu.querySelectorAll(".theme-picker-option")),i=t.findIndex(n=>n===document.activeElement);switch(e.key){case"Escape":this.close(),this._toggle.focus(),e.preventDefault();break;case"ArrowDown":if(!this._isOpen)this.open();else{const n=i<t.length-1?i+1:0;t[n].focus()}e.preventDefault();break;case"ArrowUp":if(this._isOpen){const n=i>0?i-1:t.length-1;t[n].focus()}e.preventDefault();break;case"Enter":case" ":this._isOpen&&document.activeElement.classList.contains("theme-picker-option")?this.select(document.activeElement.dataset.theme):this._isOpen||this.open(),e.preventDefault();break;case"Tab":this._isOpen&&this.close();break}}};typeof window<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Theme.init(),ThemePicker.init()}):(Theme.init(),ThemePicker.init()));const MatrixRain={canvas:null,ctx:null,animationId:null,columns:[],fontSize:14,_initialized:!1,_unsubscribe:null,chars:"\u30A1\u30AB\u30B5\u30BF\u30CA\u30CF\u30DE\u30E4\u30E9\u30EF\u30AC\u30B6\u30C0\u30D0\u30D1\u30A4\u30AD\u30B7\u30C1\u30CB\u30D2\u30DF\u30EA\u30AE\u30B8\u30D3\u30D4\u30A6\u30AF\u30B9\u30C4\u30CC\u30D5\u30E0\u30E6\u30EB\u30B0\u30BA\u30D7\u30A8\u30B1\u30BB\u30C6\u30CD\u30D8\u30E1\u30EC\u30B2\u30BC\u30D9\u30DA\u30AA\u30B3\u30BD\u30C8\u30CE\u30DB\u30E2\u30E8\u30ED\u30B4\u30BE\u30DC\u30DD0123456789",init(){this._initialized||(this._initialized=!0,typeof Theme<"u"&&(this._unsubscribe=Theme.subscribe((e,t)=>{e==="matrix"?this.start():t==="matrix"&&this.stop()}),Theme.get()==="matrix"&&this.start()))},start(){window.matchMedia("(prefers-reduced-motion: reduce)").matches||this.canvas||(this._createCanvas(),this._initColumns(),window.addEventListener("resize",this._boundResize=this._resize.bind(this)),this._loop())},stop(){this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null),this.canvas?.parentNode&&this.canvas.parentNode.removeChild(this.canvas),window.removeEventListener("resize",this._boundResize),this.canvas=null,this.ctx=null,this.columns=[]},_createCanvas(){this.canvas=document.createElement("canvas"),this.canvas.id="matrix-rain",this.canvas.setAttribute("aria-hidden","true");const e=this.canvas.style;e.cssText="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;",this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.ctx.fillStyle="#0D0208",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),document.body.insertBefore(this.canvas,document.body.firstChild)},_initColumns(){const e=Math.ceil(this.canvas.width/this.fontSize);this.columns=new Array(e);for(let t=0;t<e;t++)this.columns[t]={y:Math.random()*this.canvas.height*-.5,speed:4+Math.random()*8,nextChar:0}},_resize(){this.canvas&&(this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this._initColumns())},_loop(){this._draw(),this.animationId=requestAnimationFrame(()=>this._loop())},_draw(){const e=this.ctx,t=this.canvas.width,i=this.canvas.height,n=this.fontSize,s=this.chars,o=s.length;e.fillStyle="rgba(13, 2, 8, 0.05)",e.fillRect(0,0,t,i),e.font=n+"px monospace";for(let a=0,l=this.columns.length;a<l;a++){const r=this.columns[a],c=a*n,d=r.y;d>-n&&d<i+n&&(e.fillStyle="#FFF",e.fillText(s[r.nextChar++%o],c,d),d-n>0&&(e.fillStyle="#0F0",e.fillText(s[(r.nextChar+5)%o],c,d-n)),d-n*2>0&&(e.fillStyle="#090",e.fillText(s[(r.nextChar+10)%o],c,d-n*2))),r.y+=r.speed,r.y>i+n*3&&(r.y=Math.random()*-100,r.speed=4+Math.random()*8)}},destroy(){this.stop(),this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._initialized=!1}};typeof window<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>MatrixRain.init()):MatrixRain.init());const Modal={elementId:"article-modal",articles:null,articlesPath:"/content/articles.json",TIMING:{FADE_IN_DELAY:10,CONTENT_LOAD_DELAY:500,FADE_OUT_DURATION:300},getElement(){return document.getElementById(this.elementId)},async loadArticles(){if(this.articles)return this.articles;try{const e=await fetch(this.articlesPath);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();return this.articles={},t.articles.forEach(i=>{this.articles[i.id]=i}),this.articles}catch(e){return console.warn("Failed to load articles:",e.message),typeof Toast<"u"&&Toast.error("Could not load articles. Check connection."),{}}},open(e){const t=this.getElement(),i=document.getElementById("modal-title"),n=document.getElementById("modal-body");!t||!i||!n||(document.body.classList.add("scroll-locked"),i.innerText=`RETRIEVING LOG ${e}...`,n.innerHTML="<p>Decryption in progress...</p>",t.style.display="block",setTimeout(()=>{t.style.opacity=1},this.TIMING.FADE_IN_DELAY),setTimeout(()=>this.loadContent(e,i,n),this.TIMING.CONTENT_LOAD_DELAY))},close(){const e=this.getElement();e&&(e.style.opacity=0,document.body.classList.remove("scroll-locked"),setTimeout(()=>{e.style.display="none"},this.TIMING.FADE_OUT_DURATION))},async loadContent(e,t,i){const s=(await this.loadArticles())[e];if(s){const o=`TIMESTAMP: ${s.date} // ${s.sector}`;t.innerText=s.title,i.textContent="";const a=document.createElement("p");a.className="mono",a.style.color="var(--muted)",a.textContent=o;const l=document.createElement("hr");l.style.cssText="border:0; border-top:1px solid var(--line); margin: 2rem 0;";const r=document.createElement("p");r.textContent=s.body,i.appendChild(a),i.appendChild(l),i.appendChild(r)}else{t.innerText="LOG NOT FOUND",i.textContent="";const o=document.createElement("p");o.textContent="The requested field note could not be retrieved.",i.appendChild(o)}},init(){const e=this.getElement();e&&(e.addEventListener("click",t=>{t.target===e&&this.close()}),this.loadArticles())}};window.Modal=Modal;const Nav={drawerId:"mobile-drawer",overlayId:"mobile-overlay",toggleMobile(){const e=document.getElementById(this.drawerId),t=document.getElementById(this.overlayId);if(!e)return;e.classList.contains("open")?(e.classList.remove("open"),t?.classList.remove("open"),document.body.classList.remove("scroll-locked")):(e.classList.add("open"),t?.classList.add("open"),document.body.classList.add("scroll-locked"))},close(){const e=document.getElementById(this.drawerId),t=document.getElementById(this.overlayId);e?.classList.remove("open"),t?.classList.remove("open"),document.body.classList.remove("scroll-locked")},init(){}};window.Nav=Nav;const SleepMode={PAGE_TIME_REQUIRED:300*1e3,IDLE_TIME_REQUIRED:30*1e3,CHECK_INTERVAL:5e3,DEEP_SLEEP_DELAY:3e3,TIMING:{OVERLAY_DELAY:300,BREATHING_START:1500,WAKE_FLASH_DURATION:150,OVERLAY_FADE:500,ELEMENT_CLEANUP_DELAY:700,STAGGER_BUTTONS:100,STAGGER_CARDS:150,STAGGER_TEXT:80,STAGGER_NAV:50,STAGGER_STARTLE:30,STARTLED_MARK_DURATION:600},DISPLAY:{MOBILE_BREAKPOINT:768,TOASTERS_PER_200PX:1,TOASTERS_MOBILE:2,Z_COUNT_DESKTOP:8,Z_COUNT_MOBILE:4,ZS_PER_ELEMENT:3},CANVAS:{TOASTER_MIN_SPEED:1,TOASTER_SPEED_RANGE:1.5,WING_SPEED_MIN:5,WING_SPEED_RANGE:5,WRAP_MARGIN:60,PIXEL_SCALE:3},pageLoadTime:Date.now(),lastActivityTime:Date.now(),isAsleep:!1,isDeepSleep:!1,checkTimer:null,overlay:null,canvas:null,ctx:null,animationFrame:null,toasters:[],zs:[],sleepyElements:[],decorations:[],breathingTimeout:null,deepSleepTimeout:null,resizeHandler:null,wakeHandler:null,SLEEPY_SELECTORS:{buttons:".cta-button, .pricing-cta, .theme-toggle, .menu-toggle",cards:".process-step, .pricing-card, .about-card, .hero-badge, .wiki-category-card",text:".headline, .subhead, .section-label, .about-name, main h1, main h2, main h3",nav:".menu-link",logo:".brand-logo"},prefersReducedMotion(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches},init(){this.pageLoadTime=Date.now(),this.lastActivityTime=Date.now(),this.bindActivityListeners(),this.startChecking(),console.log("%c \u{1F4A4} Psst... stay a while and something might happen... ","background: #4a2c2a; color: #e07b3c; padding: 5px; font-family: monospace; font-size: 10px;")},bindActivityListeners(){const e=()=>{this.lastActivityTime=Date.now()};document.addEventListener("mousemove",e,{passive:!0}),document.addEventListener("keydown",e,{passive:!0}),document.addEventListener("scroll",e,{passive:!0}),document.addEventListener("touchstart",e,{passive:!0})},startChecking(){this.checkTimer=setInterval(()=>this.checkSleepConditions(),this.CHECK_INTERVAL)},checkSleepConditions(){if(this.isAsleep)return;const e=Date.now(),t=e-this.pageLoadTime,i=e-this.lastActivityTime;t>=this.PAGE_TIME_REQUIRED&&i>=this.IDLE_TIME_REQUIRED&&this.enterSleepMode()},enterSleepMode(){this.isAsleep||(this.isAsleep=!0,console.log("%c \u{1F634} FOGSIFT is taking a nap... click anywhere to wake up! ","background: #1a1412; color: #fb923c; padding: 10px; font-family: monospace; font-weight: bold;"),document.body.classList.add("page-sleeping"),this.prefersReducedMotion()||this.putElementsToSleep(),setTimeout(()=>{this.createOverlay(),this.prefersReducedMotion()||(this.initToasters(),this.initZs(),this.startAnimation()),this.wakeHandler=()=>this.wakeUp(),this.overlay.addEventListener("click",this.wakeHandler),this.overlay.addEventListener("touchend",this.wakeHandler,{passive:!0})},this.TIMING.OVERLAY_DELAY))},putElementsToSleep(){this.sleepyElements=[],this.decorations=[],document.querySelectorAll(this.SLEEPY_SELECTORS.buttons).forEach((t,i)=>{setTimeout(()=>{this.prepareElement(t),t.classList.add("sleepy"),this.sleepyElements.push({element:t,type:"button"}),i%2===0&&this.addZzzToElement(t)},i*this.TIMING.STAGGER_BUTTONS)}),document.querySelectorAll(this.SLEEPY_SELECTORS.cards).forEach((t,i)=>{setTimeout(()=>{this.prepareElement(t),t.classList.add("sleepy"),this.sleepyElements.push({element:t,type:"card"}),i<3&&this.addSleepCap(t),i===1&&this.addSnoreBubble(t),this.addZzzToElement(t)},2*this.TIMING.STAGGER_BUTTONS+i*this.TIMING.STAGGER_CARDS)}),document.querySelectorAll(this.SLEEPY_SELECTORS.text).forEach((t,i)=>{setTimeout(()=>{t.classList.add("sleepy"),this.sleepyElements.push({element:t,type:"text"})},this.TIMING.STAGGER_BUTTONS+i*this.TIMING.STAGGER_TEXT)}),document.querySelectorAll(this.SLEEPY_SELECTORS.nav).forEach((t,i)=>{setTimeout(()=>{t.classList.add("sleepy"),this.sleepyElements.push({element:t,type:"nav"})},i*this.TIMING.STAGGER_NAV)});const e=document.querySelector(this.SLEEPY_SELECTORS.logo);e&&setTimeout(()=>{this.prepareElement(e),e.classList.add("sleepy"),this.sleepyElements.push({element:e,type:"logo"}),this.addZzzToElement(e),this.addSleepCap(e)},this.TIMING.STAGGER_BUTTONS),this.breathingTimeout=setTimeout(()=>{this.startBreathing()},this.TIMING.BREATHING_START),this.deepSleepTimeout=setTimeout(()=>{this.enterDeepSleep()},this.DEEP_SLEEP_DELAY)},prepareElement(e){window.getComputedStyle(e).position==="static"&&(e.dataset.sleepOriginalPosition="static",e.style.position="relative")},restoreElement(e){e.dataset.sleepOriginalPosition==="static"&&(e.style.position="",delete e.dataset.sleepOriginalPosition)},startBreathing(){this.isAsleep&&this.sleepyElements.forEach(({element:e})=>{e.classList.remove("sleepy"),e.classList.add("sleepy-breathing")})},enterDeepSleep(){if(!this.isAsleep||this.isDeepSleep)return;this.isDeepSleep=!0,this.animationFrame&&(cancelAnimationFrame(this.animationFrame),this.animationFrame=null),document.body.classList.add("settling-to-sleep"),this.overlay&&this.overlay.classList.add("settling-to-sleep"),this.canvas&&(this.canvas.style.transition="opacity 1.5s ease-out",this.canvas.style.opacity="0");const e=this.overlay?.querySelector(".sleep-zs-container");e&&(e.style.transition="opacity 1.5s ease-out",e.style.opacity="0"),setTimeout(()=>{document.body.classList.remove("settling-to-sleep"),document.body.classList.add("deep-sleep"),this.overlay&&(this.overlay.classList.remove("settling-to-sleep"),this.overlay.classList.add("deep-sleep")),this.canvas&&(this.canvas.style.display="none"),e&&(e.innerHTML=""),this.cleanupDecorations()},1500),console.log("%c \u{1F634}\u{1F4A4} Settling into deep sleep... ","background: #0a0806; color: #666; padding: 5px; font-family: monospace; font-size: 9px;")},addZzzToElement(e){const t=document.createElement("div");t.className="element-zzz-container",t.style.cssText="position: absolute; top: -10px; right: -5px; pointer-events: none;";for(let i=0;i<this.DISPLAY.ZS_PER_ELEMENT;i++){const n=document.createElement("span");n.className="element-zzz",n.textContent="z",n.style.animationDelay=`${i*1}s`,t.appendChild(n)}e.appendChild(t),this.decorations.push(t)},addSleepCap(e){const t=document.createElement("span");t.className="sleep-cap",t.textContent="\u{1F9E2}",t.style.cssText="position: absolute; top: -20px; right: -15px; font-size: 1.5rem; transform: rotate(15deg); z-index: 50;",e.appendChild(t),this.decorations.push(t)},addSnoreBubble(e){const t=document.createElement("div");t.className="snore-bubble",t.textContent="zzz...",e.appendChild(t),this.decorations.push(t)},createOverlay(){this.overlay=document.createElement("div"),this.overlay.id="sleep-overlay",this.overlay.innerHTML=`
            <div class="sleep-scanlines"></div>
            <canvas id="sleep-canvas"></canvas>
            <div class="sleep-zs-container"></div>
            <div class="sleep-message">
                <span class="sleep-icon">\u{1F4A4}</span>
                <span class="sleep-text">tap to wake</span>
            </div>
        `,document.body.appendChild(this.overlay),this.canvas=document.getElementById("sleep-canvas"),this.ctx=this.canvas.getContext("2d"),this.resizeCanvas(),this.resizeHandler=()=>this.resizeCanvas(),window.addEventListener("resize",this.resizeHandler,{passive:!0}),requestAnimationFrame(()=>{this.overlay.classList.add("active")})},resizeCanvas(){this.canvas&&(this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight)},drawToaster(e,t,i){const n=this.ctx,s=this.CANVAS.PIXEL_SCALE,o={body:"#c4956a",dark:"#5c3d2e",slot:"#4a2c2a",wing:"#f5f0e6",wingDark:"#d4c4a8",highlight:"#e07b3c"};n.save(),n.translate(e,t),n.fillStyle=o.body,n.fillRect(0,4*s,12*s,8*s),n.fillStyle=o.dark,n.fillRect(0,10*s,12*s,2*s),n.fillStyle=o.slot,n.fillRect(2*s,5*s,3*s,4*s),n.fillRect(7*s,5*s,3*s,4*s),n.fillStyle=o.highlight,n.fillRect(2*s,3*s,3*s,2*s),n.fillRect(7*s,3*s,3*s,2*s);const a=i%2===0?0:-1*s;n.fillStyle=o.wing,n.fillRect(-4*s,(2+a/s)*s,4*s,6*s),n.fillStyle=o.wingDark,n.fillRect(-3*s,(3+a/s)*s,2*s,4*s),n.fillStyle=o.wing,n.fillRect(12*s,(2+a/s)*s,4*s,6*s),n.fillStyle=o.wingDark,n.fillRect(13*s,(3+a/s)*s,2*s,4*s),n.restore()},initToasters(){this.toasters=[];const t=window.innerWidth<this.DISPLAY.MOBILE_BREAKPOINT?this.DISPLAY.TOASTERS_MOBILE:Math.floor(window.innerWidth/200)*this.DISPLAY.TOASTERS_PER_200PX+2;for(let i=0;i<t;i++)this.toasters.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,speed:this.CANVAS.TOASTER_MIN_SPEED+Math.random()*this.CANVAS.TOASTER_SPEED_RANGE,wingFrame:Math.floor(Math.random()*10),wingSpeed:this.CANVAS.WING_SPEED_MIN+Math.floor(Math.random()*this.CANVAS.WING_SPEED_RANGE)})},initZs(){const e=this.overlay.querySelector(".sleep-zs-container");if(!e)return;const t=["small","medium","large"],n=window.innerWidth<this.DISPLAY.MOBILE_BREAKPOINT?this.DISPLAY.Z_COUNT_MOBILE:this.DISPLAY.Z_COUNT_DESKTOP;for(let s=0;s<n;s++){const o=document.createElement("div");o.className=`sleep-z ${t[s%3]}`,o.textContent="Z",o.style.left=`${10+Math.random()*80}%`,o.style.animationDelay=`${Math.random()*4}s`,o.style.animationDuration=`${4+Math.random()*3}s`,e.appendChild(o)}},startAnimation(){let e=0;const t=()=>{!this.isAsleep||!this.ctx||(this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.toasters.forEach(i=>{i.x+=i.speed,i.y-=i.speed*.6;const n=this.CANVAS.WRAP_MARGIN;i.x>this.canvas.width+n&&(i.x=-n,i.y=Math.random()*this.canvas.height),i.y<-n&&(i.y=this.canvas.height+n,i.x=Math.random()*this.canvas.width),e%i.wingSpeed===0&&i.wingFrame++,this.drawToaster(i.x,i.y,i.wingFrame)}),e++,this.animationFrame=requestAnimationFrame(t))};t()},wakeUp(){this.isAsleep&&(this.prefersReducedMotion()||(this.overlay.classList.add("waking"),this.startleElements()),setTimeout(()=>{this.isAsleep=!1,this.isDeepSleep=!1,this.lastActivityTime=Date.now(),this.breathingTimeout&&(clearTimeout(this.breathingTimeout),this.breathingTimeout=null),this.deepSleepTimeout&&(clearTimeout(this.deepSleepTimeout),this.deepSleepTimeout=null),this.animationFrame&&(cancelAnimationFrame(this.animationFrame),this.animationFrame=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null),document.body.classList.remove("page-sleeping","deep-sleep","settling-to-sleep"),document.body.classList.add("page-waking"),this.overlay&&(this.overlay.classList.remove("active"),this.overlay.classList.add("fading")),setTimeout(()=>{this.overlay&&this.overlay.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.overlay=null,this.canvas=null,this.ctx=null,this.wakeHandler=null,this.cleanupDecorations(),setTimeout(()=>{document.body.classList.remove("page-waking"),this.cleanupElementClasses()},this.TIMING.ELEMENT_CLEANUP_DELAY)},this.TIMING.OVERLAY_FADE),console.log("%c \u2600\uFE0F Good morning! FOGSIFT is awake and ready. ","background: #f5f0e6; color: #4a2c2a; padding: 10px; font-family: monospace; font-weight: bold;")},this.prefersReducedMotion()?0:this.TIMING.WAKE_FLASH_DURATION))},startleElements(){this.sleepyElements.forEach(({element:e,type:t},i)=>{setTimeout(()=>{e.classList.remove("sleepy","sleepy-breathing"),e.classList.add("startled"),t==="card"&&i<3&&this.addStartledMark(e),t==="button"&&i===0&&this.addStartledMark(e)},i*this.TIMING.STAGGER_STARTLE)})},addStartledMark(e){const t=document.createElement("span");t.className="startled-mark",t.textContent="!",t.style.cssText="position: absolute; top: -25px; right: -10px;",e.appendChild(t),this.decorations.push(t),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},this.TIMING.STARTLED_MARK_DURATION)},cleanupDecorations(){this.decorations.forEach(e=>{e&&e.parentNode&&e.parentNode.removeChild(e)}),this.decorations=[]},cleanupElementClasses(){this.sleepyElements.forEach(({element:e})=>{e.classList.remove("sleepy","sleepy-breathing","startled"),this.restoreElement(e)}),this.sleepyElements=[]},manualSleep(){this.isAsleep||this.enterSleepMode()}};window.SleepMode=SleepMode,document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelector(".footer-links");if(e){const t=document.createElement("button");t.className="footer-sleep-btn",t.setAttribute("aria-label","Put site to sleep"),t.innerHTML="\u{1F4A4}",t.title="Put site to sleep",t.addEventListener("click",i=>{i.preventDefault(),SleepMode.manualSleep()}),e.appendChild(t)}}),(function(){"use strict";const e="fogsift_",t=e+"build",n={ttl:36e5,get available(){try{const s="__test__";return localStorage.setItem(s,s),localStorage.removeItem(s),!0}catch{return!1}},get(s){if(!this.available)return null;try{const o=localStorage.getItem(e+s);if(!o)return null;const{data:a,timestamp:l,buildTimestamp:r}=JSON.parse(o);if(Date.now()-l>this.ttl)return this._log("expired",s),this.remove(s),null;const c=this._getCurrentBuild();return c&&r&&r!==c?(this._log("build changed",s),this.clear(),null):a}catch(o){return this._log("error",`get ${s}: ${o.message}`),null}},set(s,o){if(this.available)try{const a={data:o,timestamp:Date.now(),buildTimestamp:this._getCurrentBuild()||o.buildTimestamp};localStorage.setItem(e+s,JSON.stringify(a)),this._log("set",s)}catch(a){this._log("error",`set ${s}: ${a.message}`),this._cleanup()}},remove(s){this.available&&localStorage.removeItem(e+s)},isValid(s){return this.get(s)!==null},clear(){if(!this.available)return;const s=Object.keys(localStorage).filter(o=>o.startsWith(e));s.forEach(o=>localStorage.removeItem(o)),this._log("cleared",`${s.length} entries`)},setBuildTimestamp(s){this.available&&localStorage.setItem(t,String(s))},_getCurrentBuild(){if(!this.available)return null;const s=localStorage.getItem(t);return s?parseInt(s,10):null},_cleanup(){if(!this.available)return;const s=[];for(let a=0;a<localStorage.length;a++){const l=localStorage.key(a);if(l.startsWith(e)&&l!==t)try{const r=JSON.parse(localStorage.getItem(l));s.push({key:l,timestamp:r.timestamp})}catch{localStorage.removeItem(l)}}s.sort((a,l)=>a.timestamp-l.timestamp);const o=Math.ceil(s.length/2);s.slice(0,o).forEach(a=>localStorage.removeItem(a.key)),this._log("cleanup",`removed ${o} entries`)},_log(s,o){typeof Debug<"u"&&Debug.log&&Debug.log("Cache",`${s}: ${o}`)}};window.Cache=n})(),(function(){"use strict";const e="fogsift_debug",t="[FOGSIFT]",i={module:"color: #6b7280; font-weight: bold;",api:"color: #059669; font-weight: bold;",component:"color: #7c3aed; font-weight: bold;",error:"color: #dc2626; font-weight: bold;",success:"color: #16a34a;",timing:"color: #d97706;",default:"color: #374151;"},n={enabled:!1,prefix:t,init(){try{this.enabled=localStorage.getItem(e)==="true",this.enabled&&console.log(`%c${t} Debug mode enabled`,i.success)}catch{}},enable(){this.enabled=!0;try{localStorage.setItem(e,"true")}catch{}console.log(`%c${t} Debug mode enabled`,i.success),console.log(`%c${t} Use Debug.disable() to turn off`,i.default)},disable(){this.enabled=!1;try{localStorage.removeItem(e)}catch{}console.log(`%c${t} Debug mode disabled`,i.default)},log(s,o,a){if(!this.enabled)return;const l=`%c${t} %c[${s}] %c${o}`;a!==void 0?console.log(l,i.default,i.module,i.default,a):console.log(l,i.default,i.module,i.default)},api(s,o,a){if(!this.enabled)return;const l=o>=200&&o<300?i.success:i.error,r=`%c${t} %c[API] %c${s} %c${o} %c(${a}ms)`;console.log(r,i.default,i.api,i.default,l,i.timing)},component(s,o,a){if(!this.enabled)return;const l=`%c${t} %c[${s}] %c${o}`;a!==void 0?console.log(l,i.default,i.component,i.default,a):console.log(l,i.default,i.component,i.default)},error(s,o){const a=o instanceof Error?o.message:o;console.error(`%c${t} %c[${s}] %c${a}`,i.default,i.error,i.error)},group(s,o){this.enabled&&(console.group(`${t} ${s}`),o(),console.groupEnd())},table(s,o){this.enabled&&(console.log(`%c${t} ${s}:`,i.module),console.table(o))}};n.init(),window.Debug=n})(),(function(){"use strict";const e="/api",t={async loadIndex(){return this._fetch("/wiki/index.json")},async loadSitemap(){return this._fetch("/wiki/sitemap.json")},async loadArticles(){return this._fetch("/articles.json")},async loadMeta(){return this._fetch("/meta.json")},async _fetch(i){const n=`${e}${i}`,s=performance.now();try{if(typeof Cache<"u"&&Cache.isValid){const r=Cache.get(i);if(r)return this._log("cache hit",i),r}const o=await fetch(n);if(!o.ok)throw new Error(`HTTP ${o.status}: ${o.statusText}`);const a=await o.json(),l=Math.round(performance.now()-s);return this._logApi(i,o.status,l),typeof Cache<"u"&&Cache.set&&Cache.set(i,a),a}catch(o){throw this._log("error",`${i}: ${o.message}`),o}},_logApi(i,n,s){typeof Debug<"u"&&Debug.api&&Debug.api(i,n,s)},_log(i,n){typeof Debug<"u"&&Debug.log&&Debug.log("WikiAPI",`${i}: ${n}`)}};window.WikiAPI=t})();const Achievement={soundUrl:"data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkZeLgHRtbnuHj5KQiH91cHN+h4+QjoV8dXV4gYiNjouEfHd2eYGHi42LhX55eHmAhYmLioaDfnp5eoGFiImIhYJ+enp7gIWHiIeFgn98e3t/goWGhoSCf3x7e36Bg4SFhIKAfXx7fX+BgoODgoB+fHt8fX+AgoKCgX9+fHt8fX5/gIGBgH9+fXx8fH1+f4CAgH9+fXx8fH1+fn9/f39+fXx8fH1+fn5/f39+fX18fHx9fn5+f39/fn19fHx8fX19fn5+fn5+fX19fHx9fX19fn5+fn59fX19fX19fX19fX19fX19fX19fX19fX19fX19",unlock(e="Achievement Unlocked",t=50,i=""){const n=document.getElementById("xbox-achievement");n&&n.remove();const s=document.createElement("div");if(s.id="xbox-achievement",s.innerHTML=`
            <div class="achievement-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <div class="achievement-content">
                <div class="achievement-header">
                    <span class="achievement-label">Achievement Unlocked</span>
                    <span class="achievement-score">${t}G</span>
                </div>
                <div class="achievement-title">${e}</div>
                ${i?`<div class="achievement-desc">${i}</div>`:""}
            </div>
        `,!document.getElementById("xbox-achievement-styles")){const o=document.createElement("style");o.id="xbox-achievement-styles",o.textContent=`
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
            `,document.head.appendChild(o)}document.body.appendChild(s);try{const o=new Audio(this.soundUrl);o.volume=.3,o.play().catch(()=>{})}catch{}return setTimeout(()=>{s.classList.add("hiding"),setTimeout(()=>s.remove(),400)},4e3),s},firstSale:()=>Achievement.unlock("First Sale!",100,"Someone paid real money for your work"),shipped:()=>Achievement.unlock("Shipped It!",50,"Deployed to production"),bugSquashed:()=>Achievement.unlock("Bug Squashed",25,"Fixed a nasty bug"),allGreen:()=>Achievement.unlock("All Green",25,"All tests passing"),midnight:()=>Achievement.unlock("Night Owl",10,"Coding past midnight"),streak:e=>Achievement.unlock(`${e} Day Streak`,e*5,"Consecutive days of commits")};window.Achievement=Achievement,console.log('%c\u{1F3C6} Achievement system loaded! Try: Achievement.unlock("Your Title", 50, "Description")',"color: #107c10; font-weight: bold;");const QueueWidget={queueData:null,SLOTS_PER_DAY:2,WORK_DAYS:[1,2,3,4,5],_safeSessionGet(e){try{return sessionStorage.getItem(e)}catch{return null}},_safeSessionSet(e,t){try{sessionStorage.setItem(e,t)}catch{}},async init(){try{const e=await fetch("/content/queue.json");if(!e.ok)throw new Error(`HTTP ${e.status}`);this.queueData=await e.json(),this.renderFloatingWidget(),this.updateEstimates()}catch{console.log("Queue widget: Could not load queue data")}},getNextAvailableDate(){if(!this.queueData)return null;const t=this.queueData.queue.length+1,i=Math.ceil(t/this.SLOTS_PER_DAY);let n=new Date,s=0;for(;s<i;)n.setDate(n.getDate()+1),this.WORK_DAYS.includes(n.getDay())&&s++;return n},getSlotsRemainingThisWeek(){const t=new Date().getDay();let i=0;for(let o=t;o<=5;o++)this.WORK_DAYS.includes(o)&&i++;(t===0||t===6)&&(i=5);const n=i*this.SLOTS_PER_DAY,s=this.queueData?.queue?.length||0;return Math.max(0,n-s)},formatDate(e){const t={weekday:"long",month:"short",day:"numeric"};return e.toLocaleDateString("en-US",t)},renderFloatingWidget(){if(!this.queueData)return;const e=this.queueData?.queue?.length||0,t=this.getNextAvailableDate(),i=this.getSlotsRemainingThisWeek();this.queueData?.meta?.is_mock_data;const n=document.createElement("div");n.id="queue-widget",n.innerHTML=`
      <button class="queue-widget-close" onclick="QueueWidget.dismiss()" aria-label="Close">&times;</button>
      <div class="queue-widget-inner">
        <div class="queue-widget-content">
          <div class="queue-widget-stat">
            <span class="queue-widget-number">${e}</span>
            <span class="queue-widget-label">in queue</span>
          </div>
          <div class="queue-widget-divider"></div>
          <div class="queue-widget-estimate">
            <span class="queue-widget-date">${t?this.formatDate(t):"This week"}</span>
            <span class="queue-widget-sublabel">est. next slot</span>
          </div>
        </div>
        <a href="https://ko-fi.com/fogsift" class="queue-widget-cta" target="_blank" rel="noopener">
          Join Queue
        </a>
        ${i<=4?`<div class="queue-widget-urgency">${i} slots left this week</div>`:""}
      </div>
    `;const s=document.createElement("style");s.textContent=`
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
    `,document.head.appendChild(s),document.body.appendChild(n),setTimeout(()=>{this._safeSessionGet("queue-widget-interacted")},3e4)},dismiss(){const e=document.getElementById("queue-widget");e&&(e.classList.add("dismissed"),this._safeSessionSet("queue-widget-dismissed","true"))},updateEstimates(){const e=this.getNextAvailableDate(),t=this.getSlotsRemainingThisWeek();document.querySelectorAll(".js-next-available-date").forEach(i=>{i.textContent=e?this.formatDate(e):"This week"}),document.querySelectorAll(".js-slots-remaining").forEach(i=>{i.textContent=t}),document.querySelectorAll(".js-queue-length").forEach(i=>{i.textContent=this.queueData?.queue?.length||0})}};document.addEventListener("DOMContentLoaded",()=>{const e=window.location.pathname,t=e==="/"||e==="/index.html"||e.endsWith("/index.html"),i=e.includes("queue"),n=QueueWidget._safeSessionGet("queue-widget-dismissed"),s=window.innerWidth<600;!t&&!i&&!n&&!s&&QueueWidget.init()});const App={TIMING:{WORD_ROTATE_INTERVAL:2500,WORD_FADE_DURATION:300,EASTER_EGG_EFFECT:500,CLOCK_UPDATE:1e3},_intervals:[],_konamiCode:["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],_konamiIndex:0,init(){typeof Nav<"u"&&Nav.init&&Nav.init(),typeof Modal<"u"&&Modal.init&&Modal.init(),this.initClock(),this.initAccessibility(),this.initRotatingWords(),this.initKonami(),this.initHoneypot(),this.logBoot(),typeof SleepMode<"u"&&SleepMode.init&&SleepMode.init()},initHoneypot(){document.querySelectorAll('a[data-honeypot="true"]').forEach(e=>{e.addEventListener("click",t=>{const i=e.parentElement?.querySelector(".hp-field input");i&&i.checked&&(t.preventDefault(),console.log("%c \u{1F916} Bot detected ","background: #dc2626; color: white; padding: 5px;"))})})},initClock(){const e=document.getElementById("utc-clock");if(!e)return;const t=()=>{const i=new Date;e.textContent=i.toISOString().replace("T"," ").substring(0,19)+" UTC"};t(),this._intervals.push(setInterval(t,this.TIMING.CLOCK_UPDATE))},initAccessibility(){const e=document.querySelector(".theme-toggle");if(e){const s=()=>{const a=document.documentElement.getAttribute("data-theme")==="dark";e.setAttribute("aria-pressed",a?"true":"false")};s(),new MutationObserver(s).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]})}const t=document.querySelector(".menu-toggle"),i=document.getElementById("mobile-drawer");if(t&&i){const s=()=>{const a=i.classList.contains("open");t.setAttribute("aria-expanded",a?"true":"false")};new MutationObserver(s).observe(i,{attributes:!0,attributeFilter:["class"]})}i&&i.addEventListener("keydown",s=>{s.key==="Escape"&&Nav.toggleMobile()});const n=document.getElementById("article-modal");n&&n.addEventListener("keydown",s=>{s.key==="Escape"&&Modal.close()})},initRotatingWords(){document.querySelectorAll("[data-words]").forEach(t=>{const i=t.dataset.words;if(!i)return;let n;try{n=JSON.parse(i)}catch{return}if(!Array.isArray(n)||n.length<2)return;let s=0;this._intervals.push(setInterval(()=>{t.style.opacity="0",setTimeout(()=>{s=(s+1)%n.length,t.textContent=n[s],t.style.opacity="1"},this.TIMING.WORD_FADE_DURATION)},this.TIMING.WORD_ROTATE_INTERVAL))})},initKonami(){document.addEventListener("keydown",e=>{e.key===this._konamiCode[this._konamiIndex]?(this._konamiIndex++,this._konamiIndex===this._konamiCode.length&&(this._konamiIndex=0,this.triggerEasterEgg())):this._konamiIndex=0})},triggerEasterEgg(){console.log("%c"+`
    \u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591
    \u2591  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2557     \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
    \u2591  \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D     \u2588\u2588\u2551     \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D
    \u2591  \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2588\u2557    \u2588\u2588\u2551     \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2551
    \u2591  \u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D     \u2588\u2588\u2551
    \u2591  \u2588\u2588\u2551     \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2551        \u2588\u2588\u2551
    \u2591  \u255A\u2550\u255D      \u255A\u2550\u2550\u2550\u2550\u2550\u255D  \u255A\u2550\u2550\u2550\u2550\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D\u255A\u2550\u255D        \u255A\u2550\u255D
    \u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591
        `,"color: #e07b3c; font-family: monospace;"),console.log("%c \u{1F3AE} KONAMI CODE ACTIVATED! ","background: #0d9488; color: white; padding: 10px; font-size: 16px; font-weight: bold;"),console.log("%c You found the secret! Here's a fortune cookie: ","color: #4a2c2a; font-style: italic;");const t=["\u{1F52E} The fog will clear when you stop looking for the sun.","\u{1F52E} Your next breakthrough is hiding in plain sight.","\u{1F52E} Sometimes the answer is a better question.","\u{1F52E} Complexity is easy. Simplicity takes courage.","\u{1F52E} The bottleneck is rarely where you think it is.",'\u{1F52E} Ask "why" five times. The truth lives on the fifth floor.',"\u{1F52E} Your gut knows things your spreadsheet never will.","\u{1F52E} The best documentation is the kind you wish existed."];console.log("%c "+t[Math.floor(Math.random()*t.length)],"color: #e07b3c; font-size: 14px; padding: 5px;");const i=this.TIMING.EASTER_EGG_EFFECT;document.body.style.transition=`filter ${i/1e3}s`,document.body.style.filter="hue-rotate(180deg)",setTimeout(()=>{document.body.style.filter="hue-rotate(360deg)",setTimeout(()=>{document.body.style.filter="none"},i)},i)},logBoot(){console.log("%c FOGSIFT // SYSTEMS NOMINAL ","background: #4a2c2a; color: #e07b3c; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #0d9488;"),console.log('%c \u2328\uFE0F  Press "T" to cycle themes ',"color: #e07b3c; font-family: monospace; font-size: 10px;"),console.log("%c \u{1F3AE} ...or try the old ways. ","color: #999; font-family: monospace; font-size: 10px;")}};document.addEventListener("DOMContentLoaded",()=>App.init()),window.addEventListener("unload",()=>{App._intervals.forEach(e=>clearInterval(e))});
