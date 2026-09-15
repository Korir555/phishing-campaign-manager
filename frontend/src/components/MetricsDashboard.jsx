import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';
const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

export default function MetricsDashboard({ campaignId }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [campaignId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/campaign/${campaignId}/metrics`);
      if (response.data.success) {
        setMetrics(response.data.metrics);
      }
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-3 text-gray-600">Loading metrics...</p>
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

  if (!metrics) {
    return <p className="text-gray-500">No metrics available</p>;
  }

  const chartData = [
    { name: 'Sent', value: metrics.sent },
    { name: 'Opened', value: metrics.opened },
    { name: 'Clicked', value: metrics.clicked },
    { name: 'Captured', value: metrics.credentials_captured }
  ];

  const pieData = [
    { name: 'Unopened', value: metrics.sent - metrics.opened },
    { name: 'Opened', value: metrics.opened - metrics.clicked },
    { name: 'Clicked', value: metrics.clicked - metrics.credentials_captured },
    { name: 'Captured', value: metrics.credentials_captured }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Campaign Metrics</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm">Total Sent</p>
          <p className="text-3xl font-bold text-blue-600">{metrics.sent}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm">Opened</p>
          <p className="text-3xl font-bold text-green-600">{metrics.opened}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.opened_rate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm">Clicked</p>
          <p className="text-3xl font-bold text-orange-600">{metrics.clicked}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.click_rate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <p className="text-gray-600 text-sm">Captured</p>
          <p className="text-3xl font-bold text-red-600">{metrics.credentials_captured}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.success_rate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Funnel Progression</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Conversion Rates</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Open Rate</span>
              <span className="text-sm font-bold text-gray-900">{metrics.opened_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${Math.min(metrics.opened_rate, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Click Rate</span>
              <span className="text-sm font-bold text-gray-900">{metrics.click_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full"
                style={{ width: `${Math.min(metrics.click_rate, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Success Rate (Credentials Captured)</span>
              <span className="text-sm font-bold text-gray-900">{metrics.success_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{ width: `${Math.min(metrics.success_rate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Campaign Performance:</h3>
        <p className="text-sm text-blue-800">
          This campaign achieved a {metrics.success_rate.toFixed(1)}% success rate ({metrics.credentials_captured} out of {metrics.sent} targets).
          Compare this with the ML detection rate to see how effectively your defense detected phishing attacks.
        </p>
      </div>
    </div>
  );
}
