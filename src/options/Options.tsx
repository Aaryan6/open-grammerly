import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../lib/storage';
import { Settings as SettingsIcon, Save, Key, Cpu, BookOpen, Sliders } from 'lucide-react';

export default function Options() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      // Ensure the selected model is valid/supported
      if (s.selectedModel !== 'openai/gpt-oss-safeguard-20b') {
        s.selectedModel = 'openai/gpt-oss-safeguard-20b';
        saveSettings({ selectedModel: 'openai/gpt-oss-safeguard-20b' });
      }
      setSettings(s);
    });
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Geist']">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 px-8 py-6 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <SettingsIcon className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            </div>
            {status && (
              <div className={`px-4 py-2 rounded-full text-sm font-medium animate-fade-in ${
                status.includes('Error') 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-green-50 text-green-600'
              }`}>
                {status}
              </div>
            )}
          </div>
          
          <div className="p-8 space-y-10">
            {/* API Configuration */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    OpenRouter API Key
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400 font-mono text-sm" 
                      placeholder="sk-or-v1-..."
                      value={settings.openRouterKey}
                      onChange={(e) => setSettings({ ...settings, openRouterKey: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Your key is stored securely in your browser's local storage.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    AI Model
                  </label>
                  <div className="relative">
                    <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-900"
                      value={settings.selectedModel}
                      onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
                    >
                      <option value="openai/gpt-oss-safeguard-20b">GPT OSS Safeguard 20B</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* Writing Preferences */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Writing Preferences</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Writing Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['casual', 'professional', 'academic'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings({ ...settings, mode: m })}
                      className={`
                        relative py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200
                        ${settings.mode === m 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Aggressiveness
                  </label>
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                    {Math.round(settings.aggressiveness * 100)}%
                  </span>
                </div>
                
                <div className="relative py-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={settings.aggressiveness}
                    onChange={(e) => setSettings({ ...settings, aggressiveness: parseFloat(e.target.value) })}
                  />
                  <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all transform active:scale-[0.98] shadow-lg shadow-blue-600/25"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
