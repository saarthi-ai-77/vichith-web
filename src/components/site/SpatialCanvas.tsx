"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_DISTANCE } from "@/lib/spatial";

gsap.registerPlugin(ScrollTrigger);

/** Fired every camera update with the same cameraZ/progress values already
 *  driving the opacity pass below — lets a scene do its OWN richer per-beat
 *  treatment (scale, blur, text reveal, whatever) without a second,
 *  independent ScrollTrigger that would have to somehow reproduce the exact
 *  same 0-1 progress this one already computed. One source of truth. */
export const CAMERA_EVENT = "vichith:camera-update";

export function SpatialCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // The total scroll distance for the experience
      const scrollDistance = SCROLL_DISTANCE;

      // Animate the camera rig along the Z-axis
      gsap.to(cameraRef.current, {
        z: scrollDistance, // Move 10000px deep into the scene
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const cameraZ = self.progress * scrollDistance;
            const scenes = gsap.utils.toArray<HTMLElement>('.scene');
            
            const applyOpacityToLeaves = (element: HTMLElement, op: number) => {
              if (element.classList.contains('preserve-3d') || element.classList.contains('md:preserve-3d')) {
                // Do not apply opacity to preserve-3d containers as it flattens the 3D space
                Array.from(element.children).forEach(child => applyOpacityToLeaves(child as HTMLElement, op));
              } else {
                element.style.opacity = op.toString();
              }
            };

            scenes.forEach(scene => {
               const sceneZStr = scene.getAttribute('data-z') || "0";
               const sceneZAbs = Math.abs(parseFloat(sceneZStr));
               
               // Distance from camera to scene
               const distance = sceneZAbs - cameraZ;
               
               // Calculate opacity based on distance
               let opacity = 1;
               if (distance > 2000) opacity = 0;
               else if (distance > 1000) opacity = 1 - ((distance - 1000) / 1000);
               else if (distance < -800) opacity = 0;
               else if (distance < -200) opacity = 1 - ((-200 - distance) / 600);
               
               scene.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
               applyOpacityToLeaves(scene, opacity);
            });
            
            // Fade out the scroll hint at the very end
            const scrollHint = document.getElementById('scroll-hint');
            if (scrollHint) {
              scrollHint.style.opacity = self.progress > 0.95 ? '0' : '0.5';
            }

            window.dispatchEvent(new CustomEvent(CAMERA_EVENT, {
              detail: { cameraZ, progress: self.progress, velocity: self.getVelocity() },
            }));
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-background preserve-3d perspective-1000"
    >
      <div
        ref={cameraRef}
        className="absolute inset-0 preserve-3d w-full"
        style={{ transform: "translateZ(0px)" }}
      >
        {children}
      </div>
      
      {/* Scroll Hint */}
      <div id="scroll-hint" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground eyebrow flex flex-col items-center gap-2 opacity-50 transition-opacity duration-300">
        <span>Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent"></div>
      </div>
    </div>
  );
}
