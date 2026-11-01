import { Magnetic } from "@/components/Magnetic";

const REPO = "https://github.com/pointblank-club/Kitten";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:px-8 sm:pt-32">
      <div className="rise-reveal max-w-[42rem]">
        <h2 className="text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-bold tracking-tight text-balance">
          Star it. Read it. Break it in a VM.
        </h2>
        <p className="mt-6 text-[16px] leading-[1.65] text-dim">
          Kitten is free software under GPL-3.0. The best thing you can do for
          a young disk tool is read its source and try to make it fail.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a
              href={REPO}
              className="inline-block rounded-md bg-green px-6 py-3 font-mono text-[14px] font-medium text-black transition-colors hover:bg-green-bright"
            >
              github.com/pointblank-club/Kitten
            </a>
          </Magnetic>
        </div>
        <pre className="mt-8 overflow-x-auto rounded-md border border-line-faint bg-[#030403] px-4 py-3 font-mono text-[12px] leading-relaxed text-dim">
          <code>{`git clone https://github.com/pointblank-club/Kitten
cd Kitten && cargo build --release   # then point it at a disk you can lose`}</code>
        </pre>
      </div>

      <div className="mt-20 flex flex-col gap-3 border-t border-line-faint pt-6 font-mono text-[11.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>kitten. GPL-3.0. under active development.</span>
        <span>a pointblank club project</span>
      </div>
    </footer>
  );
}
