'use client';

import React from 'react';

export default function ChangelogPage() {
  return (
    <div className="changelog-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', color: 'var(--text)' }}>
      <div className="changelog-bg-glow"></div>
      
      <div className="changelog-header" style={{ marginBottom: '3rem' }}>
        <span className="changelog-kicker" style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Releases & Updates</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>Product Changelog</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1rem', marginTop: '0.5rem' }}>All notable changes to Vichith are documented here. This project is in beta.</p>
      </div>
      <div className="changelog-entry" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>[0.5.2]</h2>
          <span style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>2026-06-30</span>
        </div>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '2rem' }}>
          A critical stability hotfix addressing startup issues on clean installations, alongside refinements to the AI background removal workflow.
        </p>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🐛 Fixed</h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li><strong>Startup Crash on Clean Installations</strong> — Resolved a critical pathing/dependency issue that caused the application to crash on launch on fresh devices where Vichith had not been previously installed.</li>
          <li><strong>AI Background Removal Logic & Types</strong> — Fixed frontend TypeScript compiler issues in the Inspector and Timeline context menus. Resolves property mapping, type safety in media item lookup, and ensures correct microsecond unit conversions during clip insertion.</li>
          <li><strong>Audio-Detaching on Background Removal</strong> — Restructured the background removal sequence so that clips containing audio tracks will correctly split and detach their audio onto a new timeline track.</li>
          <li><strong>Video Playback & Letterboxing</strong> — Fixed an issue where the base video layer was being letterboxed during playback and aggressive scrubbing. The renderer now properly enforces a <code>Fill</code> fitting mode for the base layer, and FFmpeg seek arguments were optimized for smoother scrubbing.</li>
          <li><strong>Timeline UI Stability</strong> — Fixed a visual bug where toggling the Chitra mascot could cause timeline tracks to disappear or overlap with toolbar undo/redo buttons.</li>
        </ul>

        <div style={{ marginTop: '2rem' }}>
          <a href="https://vichith.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            [0.5.2] Release Details
          </a>
        </div>
      </div>

      <div className="changelog-entry" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>[0.5.1]</h2>
          <span style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>2026-06-25</span>
        </div>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '2rem' }}>
          A big update focused on <strong>captions, the timeline, AI tools, and asset organization</strong>.
        </p>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✨ New</h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>Chitra AI Co-Pilot</strong> — your personal, in-editor AI assistant is now live!
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Bring Your Own Key (BYOK)</strong> — click the ⚙️ icon in Chitra's dock to securely add your own Groq API key. Your key is stored locally in your browser, keeping your data private and giving you full control over your AI usage.</li>
              <li><strong>Natural Language Editing</strong> — type or speak commands to Chitra (e.g., <em>"generate captions"</em>, <em>"split this clip"</em>, or <em>"remove silence"</em>). She understands your intent and executes timeline actions directly.</li>
              <li><strong>Seamless Onboarding</strong> — if you try to use Chitra without an API key, she'll guide you straight to the settings with a link to get a free key from Groq.</li>
              <li><em>Note: The AI agent is currently in an early preview state. It is constantly learning and will be developed further to handle more complex editing tasks. Test it out and let us know what features or commands you'd like to see improved!</em></li>
            </ul>
          </li>
          <li>
            <strong>AI Voiceover</strong> — a new mic button on the timeline bar opens a Voiceover panel that does both:
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Record</strong> your own voice (with live timer + preview), or</li>
              <li><strong>Generate with AI</strong> — paste a script, pick from 12 voices, and Groq TTS creates the audio.</li>
              <li>Generated/recorded audio drops onto an Audio track right after your last clip (a new track is made if needed), so longer scripts can be built up <strong>batch-wise</strong>.</li>
            </ul>
          </li>
          <li><strong>Background removal that works</strong> — one-click AI subject cut-out for images (no green screen). The model now ships inside the app and runs on ONNX Runtime. <strong>Chroma Key</strong> is enabled too.</li>
          <li><strong>Multilingual & code-switch captions</strong> — captions now render Hindi, Tamil, Telugu, Bengali, Arabic, CJK, and mixed-language lines (e.g. <strong>Hinglish</strong>) with the right fonts instead of tofu boxes.</li>
          <li><strong>Caption styles & export</strong> — switch any caption between <strong>Word</strong>, <strong>Line</strong>, and <strong>Karaoke</strong> display, and <strong>export/import SRT & VTT</strong> subtitle files. New creator presets (Hormozi, Neon, TikTok).</li>
          <li><strong>Auto-caption options</strong> — language picker (incl. auto-detect for code-switching) and <strong>Translate-to-English</strong> when generating captions. The Captions tab is now live.</li>
          <li><strong>Asset organization</strong> — the Media & Audio browsers gain <strong>Folders</strong> (create bins like "B-rolls"), <strong>smart shelves</strong> (All · Recent · Favorites · Unused · On timeline), <strong>color labels</strong>, <strong>favorites</strong>, and a <strong>usage badge</strong> showing how many times each asset is on the timeline.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 Improved</h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>Pro timeline editing</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Magnetic, non-destructive drag</strong> — dropping a clip over another snaps it beside instead of trimming it.</li>
              <li><strong>Multi-clip moves</strong> are now atomic — the whole selection lands together without colliding.</li>
              <li><strong>Cross-track dragging</strong> works reliably.</li>
              <li><strong>Trim to playhead</strong> (start <code>Q</code> / end <code>W</code>), plus toolbar buttons and a richer right-click menu.</li>
              <li><strong>More shortcuts</strong>: zoom in/out/fit, frame-step, Home/End, nudge clip, ripple delete, duplicate.</li>
            </ul>
          </li>
          <li><strong>Animations</strong> — set <strong>separate In and Out</strong> presets per clip (e.g. fade in, slide out) instead of one for both.</li>
          <li><strong>Timeline zoom & scroll</strong> — mouse wheel zooms; on a trackpad, two-finger scroll pans (both axes) and pinch zooms.</li>
          <li><strong>Modern value sliders</strong> throughout the inspector — bigger, easier-to-grab handles.</li>
          <li>The right-click menu always stays on-screen.</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🐛 Fixed</h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li><strong>Captions were stuck on the first word</strong> during playback — they now advance correctly.</li>
          <li><strong>Double-clicking a caption clip</strong> now opens its word editor.</li>
          <li><strong>Overwrite drag no longer destroys clips</strong>, and <strong>undo fully restores</strong> anything a drag trimmed.</li>
          <li><strong>Waveforms</strong> now generate for files the previous decoder couldn't read (e.g. some phone/WhatsApp MP4s), and the repeated-failure retry storm is gone.</li>
          <li><strong>Chitra</strong> sticks to its spot on the timeline when you resize, and no longer appears where it shouldn't.</li>
          <li>Fixed caption-generation errors (clip timing units, Groq translate request).</li>
          <li>Removed the non-functional <strong>Record</strong> button from the Media/Audio browsers and the unused <strong>Stickers</strong> tab.</li>
        </ul>

        <div style={{ marginTop: '2rem' }}>
          <a href="https://vichith.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            [0.5.1] Release Details
          </a>
        </div>
      </div>
    </div>
  );
}
