export interface Settings {
  openRouterKey: string;
  selectedModel: string;
  enabled: boolean;
  aggressiveness: number;
  mode: 'casual' | 'professional' | 'academic';
}

export const DEFAULT_SETTINGS: Settings = {
  openRouterKey: '',
  selectedModel: 'openai/gpt-oss-safeguard-20b',
  enabled: true,
  aggressiveness: 0.5,
  mode: 'professional',
};

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings');
  const storedSettings = result.settings || {};
  return { ...DEFAULT_SETTINGS, ...storedSettings };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    settings: { ...current, ...settings },
  });
}
