import type { ReactNode } from "react";

type SectionShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
}: SectionShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">{description}</p>
      <div className="mt-10">{children}</div>
    </div>
  );
}
