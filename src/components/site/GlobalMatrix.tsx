"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { SCROLL_DISTANCE } from "@/lib/spatial";

// Real assets provided by the user
const ASSETS = [
  { type: "image", src: "/adshit.jpg" },
  { type: "video", src: "/Cinematic.mp4" },
  { type: "image", src: "/Cinematic.png" }, // Note: consider compressing this 9MB PNG later!
  { type: "image", src: "/lighthouse.jpg" },
  { type: "image", src: "/man.jpg" },
  { type: "image", src: "/pouring_tea.jpg" },
  { type: "image", src: "/shot.jpg" },
  { type: "image", src: "/split_pour.jpg" },
  { type: "image", src: "/vintage.jpg" },
  { type: "video", src: "/waves.mp4" },
];

export function GlobalMatrix() {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate a scattered array of items spanning the entire Z-depth
  const items = useMemo(() => {
    const totalItems = 40;
    const array = [];
    
    for (let i = 0; i < totalItems; i++) {
      // Z spans from +500 to just beyond the max scroll distance
      const z = 500 - (Math.random() * (SCROLL_DISTANCE + 1000));
      
      let x = (Math.random() * 200) - 50; 
      let y = (Math.random() * 140) - 20;

      // Push elements away from dead center (50, 50)
      if (x > 30 && x < 70) x = Math.random() > 0.5 ? x + 40 : x - 40;
      if (y > 30 && y < 70) y = Math.random() > 0.5 ? y + 40 : y - 40;
      
      const asset = ASSETS[i % ASSETS.length];

      array.push({
        id: i,
        z,
        x,
        y,
        type: asset.type,
        src: asset.src,
        width: 250 + Math.random() * 150,
        height: 150 + Math.random() * 100,
        rotation: Math.random() * 10 - 5
      });
    }
    
    return array.sort((a, b) => a.z - b.z);
  }, []);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.set(innerRefs.current, { scale: 0.8, opacity: 0.15 });

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let isMouseMoving = false;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMouseMoving) {
          isMouseMoving = true;
          requestAnimationFrame(updateMatrix);
        }
      };

      const updateMatrix = () => {
        isMouseMoving = false;
        
        containerRefs.current.forEach((container, i) => {
          if (!container) return;
          const inner = innerRefs.current[i];
          if (!inner) return;

          const rect = container.getBoundingClientRect();
          
          if (
            rect.bottom < -500 || 
            rect.top > window.innerHeight + 500 || 
            rect.right < -500 || 
            rect.left > window.innerWidth + 500 ||
            rect.width > window.innerWidth * 3 
          ) {
            return;
          }

          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
          
          const maxDist = 400;
          let intensity = Math.max(0, 1 - (dist / maxDist));
          intensity = gsap.parseEase("power2.out")(intensity);

          const targetScale = 0.8 + (0.4 * intensity); 
          const targetOpacity = 0.15 + (0.65 * intensity); 

          gsap.to(inner, {
            scale: targetScale,
            opacity: targetOpacity,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full preserve-3d pointer-events-none">
      {items.map((item, i) => (
        <div
          key={item.id}
          ref={el => { containerRefs.current[i] = el; }}
          className="absolute preserve-3d"
          style={{
            left: `${item.x}vw`,
            top: `${item.y}vh`,
            transform: `translateZ(${item.z}px) rotate(${item.rotation}deg)`,
            width: `${item.width}px`,
            height: `${item.height}px`,
            marginLeft: `-${item.width / 2}px`,
            marginTop: `-${item.height / 2}px`,
          }}
        >
          <div
            ref={el => { innerRefs.current[i] = el; }}
            className="w-full h-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/5 transition-colors duration-300 pointer-events-auto cursor-crosshair relative"
          >
            {item.type === "image" ? (
              <img src={item.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <video src={item.src} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* Subtle overlay to keep text readable */}
            <div className="absolute inset-0 bg-background/40 hover:bg-transparent transition-colors duration-500 z-10"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
