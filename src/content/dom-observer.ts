export type TextField = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

const EXCLUDED_INPUT_TYPES = ['password', 'hidden', 'file', 'checkbox', 'radio', 'submit', 'button', 'image', 'reset', 'color', 'range'];

export function isEditable(element: Element): element is TextField {
  const name = element.tagName.toLowerCase();
  
  if (name === 'input') {
    const inputEl = element as HTMLInputElement;
    const type = (inputEl.type || 'text').toLowerCase();
    // Exclude non-text input types
    if (EXCLUDED_INPUT_TYPES.includes(type)) {
      return false;
    }
    // Also check if it's readonly or disabled
    if (inputEl.readOnly || inputEl.disabled) {
      return false;
    }
    return true;
  }
  
  if (name === 'textarea') {
    const textareaEl = element as HTMLTextAreaElement;
    return !textareaEl.readOnly && !textareaEl.disabled;
  }
  
  return (element as HTMLElement).contentEditable === 'true' || (element as HTMLElement).isContentEditable;
}

export function observeDOM(onAdded: (el: TextField) => void) {
  // Find existing fields
  const selector = 'input, textarea, [contenteditable]';
  const existing = document.querySelectorAll(selector);
  existing.forEach(el => {
    if (isEditable(el)) onAdded(el);
  });

  // Watch for new fields
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        
        if (isEditable(node)) {
          onAdded(node);
        } else {
          const children = node.querySelectorAll(selector);
          children.forEach(el => {
            if (isEditable(el)) onAdded(el);
          });
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}
