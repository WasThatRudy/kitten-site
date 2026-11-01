"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/Magnetic";
import { BoltIcon } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* model                                                               */
/* ------------------------------------------------------------------ */

const DISK_GB = 500;
const SYS_USED = 120 / DISK_GB; // fraction of disk
const MEDIA_USED = 110 / DISK_GB;
const INIT_SPLIT = 320 / DISK_GB;
const MIN_SPLIT = SYS_USED + 16 / DISK_GB;
const MAX_SPLIT = 1 - MEDIA_USED - 16 / DISK_GB;
const CHUNKS = 24;
const CHUNK_MS = 215; // slide time per chunk
const VERIFY = 0.42; // fraction of flight spent reading+verifying at source

type Phase =
  | "idle"
  | "dragging"
  | "planning"
  | "moving"
  | "cut"
  | "console"
  | "done";

interface Sim {
  phase: Phase;
  split: number; // where the partition table says the boundary is
  target: number; // where the plan says it should be
  handle: number; // visual handle position while dragging
  moved: boolean[];
  order: number[]; // chunk copy order (overlap-safe)
  flightPos: number; // index into order
  flight: number; // -VERIFY..1 progress of current chunk
  committed: number;
  tableSnap: number; // 0..1 animation of the final boundary move
  interrupted: boolean;
  attract: boolean;
  touched: boolean;
  pulls: number;
  hintT: number;
}

interface Entry {
  id: number;
  text: string;
  kind: "ok" | "note" | "loss";
}

export interface RingHandle {
  set: (progress: number, active: boolean) => void;
}

export interface DemoHandle {
  /** Scripted show: drag, move, pull the plug, recover, finish. */
  runShow: () => void;
}

const gb = (frac: number) => Math.round(frac * DISK_GB);

function makeOrder(movingLeft: boolean): number[] {
  const a = Array.from({ length: CHUNKS }, (_, i) => i);
  return movingLeft ? a : a.reverse();
}

/* ------------------------------------------------------------------ */
/* recovery console                                                    */
/* ------------------------------------------------------------------ */

function consoleScript(sim: Sim): string[] {
  const durable = sim.committed;
  const next = Math.min(durable + 1, CHUNKS);
  if (sim.pulls > 1) {
    return [
      "Kitten recovery: rearranging your disk.",
      `Power lost again. Reading the journal … chunk ${durable} of ${CHUNKS} was durable.`,
      `Resuming at chunk ${next}.`,
    ];
  }
  return [
    "Kitten recovery: rearranging your disk.",
    "If the power goes out, just turn the computer back on. Kitten will continue.",
    "Working on /dev/nvme0n1.",
    `Reading the journal … chunk ${durable} of ${CHUNKS} was durable.`,
    `Resuming at chunk ${next}.`,
  ];
}

function RecoveryConsole({
  lines,
  progress,
  instant,
  onDone,
}: {
  lines: string[];
  progress: number; // 0..1, durable fraction shown on the recovery progress bar
  instant: boolean;
  onDone: () => void;
}) {
  const [shown, setShown] = useState<number>(instant ? lines.length : 0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (instant) {
      const t = setTimeout(() => doneRef.current(), 1400);
      return () => clearTimeout(t);
    }
    let i = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      if (i >= lines.length) {
        timer = setTimeout(() => doneRef.current(), 1000);
        return;
      }
      i++;
      setShown(i);
      timer = setTimeout(tick, 480);
    };
    timer = setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, instant]);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col justify-center bg-black px-5 font-mono text-[12px] leading-[1.9] text-ink/90 sm:px-7 sm:text-[13px]"
      role="log"
      aria-live="polite"
    >
      {lines.slice(0, shown).map((l, i) => (
        <div key={i}>
          {l}
          {i === shown - 1 && shown < lines.length && (
            <span className="cursor-blink ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] bg-ink/80" />
          )}
        </div>
      ))}
      {shown >= lines.length && (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-ink/15">
            <div
              className="h-full rounded-full bg-green transition-[width] duration-700"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-dim">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

function DoneScreen({
  movedGB,
  pulls,
}: {
  movedGB: number;
  pulls: number;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-center bg-black px-5 font-mono text-[12px] leading-relaxed sm:px-7 sm:text-[13px]">
      <div className="flex items-center gap-2.5 text-[15px] text-green sm:text-[16px]">
        <svg
          viewBox="0 0 24 24"
          className="h-[1.1em] w-[1.1em]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
          <path d="M7.5 12.5 10.5 15.5 16.5 9.5" />
        </svg>
        Done. Restarting into your system.
      </div>
      <p className="mt-3 max-w-[44ch] text-dim">
        Every moved byte was read back and verified.
        {pulls > 0 && " The power cut in the middle changed nothing."}
      </p>
      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[11px] sm:text-[12px]">
        <span>
          <span className="text-faint">data moved</span>{" "}
          <span className="text-ink">{movedGB} GB</span>
        </span>
        <span>
          <span className="text-faint">chunks verified</span>{" "}
          <span className="text-ink">
            {CHUNKS}/{CHUNKS}
          </span>
        </span>
        <span>
          <span className="text-faint">power cuts survived</span>{" "}
          <span className="text-ink">{pulls}</span>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the demo                                                            */
/* ------------------------------------------------------------------ */

export function PlugDemo({
  ringRef,
  demoRef,
}: {
  ringRef?: React.RefObject<RingHandle | null>;
  demoRef?: React.RefObject<DemoHandle | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const journalRef = useRef<HTMLDivElement>(null);
  const monoProbe = useRef<HTMLSpanElement>(null);

  const sim = useRef<Sim>({
    phase: "idle",
    split: INIT_SPLIT,
    target: INIT_SPLIT,
    handle: INIT_SPLIT,
    moved: new Array(CHUNKS).fill(false),
    order: makeOrder(true),
    flightPos: 0,
    flight: 0,
    committed: 0,
    tableSnap: 1,
    interrupted: false,
    attract: false,
    touched: false,
    pulls: 0,
    hintT: 0,
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [consoleData, setConsoleData] = useState<{
    lines: string[];
    progress: number;
  } | null>(null);
  const [pullCount, setPullCount] = useState(0);
  const [cut, setCut] = useState(false);
  const [status, setStatus] = useState("drag the white boundary to plan a resize");
  const [reduced, setReduced] = useState(false);
  const entryId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dragging = useRef(false);
  const attractAnim = useRef<{ from: number; to: number; t: number } | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only init
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const push = useCallback((text: string, kind: Entry["kind"] = "ok") => {
    setEntries((prev) => [...prev.slice(-80), { id: entryId.current++, text, kind }]);
  }, []);

  useEffect(() => {
    const el = journalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const go = useCallback((p: Phase) => {
    sim.current.phase = p;
    setPhase(p);
  }, []);

  /* ---------------- plan + move orchestration ---------------- */

  const startPlan = useCallback(
    (target: number) => {
      const s = sim.current;
      s.target = target;
      s.handle = target;
      const deltaGB = Math.abs(gb(target) - gb(s.split));
      const dir = target < s.split ? "left" : "right";
      go("planning");
      setStatus("checking the plan against the disk ...");
      push(`plan  move media ${deltaGB} GB ${dir}`, "note");
      later(() => {
        setStatus("plan is safe. writing plan + journal to disk ...");
        push(`journal  written to disk, ${CHUNKS} chunks pending`, "note");
      }, 650);
      later(() => {
        setStatus("rebooting into the mover ...");
        push(dir === "right" ? "copy order  back to front (regions overlap)" : "copy order  front to back", "note");
      }, 1350);
      later(() => {
        s.order = makeOrder(target < s.split);
        s.moved = new Array(CHUNKS).fill(false);
        s.flightPos = 0;
        s.flight = -VERIFY;
        s.committed = 0;
        s.tableSnap = 1;
        go("moving");
      }, 2050);
    },
    [go, later, push]
  );

  const resetDemo = useCallback(
    (keepAttract = false) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const s = sim.current;
      s.split = INIT_SPLIT;
      s.target = INIT_SPLIT;
      s.handle = INIT_SPLIT;
      s.moved = new Array(CHUNKS).fill(false);
      s.committed = 0;
      s.flight = 0;
      s.flightPos = 0;
      s.tableSnap = 1;
      s.interrupted = false;
      s.attract = keepAttract;
      s.pulls = 0;
      setEntries([]);
      setConsoleData(null);
      setPullCount(0);
      setCut(false);
      ringRef?.current?.set(0, false);
      go("idle");
      setStatus("drag the white boundary to plan a resize");
    },
    [go, ringRef]
  );

  const finishMove = useCallback(() => {
    const s = sim.current;
    setStatus("all chunks verified. updating the partition table ...");
    push(`data  all ${CHUNKS} chunks in place`, "note");
    later(() => {
      s.tableSnap = 0; // animates split -> target
      push("table  updated last", "ok");
    }, 500);
    later(() => {
      s.split = s.target;
      go("done");
      setStatus("");
      ringRef?.current?.set(1, true);
      later(() => ringRef?.current?.set(1, false), 2600);
      if (s.attract) {
        later(() => {
          if (sim.current.attract && !sim.current.touched) resetDemo(true);
        }, 5000);
      }
    }, 1400);
  }, [go, later, push, resetDemo]);

  const pullPlug = useCallback(() => {
    const s = sim.current;
    if (s.phase !== "moving") return;
    s.pulls += 1;
    go("cut");
    setCut(true);
    setStatus("");
    const chunkIdx = s.order[s.flightPos] + 1;
    push(`power lost  mid-copy of chunk ${chunkIdx}`, "loss");
    setPullCount(s.pulls);
    later(() => {
      setCut(false);
      setConsoleData({
        lines: consoleScript(s),
        progress: s.committed / CHUNKS,
      });
      go("console");
      setStatus("power restored.");
    }, reduced ? 500 : 1300);
  }, [go, later, push, reduced]);

  const onConsoleDone = useCallback(() => {
    const s = sim.current;
    setConsoleData(null);
    const chunkIdx = s.order[s.flightPos] + 1;
    push(`#${String(chunkIdx).padStart(2, "0")}  recopied from source, verified`, "ok");
    s.interrupted = true;
    s.flight = -VERIFY * 1.6;
    go("moving");
    setStatus(`resumed at chunk ${chunkIdx} of ${CHUNKS}.`);
  }, [go, push]);

  /* ---------------- attract mode (auto-plays once) ---------------- */

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    let armed = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !armed && !sim.current.touched) {
          armed = true;
          later(() => {
            if (sim.current.touched || sim.current.phase !== "idle") return;
            sim.current.attract = true;
            go("dragging");
            attractAnim.current = { from: sim.current.split, to: 0.4, t: 0 };
          }, 2800);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [go, later, reduced]);

  // auto-pull during attract
  useEffect(() => {
    if (phase !== "moving" || !sim.current.attract) return;
    const t = setInterval(() => {
      const s = sim.current;
      if (s.touched) return;
      if (s.committed === 9 && s.pulls === 0) pullPlug();
    }, 100);
    return () => clearInterval(t);
  }, [phase, pullPlug]);

  /* imperative API: the hero headline can run the whole show */
  useEffect(() => {
    if (!demoRef) return;
    demoRef.current = {
      runShow: () => {
        const s = sim.current;
        wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (s.phase === "moving") {
          pullPlug();
          return;
        }
        if (s.phase !== "idle" && s.phase !== "done") return;
        if (s.phase === "done") resetDemo(true);
        s.attract = true;
        s.touched = false;
        s.pulls = 0;
        go("dragging");
        attractAnim.current = { from: sim.current.split, to: 0.4, t: 0 };
      },
    };
    return () => {
      demoRef.current = null;
    };
  }, [demoRef, go, pullPlug, resetDemo]);

  const interrupt = useCallback(() => {
    const s = sim.current;
    s.touched = true;
    if (s.attract) {
      s.attract = false;
      attractAnim.current = null;
      if (s.phase === "dragging" || s.phase === "planning") {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        resetDemo();
      }
    }
  }, [resetDemo]);

  /* ---------------- dragging ---------------- */

  const fracFromEvent = useCallback((clientX: number) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const pad = 14;
    return Math.min(
      MAX_SPLIT,
      Math.max(MIN_SPLIT, (clientX - r.left - pad) / (r.width - pad * 2))
    );
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      interrupt();
      const s = sim.current;
      if (s.phase !== "idle" && s.phase !== "dragging" && s.phase !== "done") return;
      if (s.phase === "done") return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      go("dragging");
      s.handle = fracFromEvent(e.clientX);
    },
    [fracFromEvent, go, interrupt]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      sim.current.handle = fracFromEvent(e.clientX);
    },
    [fracFromEvent]
  );

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const s = sim.current;
    const deltaGB = Math.abs(gb(s.handle) - gb(s.split));
    if (deltaGB >= 20) startPlan(s.handle);
    else {
      s.handle = s.split;
      go("idle");
      setStatus("drag at least 20 GB to plan a move.");
    }
  }, [go, startPlan]);

  const onHandleKey = useCallback(
    (e: React.KeyboardEvent) => {
      interrupt();
      const s = sim.current;
      if (s.phase !== "idle" && s.phase !== "dragging") return;
      const step = (e.shiftKey ? 20 : 5) / DISK_GB;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        go("dragging");
        s.handle = Math.min(
          MAX_SPLIT,
          Math.max(MIN_SPLIT, s.handle + (e.key === "ArrowLeft" ? -step : step))
        );
        setStatus(
          `plan: system ${gb(s.handle)} GB, media ${gb(1 - s.handle)} GB. Enter starts the move.`
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const deltaGB = Math.abs(gb(s.handle) - gb(s.split));
        if (deltaGB >= 20) startPlan(s.handle);
      }
    },
    [go, interrupt, startPlan]
  );

  /* ---------------- render loop ---------------- */

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;
    let dpr = 1;
    const monoFamily = monoProbe.current
      ? getComputedStyle(monoProbe.current).fontFamily
      : "monospace";

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = 190;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const INK = "#f4f6f5";
    const GREEN = "#00d86a";

    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const s = sim.current;

      /* advance simulation */
      if (attractAnim.current && s.phase === "dragging") {
        const a = attractAnim.current;
        a.t += dt / 1400;
        const k = a.t >= 1 ? 1 : 1 - Math.pow(1 - a.t, 3);
        s.handle = a.from + (a.to - a.from) * k;
        if (a.t >= 1) {
          attractAnim.current = null;
          startPlan(s.handle);
        }
      }
      if (s.phase === "moving" && s.flightPos < CHUNKS) {
        const speed = reduced ? 3 : 1;
        s.flight += (dt / CHUNK_MS) * speed;
        if (s.flight >= 1) {
          const idx = s.order[s.flightPos];
          s.moved[idx] = true;
          s.committed += 1;
          const from = gb(s.split + idx * (MEDIA_USED / CHUNKS));
          const to = gb(s.target + idx * (MEDIA_USED / CHUNKS));
          push(
            `#${String(idx + 1).padStart(2, "0")}  copy ${from} GB to ${to} GB  verified`,
            "ok"
          );
          s.flightPos += 1;
          s.flight = -VERIFY;
          s.interrupted = false;
          if (s.flightPos >= CHUNKS) finishMove();
          else
            setStatus(
              `moving chunk ${s.order[s.flightPos] + 1} of ${CHUNKS}. copied, verified, committed.`
            );
        }
        ringRef?.current?.set(
          (s.committed + Math.max(0, Math.min(1, s.flight))) / CHUNKS,
          true
        );
      }
      if (s.tableSnap < 1) s.tableSnap = Math.min(1, s.tableSnap + dt / 450);
      s.hintT += dt / 1000;

      /* draw */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pad = 14;
      const bx = pad;
      const bw = w - pad * 2;
      const by = 52;
      const bh = 72;
      const X = (f: number) => bx + f * bw;

      const dead = s.phase === "cut";
      ctx.globalAlpha = dead ? 0.1 : 1;

      /* disk shell */
      ctx.strokeStyle = "rgba(244,246,245,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx + 0.5, by + 0.5, bw - 1, bh - 1, 7);
      ctx.stroke();

      /* partition segments: faint fill, the growing one in brand green */
      const splitNow =
        s.phase === "done" || s.tableSnap < 1
          ? s.split + (s.target - s.split) * (s.phase === "done" ? 1 : 1 - Math.pow(1 - s.tableSnap, 3))
          : s.split;
      const planActive =
        (s.phase === "dragging" || s.phase === "planning" || s.phase === "moving" ||
          s.phase === "console" || s.phase === "cut") &&
        Math.abs(s.handle - s.split) > 0.004;
      const planX = X(s.phase === "dragging" ? s.handle : s.target);
      const planSplit = s.phase === "dragging" ? s.handle : s.target;
      const growing: "system" | "media" | null = planActive
        ? planSplit < s.split
          ? "media"
          : "system"
        : null;
      ctx.fillStyle =
        growing === "system" ? "rgba(0,216,106,0.08)" : "rgba(244,246,245,0.045)";
      ctx.beginPath();
      ctx.roundRect(bx, by, splitNow * bw, bh, [7, 0, 0, 7]);
      ctx.fill();
      ctx.fillStyle =
        growing === "media" ? "rgba(0,216,106,0.08)" : "rgba(244,246,245,0.02)";
      ctx.beginPath();
      ctx.roundRect(bx + splitNow * bw, by, bw - splitNow * bw, bh, [0, 7, 7, 0]);
      ctx.fill();

      /* system used cells */
      ctx.fillStyle = "rgba(244,246,245,0.26)";
      const cellW = 6;
      const cellGap = 3;
      const sysW = SYS_USED * bw - 8;
      for (let x = 0; x < sysW; x += cellW + cellGap) {
        ctx.fillRect(bx + 6 + x, by + 10, Math.min(cellW, sysW - x), bh - 20);
      }

      /* media chunks */
      const cw = (MEDIA_USED / CHUNKS) * bw;
      const curIdx = s.flightPos < CHUNKS ? s.order[s.flightPos] : -1;
      for (let j = 0; j < CHUNKS; j++) {
        const oldX = X(s.split + j * (MEDIA_USED / CHUNKS));
        const newX = X(s.target + j * (MEDIA_USED / CHUNKS));
        let x = s.moved[j] ? newX : oldX;
        let lift = 0;
        let alpha = s.moved[j] ? 0.78 : 0.42;
        const isFlight =
          j === curIdx && (s.phase === "moving" || s.phase === "cut" || s.phase === "console");
        if (isFlight) {
          const t = Math.max(0, Math.min(1, s.flight));
          const ease = t * t * (3 - 2 * t);
          x = oldX + (newX - oldX) * ease;
          lift = Math.sin(Math.PI * Math.max(0, t)) * 14;
          alpha = 0.95;
          if (s.flight < 0) {
            // verifying at source: pulse
            alpha = 0.55 + 0.35 * Math.abs(Math.sin(s.hintT * 7));
            x = oldX;
          }
          // ghost at source while in flight
          if (t > 0.02 && !dead) {
            ctx.fillStyle = `rgba(244,246,245,${0.14 * (1 - t)})`;
            ctx.beginPath();
            ctx.roundRect(oldX + 1, by + 10, cw - 3, bh - 20, 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = `rgba(244,246,245,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x + 1, by + 10 - lift, cw - 3, bh - 20, 2);
        ctx.fill();
      }

      /* planned boundary (dashed green) */
      if (planActive) {
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(planX, by - 10);
        ctx.lineTo(planX, by + bh + 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      /* current table boundary (solid, moves LAST) */
      const flash = s.phase === "done" && s.tableSnap >= 1 ? 1 : 0;
      ctx.strokeStyle = flash ? GREEN : INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X(splitNow), by - 6);
      ctx.lineTo(X(splitNow), by + bh + 6);
      ctx.stroke();

      /* labels */
      ctx.font = `11px ${monoFamily}`;
      ctx.fillStyle = "rgba(150,160,154,0.95)";
      ctx.textBaseline = "alphabetic";
      const labSplit = s.phase === "dragging" ? s.handle : planActive ? s.target : splitNow;
      const wide = bw > 500;
      const sysLabel = wide
        ? `System  ${gb(labSplit)} GB  (${gb(SYS_USED)} GB used)`
        : `System  ${gb(labSplit)} GB`;
      const mediaLabel = wide
        ? `Media  ${gb(1 - labSplit)} GB  (${gb(MEDIA_USED)} GB used)`
        : `Media  ${gb(1 - labSplit)} GB`;
      ctx.fillStyle = growing === "system" ? GREEN : "rgba(150,160,154,0.95)";
      ctx.fillText(sysLabel, bx + 2, by - 16);
      ctx.fillStyle = growing === "media" ? GREEN : "rgba(150,160,154,0.95)";
      ctx.fillText(mediaLabel, bx + bw - ctx.measureText(mediaLabel).width - 2, by - 16);
      ctx.fillStyle = "rgba(150,160,154,0.6)";
      ctx.fillText("0", bx, by + bh + 24);
      ctx.fillText("500 GB", bx + bw - ctx.measureText("500 GB").width, by + bh + 24);
      if (planActive && !dead) {
        ctx.fillStyle = GREEN;
        const t = "plan";
        ctx.fillText(t, Math.min(Math.max(planX - 12, bx), bx + bw - 30), by + bh + 24);
      }
      if (s.phase === "done") {
        ctx.fillStyle = GREEN;
        const msg = "table updated last";
        ctx.fillText(msg, X(s.target) - ctx.measureText(msg).width / 2, by + bh + 24);
      }

      ctx.globalAlpha = 1;

      /* position the DOM handle */
      const hx =
        s.phase === "dragging" ? X(s.handle) : planActive ? planX : X(splitNow);
      if (handleRef.current) {
        handleRef.current.style.transform = `translateX(${hx - 11}px)`;
        handleRef.current.style.opacity =
          s.phase === "moving" || s.phase === "cut" || s.phase === "console" || s.phase === "planning"
            ? "0"
            : "1";
        handleRef.current.style.pointerEvents =
          s.phase === "idle" || s.phase === "dragging" ? "auto" : "none";
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [finishMove, push, reduced, ringRef, startPlan]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------------- UI ---------------- */

  const moving = phase === "moving";
  const done = phase === "done";
  const powered = phase !== "cut";
  const handleAria = {
    min: gb(MIN_SPLIT),
    max: gb(MAX_SPLIT),
    // eslint-disable-next-line react-hooks/refs -- snapshot for aria, refreshed by status re-renders
    now: gb(sim.current.handle),
  };

  return (
    <div ref={wrapRef} className="relative">
      <span ref={monoProbe} className="font-mono absolute -left-[9999px]" aria-hidden>
        x
      </span>

      {/* full-viewport power cut */}
      {cut && (
        <div className="fixed inset-0 z-[100] bg-black" aria-hidden>
          {!reduced && (
            <div className="crt-line absolute top-1/2 left-0 h-[2px] w-full bg-ink/90" />
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-[#030403]">
        {/* chrome */}
        <div className="flex items-center justify-between border-b border-line-faint px-4 py-2.5 sm:px-5">
          <span className="font-mono text-[11px] text-dim">
            kitten <span className="text-faint">/dev/nvme0n1</span>
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-faint">
            {powered ? "power" : "power lost"}
            <span
              className={`h-[7px] w-[7px] rounded-full transition-colors duration-200 ${
                powered ? "led bg-green" : "led-off bg-faint/40"
              }`}
            />
          </span>
        </div>

        <div>
          {/* canvas + handle */}
          <div className="relative select-none px-0 py-1" style={{ touchAction: "none" }}>
            <canvas ref={canvasRef} className="block" />
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label="Partition boundary. Arrow keys to move, Enter to start the move."
              aria-valuemin={handleAria.min}
              aria-valuemax={handleAria.max}
              aria-valuenow={handleAria.now}
              aria-valuetext={`system ${handleAria.now} GB`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={onHandleKey}
              className="group absolute top-[62px] left-0 flex h-[52px] w-[22px] cursor-col-resize items-center justify-center transition-opacity duration-300"
            >
              <div className="flex h-9 w-[14px] items-center justify-center rounded-full border border-ink/50 bg-black transition-colors group-hover:border-green group-focus-visible:border-green">
                <div className="flex gap-[2.5px]">
                  <span className="block h-4 w-px bg-ink/60 transition-colors group-hover:bg-green" />
                  <span className="block h-4 w-px bg-ink/60 transition-colors group-hover:bg-green" />
                </div>
              </div>
              {phase === "idle" && !reduced && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-dim">
                  drag me
                </span>
              )}
            </div>

            {consoleData && (
              <RecoveryConsole
                lines={consoleData.lines}
                progress={consoleData.progress}
                instant={reduced}
                onDone={onConsoleDone}
              />
            )}

            {done && (
              <DoneScreen movedGB={gb(MEDIA_USED)} pulls={pullCount} />
            )}
          </div>

          {/* journal ledger */}
          <div className="flex flex-col border-t border-line-faint">
            <div className="border-b border-line-faint px-4 py-2 font-mono text-[10px] text-faint">
              journal @ lba 2048
            </div>
            <div
              ref={journalRef}
              className="no-scrollbar h-[92px] overflow-y-auto px-4 py-2 font-mono text-[10.5px] leading-[1.9]"
            >
              {entries.length === 0 && (
                <span className="text-faint">no entries yet</span>
              )}
              {entries.map((e) => (
                <div
                  key={e.id}
                  className={
                    e.kind === "loss"
                      ? "font-bold text-ink"
                      : e.kind === "note"
                        ? "text-dim"
                        : "text-dim"
                  }
                >
                  {e.kind === "ok" && <span className="text-green">✓ </span>}
                  {e.kind === "loss" && <span className="text-ink"><BoltIcon /> </span>}
                  {e.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* status + plug */}
        <div className="flex flex-col gap-3 border-t border-line-faint px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-h-[2.6em] font-mono text-[11.5px] leading-relaxed text-dim sm:min-h-0">
            <span aria-live="polite">{status}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {done ? (
              <Magnetic>
                <button
                  onClick={() => {
                    interrupt();
                    resetDemo();
                  }}
                  className="rounded-md border border-line px-4 py-2 font-mono text-[12px] text-ink transition-colors hover:border-green hover:text-green"
                >
                  run it again
                </button>
              </Magnetic>
            ) : (
              <Magnetic>
                <button
                  onClick={() => {
                    interrupt();
                    pullPlug();
                  }}
                  disabled={!moving}
                  className={`rounded-md px-5 py-2.5 font-mono text-[13px] font-medium transition-all duration-300 ${
                    moving
                      ? "cursor-pointer bg-ink text-black hover:bg-green"
                      : "cursor-not-allowed border border-line-faint text-faint"
                  }`}
                >
                  <BoltIcon /> pull the plug
                </button>
              </Magnetic>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
