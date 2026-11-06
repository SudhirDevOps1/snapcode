export default function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand-small" : ""}`}>
      <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="10" fill="#7755DB" />
        <path
          d="m13 11-6 7 6 7m10-14 6 7-6 7m-3-17-4 20"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        snapcode<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
