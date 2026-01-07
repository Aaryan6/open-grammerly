(function(){const b=["password","hidden","file","checkbox","radio","submit","button","image","reset","color","range"];function m(n){const e=n.tagName.toLowerCase();if(e==="input"){const o=n,t=(o.type||"text").toLowerCase();return!(b.includes(t)||o.readOnly||o.disabled)}if(e==="textarea"){const o=n;return!o.readOnly&&!o.disabled}return n.contentEditable==="true"||n.isContentEditable}function w(n){const e="input, textarea, [contenteditable]";document.querySelectorAll(e).forEach(i=>{m(i)&&n(i)});const t=new MutationObserver(i=>{for(const s of i)for(const r of s.addedNodes)r instanceof Element&&(m(r)?n(r):r.querySelectorAll(e).forEach(l=>{m(l)&&n(l)}))});return t.observe(document.body,{childList:!0,subtree:!0}),t}class y{container;shadowRoot;currentTooltip=null;currentHighlight=null;activeElements=new Map;updateScheduled=!1;constructor(){this.container=document.createElement("div"),this.container.id="open-grammarly-root",this.container.style.position="fixed",this.container.style.top="0",this.container.style.left="0",this.container.style.width="100vw",this.container.style.height="100vh",this.container.style.pointerEvents="none",this.container.style.zIndex="2147483647",document.body.appendChild(this.container),this.shadowRoot=this.container.attachShadow({mode:"open"}),this.injectStyles(),document.addEventListener("mousedown",e=>{this.currentTooltip&&!this.container.contains(e.target)&&this.closeTooltip()}),window.addEventListener("scroll",()=>this.scheduleUpdate(),{passive:!0,capture:!0}),window.addEventListener("resize",()=>this.scheduleUpdate(),{passive:!0})}scheduleUpdate(){this.updateScheduled||(this.updateScheduled=!0,requestAnimationFrame(()=>{this.updatePositions(),this.updateScheduled=!1}))}updatePositions(){this.currentTooltip&&this.closeTooltip(),this.shadowRoot.querySelectorAll(".og-underline, .og-textarea-badge").forEach(e=>e.remove()),this.activeElements.forEach((e,o)=>{if(!document.body.contains(e.element)){this.activeElements.delete(o);return}e.element instanceof HTMLTextAreaElement||e.element instanceof HTMLInputElement?this.renderTextareaBadge(e.element,e.corrections,e.onApply):this.renderContentEditableHighlights(e.element,e.corrections,e.onApply)})}injectStyles(){const e=document.createElement("style");e.textContent=`
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
      .og-grammar, .og-spelling { 
        border-bottom-color: #ff3333;
        background: linear-gradient(45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%),
                    linear-gradient(-45deg, transparent 65%, #ff3333 65%, #ff3333 75%, transparent 75%);
        background-size: 8px 4px;
      }
      
      /* Highlight overlay shown on hover */
      .og-highlight {
        position: absolute;
        background: rgba(220, 38, 38, 0.25);
        pointer-events: none;
        z-index: 2147483646;
        border-radius: 2px;
      }
      
      .og-tooltip {
        position: fixed;
        background: white;
        border-radius: 8px;
        padding: 0;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        z-index: 20000;
        pointer-events: auto;
        min-width: 200px;
        max-width: 280px;
        border: 1px solid #e5e7eb;
        color: #111827;
        overflow: hidden;
      }
      .og-title {
        font-size: 13px;
        font-weight: 400;
        color: #6b7280;
        padding: 12px 14px 8px;
        border-bottom: none;
      }
      .og-suggestion {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        color: #2563eb;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .og-suggestion:hover {
        background: #f3f4f6;
      }
      .og-dismiss {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        color: #6b7280;
        font-size: 13px;
        cursor: pointer;
        border-top: 1px solid #f3f4f6;
        transition: background 0.15s;
      }
      .og-dismiss:hover {
        background: #f9fafb;
      }
      .og-dismiss svg {
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }
      
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
    `,this.shadowRoot.appendChild(e)}highlightCorrections(e,o,t){const i=this.getElementId(e);this.clearHighlights(e),o.length===0&&this.closeTooltip(),o.length>0?this.activeElements.set(i,{element:e,corrections:o,onApply:t}):this.activeElements.delete(i),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement?this.renderTextareaBadge(e,o,t):this.renderContentEditableHighlights(e,o,t)}clearHighlights(e){const o=this.getElementId(e);this.shadowRoot.querySelectorAll(`.og-underline[data-element-id="${o}"], .og-textarea-badge[data-element-id="${o}"]`).forEach(t=>t.remove())}getElementId(e){return e.dataset.ogId||(e.dataset.ogId=Math.random().toString(36).substr(2,9)),e.dataset.ogId}renderContentEditableHighlights(e,o,t){const i=this.getElementId(e);o.forEach(s=>{const r=this.getRangeForIndices(e,s.start,s.end);if(!r)return;const a=Array.from(r.getClientRects());a.forEach((l,h)=>{if(l.width===0)return;const c=document.createElement("div");c.className=`og-underline og-${s.type}`,c.dataset.elementId=i,c.style.left=`${l.left}px`,c.style.top=`${l.bottom-2}px`,c.style.width=`${l.width}px`,c.onmouseenter=d=>{d.stopPropagation(),this.showHighlight(a),this.showTooltip(s,l.left,l.bottom,t)},this.shadowRoot.appendChild(c)})})}renderTextareaBadge(e,o,t){const i=this.getElementId(e),s=e.getBoundingClientRect();if(o.length===0)return;const r=document.createElement("div");r.className="og-textarea-badge",r.dataset.elementId=i,r.style.left=`${s.right-30}px`,r.style.top=`${s.bottom-30}px`,r.textContent=o.length.toString(),r.onmouseenter=a=>{a.stopPropagation(),this.showTooltip(o[0],s.left,s.bottom,t)},this.shadowRoot.appendChild(r)}getRangeForIndices(e,o,t){const i=document.createRange();let s=0,r=null,a=0,l=null,h=0;const c=d=>{if(d.nodeType===Node.TEXT_NODE){const u=s+(d.textContent?.length||0);!r&&o>=s&&o<u&&(r=d,a=o-s),!l&&t>=s&&t<=u&&(l=d,h=t-s),s=u}else for(let u=0;u<d.childNodes.length&&(c(d.childNodes[u]),!l);u++);};if(c(e),r&&l)try{return i.setStart(r,a),i.setEnd(l,h),i}catch{return null}return null}showTooltip(e,o,t,i){this.closeTooltip();const s=document.createElement("div");s.className="og-tooltip",s.style.left=`${o}px`,s.style.top=`${t+8}px`;const r=e.type==="spelling"?"Use the right word":e.type==="grammar"?"Punctuation problem":e.explanation||"Suggestion";s.innerHTML=`
      <div class="og-title">${r}</div>
      <div class="og-suggestion">${e.suggestion}</div>
      <div class="og-dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Dismiss
      </div>
    `,s.querySelector(".og-suggestion")?.addEventListener("click",()=>{i(e),this.closeTooltip()}),s.querySelector(".og-dismiss")?.addEventListener("click",()=>{this.closeTooltip()}),this.shadowRoot.appendChild(s),this.currentTooltip=s;const a=s.getBoundingClientRect();a.right>window.innerWidth&&(s.style.left=`${window.innerWidth-a.width-20}px`),a.bottom>window.innerHeight&&(s.style.top=`${t-a.height-8}px`)}closeTooltip(){this.currentTooltip&&(this.currentTooltip.remove(),this.currentTooltip=null),this.clearHighlight()}showHighlight(e){this.clearHighlight(),e.forEach(o=>{if(o.width===0)return;const t=document.createElement("div");t.className="og-highlight",t.style.left=`${o.left}px`,t.style.top=`${o.top}px`,t.style.width=`${o.width}px`,t.style.height=`${o.height}px`,this.shadowRoot.appendChild(t)})}clearHighlight(){this.shadowRoot.querySelectorAll(".og-highlight").forEach(e=>e.remove())}showToast(e,o="info",t){this.shadowRoot.querySelectorAll(".og-toast").forEach(a=>a.remove());const i=document.createElement("div");i.className=`og-toast og-${o}`;let s=`<span>${e}</span>`;t?.action&&t?.onAction&&(s+=`<button class="og-toast-action">${t.action}</button>`),s+='<button class="og-toast-close">×</button>',i.innerHTML=s,i.querySelector(".og-toast-close")?.addEventListener("click",()=>{i.remove()}),t?.action&&t?.onAction&&i.querySelector(".og-toast-action")?.addEventListener("click",()=>{t.onAction(),i.remove()}),this.shadowRoot.appendChild(i);const r=t?.duration??(o==="error"?8e3:5e3);r>0&&setTimeout(()=>{this.shadowRoot.contains(i)&&i.remove()},r)}}const p=new Set,g=new y;function E(n){const e=n.target;g.highlightCorrections(e,[],()=>{}),f(e)}function v(n){const e=n.target;g.highlightCorrections(e,[],()=>{}),setTimeout(()=>f(e),100)}function f(n){const e=n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement?n.value:n.innerText;if(e.length<5){g.highlightCorrections(n,[],()=>{});return}const o=n._analysisTimeout;o&&clearTimeout(o),n._analysisTimeout=setTimeout(async()=>{const t=await chrome.runtime.sendMessage({type:"ANALYZE_TEXT",text:e});t.success?g.highlightCorrections(n,t.data.corrections,i=>{x(n,i)}):t.error?.includes("API key")?g.showToast("API key not configured","error",{action:"Open Settings",onAction:()=>{chrome.runtime.sendMessage({type:"OPEN_OPTIONS"})}}):t.error?.includes("disabled")||g.showToast(`Analysis failed: ${t.error}`,"error")},1e3)}function x(n,e){if(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement){const o=n.value,t=o.substring(0,e.start)+e.suggestion+o.substring(e.end);n.value=t,n.dispatchEvent(new Event("input",{bubbles:!0}))}else try{const o=n.innerText||n.textContent||"",t=o.substring(e.start,e.end);let i=e.start;if(t!==e.original){const l=Math.max(0,e.start-10),h=Math.min(o.length,e.end+10),d=o.substring(l,h).indexOf(e.original);if(d===-1)return;i=l+d}const s=window.getSelection();if(!s)return;const r=T(n,i,i+e.original.length);if(!r)return;const a=document.createRange();a.setStart(r.startNode,r.startOffset),a.setEnd(r.endNode,r.endOffset),s.removeAllRanges(),s.addRange(a),document.execCommand("insertText",!1,e.suggestion),n.dispatchEvent(new Event("input",{bubbles:!0}))}catch{}g.highlightCorrections(n,[],()=>{}),setTimeout(()=>f(n),500)}function T(n,e,o){let t=0,i=null,s=0,r=null,a=0;const l=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null);let h;for(;h=l.nextNode();){const c=h.textContent?.length||0,d=t+c;if(!i&&e>=t&&e<d&&(i=h,s=e-t),!r&&o>=t&&o<=d&&(r=h,a=o-t),t=d,i&&r)break}return i&&r?{startNode:i,startOffset:s,endNode:r,endOffset:a}:null}chrome.runtime.onMessage.addListener((n,e,o)=>{if(n.type==="SHOW_ANALYSIS_RESULTS"&&n.data.success){const t=document.activeElement;if(t&&(C(t)||p.has(t)))g.highlightCorrections(t,n.data.data.corrections,i=>x(t,i));else{const i=Array.from(p).pop();i&&g.highlightCorrections(i,n.data.data.corrections,s=>x(i,s))}}});function C(n){const e=n.tagName.toLowerCase();return e==="input"||e==="textarea"||n.isContentEditable}w(n=>{p.has(n)||(n.addEventListener("input",E),n.addEventListener("paste",v),n.addEventListener("focus",()=>f(n)),p.add(n))});chrome.runtime.sendMessage({type:"PING"},()=>{chrome.runtime.lastError});
})()
