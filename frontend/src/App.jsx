import React, { useState } from 'react';
import CampaignForm from './components/CampaignForm';
import CampaignList from './components/CampaignList';
import SendCampaign from './components/SendCampaign';
import DetectionResults from './components/DetectionResults';
import MetricsDashboard from './components/MetricsDashboard';
import TimelineView from './components/TimelineView';
import { AlertCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedView, setSelectedView] = useState(null);

  const handleSelectCampaign = (campaignId, view) => {
    setSelectedCampaignId(campaignId);
    setSelectedView(view);
    
    // Navigate to appropriate tab
    if (view === 'metrics') {
      setActiveTab('metrics');
    } else if (view === 'detections') {
      setActiveTab('detections');
    } else if (view === 'timeline') {
      setActiveTab('timeline');
    }
  };

  const handleCampaignCreated = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setActiveTab('send');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            🎯 Phishing Campaign Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Attack & Defense Simulation with ML Detection
          </p>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b-2 border-yellow-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>Educational Use Only:</strong> This tool simulates phishing attacks for authorized security training and testing. Never use against systems without explicit permission.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Campaigns
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ➕ Create Campaign
            </button>
            {selectedCampaignId && (
              <>
                <button
                  onClick={() => setActiveTab('send')}
                  className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'send'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🚀 Send Campaign
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'metrics'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Metrics
                </button>
                <button
                  onClick={() => setActiveTab('detections')}
                  className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'detections'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🛡️ Detection Results
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-4 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'timeline'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⏱️ Timeline
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'campaigns' && (
          <CampaignList onSelectCampaign={handleSelectCampaign} />
        )}

        {activeTab === 'create' && (
          <CampaignForm onCampaignCreated={handleCampaignCreated} />
        )}

        {activeTab === 'send' && selectedCampaignId && (
          <SendCampaign 
            campaignId={selectedCampaignId}
            onSent={() => {
              setActiveTab('metrics');
            }}
          />
        )}

        {activeTab === 'metrics' && selectedCampaignId && (
          <MetricsDashboard campaignId={selectedCampaignId} />
        )}

        {activeTab === 'detections' && selectedCampaignId && (
          <DetectionResults campaignId={selectedCampaignId} />
        )}

        {activeTab === 'timeline' && selectedCampaignId && (
          <TimelineView campaignId={selectedCampaignId} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          <p>Phishing Campaign Manager v0.1.0</p>
          <p className="mt-2">
            Built with Flask Backend + React Frontend + ML Detection (scikit-learn)
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Backend: http://localhost:5014 | Frontend: http://localhost:5173
          </p>
        </div>
      </footer>
    </div>
  );
}
