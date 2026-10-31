export function Guarantee() {
  return (
    <section
      id="guarantee"
      className="border-y border-line-faint bg-[#020302]"
    >
      <div className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-36">
        <div className="rise-reveal max-w-[46rem]">
          <p className="font-mono text-[12px] text-green">$ kitten verify</p>
          <h2 className="mt-4 text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.05] font-bold tracking-tight text-balance">
            A power cut pauses the move. It cannot corrupt it.
          </h2>
          <p className="mt-7 text-[17px] leading-[1.7] text-dim">
            At every instant during a move, each chunk of your data exists
            intact in at least one place on the disk, and the journal knows
            which place that is. Kill the power at the worst possible moment
            and nothing is lost: on the next boot the mover reads the journal,
            re-copies the one chunk that was mid-flight, verifies it, and keeps
            going as if nothing happened.
          </p>
        </div>

        <div className="rise-reveal mt-14 max-w-[40rem] overflow-x-auto rounded-lg border border-line-faint bg-black px-5 py-4 font-mono text-[12px] leading-[2.1] sm:px-6">
          <div className="text-faint">
            <span className="inline-block w-20 text-dim">t−2.1s</span>
            chunk 11 copied, verified, committed
          </div>
          <div className="text-faint">
            <span className="inline-block w-20 text-dim">t−0.4s</span>
            chunk 12 copy begins
          </div>
          <div className="font-bold text-ink">
            <span className="inline-block w-20">t+0.0s</span>⚡ power lost
          </div>
          <div className="text-faint">
            <span className="inline-block w-20 text-dim">on disk</span>
            journal intact. chunks 1..11 committed. chunk 12 source untouched.
          </div>
          <div className="text-green">
            <span className="inline-block w-20">reboot</span>
            journal read. chunk 12 recopied, verified. resumed.
          </div>
        </div>

        <p className="rise-reveal mt-10 max-w-[40rem] font-mono text-[13px] leading-relaxed text-dim">
          Your data is never in only one place. The cat sleeps because it
          checked.
        </p>
      </div>
    </section>
  );
}
