import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../lib/storage';
import { Settings as SettingsIcon, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function Popup() {
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      setEnabled(s.enabled);
      setModel(s.selectedModel.split('/').pop() || '');
    });
  }, []);

  const toggleEnabled = async () => {
    const newState = !enabled;
    setEnabled(newState);
    await saveSettings({ enabled: newState });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-80 p-0 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-lg flex items-center gap-2">
          Open Grammarly
        </h1>
        <button onClick={openOptions} className="hover:rotate-45 transition-transform p-1">
          <SettingsIcon size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield size={18} className={enabled ? 'text-green-500' : 'text-gray-400'} />
            <span className="font-medium text-gray-700">Service Status</span>
          </div>
          <button 
            onClick={toggleEnabled}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${
              enabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">85</div>
            <div className="text-[10px] uppercase text-gray-500 font-bold">Writing Score</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-xl font-bold text-purple-600">{model}</div>
            <div className="text-[10px] uppercase text-gray-500 font-bold">Current AI</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Recent Session</h3>
          <div className="flex items-center justify-between text-sm py-1 border-b">
            <span className="text-gray-600 flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Grammar</span>
            <span className="font-bold">12 fixes</span>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-b">
            <span className="text-gray-600 flex items-center gap-1"><AlertCircle size={14} className="text-amber-500"/> Style</span>
            <span className="font-bold">4 improvements</span>
          </div>
        </div>

        <button 
          onClick={openOptions}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors mt-2"
        >
          Detailed Analysis
        </button>
      </div>
    </div>
  );
}
