"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    title: "You plan it from your desk",
    body: "Pick the new layout while your OS is running. Kitten checks the plan against the real disk and refuses anything it cannot prove safe, before a single byte is written.",
  },
  {
    title: "The plan goes onto the disk itself",
    body: "Kitten writes the plan and a journal to the disk. From this point the disk carries its own instructions. RAM, the OS, even Kitten itself can vanish without losing the thread.",
  },
  {
    title: "One reboot, into the mover",
    body: "The machine restarts into a tiny Rust recovery environment, about two megabytes, running before any operating system. No live USB. Nothing else is awake to interfere.",
  },
  {
    title: "Chunks move one at a time",
    body: "Each chunk is copied to its new home, read back, verified against the source, and committed to the journal. Only then does the next chunk move.",
  },
  {
    title: "The table updates last",
    body: "Data first, table last. The partition map changes only after every byte is already in place, so there is never an instant when the map lies about where your data lives.",
  },
  {
    title: "Your OS boots. Same files, new shape.",
    body: "To the filesystem, nothing happened. To you, the disk finally has the layout you wanted. Total downtime: one reboot and the move itself.",
  },
];

const OLD = 58; // old boundary, %
const NEW = 36; // planned boundary, %
const CW = 5.6; // chunk width, %

function MiniDisk({ step }: { step: number }) {
  const movedCount = step < 4 ? 0 : step === 4 ? 3 : 6;
  const flying = step === 4 ? 3 : -1;
  const boundary = step >= 5 ? NEW : OLD;
  const journal =
    step < 2
      ? null
      : step < 4
        ? ["plan  move media 110 GB left", "journal  6 chunks pending"]
        : step === 4
          ? ["#01 ✓  #02 ✓  #03 ✓ verified", "#04  copying ..."]
          : step === 5
            ? ["#01..#06 ✓ all verified", "table  updated last"]
            : ["done. the map matches the data.", "journal retired."];

  return (
    <div className="relative h-[240px] w-full font-mono text-[10.5px]">
      {/* runtime chip */}
      <div className="absolute top-0 left-0 text-dim transition-opacity duration-500">
        {step < 3 ? (
          <span>running: your OS</span>
        ) : step < 6 ? (
          <span className="text-green">running: kitten mover (pre-OS, 2 MB)</span>
        ) : (
          <span>running: your OS, booted clean</span>
        )}
      </div>

      {/* journal readout */}
      <div
        className="absolute top-6 left-0 leading-[1.9] text-faint transition-opacity duration-500"
        style={{ opacity: journal ? 1 : 0 }}
      >
        {(journal ?? ["", ""]).map((l, i) => (
          <div key={i}>
            <span className="text-green">▸ </span>
            {l}
          </div>
        ))}
      </div>

      {/* the disk */}
      <div className="absolute top-[108px] right-0 left-0 h-[58px] rounded-md border border-line">
        {/* system used */}
        <div
          className="absolute top-2 bottom-2 left-2 rounded-[3px] bg-ink/20"
          style={{ width: "26%" }}
        />
        {/* media chunks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-2 bottom-2 rounded-[3px] transition-all duration-700 ease-out"
            style={{
              left: `${(i < movedCount || i === flying ? NEW : OLD) + i * CW + 0.4}%`,
              width: `${CW - 0.9}%`,
              background:
                i < movedCount
                  ? "color-mix(in srgb, var(--color-ink) 75%, transparent)"
                  : i === flying
                    ? "color-mix(in srgb, var(--color-ink) 95%, transparent)"
                    : "color-mix(in srgb, var(--color-ink) 40%, transparent)",
              transform: i === flying ? "translateY(-16px)" : "none",
            }}
          />
        ))}
        {/* planned boundary */}
        <div
          className="absolute -top-2 -bottom-2 w-0 border-l-2 border-dashed border-green transition-opacity duration-500"
          style={{ left: `${NEW}%`, opacity: step >= 1 && step < 6 ? 1 : 0 }}
        />
        {/* actual table boundary */}
        <div
          className="absolute -top-1 -bottom-1 w-[2px] transition-all duration-700 ease-out"
          style={{
            left: `${boundary}%`,
            background: step === 5 ? "var(--color-green)" : "var(--color-ink)",
          }}
        />
      </div>

      {/* captions */}
      <div className="absolute top-[180px] left-0 text-faint">
        system
      </div>
      <div className="absolute top-[180px] right-0 text-faint">media</div>
      <div
        className="absolute top-[180px] text-green transition-opacity duration-500"
        style={{ left: `${NEW - 2}%`, opacity: step >= 1 && step < 5 ? 1 : 0 }}
      >
        plan
      </div>
      <div
        className="absolute top-[200px] left-0 text-dim transition-opacity duration-500"
        style={{ opacity: step === 2 ? 1 : 0 }}
      >
        plan + journal live on the disk, not in RAM
      </div>
      <div
        className="absolute top-[200px] left-0 text-dim transition-opacity duration-500"
        style={{ opacity: step === 5 ? 1 : 0 }}
      >
        map changes only after the data is in place
      </div>
      <div
        className="absolute top-[200px] left-0 text-dim transition-opacity duration-500"
        style={{ opacity: step === 6 ? 1 : 0 }}
      >
        z z z
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(1);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const idx = refs.current.indexOf(e.target as HTMLLIElement);
            if (idx >= 0) setActive(idx + 1);
          }
        });
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <div className="rise-reveal">
        <p className="font-mono text-[12px] text-faint">$ kitten plan --explain</p>
        <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
          One reboot. Six steps.
        </h2>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-[26vh]">
            <MiniDisk step={active} />
          </div>
        </div>

        <ol className="order-1 space-y-0 lg:order-2">
          {STEPS.map((s, i) => (
            <li
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="step-reveal border-l border-line py-10 pl-8 transition-colors duration-500 lg:py-14"
              style={{
                borderColor:
                  active === i + 1 ? "var(--color-green)" : undefined,
              }}
            >
              <p className="font-mono text-[11px] text-faint">
                step {i + 1} of 6
              </p>
              <h3 className="mt-2 text-[1.35rem] leading-snug font-bold">
                {s.title}
              </h3>
              <p className="mt-3 max-w-[32rem] text-[15px] leading-[1.65] text-dim">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
