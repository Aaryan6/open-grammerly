import { analyzeText } from '../lib/openrouter';
import { getSettings } from '../lib/storage';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeSelection',
    title: 'Analyze with Open Grammarly',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'analyzeSelection' && info.selectionText && tab?.id) {
    try {
      const results = await handleAnalysis(info.selectionText);
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_ANALYSIS_RESULTS',
        data: results
      });
    } catch (err) {
      // Silent fail
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ success: true, message: 'PONG' });
    return;
  }
  if (request.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return;
  }
  if (request.type === 'ANALYZE_TEXT') {
    handleAnalysis(request.text).then(response => {
      sendResponse(response);
    });
    return true; // Keep channel open for async response
  }
});

async function handleAnalysis(text: string) {
  try {
    const settings = await getSettings();
    if (!settings.openRouterKey) {
      return { success: false, error: 'API key not set. Please open extension options and enter your OpenRouter key.' };
    }
    if (!settings.enabled) {
      return { success: false, error: 'Extension is disabled' };
    }
    const results = await analyzeText(text, settings);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
