'use client';

import React, { useState } from 'react';
import { Nav } from '@/components/site/Nav';
import { SiteFooter } from '@/components/site/Footer';

const inputClass =
  'w-full rounded-lg border border-line bg-black/20 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-dim focus:border-accent/50';
const labelClass = 'mb-1.5 block text-xs font-medium text-dim';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    category: 'Bug Report',
    action_attempted: '',
    what_happened: '',
    expected_behavior: '',
    severity: 'Minor',
    app_version: '',
    operating_system: 'Windows',
    email: '',
  });

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [recording, setRecording] = useState<File | null>(null);
  const [crashLog, setCrashLog] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'screenshot' | 'recording' | 'crashLog'
  ) => {
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
        body: fd,
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
          app_version: '',
          operating_system: 'Windows',
          email: '',
        });
        setScreenshot(null);
        setRecording(null);
        setCrashLog(null);
      } else {
        setErrorMsg(data.error || 'Failed to submit report. Please try again.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-background">
      <Nav />
      <div className="grid-field pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] opacity-40" />

      <main className="mx-auto max-w-2xl px-6 pb-28 pt-40 md:px-10">
        <span className="eyebrow">Beta launch hub</span>
        <h1 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.03em] md:text-5xl">
          Report an issue
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-dim">
          Help us improve Vichith. Submit bugs, crash logs, or suggest workflow improvements
          directly to the product team.
        </p>
        <div className="panel mt-12 p-6 md:p-8">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-2xl text-accent">
                ✓
              </div>
              <h2 className="mt-5 text-xl font-medium">Report submitted</h2>
              <p className="mt-2 text-sm text-dim">
                Thank you for helping us build Vichith! The engineering team will review your
                report shortly.
              </p>
              <button
                className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground"
                onClick={() => setSuccess(false)}
              >
                Submit another issue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {errorMsg && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className={labelClass} htmlFor="category">
                  Feedback category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputClass}
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

              <div>
                <label className={labelClass} htmlFor="action_attempted">
                  What were you trying to do?
                </label>
                <textarea
                  id="action_attempted"
                  name="action_attempted"
                  placeholder="Describe what you were attempting in the editor (e.g. exporting a 1080p video, importing audio...)"
                  value={formData.action_attempted}
                  onChange={handleInputChange}
                  className={inputClass}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="what_happened">
                  What actually happened? *
                </label>
                <textarea
                  id="what_happened"
                  name="what_happened"
                  placeholder="Explain the issue or bug in detail..."
                  value={formData.what_happened}
                  onChange={handleInputChange}
                  className={inputClass}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="expected_behavior">
                  What did you expect to happen?
                </label>
                <textarea
                  id="expected_behavior"
                  name="expected_behavior"
                  placeholder="Explain what the expected outcome was..."
                  value={formData.expected_behavior}
                  onChange={handleInputChange}
                  className={inputClass}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelClass}>Issue severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Blocker', 'Major', 'Minor', 'Polish'].map((level) => (
                    <label
                      key={level}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs transition-colors ${
                        formData.severity === level
                          ? 'border-accent/50 bg-accent/10 text-foreground'
                          : 'border-line text-dim hover:text-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={level}
                        checked={formData.severity === level}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="app_version">
                    App version
                  </label>
                  <input
                    type="text"
                    id="app_version"
                    name="app_version"
                    value={formData.app_version}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="operating_system">
                    Operating system
                  </label>
                  <select
                    id="operating_system"
                    name="operating_system"
                    value={formData.operating_system}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="Windows">Windows</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Optional email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com (so we can follow up with you)"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FileField
                  label="Screenshot"
                  accept="image/*"
                  file={screenshot}
                  id="screenshot-input"
                  onChange={(e) => handleFileChange(e, 'screenshot')}
                />
                <FileField
                  label="Screen recording"
                  accept="video/*"
                  file={recording}
                  id="recording-input"
                  onChange={(e) => handleFileChange(e, 'recording')}
                />
                <FileField
                  label="Crash log"
                  accept=".log,.txt"
                  file={crashLog}
                  id="crashlog-input"
                  onChange={(e) => handleFileChange(e, 'crashLog')}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Submitting report…' : 'Submit report'}
              </button>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FileField({
  label,
  accept,
  file,
  id,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <input type="file" accept={accept} onChange={onChange} id={id} className="hidden" />
      <label
        htmlFor={id}
        className="block cursor-pointer truncate rounded-lg border border-dashed border-line px-3 py-2.5 text-center text-xs text-dim transition-colors hover:border-accent/40 hover:text-foreground"
      >
        {file ? file.name : 'Select file'}
      </label>
    </div>
  );
}
