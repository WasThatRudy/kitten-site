import { WarnIcon } from "@/components/icons";
export function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="rise-reveal">
        <p className="font-mono text-[12px] text-faint">$ man gparted</p>
        <h2 className="mt-3 max-w-[24ch] text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
          Disk surgery, as currently practiced.
        </h2>
        <p className="mt-5 max-w-[36rem] text-[16px] leading-[1.65] text-dim">
          Today a resize means finding a USB stick, flashing a live image,
          booting from it, and then this. One long, uninterruptible write, with
          nothing on disk to say how far it got.
        </p>
      </div>

      <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
        {/* the fossil */}
        <div className="rise-reveal flex flex-col">
          <div className="mx-auto w-full max-w-[440px] rounded-[4px] border border-[#9a9a94] bg-[#d9d9d2] text-[#1b1b18] shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between rounded-t-[3px] border-b border-[#9a9a94] bg-[#c2c2ba] px-3 py-1.5">
              <span className="font-sans text-[12px] font-bold">
                Moving /dev/sda2 (43%)
              </span>
              <span className="flex h-[14px] w-[14px] items-center justify-center border border-[#8a8a84] bg-[#d0d0c8] font-sans text-[9px] leading-none text-[#6b6b64]">
                ×
              </span>
            </div>
            <div className="px-4 py-4 font-sans">
              <p className="text-[12.5px] leading-[1.5] font-bold">
                <WarnIcon /> DO NOT turn off the computer.
              </p>
              <p className="mt-2 text-[12px] leading-[1.5]">
                Cancelling this operation or losing power before it completes
                will most likely cause SEVERE data loss and an unbootable
                system.
              </p>
              <div className="mt-4 h-[14px] w-full border border-[#8a8a84] bg-[#efefe9]">
                <div className="h-full w-[43%] bg-[#6a7a9a]" />
              </div>
              <p className="mt-1.5 text-[11px] text-[#6b6b64]">
                Elapsed: 1:47:12. Remaining: unknown.
              </p>
              <div className="mt-3 flex justify-end">
                <span className="cursor-not-allowed border border-[#8a8a84] bg-[#d0d0c8] px-4 py-1 text-[11.5px] text-[#9a9a94]">
                  Cancel
                </span>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center font-mono text-[12px] leading-relaxed text-faint">
            the industry standard, since 2004.
          </p>
        </div>

        {/* the kitten way */}
        <div className="rise-reveal flex flex-col">
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center rounded-lg border border-line bg-[#030403] px-5 py-6 font-mono text-[13px] leading-[2]">
            <p className="text-dim">$ kitten apply</p>
            <p className="text-ink">rearranging your disk ...</p>
            <p className="text-green">
              If the power goes out, just turn the computer back on.
            </p>
            <p>
              <span className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[2px] bg-green" />
            </p>
          </div>
          <p className="mt-5 text-center font-mono text-[12px] leading-relaxed text-faint">
            kitten&apos;s entire disaster-recovery manual.
          </p>
        </div>
      </div>

      <p className="rise-reveal mx-auto mt-14 max-w-[38rem] text-center text-[15.5px] leading-[1.7] text-dim">
        The difference is the journal. Kitten commits every chunk as it goes,
        so an interruption is a pause, not a disaster. Power cut, kernel
        panic, cat on the power strip: turn the machine back on and the move
        resumes from the exact chunk it was copying.
      </p>
    </section>
  );
}
