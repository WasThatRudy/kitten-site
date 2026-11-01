import { MigrationArt } from "@/components/MigrationArt";

export function Migration() {
  return (
    <section className="border-y border-line-faint">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-6 lg:py-24">
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
        <div className="rise-reveal py-6">
          <MigrationArt />
        </div>
      </div>
    </section>
  );
}
