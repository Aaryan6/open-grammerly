import { Correction } from '../lib/openrouter';

interface ElementData {
  element: HTMLElement;
  corrections: Correction[];
  onApply: (c: Correction) => void;
}

export class UIInjector {
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  private currentTooltip: HTMLElement | null = null;
  private currentHighlight: HTMLElement | null = null;
  private activeElements: Map<string, ElementData> = new Map();
  private updateScheduled = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'open-grammarly-root';
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.pointerEvents = 'none';
    this.container.style.zIndex = '2147483647';
    document.body.appendChild(this.container);

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    this.injectStyles();
    
    document.addEventListener('mousedown', (e) => {
      if (this.currentTooltip && !this.container.contains(e.target as Node)) {
        this.closeTooltip();
      }
    });

    // Use passive listeners and debounce for better performance
    window.addEventListener('scroll', () => this.scheduleUpdate(), { passive: true, capture: true });
    window.addEventListener('resize', () => this.scheduleUpdate(), { passive: true });
  }

  private scheduleUpdate() {
    if (this.updateScheduled) return;
    this.updateScheduled = true;
    
    requestAnimationFrame(() => {
      this.updatePositions();
      this.updateScheduled = false;
    });
  }

  private updatePositions() {
    // Close tooltip on scroll/resize
    if (this.currentTooltip) this.closeTooltip();
    
    // Clear existing visual elements
    this.shadowRoot.querySelectorAll('.og-underline, .og-textarea-badge').forEach(el => el.remove());
    
    // Re-render all active corrections with updated positions
    this.activeElements.forEach((data, elementId) => {
      // Check if element is still in DOM
      if (!document.body.contains(data.element)) {
        this.activeElements.delete(elementId);
        return;
      }
      
      // Re-render the highlights
      if (data.element instanceof HTMLTextAreaElement || data.element instanceof HTMLInputElement) {
        this.renderTextareaBadge(data.element, data.corrections, data.onApply);
      } else {
        this.renderContentEditableHighlights(data.element, data.corrections, data.onApply);
      }
    });
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    this.shadowRoot.appendChild(style);
  }

  public highlightCorrections(element: HTMLElement, corrections: Correction[], onApply: (c: Correction) => void) {
    const elementId = this.getElementId(element);
    this.clearHighlights(element);
    
    // Also close any open tooltip when clearing/updating highlights
    if (corrections.length === 0) {
      this.closeTooltip();
    }

    // Store the corrections for this element so we can re-render on scroll
    if (corrections.length > 0) {
      this.activeElements.set(elementId, { element, corrections, onApply });
    } else {
      this.activeElements.delete(elementId);
    }

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      this.renderTextareaBadge(element, corrections, onApply);
    } else {
      this.renderContentEditableHighlights(element, corrections, onApply);
    }
  }

  private clearHighlights(element: HTMLElement) {
    const elementId = this.getElementId(element);
    this.shadowRoot.querySelectorAll(`.og-underline[data-element-id="${elementId}"], .og-textarea-badge[data-element-id="${elementId}"]`).forEach(el => el.remove());
  }

  private getElementId(element: HTMLElement): string {
    if (!element.dataset.ogId) {
      element.dataset.ogId = Math.random().toString(36).substr(2, 9);
    }
    return element.dataset.ogId;
  }

  private renderContentEditableHighlights(element: HTMLElement, corrections: Correction[], onApply: (c: Correction) => void) {
    const elementId = this.getElementId(element);

    corrections.forEach(correction => {
      const range = this.getRangeForIndices(element, correction.start, correction.end);
      if (!range) {
        return;
      }

      const rangeRects = Array.from(range.getClientRects());

      rangeRects.forEach((r, i) => {
        if (r.width === 0) return;
        
        const underline = document.createElement('div');
        underline.className = `og-underline og-${correction.type}`;
        underline.dataset.elementId = elementId;
        underline.style.left = `${r.left}px`;
        underline.style.top = `${r.bottom - 2}px`;
        underline.style.width = `${r.width}px`;
        
        // Show tooltip and highlight on hover
        underline.onmouseenter = (e) => {
          e.stopPropagation();
          this.showHighlight(rangeRects);
          this.showTooltip(correction, r.left, r.bottom, onApply);
        };
        
        this.shadowRoot.appendChild(underline);
      });
    });
  }

  private renderTextareaBadge(element: HTMLTextAreaElement | HTMLInputElement, corrections: Correction[], onApply: (c: Correction) => void) {
    const elementId = this.getElementId(element);
    const rect = element.getBoundingClientRect();
    
    if (corrections.length === 0) return;

    const badge = document.createElement('div');
    badge.className = 'og-textarea-badge';
    badge.dataset.elementId = elementId;
    badge.style.left = `${rect.right - 30}px`;
    badge.style.top = `${rect.bottom - 30}px`;
    badge.textContent = corrections.length.toString();
    
    badge.onmouseenter = (e) => {
      e.stopPropagation();
      this.showTooltip(corrections[0], rect.left, rect.bottom, onApply);
    };

    this.shadowRoot.appendChild(badge);
  }

  private getRangeForIndices(element: HTMLElement, start: number, end: number): Range | null {
    const range = document.createRange();
    let charCount = 0;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCount = charCount + (node.textContent?.length || 0);
        if (!startNode && start >= charCount && start < nextCount) {
          startNode = node;
          startOffset = start - charCount;
        }
        if (!endNode && end >= charCount && end <= nextCount) {
          endNode = node;
          endOffset = end - charCount;
        }
        charCount = nextCount;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
          if (endNode) break;
        }
      }
    };

    traverse(element);

    if (startNode && endNode) {
      try {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        return range;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private showTooltip(correction: Correction, x: number, y: number, onApply: (c: Correction) => void) {
    this.closeTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'og-tooltip';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y + 8}px`;

    // Generate title based on correction type
    const title = correction.type === 'spelling' 
      ? 'Use the right word' 
      : correction.type === 'grammar' 
        ? 'Punctuation problem' 
        : correction.explanation || 'Suggestion';

    tooltip.innerHTML = `
      <div class="og-title">${title}</div>
      <div class="og-suggestion">${correction.suggestion}</div>
      <div class="og-dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Dismiss
      </div>
    `;

    tooltip.querySelector('.og-suggestion')?.addEventListener('click', () => {
      onApply(correction);
      this.closeTooltip();
    });

    tooltip.querySelector('.og-dismiss')?.addEventListener('click', () => {
      this.closeTooltip();
    });

    this.shadowRoot.appendChild(tooltip);
    this.currentTooltip = tooltip;

    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      tooltip.style.left = `${window.innerWidth - rect.width - 20}px`;
    }
    if (rect.bottom > window.innerHeight) {
      tooltip.style.top = `${y - rect.height - 8}px`;
    }
  }

  private closeTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
    this.clearHighlight();
  }

  private showHighlight(rects: DOMRect[]) {
    this.clearHighlight();
    
    rects.forEach(r => {
      if (r.width === 0) return;
      
      const highlight = document.createElement('div');
      highlight.className = 'og-highlight';
      highlight.style.left = `${r.left}px`;
      highlight.style.top = `${r.top}px`;
      highlight.style.width = `${r.width}px`;
      highlight.style.height = `${r.height}px`;
      
      this.shadowRoot.appendChild(highlight);
    });
  }

  private clearHighlight() {
    this.shadowRoot.querySelectorAll('.og-highlight').forEach(el => el.remove());
  }

  public showToast(message: string, type: 'error' | 'warning' | 'success' | 'info' = 'info', options?: { action?: string; onAction?: () => void; duration?: number }) {
    // Remove existing toasts
    this.shadowRoot.querySelectorAll('.og-toast').forEach(el => el.remove());

    const toast = document.createElement('div');
    toast.className = `og-toast og-${type}`;

    let html = `<span>${message}</span>`;
    
    if (options?.action && options?.onAction) {
      html += `<button class="og-toast-action">${options.action}</button>`;
    }
    html += `<button class="og-toast-close">×</button>`;
    
    toast.innerHTML = html;

    toast.querySelector('.og-toast-close')?.addEventListener('click', () => {
      toast.remove();
    });

    if (options?.action && options?.onAction) {
      toast.querySelector('.og-toast-action')?.addEventListener('click', () => {
        options.onAction!();
        toast.remove();
      });
    }

    this.shadowRoot.appendChild(toast);

    // Auto-dismiss after duration (default 5s for info, 8s for errors)
    const duration = options?.duration ?? (type === 'error' ? 8000 : 5000);
    if (duration > 0) {
      setTimeout(() => {
        if (this.shadowRoot.contains(toast)) {
          toast.remove();
        }
      }, duration);
    }
  }
}
