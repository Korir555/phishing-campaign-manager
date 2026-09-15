import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';

export default function CampaignForm({ onCampaignCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject_line: '',
    email_body: '',
    payload_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [campaignId, setCampaignId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/campaign/create`, form);
      
      if (response.data.success) {
        setCampaignId(response.data.campaign_id);
        setSuccess(`Campaign created successfully! ID: ${response.data.campaign_id}`);
        setForm({
          name: '',
          description: '',
          subject_line: '',
          email_body: '',
          payload_url: ''
        });
        
        if (onCampaignCreated) {
          onCampaignCreated(response.data.campaign_id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">Create Phishing Campaign</h2>
      <p className="text-gray-600 mb-6">Set up a new phishing campaign for testing</p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">{success}</p>
            {campaignId && (
              <p className="text-sm text-green-800 mt-1">
                Copy this ID to send the campaign: <code className="bg-green-100 px-2 py-1 rounded">{campaignId}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-900">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Security Awareness Test Q3"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the campaign..."
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject Line
          </label>
          <input
            type="text"
            name="subject_line"
            value={form.subject_line}
            onChange={handleChange}
            placeholder="e.g., Urgent: Update Your Password Immediately"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Tip: Use urgency and action words for higher click rates</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <textarea
            name="email_body"
            value={form.email_body}
            onChange={handleChange}
            placeholder="Dear [Recipient],&#10;&#10;We have detected suspicious activity on your account. Click below to verify your identity..."
            rows="5"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Include a call-to-action link pointing to your payload URL</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payload URL
          </label>
          <input
            type="url"
            name="payload_url"
            value={form.payload_url}
            onChange={handleChange}
            placeholder="http://localhost:5014/phish/land"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">URL where users will be redirected when they click the link</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating Campaign...' : 'Create Campaign'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Copy the Campaign ID from the success message above</li>
          <li>Go to "Send Campaign" tab to select targets</li>
          <li>Monitor results in the "Dashboard" tab</li>
          <li>View detection results in "Detection Analysis"</li>
        </ol>
      </div>
    </div>
  );
}
