"use client";

import { useState, useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { SECTION_IDS } from "@/lib/spatial";
import {
  IconPlay,
  IconPause,
  IconFilm,
  IconAperture,
  IconTypography,
  IconWaveform,
  IconFrame916,
  IconFrame169,
} from "@/components/site/icons/CreativeIcons";

const STEPS = [
  { id: 0, title: "01. Raw Footage", desc: "Single continuous recording without edit or pacing.", timecode: "00:00:01:00" },
  { id: 1, title: "02. Peak Moment", desc: "Chithra identifies emotional anchor point at 00:04:18.", timecode: "00:00:02:00" },
  { id: 2, title: "03. Timeline Splits", desc: "Silence stripped, handles trimmed, multi-segment edit formed.", timecode: "00:00:03:00" },
  { id: 3, title: "04. B-Roll Layer", desc: "Supplementary macro cutaway injected into Track V2.", timecode: "00:00:04:00" },
  { id: 4, title: "05. Dynamic Captions", desc: "Word-by-word vector RSVP subtitle layer bound to Track C1.", timecode: "00:00:05:00" },
  { id: 5, title: "06. 9:16 Reframe", desc: "Subject tracked and cropped into safe social portrait frame.", timecode: "00:00:06:00" },
  { id: 6, title: "07. Master Cut", desc: "Audio ducking synced with broadcast cinematic color pass.", timecode: "00:00:07:00" },
];

export function Section04IntentToVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const stepCount = STEPS.length;
    const newStep = Math.min(stepCount - 1, Math.max(0, Math.floor(latest * stepCount)));
    setCurrentStep(newStep);
  });

  useEffect(() => {
    const initialStep = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(scrollYProgress.get() * STEPS.length))
    );
    setCurrentStep(initialStep);
  }, [scrollYProgress]);

  // Sync video time with corresponding second (second 1 to second 7)
  useEffect(() => {
    if (videoRef.current) {
      const targetTime = currentStep + 1;
      if (Number.isFinite(videoRef.current.duration) && targetTime <= videoRef.current.duration) {
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.4) {
          videoRef.current.currentTime = targetTime;
        }
      }
    }
  }, [currentStep]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id={SECTION_IDS.intent}
      ref={containerRef}
      className="relative w-full h-[250vh] bg-[#070709] border-t border-white/[0.05]"
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full my-auto">
          
          {/* Section Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-2 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">
              04 / Intent into Video
            </span>
          </div>

          {/* Section Headline */}
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight text-center">
            One thought becoming <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/85">a finished video.</span>
          </h2>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/50 font-normal max-w-md text-center leading-relaxed text-balance">
            Scroll to watch raw footage progressively synthesize into a broadcast cut.
          </p>

          {/* The Professional Studio Console */}
          <div className="w-full mt-4 sm:mt-5 rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            
            {/* Step Scrubber Navigation Bar */}
            <div className="px-4 py-2.5 sm:py-3 border-b border-white/[0.06] bg-black/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2 font-mono text-xs text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" />
                  <span className="font-semibold">{STEPS[currentStep].title}</span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-white/40">
                  {STEPS[currentStep].desc}
                </span>
              </div>

              {/* Scrubber bar with animated progress fill and playhead thumb */}
              <div className="relative flex items-center h-3 my-0.5">
                <div className="w-full h-1 bg-white/[0.1] rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)] transition-all duration-150"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Glowing playhead thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-accent drop-shadow-[0_0_8px_rgba(54,226,206,0.8)] border border-black pointer-events-none transition-all duration-150"
                  style={{ left: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />

                {/* Range input for interactive drag/click */}
                <input
                  type="range"
                  min={0}
                  max={STEPS.length - 1}
                  value={currentStep}
                  onChange={(e) => setCurrentStep(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Step Tick Marks */}
              <div className="flex justify-between items-center mt-0.5 px-0.5">
                {STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`font-mono text-[9px] sm:text-[10px] transition-all duration-200 ${
                      currentStep === idx
                        ? "text-accent font-bold scale-110 drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]"
                        : currentStep > idx
                        ? "text-white/60 hover:text-white"
                        : "text-white/20 hover:text-white/60"
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Monitor Viewport */}
            <div className="p-3 sm:p-4 bg-[#09090c]">
              <div className="relative aspect-[16/9] w-full max-w-lg md:max-w-xl max-h-[30vh] sm:max-h-[33vh] mx-auto rounded-xl overflow-hidden bg-black border border-white/[0.1] shadow-2xl">
                
                <video
                  ref={videoRef}
                  src="/Cinematic.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/shot.jpg"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover"
                />

                {/* Minimal HUD */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/[0.08] flex items-center gap-1.5 z-20">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStep >= 1 ? "bg-accent drop-shadow-[0_0_6px_rgba(54,226,206,0.6)]" : "bg-white/40"}`} />
                  <span>{currentStep === 0 ? "RAW CAPTURE · 24fps" : `ACTIVE TIMELINE · 0${currentStep + 1}`}</span>
                </div>

                {/* Step 1+: Peak Moment Anchor */}
                {currentStep >= 1 && currentStep < 5 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 border border-accent/40 w-36 sm:w-40 h-20 sm:h-24 rounded flex items-center justify-center">
                    <span className="font-mono text-[9px] text-accent bg-black/80 px-2 py-0.5 rounded border border-accent/20">
                      Anchor: 00:04:18
                    </span>
                  </div>
                )}

                {/* Step 3+: B-Roll Badge */}
                {currentStep >= 3 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[9px] z-20 border border-white/20 backdrop-blur-md">
                    Track V2 · B-Roll
                  </div>
                )}

                {/* Step 5+: 9:16 Reframe Overlay */}
                {currentStep >= 5 && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-black/75 backdrop-blur-[1px] z-10" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[9/16] border-x border-white/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden z-20 flex flex-col justify-between p-2">
                      <div className="self-center">
                        <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white text-[8px] font-mono">
                          9:16 Safe Frame
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4+: Word-by-word Caption Layer */}
                {currentStep >= 4 && (
                  <div className="absolute bottom-8 inset-x-0 flex justify-center z-30 pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded bg-black/85 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-white tracking-wide uppercase shadow-lg border border-white/15">
                      The Creator Keeps The Craft
                    </span>
                  </div>
                )}

                {/* Sleek Transport Bar with Vector Icons */}
                <div className="absolute bottom-2 inset-x-2 h-7 px-2.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/[0.08] flex items-center justify-between z-30 text-xs font-mono">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                  >
                    {isPlaying ? <IconPause size={10} /> : <IconPlay size={10} />}
                    <span className="text-white/50 text-[10px]">
                      {STEPS[currentStep].timecode}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-[9px] text-white/40">
                    <span className="flex items-center gap-1">
                      {currentStep >= 5 ? <IconFrame916 size={10} /> : <IconFrame169 size={10} />}
                      <span>{currentStep >= 5 ? "1080×1920" : "3840×2160"}</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Clean Monochromatic Multi-Track Timeline */}
              <div className="mt-2.5 max-w-lg md:max-w-xl mx-auto space-y-1 font-mono text-[9px]">
                {/* Track V2 */}
                <div className="h-5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/30 w-5 flex items-center gap-1">
                    <IconAperture size={9} />
                    <span>V2</span>
                  </span>
                  {currentStep >= 3 ? (
                    <div className="h-3.5 bg-white/[0.08] border border-white/[0.15] rounded px-1.5 flex items-center text-white/90 text-[8px]">
                      sunrise_flare.mp4 [synced]
                    </div>
                  ) : (
                    <span className="text-white/20 text-[8px]">Empty</span>
                  )}
                </div>

                {/* Track V1 */}
                <div className="h-5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/30 w-5 flex items-center gap-1">
                    <IconFilm size={9} />
                    <span>V1</span>
                  </span>
                  {currentStep >= 2 ? (
                    <div className="flex-1 flex gap-1 h-3.5">
                      <div className="bg-white/[0.06] border border-white/[0.1] rounded flex-1 flex items-center px-1 text-[8px] text-white/70">
                        master_partA
                      </div>
                      <div className="bg-white/[0.12] border border-white/[0.2] rounded w-16 sm:w-20 flex items-center px-1 text-[8px] text-white font-medium">
                        anchor_cut
                      </div>
                      <div className="bg-white/[0.06] border border-white/[0.1] rounded flex-1 flex items-center px-1 text-[8px] text-white/70">
                        master_partB
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 h-3.5 bg-white/[0.04] rounded flex items-center px-1.5 text-[8px] text-white/30">
                      raw_continuous_capture.mp4
                    </div>
                  )}
                </div>

                {/* Track C1 */}
                <div className="h-5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/30 w-5 flex items-center gap-1">
                    <IconTypography size={9} />
                    <span>C1</span>
                  </span>
                  {currentStep >= 4 ? (
                    <div className="flex gap-1">
                      {["THE", "CREATOR", "KEEPS", "THE", "CRAFT"].map((w, idx) => (
                        <span key={idx} className="bg-white/[0.06] border border-white/[0.1] text-white/80 px-1 rounded text-[8px]">
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white/20 text-[8px]">Awaiting caption directive</span>
                  )}
                </div>

                {/* Track A1 */}
                <div className="h-5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 gap-2">
                  <span className="text-white/30 w-5 flex items-center gap-1">
                    <IconWaveform size={9} />
                    <span>A1</span>
                  </span>
                  {currentStep >= 6 ? (
                    <div className="flex-1 flex items-center justify-between text-white/70 text-[8px]">
                      <span>master_soundtrack_mix.wav</span>
                      <span className="text-accent/80">Ducked (-14LUFS)</span>
                    </div>
                  ) : (
                    <span className="text-white/20 text-[8px]">Camera audio master</span>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
