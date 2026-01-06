import { observeDOM, TextField } from './dom-observer';
import { UIInjector } from './ui-injector';
import { Correction } from '../lib/openrouter';

const analyzedFields = new Set<TextField>();
const ui = new UIInjector();

function handleInput(event: Event) {
  const target = event.target as TextField;
  
  // Clear highlights immediately on any input change
  ui.highlightCorrections(target, [], () => {});
  
  analyzeField(target);
}

function handlePaste(event: Event) {
  const target = event.target as TextField;
  
  // Clear highlights and analyze after paste completes
  ui.highlightCorrections(target, [], () => {});
  
  // Small delay to let paste complete
  setTimeout(() => analyzeField(target), 100);
}

function analyzeField(target: TextField) {
  const text = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement 
    ? target.value 
    : (target as HTMLElement).innerText;

  if (text.length < 5) {
    ui.highlightCorrections(target, [], () => {}); // Clear highlights
    return;
  }

  const timeoutId = (target as any)._analysisTimeout;
  if (timeoutId) clearTimeout(timeoutId);

  (target as any)._analysisTimeout = setTimeout(async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      text
    });

    if (response.success) {
      ui.highlightCorrections(target, response.data.corrections, (correction) => {
        applyCorrection(target, correction);
      });
    } else {
      // Show toast notification for errors
      if (response.error?.includes('API key')) {
        ui.showToast('API key not configured', 'error', {
          action: 'Open Settings',
          onAction: () => {
            chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
          }
        });
      } else if (response.error?.includes('disabled')) {
        // Silent - extension is disabled
      } else {
        ui.showToast(`Analysis failed: ${response.error}`, 'error');
      }
    }
  }, 1000);
}

function applyCorrection(target: TextField, correction: Correction) {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    // For input/textarea - use exact position from correction
    const val = target.value;
    const newVal = val.substring(0, correction.start) + correction.suggestion + val.substring(correction.end);
    target.value = newVal;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // For contenteditable - find and replace only the specific text
    try {
      const currentText = target.innerText || target.textContent || '';
      
      // Verify the text at the specified position matches
      const textAtPosition = currentText.substring(correction.start, correction.end);
      
      // Use the exact position from the correction
      let startIndex = correction.start;
      
      // If the text doesn't match at the expected position, try to find it nearby
      if (textAtPosition !== correction.original) {
        const searchStart = Math.max(0, correction.start - 10);
        const searchEnd = Math.min(currentText.length, correction.end + 10);
        const searchArea = currentText.substring(searchStart, searchEnd);
        const foundIndex = searchArea.indexOf(correction.original);
        
        if (foundIndex === -1) {
          return; // Can't find the text
        }
        startIndex = searchStart + foundIndex;
      }
      
      // Use Selection API to select only the specific text and replace it
      // This preserves undo stack better than replacing all content
      const selection = window.getSelection();
      if (!selection) return;
      
      // Find the text node and offset for the correction
      const result = findTextNodeAtPosition(target, startIndex, startIndex + correction.original.length);
      if (!result) return;
      
      const range = document.createRange();
      range.setStart(result.startNode, result.startOffset);
      range.setEnd(result.endNode, result.endOffset);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Use insertText to replace only the selected text (preserves undo)
      document.execCommand('insertText', false, correction.suggestion);
      
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      // Silent fail
    }
  }
  
  // Clear highlights and re-analyze after a short delay
  ui.highlightCorrections(target, [], () => {});
  setTimeout(() => analyzeField(target), 500);
}

// Helper function to find text node at a specific character position
function findTextNodeAtPosition(element: HTMLElement, start: number, end: number): { startNode: Text, startOffset: number, endNode: Text, endOffset: number } | null {
  let charCount = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;
  
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  
  while (node = walker.nextNode() as Text | null) {
    const nodeLength = node.textContent?.length || 0;
    const nextCount = charCount + nodeLength;
    
    if (!startNode && start >= charCount && start < nextCount) {
      startNode = node;
      startOffset = start - charCount;
    }
    
    if (!endNode && end >= charCount && end <= nextCount) {
      endNode = node;
      endOffset = end - charCount;
    }
    
    charCount = nextCount;
    
    if (startNode && endNode) break;
  }
  
  if (startNode && endNode) {
    return { startNode, startOffset, endNode, endOffset };
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_ANALYSIS_RESULTS') {
    if (request.data.success) {
      const focused = document.activeElement as HTMLElement;
      if (focused && (isTextField(focused) || analyzedFields.has(focused as TextField))) {
        ui.highlightCorrections(focused, request.data.data.corrections, (c) => applyCorrection(focused as TextField, c));
      } else {
        const lastField = Array.from(analyzedFields).pop();
        if (lastField) {
          ui.highlightCorrections(lastField, request.data.data.corrections, (c) => applyCorrection(lastField, c));
        }
      }
    }
  }
});

function isTextField(el: Element): el is TextField {
  const name = el.tagName.toLowerCase();
  return name === 'input' || name === 'textarea' || (el as HTMLElement).isContentEditable;
}

observeDOM((el) => {
  if (analyzedFields.has(el)) return;
  
  el.addEventListener('input', handleInput);
  el.addEventListener('paste', handlePaste);
  el.addEventListener('focus', () => analyzeField(el));
  analyzedFields.add(el);
});

// Test connection to background
chrome.runtime.sendMessage({ type: 'PING' }, () => {
  if (chrome.runtime.lastError) {
    // Silent fail
  }
});
