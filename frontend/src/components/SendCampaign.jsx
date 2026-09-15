import React, { useState } from 'react';
import axios from 'axios';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5014/api';

export default function SendCampaign({ campaignId, onSent }) {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setEmails(e.target.value);
  };

  const parseEmails = (text) => {
    return text
      .split(/[\n,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const targetEmails = parseEmails(emails);

    if (targetEmails.length === 0) {
      setError('No valid emails found. Please enter email addresses separated by newlines or commas.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        `${API_URL}/campaign/${campaignId}/send`,
        { target_emails: targetEmails }
      );

      if (response.data.success) {
        setSuccess(`Campaign sent to ${response.data.emails_sent} recipients! ML detector is analyzing...`);
        setEmails('');
        if (onSent) {
          onSent();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send campaign');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const emailList = parseEmails(emails);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">Send Campaign</h2>
      <p className="text-gray-600 mb-6">Campaign ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{campaignId}</code></p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">{success}</p>
            <p className="text-sm text-green-800 mt-1">
              The ML detector is now analyzing each email. Check "Detection Results" tab to see flags and confidence scores.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-900">{error}</p>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Email Addresses
          </label>
          <textarea
            value={emails}
            onChange={handleChange}
            placeholder="Enter email addresses (one per line or comma/semicolon separated):&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
            rows="8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supports: newlines, commas, semicolons. Will validate email format automatically.
          </p>
        </div>

        {emailList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-2">
              {emailList.length} valid email{emailList.length !== 1 ? 's' : ''} detected:
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {emailList.map((email, idx) => (
                <div key={idx} className="text-xs text-blue-800 bg-white p-2 rounded border border-blue-100">
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || emailList.length === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            loading || emailList.length === 0
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : `Send to ${emailList.length} recipient${emailList.length !== 1 ? 's' : ''}`}
        </button>
      </form>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Only use this for authorized testing (security awareness training, penetration testing with permission)</li>
          <li>Emails are simulated — no actual emails sent to real mailboxes</li>
          <li>ML detector runs on campaign send for immediate analysis</li>
          <li>Click "Detection Results" to see how many emails were flagged</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What Happens Next:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Campaign is sent to all email addresses</li>
          <li>ML detector analyzes each email (extracting 15 features)</li>
          <li>Confidence scores calculated (0-100%)</li>
          <li>Emails flagged as phishing or legitimate</li>
          <li>View results in "Detection Results" tab</li>
          <li>Compare: attack success vs detection accuracy</li>
        </ol>
      </div>
    </div>
  );
}
