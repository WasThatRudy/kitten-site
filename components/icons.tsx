/** Inline icons, sized by the surrounding font (1em), colored via currentColor. */

export function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
      style={{
        width: "0.95em",
        height: "0.95em",
        display: "inline-block",
        verticalAlign: "-0.12em",
      }}
    >
      <path d="M13.2 2 5 13.4h5.1L9.6 22l8.4-11.8h-5.2L13.2 2z" />
    </svg>
  );
}

export function WarnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={{
        width: "1em",
        height: "1em",
        display: "inline-block",
        verticalAlign: "-0.15em",
      }}
    >
      <path d="M12 3 2.5 20h19L12 3z" />
      <path d="M12 9.5v4.5" strokeLinecap="round" />
      <path d="M12 17.2v.1" strokeLinecap="round" />
    </svg>
  );
}
