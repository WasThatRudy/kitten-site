"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { RingHandle } from "@/components/demo/PlugDemo";

/**
 * The emblem, breathing, with an SVG arc fitted exactly over the logo's
 * baked-in crescent (circle center 373,373 r=324 in the 760px crop).
 * During a move the arc fills with bright green: the crescent is the
 * progress ring.
 */
export function HeroLogo({ ringRef }: { ringRef: React.RefObject<RingHandle | null> }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    ringRef.current = {
      set: (p, active) => {
        const el = pathRef.current;
        if (!el) return;
        el.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, p)) * 100);
        el.style.opacity = active ? "1" : "0";
      },
    };
    return () => {
      ringRef.current = null;
    };
  }, [ringRef]);

  return (
    <div className="relative aspect-square w-full max-w-[340px]">
      <div className="bloom absolute -inset-10" aria-hidden />
      <div className="breathe relative h-full w-full">
        <Image
          src="/logo.png"
          alt="Kitten: a sleeping cat curled on a stack of servers"
          fill
          sizes="340px"
          priority
          className="object-contain"
        />
        <svg
          viewBox="0 0 760 760"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            ref={pathRef}
            d="M 653.6 211 A 324 324 0 1 0 125 581"
            fill="none"
            stroke="#8cffbe"
            strokeWidth="26"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{
              opacity: 0,
              transition: "opacity 0.6s ease",
              filter: "drop-shadow(0 0 10px rgba(0,216,106,0.7))",
            }}
          />
        </svg>
      </div>
    </div>
  );
}
