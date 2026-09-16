import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>HyperUtil — comparador de impressão 3D.</p>
        <Link href="/admin" className="hover:text-accent">
          Painel de administração
        </Link>
      </div>
    </footer>
  );
}
