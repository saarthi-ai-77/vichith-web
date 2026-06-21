'use client';

import React, { useState } from 'react';

interface Report {
  id: any;
  category: string;
  action_attempted: string;
  what_happened: string;
  expected_behavior: string;
  severity: string;
  app_version: string;
  operating_system: string;
  email?: string;
  attachment_urls: string[];
  created_at: string;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('');
  const [activePasscode, setActivePasscode] = useState(''); // Stores verified passcode for future API calls
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setErrorMsg('');
    setLoading(true);

    try {
      // Call reports API with input passcode in custom header
      const res = await fetch('/api/admin/reports', {
        method: 'GET',
        headers: {
          'x-admin-passcode': passcode
        }
      });

      const data = await res.json();

      if (res.ok && data.reports) {
        setIsAuthenticated(true);
        setActivePasscode(passcode);
        setReports(data.reports);
        if (data.reports.length > 0) {
          setSelectedReport(data.reports[0]);
        }
      } else {
        setErrorMsg(data.error || 'Incorrect passcode. Please try again.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!activePasscode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'GET',
        headers: {
          'x-admin-passcode': activePasscode
        }
      });
      const data = await res.json();
      if (res.ok && data.reports) {
        setReports(data.reports);
        // Retain selection if still in list, otherwise select first
        if (data.reports.length > 0) {
          const stillExists = data.reports.find((r: Report) => r.id === selectedReport?.id);
          if (!stillExists) {
            setSelectedReport(data.reports[0]);
          }
        } else {
          setSelectedReport(null);
        }
      } else {
        setErrorMsg(data.error || 'Failed to sync reports.');
      }
    } catch (err) {
      setErrorMsg('Failed to refresh data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchCat = filterCategory === 'All' || report.category === filterCategory;
    const matchSev = filterSeverity === 'All' || report.severity === filterSeverity;
    return matchCat && matchSev;
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="login-glow"></div>
        <div className="login-card">
          <h2>Vichith Admin Access</h2>
          <p className="login-sub">Enter the administrator passcode to manage beta feedback and crash reports.</p>
          <form onSubmit={handleLogin}>
            {errorMsg && <div className="login-error">{errorMsg}</div>}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                placeholder="Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="form-control"
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                disabled={loading}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Reports ({filteredReports.length})</h3>
          <button onClick={fetchReports} className="refresh-btn" title="Refresh Reports" disabled={loading}>
            {loading ? '...' : '↺'}
          </button>
        </div>
        
        {/* Filters */}
        <div className="admin-filters">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
            <option value="All">All Categories</option>
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

          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="filter-select">
            <option value="All">All Severities</option>
            <option value="Blocker">Blocker</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
            <option value="Polish">Polish</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="admin-reports-list">
          {filteredReports.length === 0 ? (
            <div className="empty-state">No matching reports found.</div>
          ) : (
            filteredReports.map((report, idx) => (
              <div
                key={idx}
                className={`admin-report-item ${selectedReport?.id === report.id ? 'active' : ''}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="item-meta">
                  <span className={`badge-sev ${report.severity.toLowerCase()}`}>{report.severity}</span>
                  <span className="item-date">
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="item-title">{report.category}</div>
                <div className="item-snippet">{report.what_happened}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-main">
        {selectedReport ? (
          <div className="report-detail-view">
            <div className="detail-header">
              <div>
                <span className="detail-category">{selectedReport.category}</span>
                <h2>{selectedReport.what_happened.split('.')[0]}...</h2>
              </div>
              <div className="detail-meta-box">
                <span className={`badge-sev large ${selectedReport.severity.toLowerCase()}`}>
                  {selectedReport.severity}
                </span>
              </div>
            </div>

            <div className="detail-grid-meta">
              <div>
                <strong>Submitted:</strong> {new Date(selectedReport.created_at).toLocaleString()}
              </div>
              <div>
                <strong>App Version:</strong> {selectedReport.app_version}
              </div>
              <div>
                <strong>OS:</strong> {selectedReport.operating_system}
              </div>
              <div>
                <strong>Contact:</strong> {selectedReport.email || 'Anonymous'}
              </div>
            </div>

            <hr className="detail-divider" />

            <div className="detail-section">
              <h4>What happened?</h4>
              <p className="detail-text-block">{selectedReport.what_happened}</p>
            </div>

            {selectedReport.action_attempted && (
              <div className="detail-section">
                <h4>What was the user trying to do?</h4>
                <p className="detail-text-block">{selectedReport.action_attempted}</p>
              </div>
            )}

            {selectedReport.expected_behavior && (
              <div className="detail-section">
                <h4>Expected Outcome</h4>
                <p className="detail-text-block">{selectedReport.expected_behavior}</p>
              </div>
            )}

            {/* Attachments Section */}
            <div className="detail-section">
              <h4>Media & Log Attachments</h4>
              {selectedReport.attachment_urls && selectedReport.attachment_urls.length > 0 ? (
                <div className="detail-attachments-grid">
                  {selectedReport.attachment_urls.map((url, idx) => {
                    const isImage = url.match(/\.(jpeg|jpg|gif|png)/i) || url.includes('screenshot') || url.includes('image');
                    const isVideo = url.match(/\.(mp4|webm|mov)/i) || url.includes('recording') || url.includes('video');
                    const isLog = url.match(/\.(log|txt)/i) || url.includes('crashLog') || url.includes('log');

                    return (
                      <div key={idx} className="attachment-preview-card">
                        <div className="preview-header">
                          Attachment #{idx + 1}
                        </div>
                        <div className="preview-body">
                          {isImage ? (
                            <img src={url} alt="Screenshot" className="preview-media" />
                          ) : isVideo ? (
                            <video src={url} controls className="preview-media" />
                          ) : isLog ? (
                            <div className="log-preview-box">
                              <code>System log attached</code>
                            </div>
                          ) : (
                            <div className="generic-file-box">📎 File Attached</div>
                          )}
                        </div>
                        <div className="preview-actions">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                            Open File
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-attachments">No screenshot, video, or log files attached to this report.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-empty-main">
            <h3>No Report Selected</h3>
            <p>Select a report from the sidebar to inspect logs and attachments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
