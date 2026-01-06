(function(){const x=["password","hidden","file","checkbox","radio","submit","button","image","reset","color","range"];function m(t){const e=t.tagName.toLowerCase();if(e==="input"){const n=t,o=(n.type||"text").toLowerCase();return!(x.includes(o)||n.readOnly||n.disabled)}if(e==="textarea"){const n=t;return!n.readOnly&&!n.disabled}return t.contentEditable==="true"||t.isContentEditable}function y(t){const e="input, textarea, [contenteditable]";document.querySelectorAll(e).forEach(i=>{m(i)&&t(i)});const o=new MutationObserver(i=>{for(const s of i)for(const r of s.addedNodes)r instanceof Element&&(m(r)?t(r):r.querySelectorAll(e).forEach(a=>{m(a)&&t(a)}))});return o.observe(document.body,{childList:!0,subtree:!0}),o}class w{container;shadowRoot;currentTooltip=null;activeElements=new Map;updateScheduled=!1;constructor(){this.container=document.createElement("div"),this.container.id="open-grammarly-root",this.container.style.position="fixed",this.container.style.top="0",this.container.style.left="0",this.container.style.width="100vw",this.container.style.height="100vh",this.container.style.pointerEvents="none",this.container.style.zIndex="2147483647",document.body.appendChild(this.container),this.shadowRoot=this.container.attachShadow({mode:"open"}),this.injectStyles(),document.addEventListener("mousedown",e=>{this.currentTooltip&&!this.container.contains(e.target)&&this.closeTooltip()}),window.addEventListener("scroll",()=>this.scheduleUpdate(),{passive:!0,capture:!0}),window.addEventListener("resize",()=>this.scheduleUpdate(),{passive:!0})}scheduleUpdate(){this.updateScheduled||(this.updateScheduled=!0,requestAnimationFrame(()=>{this.updatePositions(),this.updateScheduled=!1}))}updatePositions(){this.currentTooltip&&this.closeTooltip(),this.shadowRoot.querySelectorAll(".og-underline, .og-textarea-badge").forEach(e=>e.remove()),this.activeElements.forEach((e,n)=>{if(!document.body.contains(e.element)){this.activeElements.delete(n);return}e.element instanceof HTMLTextAreaElement||e.element instanceof HTMLInputElement?this.renderTextareaBadge(e.element,e.corrections,e.onApply):this.renderContentEditableHighlights(e.element,e.corrections,e.onApply)})}injectStyles(){const e=document.createElement("style");e.textContent=`
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }
      .og-underline {
        position: absolute;
        height: 4px;
        /* Fallback solid border in case gradient doesn't render */
        border-bottom: 2px solid #ff3333;
        background: linear-gradient(45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%),
                    linear-gradient(-45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%);
        background-size: 8px 4px;
        pointer-events: auto;
        cursor: pointer;
        z-index: 2147483647;
        display: block !important;
        box-sizing: border-box;
      }
      .og-underline:hover {
        background-color: rgba(255, 77, 77, 0.3);
      }
      .og-grammar, .og-spelling { 
        border-bottom-color: #ff3333;
        background: linear-gradient(45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%),
                    linear-gradient(-45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%);
        background-size: 8px 4px;
      }
      
      .og-tooltip {
        position: fixed;
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 20000;
        pointer-events: auto;
        width: 280px;
        border: 1px solid #e5e7eb;
        color: #111827;
      }
      .og-type {
        text-transform: uppercase;
        font-size: 10px;
        font-weight: 700;
        color: #6b7280;
        margin-bottom: 4px;
      }
      .og-suggestion-box {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .og-original {
        text-decoration: line-through;
        color: #9ca3af;
        font-size: 14px;
      }
      .og-suggestion {
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 4px;
        color: #111827;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
      }
      .og-suggestion:hover {
        background: #e5e7eb;
      }
      .og-arrow {
        color: #9ca3af;
        font-size: 14px;
      }
      .og-actions {
        display: flex;
        gap: 8px;
      }
      .og-btn {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: none;
      }
      .og-apply {
        background: #2563eb;
        color: white;
      }
      .og-apply:hover { background: #1d4ed8; }
      .og-dismiss {
        background: white;
        color: #4b5563;
        border: 1px solid #d1d5db;
      }
      .og-dismiss:hover { background: #f9fafb; }
      
      .og-textarea-badge {
        position: absolute;
        background: #2563eb;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        pointer-events: auto;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .og-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 13px;
        max-width: 320px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: og-slide-in 0.3s ease-out;
        z-index: 2147483647;
      }
      .og-toast.og-error {
        background: #dc2626;
      }
      .og-toast.og-warning {
        background: #d97706;
      }
      .og-toast.og-success {
        background: #059669;
      }
      .og-toast-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        margin-left: auto;
        opacity: 0.7;
      }
      .og-toast-close:hover {
        opacity: 1;
      }
      .og-toast-action {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
      }
      .og-toast-action:hover {
        background: rgba(255,255,255,0.3);
      }
      @keyframes og-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,this.shadowRoot.appendChild(e)}highlightCorrections(e,n,o){const i=this.getElementId(e);this.clearHighlights(e),n.length===0&&this.closeTooltip(),n.length>0?this.activeElements.set(i,{element:e,corrections:n,onApply:o}):this.activeElements.delete(i),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement?this.renderTextareaBadge(e,n,o):this.renderContentEditableHighlights(e,n,o)}clearHighlights(e){const n=this.getElementId(e);this.shadowRoot.querySelectorAll(`.og-underline[data-element-id="${n}"], .og-textarea-badge[data-element-id="${n}"]`).forEach(o=>o.remove())}getElementId(e){return e.dataset.ogId||(e.dataset.ogId=Math.random().toString(36).substr(2,9)),e.dataset.ogId}renderContentEditableHighlights(e,n,o){const i=this.getElementId(e);n.forEach(s=>{const r=this.getRangeForIndices(e,s.start,s.end);if(!r)return;Array.from(r.getClientRects()).forEach((a,g)=>{if(a.width===0)return;const c=document.createElement("div");c.className=`og-underline og-${s.type}`,c.dataset.elementId=i,c.style.left=`${a.left}px`,c.style.top=`${a.bottom-2}px`,c.style.width=`${a.width}px`,c.onmouseenter=d=>{d.stopPropagation(),this.showTooltip(s,a.left,a.bottom,o)},this.shadowRoot.appendChild(c)})})}renderTextareaBadge(e,n,o){const i=this.getElementId(e),s=e.getBoundingClientRect();if(n.length===0)return;const r=document.createElement("div");r.className="og-textarea-badge",r.dataset.elementId=i,r.style.left=`${s.right-30}px`,r.style.top=`${s.bottom-30}px`,r.textContent=n.length.toString(),r.onmouseenter=l=>{l.stopPropagation(),this.showTooltip(n[0],s.left,s.bottom,o)},this.shadowRoot.appendChild(r)}getRangeForIndices(e,n,o){const i=document.createRange();let s=0,r=null,l=0,a=null,g=0;const c=d=>{if(d.nodeType===Node.TEXT_NODE){const h=s+(d.textContent?.length||0);!r&&n>=s&&n<h&&(r=d,l=n-s),!a&&o>=s&&o<=h&&(a=d,g=o-s),s=h}else for(let h=0;h<d.childNodes.length&&(c(d.childNodes[h]),!a);h++);};if(c(e),r&&a)try{return i.setStart(r,l),i.setEnd(a,g),i}catch{return null}return null}showTooltip(e,n,o,i){this.closeTooltip();const s=document.createElement("div");s.className="og-tooltip",s.style.left=`${n}px`,s.style.top=`${o+8}px`,s.innerHTML=`
      <div class="og-type">${e.type}</div>
      <div class="og-suggestion-box">
        <span class="og-original">${e.original}</span>
        <span class="og-arrow">→</span>
        <span class="og-suggestion">${e.suggestion}</span>
      </div>
      <div class="og-actions">
        <button class="og-btn og-apply">Apply</button>
        <button class="og-btn og-dismiss">Dismiss</button>
      </div>
    `,s.querySelector(".og-apply")?.addEventListener("click",()=>{i(e),this.closeTooltip()}),s.querySelector(".og-dismiss")?.addEventListener("click",()=>{this.closeTooltip()}),this.shadowRoot.appendChild(s),this.currentTooltip=s;const r=s.getBoundingClientRect();r.right>window.innerWidth&&(s.style.left=`${window.innerWidth-r.width-20}px`),r.bottom>window.innerHeight&&(s.style.top=`${o-r.height-8}px`)}closeTooltip(){this.currentTooltip&&(this.currentTooltip.remove(),this.currentTooltip=null)}showToast(e,n="info",o){this.shadowRoot.querySelectorAll(".og-toast").forEach(l=>l.remove());const i=document.createElement("div");i.className=`og-toast og-${n}`;let s=`<span>${e}</span>`;o?.action&&o?.onAction&&(s+=`<button class="og-toast-action">${o.action}</button>`),s+='<button class="og-toast-close">×</button>',i.innerHTML=s,i.querySelector(".og-toast-close")?.addEventListener("click",()=>{i.remove()}),o?.action&&o?.onAction&&i.querySelector(".og-toast-action")?.addEventListener("click",()=>{o.onAction(),i.remove()}),this.shadowRoot.appendChild(i);const r=o?.duration??(n==="error"?8e3:5e3);r>0&&setTimeout(()=>{this.shadowRoot.contains(i)&&i.remove()},r)}}const p=new Set,u=new w;function E(t){const e=t.target;u.highlightCorrections(e,[],()=>{}),f(e)}function v(t){const e=t.target;u.highlightCorrections(e,[],()=>{}),setTimeout(()=>f(e),100)}function f(t){const e=t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value:t.innerText;if(e.length<5){u.highlightCorrections(t,[],()=>{});return}const n=t._analysisTimeout;n&&clearTimeout(n),t._analysisTimeout=setTimeout(async()=>{const o=await chrome.runtime.sendMessage({type:"ANALYZE_TEXT",text:e});o.success?u.highlightCorrections(t,o.data.corrections,i=>{b(t,i)}):o.error?.includes("API key")?u.showToast("API key not configured","error",{action:"Open Settings",onAction:()=>{chrome.runtime.sendMessage({type:"OPEN_OPTIONS"})}}):o.error?.includes("disabled")||u.showToast(`Analysis failed: ${o.error}`,"error")},1e3)}function b(t,e){if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement){const n=t.value,o=n.substring(0,e.start)+e.suggestion+n.substring(e.end);t.value=o,t.dispatchEvent(new Event("input",{bubbles:!0}))}else try{const n=t.innerText||t.textContent||"",o=n.substring(e.start,e.end);let i=e.start;if(o!==e.original){const a=Math.max(0,e.start-10),g=Math.min(n.length,e.end+10),d=n.substring(a,g).indexOf(e.original);if(d===-1)return;i=a+d}const s=window.getSelection();if(!s)return;const r=T(t,i,i+e.original.length);if(!r)return;const l=document.createRange();l.setStart(r.startNode,r.startOffset),l.setEnd(r.endNode,r.endOffset),s.removeAllRanges(),s.addRange(l),document.execCommand("insertText",!1,e.suggestion),t.dispatchEvent(new Event("input",{bubbles:!0}))}catch{}u.highlightCorrections(t,[],()=>{}),setTimeout(()=>f(t),500)}function T(t,e,n){let o=0,i=null,s=0,r=null,l=0;const a=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,null);let g;for(;g=a.nextNode();){const c=g.textContent?.length||0,d=o+c;if(!i&&e>=o&&e<d&&(i=g,s=e-o),!r&&n>=o&&n<=d&&(r=g,l=n-o),o=d,i&&r)break}return i&&r?{startNode:i,startOffset:s,endNode:r,endOffset:l}:null}chrome.runtime.onMessage.addListener((t,e,n)=>{if(t.type==="SHOW_ANALYSIS_RESULTS"&&t.data.success){const o=document.activeElement;if(o&&(C(o)||p.has(o)))u.highlightCorrections(o,t.data.data.corrections,i=>b(o,i));else{const i=Array.from(p).pop();i&&u.highlightCorrections(i,t.data.data.corrections,s=>b(i,s))}}});function C(t){const e=t.tagName.toLowerCase();return e==="input"||e==="textarea"||t.isContentEditable}y(t=>{p.has(t)||(t.addEventListener("input",E),t.addEventListener("paste",v),t.addEventListener("focus",()=>f(t)),p.add(t))});chrome.runtime.sendMessage({type:"PING"},()=>{chrome.runtime.lastError});
})()
