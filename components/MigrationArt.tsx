/**
 * Machine-to-machine migration, drawn in the logo's iconography:
 * outlined server units with green status LEDs, chunks traveling
 * to the new machine, the crescent waking up behind it.
 */
export function MigrationArt() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <svg viewBox="0 0 560 320" className="block h-auto w-full" fill="none">
        {/* crescent behind the new machine, echoing the logo */}
        <path
          d="M 545 108 A 125 125 0 1 0 336 241"
          stroke="var(--color-green)"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* source machine */}
        <g stroke="var(--color-ink)" strokeWidth="3">
          <rect x="44" y="104" width="168" height="52" rx="13" fill="var(--color-bg)" />
          <rect x="44" y="166" width="168" height="52" rx="13" fill="var(--color-bg)" />
        </g>
        <g fill="var(--color-green)">
          <circle cx="152" cy="130" r="4.5" />
          <circle cx="172" cy="130" r="4.5" />
          <circle cx="192" cy="130" r="4.5" />
          <circle cx="152" cy="192" r="4.5" />
          <circle cx="172" cy="192" r="4.5" />
          <circle cx="192" cy="192" r="4.5" />
        </g>

        {/* the path the chunks take */}
        <line
          x1="226"
          y1="161"
          x2="334"
          y2="161"
          stroke="var(--color-line)"
          strokeWidth="2"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />

        {/* chunks in flight */}
        <g fill="var(--color-green)">
          <rect className="mig-packet" x="222" y="155" width="11" height="11" rx="2" />
          <rect
            className="mig-packet"
            x="222"
            y="155"
            width="11"
            height="11"
            rx="2"
            style={{ animationDelay: "1s" }}
          />
          <rect
            className="mig-packet"
            x="222"
            y="155"
            width="11"
            height="11"
            rx="2"
            style={{ animationDelay: "2s" }}
          />
        </g>

        {/* new machine */}
        <g stroke="var(--color-ink)" strokeWidth="3">
          <rect x="348" y="104" width="168" height="52" rx="13" fill="var(--color-bg)" />
          <rect x="348" y="166" width="168" height="52" rx="13" fill="var(--color-bg)" />
        </g>
        <g fill="var(--color-green)">
          <circle className="mig-led" cx="456" cy="130" r="4.5" />
          <circle className="mig-led" cx="476" cy="130" r="4.5" style={{ animationDelay: "0.5s" }} />
          <circle className="mig-led" cx="496" cy="130" r="4.5" style={{ animationDelay: "1s" }} />
          <circle className="mig-led" cx="456" cy="192" r="4.5" style={{ animationDelay: "1.5s" }} />
          <circle className="mig-led" cx="476" cy="192" r="4.5" style={{ animationDelay: "2s" }} />
          <circle className="mig-led" cx="496" cy="192" r="4.5" style={{ animationDelay: "2.5s" }} />
        </g>
      </svg>

      <div className="flex justify-between px-2 font-mono text-[11px] text-faint">
        <span>running machine</span>
        <span className="pr-3">new hardware</span>
      </div>
    </div>
  );
}
