import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

export function StarIcon({ className = "size-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.8 14.7 8.3l6 .5-4.6 4 1.4 5.8L12 15.8 6.5 18.6 7.9 12.8 3.3 8.8l6-.5L12 2.8Z" />
    </svg>
  );
}

export function StarOutlineIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="m12 3.2 2.5 5.3 5.8.6-4.4 3.8 1.3 5.7L12 15.8 6.8 18.6 8.1 12.9 3.7 9.1l5.8-.6L12 3.2Z" />
    </svg>
  );
}

export function DocumentIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M7 3.5h7.2L19 8.3V20.5H7V3.5Z" />
      <path d="M14 3.5V8.5h5" />
      <path d="M9.5 12h5M9.5 15.5h5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function SwordsIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="m14.5 4.5 5 5-9.5 9.5H5v-5L14.5 4.5Z" />
      <path d="m16 6 2.5-2.5 2 2L18 8" />
      <path d="m4.5 14.5 5 5" />
      <path d="m9.5 4.5-5 5 9.5 9.5H19v-5L9.5 4.5Z" opacity="0.9" />
    </svg>
  );
}

export function TrophyIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 9.5" />
      <path d="M16 6h2.5A2.5 2.5 0 0 1 16 9.5" />
      <path d="M12 11v3" />
      <path d="M9 20h6M10 17h4v3h-4v-3Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-accent">
      {children}
    </span>
  );
}
