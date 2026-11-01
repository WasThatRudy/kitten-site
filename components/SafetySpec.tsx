const INVARIANTS = [
  {
    k: "refuse before writing",
    v: "Every plan is validated against the disk as it actually is. A plan that cannot be proven safe never writes its first byte.",
  },
  {
    k: "verify every chunk",
    v: "A copy does not count until it reads back identical to its source. Trust nothing, not even the disk's own acknowledgement.",
  },
  {
    k: "the journal is the truth",
    v: "On boot, the mover believes the journal over everything, including its own memory of what it was doing. Memory lies after a crash. The journal doesn't.",
  },
  {
    k: "data first, table last",
    v: "The partition map is updated only after every byte is in its new home. The map never points at data that isn't there.",
  },
  {
    k: "crash-tested on purpose",
    v: "The test harness kills the mover at every step boundary, thousands of times, and expects a byte-perfect resume after each one.",
  },
  {
    k: "small enough to read",
    v: "The mover is a small, focused piece of Rust under GPL-3.0. Don't take our word for any of this. Read it.",
  },
];

export function SafetySpec() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="rise-reveal max-w-[40rem]">
        <p className="font-mono text-[12px] text-faint">$ cat SPEC.md</p>
        <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
          Crash-safe by design, not by luck.
        </h2>
        <p className="mt-5 text-[16px] leading-[1.65] text-dim">
          Kitten is written against a strict data-safety specification. These
          are its invariants, in human terms.
        </p>
      </div>

      <dl className="mt-14">
        {INVARIANTS.map((inv) => (
          <div
            key={inv.k}
            className="rise-reveal grid gap-2 border-t border-line-faint py-7 sm:grid-cols-[260px_1fr] sm:gap-10"
          >
            <dt className="font-mono text-[13px] font-medium text-green">
              {inv.k}
            </dt>
            <dd className="max-w-[36rem] text-[15px] leading-[1.65] text-dim">
              {inv.v}
            </dd>
          </div>
        ))}
        <div className="border-t border-line-faint" />
      </dl>

      <p className="mt-10 font-mono text-[12px] leading-relaxed text-faint">
        Kitten is under active development. run it on VMs and machines you can
        reinstall, not yet on a disk you can&apos;t lose.
      </p>
    </section>
  );
}
