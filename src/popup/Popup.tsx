import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../lib/storage';
import { Settings as SettingsIcon, Sparkles, Check, AlertTriangle } from 'lucide-react';

const MODEL_NAMES: Record<string, string> = {
  'openai/gpt-oss-safeguard-20b': 'GPT OSS Safeguard',
  'google/gemini-pro': 'Gemini Pro',
  'google/gemini-flash': 'Gemini Flash',
  // Add other mappings as needed
};

export default function Popup() {
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState('');
  const [modelDisplay, setModelDisplay] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      setEnabled(s.enabled);
      const rawModel = s.selectedModel;
      setModel(rawModel);
      
      // Better model name display logic
      if (MODEL_NAMES[rawModel]) {
        setModelDisplay(MODEL_NAMES[rawModel]);
      } else {
        // Fallback: strip prefix and capitalize
        const name = rawModel.split('/').pop() || rawModel;
        setModelDisplay(name.replace(/-/g, ' '));
      }
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
    <div className="popup-container">
      {/* Header */}
      <header className="header animate-in">
        <div className="logo-group">
          <div className="logo-icon">
            <Sparkles size={18} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="brand-name">Open Grammarly</span>
        </div>
        <button onClick={openOptions} className="settings-btn" title="Open Settings">
          <SettingsIcon size={18} />
        </button>
      </header>

      {/* Content */}
      <div className="content">
        {/* Status Row */}
        <div className="status-row animate-in delay-1">
          <div className="status-left">
            <div className={`status-dot ${enabled ? 'active' : ''}`} />
            <span className="status-label">Service Status</span>
          </div>
          <button
            onClick={toggleEnabled}
            className={`toggle ${enabled ? 'active' : ''}`}
            aria-label="Toggle service"
          />
        </div>

        {/* Stats Grid */}
        <div className="stats-grid animate-in delay-2">
          <div className="stat-card">
            <div className="stat-value">85</div>
            <div className="stat-label">Writing Score</div>
          </div>
          <div className="stat-card relative overflow-hidden">
             {/* Gradient overlay for text overflow if needed, or just better CSS */}
            <div className="stat-value small truncate capitalize" title={model}>
              {modelDisplay || 'Not set'}
            </div>
            <div className="stat-label">Current AI</div>
          </div>
        </div>

        {/* Recent Session */}
        <div className="session-section animate-in delay-3">
          <div className="section-title">Recent Session</div>
          <div className="session-list">
            <div className="session-item">
              <div className="session-left">
                <div className="session-icon success">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <span className="session-name">Grammar</span>
              </div>
              <span className="session-count">12 fixes</span>
            </div>
            <div className="session-item">
              <div className="session-left">
                <div className="session-icon warning">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                </div>
                <span className="session-name">Style</span>
              </div>
              <span className="session-count">4 improvements</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button onClick={openOptions} className="btn-primary animate-in delay-4">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
}
