"use client";

import { useEffect, useRef, useState } from "react";
import {
  PlugDemo,
  type RingHandle,
  type DemoHandle,
} from "@/components/demo/PlugDemo";
import { HeroLogo } from "@/components/HeroLogo";
import { Magnetic } from "@/components/Magnetic";

const REPO = "https://github.com/pointblank-club/Kitten";

const BOOT_LINES = [
  "kitten bios v0.4",
  "disk /dev/vda: 500 GB, gpt, 2 partitions",
  "journal: clean",
  "cat: asleep",
  "ok.",
];

function BootIntro({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState<string[]>([]);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    let li = 0;
    let ci = 0;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      setFading(true);
      setTimeout(() => doneRef.current(), 380);
    };
    const tick = () => {
      if (cancelled) return;
      if (li >= BOOT_LINES.length) {
        t = setTimeout(finish, 260);
        return;
      }
      ci++;
      const at = li;
      const partial = BOOT_LINES[at].slice(0, ci);
      setShown((prev) => {
        const next = prev.slice(0, at);
        next[at] = partial;
        return next;
      });
      if (ci >= BOOT_LINES[at].length) {
        li++;
        ci = 0;
        t = setTimeout(tick, 70);
      } else {
        t = setTimeout(tick, 7);
      }
    };
    t = setTimeout(tick, 320);
    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[90] bg-black px-6 py-6 transition-opacity duration-300 sm:px-10 sm:py-8 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      <div className="font-mono text-[12px] leading-[1.9] text-dim sm:text-[13px]">
        {shown.map((l, i) => (
          <div key={i} className={i === 3 ? "text-green" : undefined}>
            {l}
            {i === shown.length - 1 && (
              <span className="cursor-blink ml-0.5 inline-block h-[1em] w-[0.6em] translate-y-[2px] bg-green" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const ring = useRef<RingHandle | null>(null);
  const demo = useRef<DemoHandle | null>(null);
  const [[booted, intro], setBoot] = useState<[boolean, boolean]>([
    false,
    false,
  ]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only init
    setBoot(reduced || sessionStorage.getItem("kitten-booted") ? [true, false] : [false, true]);
  }, []);

  const finishBoot = () => {
    sessionStorage.setItem("kitten-booted", "1");
    setBoot([true, false]);
  };

  return (
    <section
      className={`relative mx-auto max-w-6xl overflow-x-clip px-5 sm:px-8 ${
        booted ? "booted" : ""
      }`}
    >
      {intro && <BootIntro onDone={finishBoot} />}

      <header
        className="stamp flex items-center justify-between py-6"
        style={{ "--stamp-delay": "0.05s" } as React.CSSProperties}
      >
        <span className="flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-wide text-ink">
          <span className="led inline-block h-[7px] w-[7px] rounded-full bg-green" />
          kitten
        </span>
        <nav className="flex items-center gap-6 font-mono text-[12px] text-dim">
          <a href="#how" className="transition-colors hover:text-ink">
            how it works
          </a>
          <a
            href="#guarantee"
            className="hidden transition-colors hover:text-ink sm:inline"
          >
            the guarantee
          </a>
          <a
            href={REPO}
            className="text-ink underline decoration-green decoration-2 underline-offset-4 transition-colors hover:text-green"
          >
            GitHub
          </a>
        </nav>
      </header>

      <div className="relative pt-10 sm:pt-14">
        {/* breathing emblem, sized to counterweight the headline */}
        <div
          className="stamp absolute top-20 right-0 hidden w-[270px] lg:block xl:top-14 xl:w-[345px]"
          style={{ "--stamp-delay": "0.65s" } as React.CSSProperties}
        >
          <HeroLogo ringRef={ring} />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt=""
          aria-hidden
          className="breathe stamp mb-8 w-24 lg:hidden"
          style={{ "--stamp-delay": "0.1s" } as React.CSSProperties}
        />

        <h1>
          <span
            className="stamp block text-[clamp(1.5rem,3.2vw,2.4rem)] leading-none font-medium tracking-tight"
            style={
              {
                "--stamp-delay": "0.18s",
                fontVariationSettings: '"wdth" 97, "opsz" 60',
              } as React.CSSProperties
            }
          >
            Resize your disk.
          </span>
          <button
            type="button"
            onClick={() => demo.current?.runShow()}
            className="plug-line plug-stamp mt-2 block text-left text-[clamp(4.2rem,13vw,11rem)] leading-[0.92] font-extrabold tracking-[-0.01em] uppercase"
            style={{ "--stamp-delay": "0.32s" } as React.CSSProperties}
            aria-label="Pull the plug: run the demo below and cut the power mid-move"
          >
            Pull the
            <br />
            plug<span className="text-green">.</span>
          </button>
          <span
            className="stamp mt-4 block text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight font-normal text-green vf-hover"
            style={
              {
                "--stamp-delay": "0.5s",
                fontVariationSettings: '"wdth" 100, "opsz" 50',
              } as React.CSSProperties
            }
          >
            The cat doesn&apos;t flinch.
          </span>
        </h1>

        <p
          className="stamp mt-3 font-mono text-[11.5px] text-faint"
          style={{ "--stamp-delay": "0.58s" } as React.CSSProperties}
        >
          the headline is a button. it runs the demo.
        </p>

        <div
          className="stamp mt-10"
          style={{ "--stamp-delay": "0.66s" } as React.CSSProperties}
        >
          <p className="max-w-[34rem] text-[16.5px] leading-[1.65] text-dim">
            Kitten is a GPL-3.0 tool, written in Rust, that rearranges the
            partitions on your disk in place. One reboot, no live USB. Every
            step is journaled and every chunk verified, so a power cut at any
            moment cannot cost you a byte: the move resumes exactly where it
            stopped.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Magnetic>
              <a
                href={REPO}
                className="inline-block rounded-md bg-ink px-5 py-2.5 font-mono text-[13px] font-medium whitespace-nowrap text-black transition-colors hover:bg-green"
              >
                read the source
              </a>
            </Magnetic>
            <p className="font-mono text-[12px] text-faint">
              under active development. not yet for a disk you can&apos;t lose.
            </p>
          </div>
        </div>
      </div>

      {/* sector ruler into the demo */}
      <div
        className="stamp mt-14 mb-2"
        style={{ "--stamp-delay": "0.74s" } as React.CSSProperties}
      >
        <div className="ruler w-full opacity-50" aria-hidden />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-faint" aria-hidden>
          <span>lba 0x0000</span>
          <span className="hidden sm:inline">0x3E80</span>
          <span>0x7D00</span>
        </div>
      </div>

      <div
        id="demo"
        className="stamp scroll-mt-24 pb-6"
        style={{ "--stamp-delay": "0.8s" } as React.CSSProperties}
      >
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <p className="font-mono text-[12px] text-dim">
            shrink a partition, then cut the power mid-move.
          </p>
          <p className="hidden font-mono text-[11px] text-faint sm:block">
            simulated 500 GB disk
          </p>
        </div>
        <PlugDemo ringRef={ring} demoRef={demo} />
      </div>
    </section>
  );
}
