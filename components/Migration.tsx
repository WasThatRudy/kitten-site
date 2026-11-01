"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ServerStack3D = dynamic(() => import("@/components/ServerStack3D"), {
  ssr: false,
  loading: () => null,
});

export function Migration() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only init
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-y border-line-faint">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-6 lg:py-10">
        <div className="py-6">
          <p className="font-mono text-[12px] text-faint">
            $ kitten migrate --to new-hardware
          </p>
          <p className="mt-3 inline-block rounded-full border border-line px-3 py-1 font-mono text-[11px] text-dim">
            coming soon, not yet released
          </p>
          <h2 className="mt-5 max-w-[18ch] text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
            Next: the whole machine moves.
          </h2>
          <p className="mt-5 max-w-[30rem] text-[16px] leading-[1.65] text-dim">
            Machine-to-machine live migration. Copy a running machine onto new
            hardware while it keeps working, then cut over to a verified,
            byte-for-byte copy. Same journal discipline, bigger jump.
          </p>
        </div>
        <div ref={ref} className="h-[320px] w-full sm:h-[400px]">
          {mounted && <ServerStack3D animate={animate} />}
        </div>
      </div>
    </section>
  );
}
