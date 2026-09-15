import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';

export default function CampaignList({ onSelectCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/campaigns`);
      if (response.data.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (err) {
      setError('Failed to load campaigns');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-3 text-gray-600">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Campaigns</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No campaigns yet.</p>
          <p className="text-gray-500 text-sm mt-2">Create one in the "Create Campaign" tab to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">ID: <code className="bg-gray-100 px-2 py-1 rounded">{campaign.id.slice(0, 8)}...</code></span>
                    <span className={`font-semibold ${
                      campaign.status === 'sent' ? 'text-green-600' :
                      campaign.status === 'draft' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-800">{campaign.metrics.sent}</p>
                  <p className="text-xs text-gray-600">Sent</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-2xl font-bold text-blue-600">{campaign.metrics.opened}</p>
                  <p className="text-xs text-gray-600">{campaign.metrics.opened_rate.toFixed(1)}% Opened</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <p className="text-2xl font-bold text-orange-600">{campaign.metrics.clicked}</p>
                  <p className="text-xs text-gray-600">{campaign.metrics.click_rate.toFixed(1)}% Clicked</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <p className="text-2xl font-bold text-red-600">{campaign.metrics.credentials_captured}</p>
                  <p className="text-xs text-gray-600">{campaign.metrics.success_rate.toFixed(1)}% Success</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectCampaign(campaign.id, 'metrics')}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                >
                  View Metrics
                </button>
                <button
                  onClick={() => onSelectCampaign(campaign.id, 'detections')}
                  className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-colors"
                >
                  Detection Results
                </button>
                <button
                  onClick={() => onSelectCampaign(campaign.id, 'timeline')}
                  className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                >
                  Timeline
                </button>
              </div>

              {campaign.created_at && (
                <p className="text-xs text-gray-400 mt-3">
                  Created: {new Date(campaign.created_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
