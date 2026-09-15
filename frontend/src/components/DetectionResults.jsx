import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, RefreshCw, AlertCircle, Shield, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';

export default function DetectionResults({ campaignId }) {
  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, phishing, legitimate
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDetections();
  }, [campaignId]);

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/campaign/${campaignId}/detections`);
      
      if (response.data.success) {
        setDetections(response.data.detections || []);
        setSummary(response.data.summary || {});
      }
    } catch (err) {
      setError('Failed to load detection results');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDetections();
    setRefreshing(false);
  };

  const filteredDetections = detections.filter(d => {
    if (filter === 'phishing') return d.is_phishing;
    if (filter === 'legitimate') return !d.is_phishing;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-3 text-gray-600">Loading detection results...</p>
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
        <h2 className="text-3xl font-bold text-gray-800">ML Detection Results</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm">Total Analyzed</p>
            <p className="text-3xl font-bold text-blue-600">{summary.total_emails}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm">Flagged as Phishing</p>
            <p className="text-3xl font-bold text-red-600">{summary.detected_as_phishing}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm">Detection Rate</p>
            <p className="text-3xl font-bold text-green-600">{summary.detection_rate?.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({detections.length})
          </button>
          <button
            onClick={() => setFilter('phishing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'phishing'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Phishing ({detections.filter(d => d.is_phishing).length})
          </button>
          <button
            onClick={() => setFilter('legitimate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'legitimate'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Legitimate ({detections.filter(d => !d.is_phishing).length})
          </button>
        </div>

        {filteredDetections.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No emails to display</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Verdict</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Confidence</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetections.map(detection => (
                  <tr key={detection.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {detection.email_id?.slice(0, 12)}...
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {detection.is_phishing ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Phishing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <Shield className="w-3 h-3" />
                          Legitimate
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              detection.confidence_score > 0.6
                                ? 'bg-red-500'
                                : detection.confidence_score > 0.4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${detection.confidence_score * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-800 w-10">
                          {(detection.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {detection.reasons && detection.reasons.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {detection.reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                          {detection.reasons.length > 2 && (
                            <li className="text-gray-500 italic">+{detection.reasons.length - 2} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-gray-500">—</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How This Works:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Each email is analyzed with 15 ML features (sender, URLs, keywords, HTML, etc.)</li>
          <li>scikit-learn RandomForest classifier predicts: phishing or legitimate</li>
          <li>Confidence score (0-100%) shows model certainty</li>
          <li>Reasons explain why email was flagged</li>
          <li>Compare with campaign success rate to measure detection effectiveness</li>
        </ol>
      </div>
    </div>
  );
}
