import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, RefreshCw, Send, Mouse, Shield, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';

export default function TimelineView({ campaignId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [campaignId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/timeline?campaign_id=${campaignId}`);
      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (err) {
      setError('Failed to load timeline');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'sent':
        return <Send className="w-5 h-5 text-blue-600" />;
      case 'clicked':
        return <Mouse className="w-5 h-5 text-orange-600" />;
      case 'detected':
        return <Shield className="w-5 h-5 text-green-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'sent':
        return 'bg-blue-100 border-blue-300';
      case 'clicked':
        return 'bg-orange-100 border-orange-300';
      case 'detected':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'sent':
        return 'Email Sent';
      case 'clicked':
        return 'Link Clicked';
      case 'detected':
        return 'Phishing Detected';
      default:
        return 'Event';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-3 text-gray-600">Loading timeline...</p>
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
        <h2 className="text-3xl font-bold text-gray-800">Campaign Timeline</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No events yet. Send the campaign to populate this timeline.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-300" />

          {/* Events */}
          <div className="space-y-6 pl-24">
            {events.map((event, idx) => (
              <div key={idx} className="relative">
                {/* Icon circle on timeline */}
                <div className="absolute -left-20 top-2 w-12 h-12 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
                  {getIcon(event.type)}
                </div>

                {/* Event card */}
                <div className={`p-4 rounded-lg border-2 ${getColor(event.type)} bg-white`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{getLabel(event.type)}</h4>
                      {event.email && (
                        <p className="text-sm text-gray-600 mt-1">
                          Email: <code className="bg-gray-100 px-2 py-1 rounded">{event.email}</code>
                        </p>
                      )}
                    </div>
                    {event.timestamp && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700">{event.description}</p>

                  {event.confidence && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600">Confidence: <span className="font-bold">{(event.confidence * 100).toFixed(0)}%</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Timeline Legend:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Email sent to target</span>
          </div>
          <div className="flex items-center gap-2">
            <Mouse className="w-5 h-5 text-orange-600" />
            <span>Target clicked link</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>ML detector flagged email</span>
          </div>
        </div>
      </div>
    </div>
  );
}
