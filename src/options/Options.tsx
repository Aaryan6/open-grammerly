import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../lib/storage';

export default function Options() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      setStatus('Settings saved!');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      setStatus('Error saving settings');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Open Grammarly Settings</h1>
      
      <div className="space-y-6">
        <section className="p-4 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">API Configuration</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              OpenRouter API Key
            </label>
            <input 
              type="password" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="sk-or-v1-..."
              value={settings.openRouterKey}
              onChange={(e) => setSettings({ ...settings, openRouterKey: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your key is stored locally in your browser.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Model
            </label>
            <select 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.selectedModel}
              onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
            >
              <option value="openai/gpt-oss-safeguard-20b">GPT OSS Safeguard 20B</option>
            </select>
          </div>
        </section>

        <section className="p-4 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Writing Preferences</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Writing Mode
            </label>
            <div className="flex gap-2">
              {(['casual', 'professional', 'academic'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSettings({ ...settings, mode: m })}
                  className={`flex-1 py-2 px-4 rounded border capitalize ${
                    settings.mode === m 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Aggressiveness ({settings.aggressiveness})
            </label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              value={settings.aggressiveness}
              onChange={(e) => setSettings({ ...settings, aggressiveness: parseFloat(e.target.value) })}
            />
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
          {status && (
            <span className={`text-sm ${status.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
