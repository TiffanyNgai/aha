/**
 * The AHA! mark: a spark caught mid-orbit — the moment an idea lands.
 * Kept as inline SVG so it stays crisp at any size and picks up the current theme.
 * `app/brand/build-icons.sh` renders the same artwork to the PNG app icons.
 */
export function LogoMark({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="aha-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a4cf0" />
          <stop offset="1" stopColor="#17104d" />
        </linearGradient>
        <linearGradient id="aha-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset="0.45" stopColor="#ffd24d" />
          <stop offset="1" stopColor="#ffa41b" />
        </linearGradient>
        <radialGradient id="aha-glow" cx="0.5" cy="0.48" r="0.5">
          <stop offset="0" stopColor="#ffc440" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffc440" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="114" fill="url(#aha-bg)" />
      <circle cx="256" cy="248" r="190" fill="url(#aha-glow)" />
      <g transform="rotate(-24 256 268)">
        <ellipse cx="256" cy="268" rx="196" ry="74" fill="none" stroke="#ffcd5a" strokeOpacity="0.16" strokeWidth="14" />
        <ellipse cx="256" cy="268" rx="196" ry="74" fill="none" stroke="#ffdd82" strokeOpacity="0.92" strokeWidth="4" />
      </g>
      <path d="M256 112 Q278 226 392 248 Q278 270 256 384 Q234 270 120 248 Q234 226 256 112 Z" fill="url(#aha-spark)" />
      <path d="M256 170 Q268 236 334 248 Q268 260 256 326 Q244 260 178 248 Q244 236 256 170 Z" fill="#fffdf2" />
      <path d="M392 352 Q399 379 426 386 Q399 393 392 420 Q385 393 358 386 Q385 379 392 352 Z" fill="#ffe79a" />
      <path d="M116 132 Q121 152 141 157 Q121 162 116 182 Q111 162 91 157 Q111 152 116 132 Z" fill="#ffe79a" fillOpacity="0.8" />
    </svg>
  );
}

/** Mark plus wordmark, for the home header. The spark doubles as the dot of the "!". */
export function Wordmark() {
  return (
    <span className="wordmark">
      <LogoMark size={30} title="AHA!" />
      <span className="wordmark-text" aria-hidden="true">AHA<span className="bang">!</span></span>
    </span>
  );
}
