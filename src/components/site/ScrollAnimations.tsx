"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale" | "reveal";
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  animation = "fadeUp",
  delay = 0,
  duration = 1,
  trigger,
  start = "top 80%",
  end = "bottom 20%",
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger || element,
        start,
        end,
        toggleActions: "play none none reverse",
      },
    });

    const animations: Record<string, gsap.TweenVars> = {
      fadeUp: { y: 60, opacity: 0 },
      fadeIn: { opacity: 0 },
      slideLeft: { x: -100, opacity: 0 },
      slideRight: { x: 100, opacity: 0 },
      scale: { scale: 0.8, opacity: 0 },
      reveal: { clipPath: "inset(100% 0 0 0)", opacity: 1 },
    };

    tl.from(element, {
      ...animations[animation],
      duration,
      delay,
      ease: "power3.out",
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) st.kill();
      });
    };
  }, [animation, delay, duration, trigger, start, end]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface ScrollScrubProps {
  children: React.ReactNode;
  className?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  pinSpacing?: boolean;
}

export function ScrollScrub({
  children,
  className = "",
  from = {},
  to = {},
  start = "top bottom",
  end = "bottom top",
  scrub = 1,
  pin = false,
  pinSpacing = true,
}: ScrollScrubProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const st = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      scrub,
      pin,
      pinSpacing,
      animation: gsap.fromTo(element, from, to),
    });

    return () => {
      st.kill();
    };
  }, [from, to, start, end, scrub, pin, pinSpacing]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// 3D Transform utilities
export function use3DTransform() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(element, {
        rotateY: x * 10,
        rotateX: -y * 10,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}

// Split text animation
export function SplitText({
  children,
  className = "",
  stagger = 0.05,
}: {
  children: string;
  className?: string;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".char");

    gsap.fromTo(
      chars,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [stagger]);

  return (
    <span ref={containerRef} className={className}>
      {children.split("").map((char, i) => (
        <span key={i} className="char inline-block" style={{ whiteSpace: char === " " ? "pre" : undefined }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// Parallax effect
export function ParallaxLayer({
  children,
  className = "",
  speed = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.to(element, {
      y: () => -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Horizontal scroll section
export function HorizontalScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const container = containerRef.current;
    const scroll = scrollRef.current;

    const scrollWidth = scroll.scrollWidth - container.offsetWidth;

    gsap.to(scroll, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={scrollRef} className="flex gap-8" style={{ width: "max-content" }}>
        {children}
      </div>
    </div>
  );
}

// Text reveal with clip-path
export function TextReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.fromTo(
      element,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.2,
        delay,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default ScrollReveal;
