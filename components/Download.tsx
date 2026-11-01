"use client";

import { useEffect, useState } from "react";
import { Magnetic } from "@/components/Magnetic";

const RELEASES_PAGE = "https://github.com/pointblank-club/Kitten/releases";
const API = "https://api.github.com/repos/pointblank-club/Kitten/releases?per_page=1";

interface Asset {
  name: string;
  browser_download_url: string;
}

interface Release {
  version: string;
  prerelease: boolean;
  assets: Asset[];
}

type State = { kind: "loading" } | { kind: "none" } | { kind: "ready"; release: Release };

const ROWS = [
  {
    key: "deb",
    distro: "Debian, Ubuntu, Mint, Pop!_OS",
    file: (v: string) => `kitten_${v}_amd64.deb`,
    match: (n: string) => n.endsWith(".deb"),
  },
  {
    key: "rpm",
    distro: "Fedora, openSUSE",
    file: (v: string) => `kitten-${v}-1.x86_64.rpm`,
    match: (n: string) => n.endsWith(".rpm"),
  },
  {
    key: "cli",
    distro: "Any distro: static CLI, runs even from a live USB",
    file: (v: string) => `kitten-cli-${v}-x86_64-linux-musl.tar.gz`,
    match: (n: string) => n.endsWith(".tar.gz"),
  },
  {
    key: "sums",
    distro: "Checksums",
    file: () => "SHA256SUMS",
    match: (n: string) => n === "SHA256SUMS",
  },
];

export function Download() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list) && list.length > 0 && list[0].assets?.length) {
          setState({
            kind: "ready",
            release: {
              version: String(list[0].tag_name ?? "").replace(/^v/, ""),
              prerelease: Boolean(list[0].prerelease),
              assets: list[0].assets,
            },
          });
        } else {
          setState({ kind: "none" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "none" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const release = state.kind === "ready" ? state.release : null;
  const v = release?.version || "0.1.0";

  return (
    <section
      id="download"
      className="border-t border-line-faint bg-wash"
    >
      <div className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
        <div className="rise-reveal max-w-[42rem]">
          <p className="font-mono text-[12px] text-faint">
            $ sudo apt install ./kitten_amd64.deb
          </p>
          <h2 className="mt-3 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
            Get Kitten.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-dim">
            Native packages for Debian, Ubuntu, Fedora, and friends, plus a
            static CLI that runs on any distro. Free software,
            GPL-3.0-or-later.
          </p>
          {release?.prerelease && (
            <p className="mt-4 inline-block rounded-full border border-line px-3 py-1 font-mono text-[11px] text-dim">
              v{v} pre-release. early build, back up first.
            </p>
          )}
          {state.kind === "none" && (
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Magnetic>
                <a
                  href={RELEASES_PAGE}
                  className="inline-block rounded-md bg-ink px-5 py-2.5 font-mono text-[13px] font-medium whitespace-nowrap text-bg transition-colors hover:bg-green"
                >
                  watch releases on GitHub
                </a>
              </Magnetic>
              <p className="font-mono text-[12px] text-faint">
                packages land with the first release. the lineup below is what
                ships.
              </p>
            </div>
          )}
        </div>

        <div className="rise-reveal mt-12">
          {ROWS.map((row) => {
            const asset = release?.assets.find((a) => row.match(a.name));
            const href = asset?.browser_download_url ?? RELEASES_PAGE;
            const live = Boolean(asset);
            return (
              <div
                key={row.key}
                className="grid items-baseline gap-1 border-t border-line-faint py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px] sm:gap-6"
              >
                <span className="text-[15px] text-ink">{row.distro}</span>
                <span className={`font-mono text-[12.5px] ${live ? "text-dim" : "text-faint"}`}>
                  {row.file(release ? v : "x.y.z")}
                </span>
                <span className="sm:text-right">
                  <a
                    href={href}
                    className={`font-mono text-[12.5px] underline underline-offset-4 transition-colors ${
                      live
                        ? "text-green decoration-green hover:text-green-bright"
                        : "text-faint decoration-line hover:text-dim"
                    }`}
                  >
                    {live ? "download" : "soon"}
                  </a>
                </span>
              </div>
            );
          })}
          <div className="border-t border-line-faint" />
        </div>

        <div className="rise-reveal mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <pre className="screen overflow-x-auto rounded-md border border-line-faint bg-[#030403] px-4 py-3.5 font-mono text-[12px] leading-[1.9] text-dim">
            <code>{`# Debian, Ubuntu, Mint, Pop!_OS
sudo apt install ./kitten_${release ? v : "x.y.z"}_amd64.deb

# Fedora, openSUSE
sudo dnf install ./kitten-${release ? v : "x.y.z"}-1.x86_64.rpm

# verify what you downloaded
sha256sum -c SHA256SUMS

# then launch Kitten from the app menu, or:
bootshift-gui        # the app
bootshift            # the CLI`}</code>
          </pre>
          <div className="font-mono text-[12px] leading-[2] text-faint">
            <p className="text-dim">needs</p>
            <p>Ubuntu 24.04+, Mint 22+, Debian 13+, Fedora 40+</p>
            <p>amd64 / x86_64 only, for now</p>
            <p className="mt-3 text-dim">older distro?</p>
            <p>
              the static CLI tarball runs anywhere, even from a live USB:
              <span className="text-dim"> bootshift resume</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
