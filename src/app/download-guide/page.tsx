'use client';

import React from 'react';

export default function DownloadGuidePage() {
  return (
    <div className="guide-container">
      <div className="guide-bg-glow"></div>
      
      <div className="guide-header">
        <span className="guide-kicker">Installation Support</span>
        <h1>Windows Installation Guide</h1>
        <p>Follow these steps to safely bypass the Windows SmartScreen warning and install the Vichith Beta editor on your system.</p>
      </div>

      <div className="guide-content">
        
        {/* Step-by-Step Guide */}
        <div className="steps-wrapper">
          
          <div className="guide-step-card">
            <div className="step-num-badge">1</div>
            <div className="step-body">
              <h3>Download Vichith</h3>
              <p>Click the download button on the home page or download directly from the link below. The setup installer is distributed as a executable file (`Vichith_0.5.2_x64-setup.exe`).</p>
              <div style={{ marginTop: '1rem' }}>
                <a href="https://github.com/saarthi-ai-77/vichith-updater/releases/download/v0.5.2/Vichith_0.5.2_x64-setup.exe" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  Download Installer (.exe)
                </a>
              </div>
            </div>
          </div>

          <div className="guide-step-card">
            <div className="step-num-badge">2</div>
            <div className="step-body">
              <h3>Open the Installer</h3>
              <p>Locate the downloaded `Vichith_0.5.2_x64-setup.exe` file on your PC (usually in your Downloads folder) and double-click to run it.</p>
            </div>
          </div>

          <div className="guide-step-card">
            <div className="step-num-badge">3</div>
            <div className="step-body">
              <h3>Windows SmartScreen Warning</h3>
              <p>Because this early beta build is not yet code-signed with Microsoft's developer key, Windows Defender SmartScreen may display a blue warning box saying <strong>"Windows protected your PC"</strong>.</p>
              
              {/* Mockup of SmartScreen Dialog */}
              <div className="mock-smartscreen">
                <div className="mock-ss-title">Windows Defender SmartScreen</div>
                <div className="mock-ss-header">Windows protected your PC</div>
                <p className="mock-ss-text">
                  Windows Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC at risk.
                </p>
                <div className="mock-ss-actions">
                  <span className="mock-ss-link active">More info</span>
                </div>
                <div className="mock-ss-buttons">
                  <span className="mock-ss-btn">Don't run</span>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-step-card">
            <div className="step-num-badge">4</div>
            <div className="step-body">
              <h3>Click "More Info"</h3>
              <p>On the blue warning window, click the underlined <strong>"More info"</strong> link at the end of the text paragraph. This will reveal the developer info and the hidden installation actions.</p>
            </div>
          </div>

          <div className="guide-step-card">
            <div className="step-num-badge">5</div>
            <div className="step-body">
              <h3>Click "Run Anyway"</h3>
              <p>Once you click "More info", a new button labeled <strong>"Run anyway"</strong> will appear in the bottom right corner. Click this button to launch the setup installer.</p>
              
              {/* Mockup of SmartScreen Dialog step 2 */}
              <div className="mock-smartscreen">
                <div className="mock-ss-title">Windows Defender SmartScreen</div>
                <div className="mock-ss-header">Windows protected your PC</div>
                <div className="mock-ss-metadata">
                  <div><strong>App:</strong> Vichith_0.5.2_x64-setup.exe</div>
                  <div><strong>Publisher:</strong> Unknown Publisher</div>
                </div>
                <div className="mock-ss-buttons-row">
                  <span className="mock-ss-btn accent">Run anyway</span>
                  <span className="mock-ss-btn">Don't run</span>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-step-card">
            <div className="step-num-badge">6</div>
            <div className="step-body">
              <h3>Launch Vichith</h3>
              <p>The installer will copy the files and add the application to your Desktop. Once complete, Vichith will start automatically and you are ready to begin creating!</p>
            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="guide-faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h4>Why am I seeing a warning?</h4>
            <p>Windows displays the SmartScreen security warning for any downloaded executable file that has not yet built up enough "reputation" in their network. It is standard behavior for all new software files distributed outside the official Microsoft Store.</p>
          </div>

          <div className="faq-item">
            <h4>Why is Vichith unsigned?</h4>
            <p>Establishing digital code signing certificates is an administrative process that takes time for early-stage teams. As we finalize our early beta cycles alongside our community, we will be transitioning to signed installers for future releases.</p>
          </div>

          <div className="faq-item">
            <h4>Will future versions be signed?</h4>
            <p>Yes. Digital certificates and official app store distributions are on our active roadmap as we build out release cycles toward our v1.0 milestone.</p>
          </div>

          <div className="faq-item">
            <h4>How do I know this came from Vichith?</h4>
            <p>We distribute all release builds directly from our official Github repository and website hub. This ensures the integrity of the binary. Never download Vichith from third-party hubs or filesharing sites.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
