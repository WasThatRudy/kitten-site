"use client";

import Image from "next/image";
import { useState } from "react";

const STEPS = [
  {
    key: "goals",
    label: "Goals",
    src: "/screens/goals.webp",
    caption:
      "Pick a goal in plain words. Kitten works out the safe way to do it and shows you before anything changes.",
  },
  {
    key: "arrange",
    label: "1  Arrange",
    src: "/screens/arrange.webp",
    caption:
      "Drag partitions, or drag an edge to resize. The disk as it is today and as it will be after the restart, side by side.",
  },
  {
    key: "plan",
    label: "2  Plan",
    src: "/screens/plan.webp",
    caption:
      "Every step the recovery system will take, in order, with the real costs: data copied, chunk size, rough time.",
  },
  {
    key: "checks",
    label: "3  Checks",
    src: "/screens/checks.webp",
    caption:
      "Twelve safety checks, from firmware mode to disk health. All of them pass, or Kitten writes nothing at all.",
  },
  {
    key: "recovery",
    label: "Recovery",
    src: "/screens/recovery.png",
    caption:
      "The move itself runs here, before any operating system starts. This is the actual recovery screen, captured from a VM mid-move.",
  },
  {
    key: "done",
    label: "4  Done",
    src: "/screens/done.webp",
    caption:
      "Every moved byte read back and verified. The journal and your old partition table stay on the EFI partition.",
  },
];

export function AppTour() {
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="rise-reveal max-w-[42rem]">
        <p className="font-mono text-[12px] text-faint">$ kitten</p>
        <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
          Drag partitions. Read the plan. Pass the checks.
        </h2>
        <p className="mt-5 text-[16px] leading-[1.65] text-dim">
          The app is a four-step wizard, and nothing is written until you have
          seen the plan and every check is green. The move itself runs at the
          restart, on the recovery screen below. A built-in demo disk lets you
          rehearse the whole thing without touching hardware.
        </p>
      </div>

      <div className="rise-reveal mt-12">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="App screens"
        >
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`rounded-md border px-4 py-2 font-mono text-[12px] transition-colors ${
                active === i
                  ? "border-green text-green"
                  : "border-line text-dim hover:border-ink/40 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative mt-5 overflow-hidden rounded-xl border border-line shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={i === active ? "block" : "hidden"}
              role="tabpanel"
            >
              <Image
                src={s.src}
                alt={`Kitten app, ${s.label} step`}
                width={1600}
                height={1000}
                sizes="(max-width: 1200px) 100vw, 1104px"
                className="block h-auto w-full"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <p className="mt-4 max-w-[44rem] font-mono text-[12px] leading-relaxed text-dim">
          {STEPS[active].caption}
        </p>
      </div>
    </section>
  );
}
