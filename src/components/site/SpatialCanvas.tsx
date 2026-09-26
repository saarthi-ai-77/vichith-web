"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_DISTANCE } from "@/lib/spatial";

gsap.registerPlugin(ScrollTrigger);

/** Fired every camera update — lets scenes react imperatively (no re-renders). */
export const CAMERA_EVENT = "vichith:camera-update";

export function SpatialCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.style.willChange = "transform";
    }

    const ctx = gsap.context(() => {
      const scrollDistance = SCROLL_DISTANCE;

      // Cache DOM queries that never change — run once at setup, not per frame.
      // gsap.utils.toArray inside onUpdate was doing a live querySelectorAll
      // on every tick which is a significant reflow source on pages with many elements.
      let scenes: HTMLElement[] = [];
      let scrollHint: HTMLElement | null = null;

      // Defer cache population until after first paint so all scenes are in DOM
      requestAnimationFrame(() => {
        scenes = gsap.utils.toArray<HTMLElement>(".scene");
        scrollHint = document.getElementById("scroll-hint");
      });

      const applySceneOpacity = (scene: HTMLElement, op: number) => {
        // Apply opacity to direct children only — never to the preserve-3d root
        // (setting opacity on preserve-3d flattens the 3D stacking context).
        const ch = scene.children;
        for (let i = 0; i < ch.length; i++) {
          (ch[i] as HTMLElement).style.opacity = op.toString();
        }
      };

      gsap.to(cameraRef.current, {
        z: scrollDistance,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: 2,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const cameraZ = self.progress * scrollDistance;

            for (let i = 0; i < scenes.length; i++) {
              const scene = scenes[i];
              const sceneZAbs = Math.abs(parseFloat(scene.dataset.z || "0"));
              const distance = sceneZAbs - cameraZ;

              let opacity = 1;
              if (distance > 2000) {
                opacity = 0;
              } else if (distance > 800) {
                opacity = 1 - (distance - 800) / 1200;
              } else if (distance < -900) {
                opacity = 0;
              } else if (distance < -200) {
                opacity = 1 - (-200 - distance) / 700;
              }

              if (opacity <= 0.01) {
                scene.style.visibility = "hidden";
              } else {
                scene.style.visibility = "visible";
                applySceneOpacity(scene, opacity);
              }
            }

            if (scrollHint) {
              scrollHint.style.opacity = self.progress > 0.04 ? "0" : "0.5";
            }

            window.dispatchEvent(
              new CustomEvent(CAMERA_EVENT, {
                detail: { cameraZ, progress: self.progress, velocity: self.getVelocity() },
              })
            );
          },
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-background preserve-3d"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cameraRef}
        className="absolute inset-0 preserve-3d w-full"
        style={{ transform: "translateZ(0px)" }}
      >
        {children}
      </div>

      <div
        id="scroll-hint"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 transition-opacity duration-500 pointer-events-none"
      >
        <span className="eyebrow text-muted-foreground">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </div>
  );
}
