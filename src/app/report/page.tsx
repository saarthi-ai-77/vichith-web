'use client';

import React, { useState } from 'react';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    category: 'Bug Report',
    action_attempted: '',
    what_happened: '',
    expected_behavior: '',
    severity: 'Minor',
    app_version: '0.5.0',
    operating_system: 'Windows',
    email: '',
  });

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [recording, setRecording] = useState<File | null>(null);
  const [crashLog, setCrashLog] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'screenshot' | 'recording' | 'crashLog') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'screenshot') setScreenshot(file);
      if (type === 'recording') setRecording(file);
      if (type === 'crashLog') setCrashLog(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.what_happened) {
      setErrorMsg('Please explain what happened.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('category', formData.category);
      fd.append('action_attempted', formData.action_attempted);
      fd.append('what_happened', formData.what_happened);
      fd.append('expected_behavior', formData.expected_behavior);
      fd.append('severity', formData.severity);
      fd.append('app_version', formData.app_version);
      fd.append('operating_system', formData.operating_system);
      fd.append('email', formData.email);

      if (screenshot) fd.append('screenshot', screenshot);
      if (recording) fd.append('recording', recording);
      if (crashLog) fd.append('crashLog', crashLog);

      const res = await fetch('/api/report', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();

      if (res.ok || data.success) {
        setSuccess(true);
        setFormData({
          category: 'Bug Report',
          action_attempted: '',
          what_happened: '',
          expected_behavior: '',
          severity: 'Minor',
          app_version: '0.5.0',
          operating_system: 'Windows',
          email: '',
        });
        setScreenshot(null);
        setRecording(null);
        setCrashLog(null);
      } else {
        setErrorMsg(data.error || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-bg-glow"></div>
      
      <div className="report-header">
        <span className="report-kicker">Beta Launch Hub</span>
        <h1>Report an Issue</h1>
        <p>Help us improve Vichith. Submit bugs, crash logs, or suggest workflow improvements directly to the product team.</p>
        <div style={{ marginTop: '1rem' }}>
          <a href="/known-issues" className="report-link">
            Check Known Issues first &rarr;
          </a>
        </div>
      </div>

      <div className="report-card">
        {success ? (
          <div className="report-success">
            <div className="success-icon">✓</div>
            <h2>Report Submitted</h2>
            <p>Thank you for helping us build Vichith! The engineering team will review your report shortly.</p>
            <button className="btn-primary" onClick={() => setSuccess(false)}>
              Submit Another Issue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form">
            {errorMsg && <div className="error-banner">{errorMsg}</div>}
            
            <div className="form-group">
              <label htmlFor="category">Feedback Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Bug Report">Bug Report</option>
                <option value="General Feedback">General Feedback</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Performance Issue">Performance Issue</option>
                <option value="Workflow Suggestion">Workflow Suggestion</option>
                <option value="UI/UX Feedback">UI/UX Feedback</option>
                <option value="Export Issue">Export Issue</option>
                <option value="Crash Report">Crash Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="action_attempted">What were you trying to do?</label>
              <textarea
                id="action_attempted"
                name="action_attempted"
                placeholder="Describe what you were attempting in the editor (e.g. exporting a 1080p video, importing audio...)"
                value={formData.action_attempted}
                onChange={handleInputChange}
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="what_happened">What actually happened? *</label>
              <textarea
                id="what_happened"
                name="what_happened"
                placeholder="Explain the issue or bug in detail..."
                value={formData.what_happened}
                onChange={handleInputChange}
                className="form-control"
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expected_behavior">What did you expect to happen?</label>
              <textarea
                id="expected_behavior"
                name="expected_behavior"
                placeholder="Explain what the expected outcome was..."
                value={formData.expected_behavior}
                onChange={handleInputChange}
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Issue Severity</label>
              <div className="severity-grid">
                {['Blocker', 'Major', 'Minor', 'Polish'].map((level) => (
                  <label
                    key={level}
                    className={`severity-card ${formData.severity === level ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={level}
                      checked={formData.severity === level}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <span className="severity-dot"></span>
                    <span className="severity-label">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="app_version">App Version</label>
                <input
                  type="text"
                  id="app_version"
                  name="app_version"
                  value={formData.app_version}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="operating_system">Operating System</label>
                <select
                  id="operating_system"
                  name="operating_system"
                  value={formData.operating_system}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Windows">Windows</option>
                  <option value="macOS">macOS</option>
                  <option value="Linux">Linux</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Optional Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com (so we can follow up with you)"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="file-upload-section">
              <div className="file-uploader">
                <span className="file-label">Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'screenshot')}
                  id="screenshot-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="screenshot-input" className="file-upload-btn">
                  {screenshot ? screenshot.name : 'Select Screenshot'}
                </label>
              </div>

              <div className="file-uploader">
                <span className="file-label">Upload Screen Recording</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'recording')}
                  id="recording-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="recording-input" className="file-upload-btn">
                  {recording ? recording.name : 'Select Recording'}
                </label>
              </div>

              <div className="file-uploader">
                <span className="file-label">Upload Crash Log</span>
                <input
                  type="file"
                  accept=".log,.txt"
                  onChange={(e) => handleFileChange(e, 'crashLog')}
                  id="crashlog-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="crashlog-input" className="file-upload-btn">
                  {crashLog ? crashLog.name : 'Select Log File'}
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
              {submitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
